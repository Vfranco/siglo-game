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

  // Extraer el comodín del deck (primera ficha)
  const wildcardValue = shuffledDeck[0];
  const deckWithoutWildcard = shuffledDeck.slice(1);

  const gameData: Partial<Game> = {
    roomCode,
    hostId,
    baseBet,
    pot: 0,
    deck: deckWithoutWildcard,
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
 * Remover jugador de la sala (solo host)
 */
export const removePlayer = async (
  roomCode: string,
  playerId: string,
  hostId: string
): Promise<void> => {
  const gameRef = doc(db, 'games', roomCode);

  await runTransaction(db, async (transaction) => {
    const gameDoc = await transaction.get(gameRef);
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }

    const gameData = gameDoc.data() as Game;

    // Verificar que quien remueve es el host
    if (gameData.hostId !== hostId) {
      throw new Error('Only host can remove players');
    }

    // Verificar que el jugador no sea el host
    if (playerId === hostId) {
      throw new Error('Host cannot remove themselves');
    }

    // Remover al jugador
    const updatedPlayers = gameData.players?.filter(p => p.id !== playerId) || [];

    transaction.update(gameRef, {
      players: updatedPlayers,
      updatedAt: serverTimestamp(),
    });
  });
};

/**
 * Remover jugador durante el juego (auto-abandono)
 */
export const leaveGame = async (
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
    const updatedPlayers = gameData.players?.filter(p => p.id !== playerId) || [];

    transaction.update(gameRef, {
      players: updatedPlayers,
      updatedAt: serverTimestamp(),
    });
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
    const updatedPlayers = players.map(p => {
      const { isReady, ...playerWithoutReady } = p;
      return {
        ...playerWithoutReady,
        status: 'playing' as const,
        bet: baseBet,
      };
    });

    // Calcular pot inicial
    const pot = players.length * baseBet;

    // El comodín ya fue extraído del deck al crear la sala
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

    // Verificar si hay un ganador:
    // 1. Siglo directo (99-100)
    // 2. Todos los jugadores activos terminaron (no hay nadie en 'playing')
    const hasDirectWinner = updatedPlayers.some(p => p.status === 'winner');
    const activePlayers = updatedPlayers.filter(p => p.status !== 'busted');
    const playersStillPlaying = activePlayers.filter(p => p.status === 'playing');
    const shouldDeclareWinner = hasDirectWinner || (activePlayers.length > 0 && playersStillPlaying.length === 0);
    
    if (shouldDeclareWinner) {
      // Si hay ganador directo (Siglo), usar ese; si no, determinar por mayor pinta
      let winner: any;
      let finalPlayers: any[];
      
      if (hasDirectWinner) {
        winner = updatedPlayers.find(p => p.status === 'winner')!;
        finalPlayers = updatedPlayers;
      } else {
        const result = determineWinner(updatedPlayers, gameData.wildcard.value);
        winner = result.winner;
        finalPlayers = result.finalPlayers;
      }
      
      const pot = gameData.pot || 0;
      
      const playersWithWinner = finalPlayers.map(p =>
        p.id === winner.id
          ? { ...p, coins: p.coins + pot }
          : p
      );

      transaction.update(gameRef, {
        players: playersWithWinner,
        deck: remainingDeck,
        drawnTiles: arrayUnion(drawnTile),
        pot: 0,
        roundState: 'finished',
        updatedAt: serverTimestamp(),
      });
    } else {
      transaction.update(gameRef, {
        players: updatedPlayers,
        deck: remainingDeck,
        drawnTiles: arrayUnion(drawnTile),
        updatedAt: serverTimestamp(),
      });
    }


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

    // Verificar si se debe declarar ganador
    const activePlayers = updatedPlayers.filter(p => p.status !== 'busted');
    const playersStillPlaying = activePlayers.filter(p => p.status === 'playing');
    
    // Casos para declarar ganador:
    // 1. Solo queda este jugador activo (todos los demás están busted)
    // 2. Todos los jugadores activos se plantaron (no hay nadie en 'playing')
    const shouldDeclareWinner = activePlayers.length > 0 && playersStillPlaying.length === 0;
    
    if (shouldDeclareWinner) {
      // Determinar el ganador por mayor pinta
      const { winner, finalPlayers } = determineWinner(updatedPlayers, gameData.wildcard.value);
      const pot = gameData.pot || 0;
      
      const playersWithWinner = finalPlayers.map(p =>
        p.id === winner.id
          ? { ...p, coins: p.coins + pot }
          : p
      );

      transaction.update(gameRef, {
        players: playersWithWinner,
        pot: 0,
        roundState: 'finished',
        updatedAt: serverTimestamp(),
      });
    } else {
      transaction.update(gameRef, {
        players: updatedPlayers,
        updatedAt: serverTimestamp(),
      });
    }
  });
};

/**
 * Pasar al siguiente turno
 * Salta automáticamente a jugadores que están busteados o plantados
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

    // Buscar el siguiente jugador que pueda jugar (no busted ni stood)
    let nextIndex = (currentIndex + 1) % players.length;
    let attempts = 0;
    
    // Saltar jugadores que están busted o stood
    while (attempts < players.length) {
      const nextPlayer = players[nextIndex];
      if (nextPlayer.status === 'playing') {
        // Este jugador puede jugar
        break;
      }
      nextIndex = (nextIndex + 1) % players.length;
      attempts++;
    }

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
 * Determinar el ganador basándose en la puntuación
 */
const determineWinner = (players: Player[], wildcardValue: number): { winner: Player, finalPlayers: Player[] } => {
  // Si hay un ganador directo (99 o 100), ese es el ganador
  const directWinner = players.find(p => p.status === 'winner');
  if (directWinner) {
    return { winner: directWinner, finalPlayers: players };
  }
  
  // Calcular puntuaciones de jugadores que no están busteados
  const playersWithScores = players
    .filter(p => p.status !== 'busted')
    .map(p => {
      const handTotal = p.hand.reduce((sum, tile) => sum + tile, 0);
      const total = handTotal + (p.wildcardActive ? wildcardValue : 0);
      return { player: p, score: total };
    });
  
  // Si no hay jugadores válidos, todos están busteados
  if (playersWithScores.length === 0) {
    // En caso de que todos estén busteados, no hay ganador
    return { winner: players[0], finalPlayers: players };
  }
  
  // Encontrar el jugador con la puntuación más alta
  const winnerData = playersWithScores.reduce((max, current) => 
    current.score > max.score ? current : max
  );
  
  // Actualizar el status del ganador
  const finalPlayers = players.map(p => 
    p.id === winnerData.player.id 
      ? { ...p, status: 'winner' as const }
      : p
  );
  
  return { 
    winner: finalPlayers.find(p => p.id === winnerData.player.id)!, 
    finalPlayers 
  };
};

/**
 * Resolver ganador y distribuir pot
 */
export const resolveWinner = async (roomCode: string): Promise<void> => {
  const gameRef = doc(db, 'games', roomCode);

  await runTransaction(db, async (transaction) => {
    const gameDoc = await transaction.get(gameRef);
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }

    const gameData = gameDoc.data() as Game;
    const players = gameData.players || [];
    const pot = gameData.pot || 0;

    // Buscar ganador (quien tenga status 'winner')
    const winner = players.find(p => p.status === 'winner');
    
    if (winner) {
      // Actualizar coins del ganador
      const updatedPlayers = players.map(p =>
        p.id === winner.id
          ? { ...p, coins: p.coins + pot }
          : p
      );

      transaction.update(gameRef, {
        players: updatedPlayers,
        pot: 0,
        roundState: 'finished',
        updatedAt: serverTimestamp(),
      });
    }
  });
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

    // Extraer el comodín del deck (primera ficha)
    const newWildcard = shuffledDeck[0];
    const deckWithoutWildcard = shuffledDeck.slice(1);

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
    let remainingDeck = [...deckWithoutWildcard];
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
      roundState: 'in_round',
      updatedAt: serverTimestamp(),
    });
  });
};

/**
 * Colocar apuesta individual para re-betting
 */
export const placeReBet = async (
  roomCode: string,
  userId: string,
  betAmount: number
): Promise<void> => {
  const gameRef = doc(db, 'games', roomCode);

  await runTransaction(db, async (transaction) => {
    const gameDoc = await transaction.get(gameRef);
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }

    const gameData = gameDoc.data() as Game;
    const players = gameData.players || [];
    
    // Actualizar la apuesta del jugador y marcarlo como listo
    const updatedPlayers = players.map(p => {
      if (p.id === userId) {
        return {
          ...p,
          bet: betAmount,
          isReady: true, // Usar isReady para indicar que ya apostó
        };
      }
      return p;
    });

    // Verificar si todos han apostado
    const allBetsPlaced = updatedPlayers.every(p => p.isReady);
    
    if (allBetsPlaced) {
      // Obtener la apuesta más alta
      const highestBet = Math.max(...updatedPlayers.map(p => p.bet || 0));
      
      // Generar nuevo deck y mezclarlo
      const newDeck = Array.from({ length: 90 }, (_, i) => i + 1);
      const shuffledDeck = shuffleArray(newDeck);

      // Extraer el comodín del deck (primera ficha)
      const newWildcard = shuffledDeck[0];
      const deckWithoutWildcard = shuffledDeck.slice(1);

      // Resetear jugadores con la apuesta más alta
      const resetPlayers = updatedPlayers.map(p => ({
        ...p,
        hand: [],
        status: 'playing' as const,
        bet: highestBet,
        wildcardActive: false,
        isReady: false, // Resetear el estado de ready
      }));

      // Calcular nuevo pot
      const newPot = resetPlayers.length * highestBet;

      // Repartir primera ficha a cada jugador
      let remainingDeck = [...deckWithoutWildcard];
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
        baseBet: highestBet,
        currentTurnIndex: 0,
        roundState: 'in_round',
        updatedAt: serverTimestamp(),
      });
    } else {
      // Solo actualizar las apuestas de los jugadores
      transaction.update(gameRef, {
        players: updatedPlayers,
        updatedAt: serverTimestamp(),
      });
    }
  });
};
