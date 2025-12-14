import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../../utils/animations';
import { useAuthContext } from '../../contexts/AuthContext';
import { useDocument } from '../../hooks/useFirestore';
import { createGame, joinGame, setPlayerReady, startGame, removePlayer } from '../../services/gameService';
import { Game } from '../../types';
import { LobbyTopBar } from './components/LobbyTopBar';
import { ConfirmModal } from '../shared/ConfirmModal';
import { NotificationModal } from '../shared/NotificationModal';
import './Lobby.css';

const MAX_PLAYERS = 6;

// Generate a random room code
const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const Lobby = () => {
  const [userId, setUserId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerCoins, setPlayerCoins] = useState(0);
  const [roomCode, setRoomCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notification, setNotification] = useState<{title: string, message: string, type: 'info' | 'warning' | 'error'} | null>(null);
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  // Escuchar cambios en tiempo real del juego
  const { data: game, loading } = useDocument<Game>('games', roomCode || null);
  
  const baseBet = game?.baseBet || 100;
  const players = game?.players || [];
  const currentPlayer = players.find(p => p.id === userId);
  const isReady = currentPlayer?.isReady || false;
  const isHost = game?.hostId === userId;

  useEffect(() => {
    const name = localStorage.getItem('playerName');
    const coins = localStorage.getItem('playerCoins');
    const storedUserId = localStorage.getItem('userId');

    if (!name || !coins || !storedUserId || !user) {
      navigate('/');
      return;
    }

    setUserId(storedUserId);
    setPlayerName(name);
    setPlayerCoins(parseInt(coins));

    // Verificar si ya tiene un roomCode guardado
    const storedRoomCode = localStorage.getItem('roomCode');
    if (storedRoomCode) {
      setRoomCode(storedRoomCode);
      setShowJoinInput(false);
    } else {
      // No crear sala automáticamente, esperar a que el usuario decida
      setShowJoinInput(true);
    }
  }, [navigate, user]);

  const handleToggleReady = async () => {
    if (!roomCode || !userId) return;
    
    try {
      await setPlayerReady(roomCode, userId, !isReady);
    } catch (err) {
      console.error('Error al marcar como listo:', err);
      setError('Error al actualizar estado. Intenta de nuevo.');
    }
  };

  const handleStartGame = async () => {
    if (!roomCode || !isHost) return;
    
    try {
      await startGame(roomCode);
      // Firebase actualizará el estado y todos navegarán
    } catch (err) {
      console.error('Error al iniciar juego:', err);
      setError('Error al iniciar el juego. Intenta de nuevo.');
    }
  };
  
  // Navegar automáticamente cuando el juego inicie (si estás listo)
  useEffect(() => {
    if (game?.roundState === 'in_round') {
      // Verificar si el jugador está en la partida
      const playerInGame = game.players?.some(p => p.id === userId);
      
      if (playerInGame) {
        navigate('/game');
      } else {
        // El jugador no está en la partida (fue removido o no se unió a tiempo)
        setNotification({
          title: 'Partida Iniciada',
          message: 'La partida ya comenzó sin ti. Puedes esperar a que termine o iniciar otra sala.',
          type: 'warning'
        });
        // Limpiar roomCode para volver al lobby
        localStorage.removeItem('roomCode');
        setRoomCode('');
        setShowJoinInput(true);
      }
    }
  }, [game?.roundState, game?.players, userId, navigate]);

  const handleCopyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const handleCreateRoom = async () => {
    const name = localStorage.getItem('playerName');
    const coins = localStorage.getItem('playerCoins');
    
    if (!name || !coins || !userId) return;
    
    setIsCreating(true);
    try {
      const newRoomCode = generateRoomCode();
      await createGame(newRoomCode, userId, 100);
      await joinGame(newRoomCode, userId, name, parseInt(coins));
      setRoomCode(newRoomCode);
      localStorage.setItem('roomCode', newRoomCode);
      setShowJoinInput(false);
    } catch (err) {
      console.error('Error creando sala:', err);
      setError('Error al crear la sala. Intenta de nuevo.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    const name = localStorage.getItem('playerName');
    const coins = localStorage.getItem('playerCoins');
    
    if (!name || !coins || !userId || !joinCode) return;
    
    setIsCreating(true);
    try {
      await joinGame(joinCode.toUpperCase(), userId, name, parseInt(coins));
      setRoomCode(joinCode.toUpperCase());
      localStorage.setItem('roomCode', joinCode.toUpperCase());
      setShowJoinInput(false);
      setError('');
    } catch (err) {
      console.error('Error uniéndose a sala:', err);
      setError('Sala no encontrada o error al unirse. Verifica el código.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    if (!roomCode || !userId || !isHost) return;
    
    try {
      await removePlayer(roomCode, playerId, userId);
    } catch (err) {
      console.error('Error al remover jugador:', err);
      setError('Error al remover jugador. Intenta de nuevo.');
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    // Limpiar todo el localStorage
    localStorage.removeItem('roomCode');
    localStorage.removeItem('playerName');
    localStorage.removeItem('userId');
    localStorage.removeItem('playerCoins');
    localStorage.removeItem('selectedCoins');
    // Navegar al inicio
    navigate('/');
  };
  
  const allPlayersReady = players.length > 1 && players.every((p) => p.isReady);
  const roomFull = players.length >= MAX_PLAYERS;
  
  // Mostrar pantalla de crear/unirse si no hay sala
  if (showJoinInput && !roomCode) {
    return (
      <motion.div
        className="lobby-screen"
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <LobbyTopBar
          playerName={playerName}
          playerCoins={playerCoins}
          onLogout={handleLogout}
        />
        
        <div className="lobby-container">
          <div className="join-create-container">
            <h1 className="lobby-title">Crear o Unirse a Sala</h1>
            
            {error && (
              <div className="error-banner">
                <span>⚠️ {error}</span>
                <button onClick={() => setError('')}>✕</button>
              </div>
            )}
            
            <div className="join-create-options">
              <div className="option-card">
                <h2>🎮 Crear Nueva Sala</h2>
                <p>Crea una nueva sala y comparte el código con tus amigos</p>
                <button 
                  className="btn-primary"
                  onClick={handleCreateRoom}
                  disabled={isCreating}
                >
                  {isCreating ? 'Creando...' : 'Crear Sala'}
                </button>
              </div>
              
              <div className="option-divider">o</div>
              
              <div className="option-card">
                <h2>🚪 Unirse a Sala</h2>
                <p>Ingresa el código de sala de tu amigo</p>
                <input
                  type="text"
                  className="join-code-input"
                  placeholder="Ej: 3W2VGS"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
                <button 
                  className="btn-primary"
                  onClick={handleJoinRoom}
                  disabled={isCreating || joinCode.length !== 6}
                >
                  {isCreating ? 'Uniéndose...' : 'Unirse'}
                </button>
              </div>
            </div>
            
            <button
              className="btn-secondary"
              onClick={() => navigate('/coins-selection')}
              style={{ marginTop: '2rem' }}
            >
              ← Atrás
            </button>
          </div>
        </div>

        {showLogoutConfirm && (
          <ConfirmModal
            title="Cerrar Sesión"
            message="¿Estás seguro de que deseas cerrar sesión? Perderás tu progreso actual."
            type="warning"
            confirmText="Sí, cerrar sesión"
            cancelText="Cancelar"
            onConfirm={confirmLogout}
            onCancel={() => setShowLogoutConfirm(false)}
          />
        )}
      </motion.div>
    );
  }
  
  if (loading || (isCreating && roomCode)) {
    return (
      <motion.div
        className="lobby-screen"
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <div className="lobby-container">
          <div className="loading-message">
            <h2>⏳ Cargando sala...</h2>
          </div>
        </div>

        {showLogoutConfirm && (
          <ConfirmModal
            title="Cerrar Sesión"
            message="¿Estás seguro de que deseas cerrar sesión? Perderás tu progreso actual."
            type="warning"
            confirmText="Sí, cerrar sesión"
            cancelText="Cancelar"
            onConfirm={confirmLogout}
            onCancel={() => setShowLogoutConfirm(false)}
          />
        )}
      </motion.div>
    );
  }

  if (!game && roomCode) {
    return (
      <motion.div
        className="lobby-screen"
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <div className="lobby-container">
          <div className="error-message">
            <h2>❌ Error al cargar la sala</h2>
            <button className="btn-primary" onClick={() => navigate('/coins-selection')}>
              Volver a intentar
            </button>
          </div>
        </div>

        {showLogoutConfirm && (
          <ConfirmModal
            title="Cerrar Sesión"
            message="¿Estás seguro de que deseas cerrar sesión? Perderás tu progreso actual."
            type="warning"
            confirmText="Sí, cerrar sesión"
            cancelText="Cancelar"
            onConfirm={confirmLogout}
            onCancel={() => setShowLogoutConfirm(false)}
          />
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="lobby-screen"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <LobbyTopBar
        playerName={playerName}
        playerCoins={playerCoins}
        onLogout={handleLogout}
      />
      
      <div className="lobby-container">
        <div className="lobby-header">
          <h1 className="lobby-title">Sala de Juego</h1>

          <div className="room-code-container">
            <div className="room-code">
              <span className="room-code-label">Código de Sala:</span>
              <span className="room-code-value">{roomCode}</span>
              <button
                className="copy-button"
                onClick={handleCopyRoomCode}
                title="Copiar código"
              >
                {copied ? '✓ Copiado' : '📋 Copiar'}
              </button>
            </div>
          </div>

          <div className="game-info">
            <div className="info-card">
              <span className="info-label">Apuesta Base:</span>
              <span className="info-value">{baseBet} coins</span>
            </div>
            <div className="info-card">
              <span className="info-label">Jugadores:</span>
              <span className={`info-value ${roomFull ? 'full' : ''}`}>
                {players.length}/{MAX_PLAYERS}
              </span>
            </div>
          </div>
        </div>

        <div className="lobby-content">
          {error && (
            <div className="error-banner">
              <span>⚠️ {error}</span>
              <button onClick={() => setError('')}>✕</button>
            </div>
          )}
          
          <div className="players-section">
            <h2 className="section-title">Jugadores en la Sala</h2>
            <div className="players-list">
              {players.map((player) => (
                <div
                  key={player.id}
                  className={`player-card ${player.isReady ? 'ready' : ''} ${
                    player.id === userId ? 'current-player' : ''
                  }`}
                >
                  <div className="player-avatar">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="player-info">
                    <div className="player-name">
                      {player.name}
                      {player.id === userId && (
                        <span className="you-badge">Tú</span>
                      )}
                      {player.id === game?.hostId && (
                        <span className="host-badge">Host</span>
                      )}
                    </div>
                    <div className="player-coins">💰 {player.coins.toLocaleString()} coins</div>
                  </div>
                  <div className="player-status">
                    {player.isReady ? (
                      <span className="status-badge ready">✓ Listo</span>
                    ) : (
                      <span className="status-badge waiting">Esperando...</span>
                    )}
                  </div>
                  {isHost && player.id !== userId && player.id !== game?.hostId && (
                    <button
                      className="btn-remove-player"
                      onClick={() => handleRemovePlayer(player.id)}
                      title="Remover jugador"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="lobby-actions">
            <button
              className={`btn-ready ${isReady ? 'ready' : ''}`}
              onClick={handleToggleReady}
            >
              {isReady ? '✓ Listo' : 'Marcar como Listo'}
            </button>

            {isHost && allPlayersReady && (
              <button
                className="btn-start-game"
                onClick={handleStartGame}
              >
                Iniciar Partida
              </button>
            )}
            
            {isHost && !allPlayersReady && players.length > 1 && (
              <div className="waiting-message">
                ⏳ Esperando a que todos los jugadores estén listos...
              </div>
            )}
            
            {players.length === 1 && (
              <div className="waiting-message">
                👥 Esperando a que más jugadores se unan...
              </div>
            )}

            <button
              className="btn-leave"
              onClick={() => {
                localStorage.removeItem('roomCode');
                navigate('/coins-selection');
              }}
            >
              Salir del Lobby
            </button>
          </div>

          <div className="lobby-info">
            <div className="info-box">
              <h3>Reglas del Juego</h3>
              <ul>
                <li>Alcanza exactamente 99 o 100 puntos para ganar</li>
                <li>Puedes pedir fichas o usar el comodín</li>
                <li>Si te pasas de 100, quedas eliminado</li>
                <li>El ganador se lleva todo el pot</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <ConfirmModal
          title="Cerrar Sesión"
          message="¿Estás seguro de que deseas cerrar sesión? Perderás tu progreso actual."
          type="warning"
          confirmText="Sí, cerrar sesión"
          cancelText="Cancelar"
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutConfirm(false)}
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
