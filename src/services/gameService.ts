import {
  collection,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  getDoc,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Player, Game } from '../types';

/**
 * Fisher-Yates shuffle algorithm
 */
const shuffleArray = (array: number[]): number[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }
  return shuffled;
};

/**
 * Crear una nueva sala de juego
 */
export const createGame = async (
  roomCode: string,
  hostId: string,
  baseBet: number = 100
): Promise<string> => {
  const gameRef = doc(collection(db, 'games'), roomCode);

  // Generar deck inicial (1-90) y mezclarlo
  const initialDeck = Array.from({ length: 90 }, (_, i) => i + 1);
  const shuffledDeck = shuffleArray(initialDeck);

  // Generar comodín aleatorio (1-30)
  const wildcardValue = Math.floor(Math.random() * 30) + 1;

  const gameData: Partial<Game> = {
    roomCode,
    hostId,
    baseBet,
    pot: 0,
    deck: shuffledDeck,
    wildcard: {
      value: wildcardValue,
      revealed: false,
    },
    drawnTiles: [],
    currentTurnIndex: 0,
    roundState: 'lobby',
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
  };

  await setDoc(gameRef, gameData);
  return roomCode;
};

/**
 * Agregar un jugador a la sala
 */
export const joinGame = async (
  roomCode: string,
  playerId: string,
  playerName: string,
  coins: number
): Promise<void> => {
  const gameRef = doc(db, 'games', roomCode);
  const gameDoc = await getDoc(gameRef);

  if (!gameDoc.exists()) {
    throw new Error('Game not found');
  }

  const gameData = gameDoc.data() as Game;

  // Verificar que no haya más de 6 jugadores
  if (gameData.players && gameData.players.length >= 6) {
    throw new Error('Game is full');
  }

  // Verificar que el jugador no esté ya en la sala
  if (gameData.players?.some(p => p.id === playerId)) {
    throw new Error('Player already in game');
  }

  const newPlayer: Player = {
    id: playerId,
    name: playerName,
    coins,
    hand: [],
    status: 'waiting',
    bet: 0,
    wildcardActive: false,
  };

  await updateDoc(gameRef, {
    players: arrayUnion(newPlayer),
    updatedAt: serverTimestamp(),
  });
};

/**
 * Marcar jugador como listo
 */
export const setPlayerReady = async (
  roomCode: string,
  playerId: string,
  isReady: boolean
): Promise<void> => {
  const gameRef = doc(db, 'games', roomCode);

  await runTransaction(db, async (transaction) => {
    const gameDoc = await transaction.get(gameRef);
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }

    const gameData = gameDoc.data() as Game;
    const players = gameData.players || [];

    const updatedPlayers = players.map(p =>
      p.id === playerId ? { ...p, isReady } : p
    );

    transaction.update(gameRef, {
      players: updatedPlayers,
      updatedAt: serverTimestamp(),
    });
  });
};

/**
 * Iniciar el juego
 */
export const startGame = async (roomCode: string): Promise<void> => {
  const gameRef = doc(db, 'games', roomCode);

  await runTransaction(db, async (transaction) => {
    const gameDoc = await transaction.get(gameRef);
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }

    const gameData = gameDoc.data() as Game;
    const players = gameData.players || [];
    const baseBet = gameData.baseBet || 100;

    // Actualizar jugadores: status = 'playing', bet = baseBet
    const updatedPlayers = players.map(p => ({
      ...p,
      status: 'playing' as const,
      bet: baseBet,
      isReady: undefined, // Remover isReady
    }));

    // Calcular pot inicial
    const pot = players.length * baseBet;

    // Repartir primera ficha a cada jugador
    let remainingDeck = [...gameData.deck];
    const playersWithFirstTile = updatedPlayers.map(player => {
      const randomIndex = Math.floor(Math.random() * remainingDeck.length);
      const firstTile = remainingDeck[randomIndex];
      remainingDeck = remainingDeck.filter((_, idx) => idx !== randomIndex);

      return {
        ...player,
        hand: [firstTile],
      };
    });

    transaction.update(gameRef, {
      players: playersWithFirstTile,
      pot,
      deck: remainingDeck,
      roundState: 'in_round',
      currentTurnIndex: 0,
      wildcard: {
        ...gameData.wildcard,
        revealed: true,
      },
      updatedAt: serverTimestamp(),
    });
  });
};

/**
 * Pedir una ficha
 */
export const drawTile = async (
  roomCode: string,
  playerId: string
): Promise<number> => {
  const gameRef = doc(db, 'games', roomCode);

  return await runTransaction(db, async (transaction) => {
    const gameDoc = await transaction.get(gameRef);
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }

    const gameData = gameDoc.data() as Game;
    const players = gameData.players || [];
    const deck = gameData.deck || [];

    if (deck.length === 0) {
      throw new Error('Deck is empty');
    }

    // Extraer ficha de posición aleatoria
    const randomIndex = Math.floor(Math.random() * deck.length);
    const drawnTile = deck[randomIndex];
    const remainingDeck = deck.filter((_, idx) => idx !== randomIndex);

    // Actualizar jugador
    const updatedPlayers = players.map(p => {
      if (p.id === playerId) {
        const newHand = [...p.hand, drawnTile];
        const handTotal = newHand.reduce((sum, tile) => sum + tile, 0);
        const wildcardValue = p.wildcardActive ? gameData.wildcard.value : 0;
        const total = handTotal + wildcardValue;

        let newStatus = p.status;
        if (total > 100) {
          newStatus = 'busted';
        } else if (total === 99 || total === 100) {
          newStatus = 'winner';
        }

        return {
          ...p,
          hand: newHand,
          status: newStatus,
        };
      }
      return p;
    });

    transaction.update(gameRef, {
      players: updatedPlayers,
      deck: remainingDeck,
      drawnTiles: arrayUnion(drawnTile),
      updatedAt: serverTimestamp(),
    });

    return drawnTile;
  });
};

/**
 * Toggle comodín
 */
export const toggleWildcard = async (
  roomCode: string,
  playerId: string
): Promise<void> => {
  const gameRef = doc(db, 'games', roomCode);

  await runTransaction(db, async (transaction) => {
    const gameDoc = await transaction.get(gameRef);
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }

    const gameData = gameDoc.data() as Game;
    const players = gameData.players || [];

    const updatedPlayers = players.map(p => {
      if (p.id === playerId) {
        const newWildcardActive = !p.wildcardActive;
        const handTotal = p.hand.reduce((sum, tile) => sum + tile, 0);
        const wildcardValue = newWildcardActive ? gameData.wildcard.value : 0;
        const total = handTotal + wildcardValue;

        let newStatus = p.status;
        if (total > 100) {
          newStatus = 'busted';
        } else if (total === 99 || total === 100) {
          newStatus = 'winner';
        } else {
          newStatus = 'playing';
        }

        return {
          ...p,
          wildcardActive: newWildcardActive,
          status: newStatus,
        };
      }
      return p;
    });

    transaction.update(gameRef, {
      players: updatedPlayers,
      updatedAt: serverTimestamp(),
    });
  });
};

/**
 * Quedarse (stand)
 */
export const standPlayer = async (
  roomCode: string,
  playerId: string
): Promise<void> => {
  const gameRef = doc(db, 'games', roomCode);

  await runTransaction(db, async (transaction) => {
    const gameDoc = await transaction.get(gameRef);
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }

    const gameData = gameDoc.data() as Game;
    const players = gameData.players || [];

    const updatedPlayers = players.map(p =>
      p.id === playerId ? { ...p, status: 'stood' as const } : p
    );

    transaction.update(gameRef, {
      players: updatedPlayers,
      updatedAt: serverTimestamp(),
    });
  });
};

/**
 * Pasar al siguiente turno
 */
export const nextTurn = async (roomCode: string): Promise<void> => {
  const gameRef = doc(db, 'games', roomCode);

  await runTransaction(db, async (transaction) => {
    const gameDoc = await transaction.get(gameRef);
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }

    const gameData = gameDoc.data() as Game;
    const players = gameData.players || [];
    const currentIndex = gameData.currentTurnIndex || 0;

    const nextIndex = (currentIndex + 1) % players.length;

    transaction.update(gameRef, {
      currentTurnIndex: nextIndex,
      updatedAt: serverTimestamp(),
    });
  });
};

/**
 * Verificar si todos los jugadores están busteados
 */
export const checkAllBusted = (players: Player[]): boolean => {
  return players.every(p => p.status === 'busted');
};

/**
 * Resetear el juego con nuevas apuestas
 */
export const resetGameWithBets = async (
  roomCode: string,
  newBaseBet: number
): Promise<void> => {
  const gameRef = doc(db, 'games', roomCode);

  await runTransaction(db, async (transaction) => {
    const gameDoc = await transaction.get(gameRef);
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }

    const gameData = gameDoc.data() as Game;
    const players = gameData.players || [];

    // Generar nuevo deck y mezclarlo
    const newDeck = Array.from({ length: 90 }, (_, i) => i + 1);
    const shuffledDeck = shuffleArray(newDeck);

    // Generar nuevo comodín
    const newWildcard = Math.floor(Math.random() * 30) + 1;

    // Resetear jugadores
    const resetPlayers = players.map(p => ({
      ...p,
      hand: [],
      status: 'playing' as const,
      bet: newBaseBet,
      wildcardActive: false,
    }));

    // Calcular nuevo pot
    const newPot = players.length * newBaseBet;

    // Repartir primera ficha a cada jugador
    let remainingDeck = [...shuffledDeck];
    const playersWithFirstTile = resetPlayers.map(player => {
      const randomIndex = Math.floor(Math.random() * remainingDeck.length);
      const firstTile = remainingDeck[randomIndex];
      remainingDeck = remainingDeck.filter((_, idx) => idx !== randomIndex);

      return {
        ...player,
        hand: [firstTile],
      };
    });

    transaction.update(gameRef, {
      players: playersWithFirstTile,
      pot: newPot,
      deck: remainingDeck,
      drawnTiles: [],
      wildcard: {
        value: newWildcard,
        revealed: true,
      },
      baseBet: newBaseBet,
      currentTurnIndex: 0,
      updatedAt: serverTimestamp(),
    });
  });
};
