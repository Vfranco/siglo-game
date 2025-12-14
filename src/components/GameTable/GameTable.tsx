import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../../utils/animations';
import { Player } from '../../types';
import { GameBoard } from './components/GameBoard';
import { DeckDisplay } from './components/DeckDisplay';
import { WildcardDisplay } from './components/WildcardDisplay';
import { PlayerHand } from './components/PlayerHand';
import { GameControls } from './components/GameControls';
import { PotDisplay } from './components/PotDisplay';
import { PlayersList } from './components/PlayersList';
import { ReBetting } from './components/ReBetting';
import './GameTable.css';

export const GameTable = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [currentPlayerId] = useState('1'); // ID del jugador actual

  // Estado del juego
  const [deck, setDeck] = useState<number[]>([]);
  const [drawnTiles, setDrawnTiles] = useState<number[]>([]);
  const [wildcard, setWildcard] = useState({ value: 0, revealed: false });
  const [pot, setPot] = useState(0);
  const [baseBet] = useState(100);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

  // Jugadores
  const [players, setPlayers] = useState<Player[]>([]);
  const [myHand, setMyHand] = useState<number[]>([]);
  const [wildcardActive, setWildcardActive] = useState(false);

  // Re-betting state
  const [showReBetting, setShowReBetting] = useState(false);
  const [newBets, setNewBets] = useState<Map<string, number>>(new Map());
  const [playerCoins, setPlayerCoins] = useState(0);

  // Inicializar juego
  useEffect(() => {
    const name = localStorage.getItem('playerName');
    const coins = localStorage.getItem('playerCoins');

    if (!name || !coins) {
      navigate('/');
      return;
    }

    setPlayerName(name);
    setPlayerCoins(parseInt(coins));

    // Generar deck (1-90) y mezclar aleatoriamente
    const initialDeck = Array.from({ length: 90 }, (_, i) => i + 1);
    const shuffledDeck = shuffleArray(initialDeck);

    // Generar comodín aleatorio (1-30)
    const randomWildcard = Math.floor(Math.random() * 30) + 1;
    setWildcard({ value: randomWildcard, revealed: true });

    // Inicializar jugadores (mock)
    const mockPlayers: Player[] = [
      {
        id: '1',
        name: name,
        coins: parseInt(coins),
        hand: [],
        status: 'playing',
        bet: baseBet,
        wildcardActive: false,
      },
      {
        id: '2',
        name: 'Jugador 2',
        coins: 2000,
        hand: [15, 22],
        status: 'playing',
        bet: baseBet,
        wildcardActive: false,
      },
      {
        id: '3',
        name: 'Jugador 3',
        coins: 1500,
        hand: [8, 31],
        status: 'playing',
        bet: baseBet,
        wildcardActive: true,
      },
    ];

    setPlayers(mockPlayers);

    // Repartir primera ficha aleatoria al jugador actual
    const randomIndex = Math.floor(Math.random() * shuffledDeck.length);
    const firstTile = shuffledDeck[randomIndex];
    const remainingDeck = shuffledDeck.filter((_, idx) => idx !== randomIndex);

    setMyHand([firstTile]);
    setDeck(remainingDeck);

    // Calcular pot inicial
    setPot(mockPlayers.length * baseBet);
  }, [navigate, baseBet]);

  // Algoritmo Fisher-Yates (Knuth shuffle) para mezclar aleatoriamente
  const shuffleArray = (array: number[]) => {
    const shuffled = [...array];

    // Mezclar de atrás hacia adelante para mejor aleatoriedad
    for (let i = shuffled.length - 1; i > 0; i--) {
      // Generar índice aleatorio entre 0 e i (inclusivo)
      const randomIndex = Math.floor(Math.random() * (i + 1));

      // Intercambiar elementos
      [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
    }

    return shuffled;
  };

  const calculateTotal = (hand: number[], includeWildcard: boolean) => {
    const handTotal = hand.reduce((sum, tile) => sum + tile, 0);
    return includeWildcard ? handTotal + wildcard.value : handTotal;
  };

  const handleDrawTiles = (count: number) => {
    if (deck.length === 0) return;

    const tilesToDraw = Math.min(count, deck.length);

    // Extraer fichas de posiciones aleatorias del deck para mayor aleatoriedad
    const newTiles: number[] = [];
    const remainingDeck = [...deck];

    for (let i = 0; i < tilesToDraw; i++) {
      // Seleccionar índice aleatorio del deck restante
      const randomIndex = Math.floor(Math.random() * remainingDeck.length);
      const drawnTile = remainingDeck[randomIndex];

      newTiles.push(drawnTile);
      // Remover la ficha extraída del deck
      remainingDeck.splice(randomIndex, 1);
    }

    setMyHand([...myHand, ...newTiles]);
    setDrawnTiles([...drawnTiles, ...newTiles]);
    setDeck(remainingDeck);

    // Verificar si se pasó de 100
    const newTotal = calculateTotal([...myHand, ...newTiles], wildcardActive);
    if (newTotal > 100) {
      // Jugador se pasó - busteado
      handlePlayerBusted();
    } else if (newTotal === 99 || newTotal === 100) {
      // ¡SIGLO!
      handleSiglo();
    }
  };

  const handleToggleWildcard = () => {
    const newWildcardActive = !wildcardActive;
    setWildcardActive(newWildcardActive);

    // Verificar total con el comodín toggle
    const newTotal = calculateTotal(myHand, newWildcardActive);
    if (newTotal > 100) {
      handlePlayerBusted();
    } else if (newTotal === 99 || newTotal === 100) {
      handleSiglo();
    }
  };

  const handleStand = () => {
    // Jugador se queda con su mano actual
    setPlayers(players.map(p =>
      p.id === currentPlayerId ? { ...p, status: 'stood' } : p
    ));

    // Pasar al siguiente turno
    nextTurn();
  };

  const handlePlayerBusted = () => {
    const updatedPlayers = players.map(p =>
      p.id === currentPlayerId ? { ...p, status: 'busted' as const } : p
    );
    setPlayers(updatedPlayers);

    // Verificar si todos los jugadores están busteados
    const allBusted = updatedPlayers.every(p => p.status === 'busted');

    if (allBusted) {
      // Todos se pasaron - activar re-apuesta
      setTimeout(() => {
        setShowReBetting(true);
        setNewBets(new Map());
      }, 2000);
    } else {
      // Pasar al siguiente turno
      setTimeout(() => nextTurn(), 2000);
    }
  };

  const handleSiglo = () => {
    // ¡Ganador!
    setPlayers(players.map(p =>
      p.id === currentPlayerId ? { ...p, status: 'winner' } : p
    ));

    // Mostrar celebración
    alert(`¡SIGLO! ${playerName} gana ${pot} coins!`);
  };

  const nextTurn = () => {
    const nextIndex = (currentTurnIndex + 1) % players.length;
    setCurrentTurnIndex(nextIndex);
  };

  const handlePlaceBet = (amount: number) => {
    // Guardar la apuesta del jugador actual
    const updatedBets = new Map(newBets);
    updatedBets.set(currentPlayerId, amount);
    setNewBets(updatedBets);

    // Actualizar coins del jugador
    setPlayerCoins(playerCoins - amount);

    // Verificar si todos los jugadores han apostado
    if (updatedBets.size === players.length) {
      // Obtener la apuesta más alta
      const highestBet = Math.max(...Array.from(updatedBets.values()));

      // Todos deben igualar la apuesta más alta
      const finalBets = new Map<string, number>();
      players.forEach(player => {
        finalBets.set(player.id, highestBet);
      });

      // Resetear el juego con las nuevas apuestas
      resetGameWithNewBets(highestBet);
    }
  };

  const resetGameWithNewBets = (newBaseBet: number) => {
    // Generar nuevo deck y mezclarlo
    const newDeck = Array.from({ length: 90 }, (_, i) => i + 1);
    const shuffledDeck = shuffleArray(newDeck);

    // Generar nuevo comodín
    const randomWildcard = Math.floor(Math.random() * 30) + 1;
    setWildcard({ value: randomWildcard, revealed: true });

    // Resetear jugadores a estado "playing"
    const resetPlayers = players.map(p => ({
      ...p,
      hand: [],
      status: 'playing' as const,
      bet: newBaseBet,
      wildcardActive: false,
    }));
    setPlayers(resetPlayers);

    // Calcular nuevo pot
    const newPot = players.length * newBaseBet;
    setPot(newPot);

    // Repartir primera ficha aleatoria al jugador actual
    const randomIndex = Math.floor(Math.random() * shuffledDeck.length);
    const firstTile = shuffledDeck[randomIndex];
    const remainingDeck = shuffledDeck.filter((_, idx) => idx !== randomIndex);

    setMyHand([firstTile]);
    setDeck(remainingDeck);
    setDrawnTiles([]);
    setWildcardActive(false);

    // Cerrar modal de re-apuesta
    setShowReBetting(false);
    setNewBets(new Map());

    // Reiniciar desde el primer jugador
    setCurrentTurnIndex(0);
  };

  const isMyTurn = players[currentTurnIndex]?.id === currentPlayerId;
  const myTotal = calculateTotal(myHand, wildcardActive);
  const myStatus = players.find(p => p.id === currentPlayerId)?.status || 'playing';

  const currentHighestBet = newBets.size > 0
    ? Math.max(...Array.from(newBets.values()))
    : 0;

  const myBetPlaced = newBets.has(currentPlayerId);

  return (
    <motion.div
      className="game-table-screen"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {showReBetting && (
        <ReBetting
          playerCoins={playerCoins}
          onPlaceBet={handlePlaceBet}
          currentHighestBet={currentHighestBet}
          allBetsPlaced={myBetPlaced}
        />
      )}

      <GameBoard>
        {/* Header con info del juego */}
        <div className="game-header">
          <PotDisplay pot={pot} />
          <WildcardDisplay
            value={wildcard.value}
            revealed={wildcard.revealed}
            active={wildcardActive}
          />
          <DeckDisplay
            remainingTiles={deck.length}
            drawnTiles={drawnTiles}
          />
        </div>

        {/* Lista de jugadores */}
        <PlayersList
          players={players}
          currentTurnIndex={currentTurnIndex}
          currentPlayerId={currentPlayerId}
        />

        {/* Mano del jugador */}
        <PlayerHand
          hand={myHand}
          total={myTotal}
          wildcardActive={wildcardActive}
          wildcardValue={wildcard.value}
          playerName={playerName}
          status={myStatus}
        />

        {/* Controles del juego */}
        <GameControls
          isMyTurn={isMyTurn}
          myStatus={myStatus}
          onDrawTiles={handleDrawTiles}
          onToggleWildcard={handleToggleWildcard}
          onStand={handleStand}
          wildcardActive={wildcardActive}
          canDraw={deck.length > 0}
        />
      </GameBoard>
    </motion.div>
  );
};
