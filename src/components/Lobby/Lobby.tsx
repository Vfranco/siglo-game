import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../../utils/animations';
import './Lobby.css';

interface LobbyPlayer {
  id: string;
  name: string;
  coins: number;
  isReady: boolean;
}

const MAX_PLAYERS = 6;

// Generate a random room code
const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const Lobby = () => {
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [baseBet] = useState(100);
  const [roomCode] = useState(generateRoomCode());
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem('playerName');
    const coins = localStorage.getItem('playerCoins');

    if (!name || !coins) {
      navigate('/');
      return;
    }

    setPlayerName(name);

    // Simulación de jugadores (esto se reemplazará con Firebase)
    const currentPlayer: LobbyPlayer = {
      id: '1',
      name: name,
      coins: parseInt(coins),
      isReady: false,
    };

    // Jugadores de ejemplo
    const mockPlayers: LobbyPlayer[] = [
      currentPlayer,
      {
        id: '2',
        name: 'Jugador 2',
        coins: 2000,
        isReady: true,
      },
      {
        id: '3',
        name: 'Jugador 3',
        coins: 1000,
        isReady: false,
      },
    ];

    setPlayers(mockPlayers);
  }, [navigate]);

  const handleToggleReady = () => {
    setIsReady(!isReady);
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === '1' ? { ...p, isReady: !isReady } : p
      )
    );
  };

  const handleStartGame = () => {
    // Navegar a la mesa de juego
    navigate('/game');
  };

  const handleCopyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const somePlayersReady = players.some((p) => p.isReady);
  const roomFull = players.length >= MAX_PLAYERS;

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
          <div className="players-section">
            <h2 className="section-title">Jugadores en la Sala</h2>
            <div className="players-list">
              {players.map((player) => (
                <div
                  key={player.id}
                  className={`player-card ${player.isReady ? 'ready' : ''} ${
                    player.name === playerName ? 'current-player' : ''
                  }`}
                >
                  <div className="player-avatar">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="player-info">
                    <div className="player-name">
                      {player.name}
                      {player.name === playerName && (
                        <span className="you-badge">Tú</span>
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

            {somePlayersReady && (
              <button
                className="btn-start-game"
                onClick={handleStartGame}
              >
                Iniciar Partida
              </button>
            )}

            <button
              className="btn-leave"
              onClick={() => navigate('/coins-selection')}
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
    </motion.div>
  );
};
