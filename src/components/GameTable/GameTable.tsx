import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../../utils/animations';
import { useAuthContext } from '../../contexts/AuthContext';
import { useDocument } from '../../hooks/useFirestore';
import { useGameSounds } from '../../hooks/useGameSounds';
import { drawTile, toggleWildcard, standPlayer, nextTurn, resetGameWithBets, placeReBet, leaveGame } from '../../services/gameService';
import { Game } from '../../types';
import { GameBoard } from './components/GameBoard';
import { DeckDisplay } from './components/DeckDisplay';
import { WildcardDisplay } from './components/WildcardDisplay';
import { PlayerHand } from './components/PlayerHand';
import { GameControls } from './components/GameControls';
import { PotDisplay } from './components/PotDisplay';
import { PlayersList } from './components/PlayersList';
import { ReBetting } from './components/ReBetting';
import { WinnerModal } from './components/WinnerModal';
import { TopBar } from './components/TopBar';
import { ConfirmModal } from '../shared/ConfirmModal';
import { NotificationModal } from '../shared/NotificationModal';
import './GameTable.css';

export const GameTable = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [userId, setUserId] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [notification, setNotification] = useState<{title: string, message: string, type: 'info' | 'warning' | 'error'} | null>(null);
  const [previousPlayerCount, setPreviousPlayerCount] = useState<number>(0);
  const { user } = useAuthContext();
  const sounds = useGameSounds();
  
  // Escuchar cambios en tiempo real del juego
  const { data: game, loading } = useDocument<Game>('games', roomCode || null);
  
  // Re-betting state
  const [showReBetting, setShowReBetting] = useState(false);
  
  // Winner modal state
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winnerData, setWinnerData] = useState<{
    name: string;
    isCurrentPlayer: boolean;
    potWon: number;
    winType: 'siglo' | 'highest-score';
    score: number;
  } | null>(null);

  // Inicializar juego
  useEffect(() => {
    const name = localStorage.getItem('playerName');
    const storedUserId = localStorage.getItem('userId');
    const storedRoomCode = localStorage.getItem('roomCode');

    if (!name || !storedUserId || !storedRoomCode || !user) {
      navigate('/lobby');
      return;
    }

    setPlayerName(name);
    setUserId(storedUserId);
    setRoomCode(storedRoomCode);
  }, [navigate, user]);
  
  // Iniciar música de fondo cuando el componente se monta
  useEffect(() => {
    // Intentar iniciar música de fondo
    const timer = setTimeout(() => {
      sounds.startBackgroundMusic();
    }, 500);
    
    // Detener música cuando se desmonta el componente
    return () => {
      clearTimeout(timer);
      sounds.stopBackgroundMusic();
    };
  }, []);
  
  // Detectar cuando todos están busteados para mostrar re-betting
  useEffect(() => {
    if (!game) return;
    
    const players = game.players || [];
    const allBusted = players.length > 0 && players.every(p => p.status === 'busted');
    
    // Solo mostrar si todos están busteados Y no hay ganador Y no está en estado finished
    if (allBusted && game.roundState !== 'finished' && !game.players?.some(p => p.status === 'winner')) {
      if (!showReBetting) {
        setTimeout(() => {
          setShowReBetting(true);
        }, 2000);
      }
    } else if (showReBetting && game.roundState === 'in_round' && players.some(p => p.hand.length > 0)) {
      // Cerrar la modal cuando el juego se resetea y comienza una nueva ronda
      setShowReBetting(false);
    }
  }, [game, showReBetting]);
  
  // Auto-pasar turno cuando un jugador se pasa o gana
  useEffect(() => {
    if (!game || !userId || !roomCode) return;
    
    const currentPlayer = game.players?.find(p => p.id === userId);
    const isMyTurnNow = game.currentTurnIndex !== undefined && 
                        game.players?.[game.currentTurnIndex]?.id === userId;
    
    // Si es mi turno y me pasé o gané, pasar turno automáticamente
    if (isMyTurnNow && currentPlayer && 
        (currentPlayer.status === 'busted' || currentPlayer.status === 'winner')) {
      const timer = setTimeout(async () => {
        try {
          await nextTurn(roomCode);
        } catch (err) {
          console.error('Error al pasar turno automáticamente:', err);
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [game, userId, roomCode]);

  // Detectar cambios de estado del jugador (bust o winner) para sonidos
  useEffect(() => {
    if (!game || !userId) return;
    
    const currentPlayer = game.players?.find(p => p.id === userId);
    
    if (currentPlayer?.status === 'busted') {
      sounds.playBust();
    } else if (currentPlayer?.status === 'winner') {
      sounds.playWin();
    }
  }, [game?.players?.find((p: any) => p.id === userId)?.status]);
  
  // Detectar ganador
  useEffect(() => {
    if (!game || !userId || showWinnerModal || winnerData) return;
    
    const winner = game.players?.find(p => p.status === 'winner');
    if (winner && game.roundState === 'finished') {
      const handTotal = winner.hand.reduce((sum, tile) => sum + tile, 0);
      const wildcardValue = winner.wildcardActive ? game.wildcard.value : 0;
      const totalScore = handTotal + wildcardValue;
      
      // Determinar si es Siglo (99-100) o mayor pinta
      const isSiglo = totalScore === 99 || totalScore === 100;
      
      setWinnerData({
        name: winner.name,
        isCurrentPlayer: winner.id === userId,
        potWon: game.pot || 0,
        winType: isSiglo ? 'siglo' : 'highest-score',
        score: totalScore,
      });
      
      setTimeout(() => {
        setShowWinnerModal(true);
      }, 1000);
    }
  }, [game, userId, showWinnerModal, winnerData]);

  // Detectar cuando un jugador abandona
  useEffect(() => {
    if (!game || !userId) return;

    const currentPlayerCount = game.players?.length || 0;

    // Inicializar el contador en el primer render
    if (previousPlayerCount === 0) {
      setPreviousPlayerCount(currentPlayerCount);
      return;
    }

    // Si disminuyó el número de jugadores, alguien abandonó
    if (currentPlayerCount < previousPlayerCount && currentPlayerCount > 0) {
      console.log('Player left detected! Previous:', previousPlayerCount, 'Current:', currentPlayerCount);
      
      // Mostrar notificación
      setNotification({
        title: 'Jugador Abandonó',
        message: 'Un jugador ha abandonado la sala. El juego continúa con los jugadores restantes.',
        type: 'warning'
      });
      
      // Actualizar el contador
      setPreviousPlayerCount(currentPlayerCount);
    } else if (currentPlayerCount !== previousPlayerCount) {
      // Actualizar sin notificación si aumentó o cambió por otra razón
      setPreviousPlayerCount(currentPlayerCount);
    }
  }, [game?.players?.length]);

  const calculateTotal = (hand: number[], includeWildcard: boolean, wildcardValue: number) => {
    const handTotal = hand.reduce((sum, tile) => sum + tile, 0);
    return includeWildcard ? handTotal + wildcardValue : handTotal;
  };

  const handleDrawTiles = async () => {
    if (!roomCode || !userId || isProcessing) return;
    
    // Intentar iniciar música con la interacción del usuario
    sounds.startBackgroundMusic();
    
    try {
      setIsProcessing(true);
      sounds.playDrawTile();
      await drawTile(roomCode, userId);
      // El service maneja automáticamente el status
      // El turno se pasará con el botón "Siguiente turno" o automáticamente si está busted
    } catch (err) {
      console.error('Error al pedir ficha:', err);
      setError('Error al pedir ficha. Intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleWildcard = async () => {
    if (!roomCode || !userId || isProcessing) return;
    
    try {
      setIsProcessing(true);
      await toggleWildcard(roomCode, userId);
      sounds.playWildcard();
    } catch (err) {
      console.error('Error al toggle comodín:', err);
      setError('Error al activar comodín. Intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStand = async () => {
    if (!roomCode || !userId || isProcessing) return;
    
    try {
      setIsProcessing(true);
      sounds.playStand();
      await standPlayer(roomCode, userId);
      await nextTurn(roomCode);
    } catch (err) {
      console.error('Error al quedarse:', err);
      setError('Error al quedarse. Intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlaceBet = async (amount: number) => {
    if (!roomCode || !userId || isProcessing) return;
    
    try {
      setIsProcessing(true);
      sounds.playBet();
      // Colocar la apuesta individual del jugador
      await placeReBet(roomCode, userId, amount);
      // La modal se cerrará automáticamente cuando todos hayan apostado y el juego se resetee
    } catch (err) {
      console.error('Error al apostar:', err);
      setError('Error al colocar apuesta. Intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleNewRound = async () => {
    if (!roomCode || isProcessing) return;
    
    try {
      setIsProcessing(true);
      // Primero cerrar la modal
      setShowWinnerModal(false);
      setWinnerData(null);
      
      // Resetear el juego con la misma apuesta base
      await resetGameWithBets(roomCode, game?.baseBet || 100);
    } catch (err) {
      console.error('Error al iniciar nueva ronda:', err);
      setError('Error al iniciar nueva ronda. Intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleBackToLobby = () => {
    // Limpiar localStorage y navegar al lobby
    localStorage.removeItem('roomCode');
    navigate('/lobby');
  };
  
  const handleLeaveGame = () => {
    setShowLeaveConfirm(true);
  };

  const confirmLeaveGame = async () => {
    if (!roomCode || !userId) return;
    
    try {
      // Primero remover al jugador de la sala en Firestore
      await leaveGame(roomCode, userId);
    } catch (err) {
      console.error('Error al abandonar sala:', err);
    } finally {
      // Limpiar todo el localStorage relacionado con la partida
      localStorage.removeItem('roomCode');
      localStorage.removeItem('playerName');
      localStorage.removeItem('userId');
      localStorage.removeItem('selectedCoins');
      // Navegar al inicio
      navigate('/');
    }
  };
  
  // Datos derivados del estado de Firebase
  const players = game?.players || [];
  const currentPlayer = players.find(p => p.id === userId);
  const myHand = currentPlayer?.hand || [];
  const wildcardActive = currentPlayer?.wildcardActive || false;
  const myStatus = currentPlayer?.status || 'waiting';
  const isMyTurn = game?.currentTurnIndex !== undefined && players[game.currentTurnIndex]?.id === userId;
  const myTotal = calculateTotal(myHand, wildcardActive, game?.wildcard?.value || 0);
  const playerCoins = currentPlayer?.coins || 0;
  const myBustedHistory = currentPlayer?.bustedHistory || null;

  if (loading || !game) {
    return (
      <motion.div
        className="game-table-screen"
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <div className="loading-container">
          <h2>⏳ Cargando juego...</h2>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="game-table-screen"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <TopBar
        playerName={playerName}
        playerCoins={playerCoins}
        roomCode={roomCode}
        onLeave={handleLeaveGame}
      />
      
      {error && (
        <div className="error-notification">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}
      
      {showReBetting && (
        <ReBetting
          playerCoins={playerCoins}
          onPlaceBet={handlePlaceBet}
          currentHighestBet={Math.max(...(game.players?.map(p => p.bet || 0) || [0]))}
          allBetsPlaced={currentPlayer?.isReady || false}
        />
      )}
      
      {showWinnerModal && winnerData && (
        <WinnerModal
          winnerName={winnerData.name}
          isCurrentPlayer={winnerData.isCurrentPlayer}
          potWon={winnerData.potWon}
          winType={winnerData.winType}
          winnerScore={winnerData.score}
          onNewRound={handleNewRound}
          onBackToLobby={handleBackToLobby}
        />
      )}

      <GameBoard>
        {/* Header con info del juego */}
        <div className="game-header">
          <PotDisplay pot={game.pot} />
          <WildcardDisplay
            value={game.wildcard.value}
            revealed={game.wildcard.revealed}
            active={wildcardActive}
          />
          <DeckDisplay
            remainingTiles={game.deck.length}
            drawnTiles={game.drawnTiles}
          />
        </div>

        {/* Lista de jugadores */}
        <PlayersList
          players={players}
          currentTurnIndex={game.currentTurnIndex}
          currentPlayerId={userId}
        />

        {/* Mano del jugador */}
        <PlayerHand
          hand={myHand}
          total={myTotal}
          wildcardActive={wildcardActive}
          wildcardValue={game.wildcard.value}
          playerName={playerName}
          status={myStatus}
          bustedHistory={myBustedHistory}
        />

        {/* Controles del juego */}
        <GameControls
          isMyTurn={isMyTurn}
          myStatus={myStatus}
          onDrawTiles={handleDrawTiles}
          onToggleWildcard={handleToggleWildcard}
          onStand={handleStand}
          wildcardActive={wildcardActive}
          canDraw={game.deck.length > 0 && !isProcessing}
        />
      </GameBoard>

      {showLeaveConfirm && (
        <ConfirmModal
          title="Abandonar Partida"
          message="¿Estás seguro de que deseas abandonar la partida? Perderás tu progreso y tu apuesta."
          type="danger"
          confirmText="Sí, abandonar"
          cancelText="Cancelar"
          onConfirm={confirmLeaveGame}
          onCancel={() => setShowLeaveConfirm(false)}
        />
      )}

      {notification && (
        <NotificationModal
          title={notification.title}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </motion.div>
  );
};
