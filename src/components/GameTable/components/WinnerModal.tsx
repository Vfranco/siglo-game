import { motion } from 'framer-motion';
import './WinnerModal.css';

interface WinnerModalProps {
  winnerName: string;
  isCurrentPlayer: boolean;
  potWon: number;
  winType: 'siglo' | 'highest-score';
  winnerScore: number;
  onNewRound: () => void;
  onBackToLobby: () => void;
}

export const WinnerModal = ({
  winnerName,
  isCurrentPlayer,
  potWon,
  winType,
  winnerScore,
  onNewRound,
  onBackToLobby,
}: WinnerModalProps) => {
  return (
    <motion.div
      className="winner-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="winner-modal"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Confetti animation */}
        <div className="confetti-container">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="confetti" />
          ))}
        </div>

        {/* Winner content */}
        <div className="winner-content">
          {winType === 'siglo' ? (
            <>
              <motion.div
                className="winner-badge siglo"
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                🏆
              </motion.div>
              <h1 className="winner-title siglo">
                {isCurrentPlayer ? '¡SIGLO!' : '¡SIGLO!'}
              </h1>
            </>
          ) : (
            <>
              <motion.div
                className="winner-badge highest"
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                👑
              </motion.div>
              <h1 className="winner-title highest">
                {isCurrentPlayer ? '¡Ganaste!' : `¡${winnerName} Ganó!`}
              </h1>
            </>
          )}

          <div className="winner-details">
            <p className="winner-name">
              {isCurrentPlayer ? 'Tú ganaste' : winnerName}
            </p>
            <p className="winner-score">
              {winType === 'siglo' 
                ? `Hizo Siglo con ${winnerScore} puntos` 
                : `Mayor pinta: ${winnerScore} puntos`
              }
            </p>
            <div className="pot-won">
              <span className="pot-label">Premio:</span>
              <span className="pot-amount">+{potWon} 🪙</span>
            </div>
          </div>

          <div className="winner-actions">
            <button
              className="btn btn-primary"
              onClick={onNewRound}
            >
              🔄 Nueva Ronda
            </button>
            <button
              className="btn btn-secondary"
              onClick={onBackToLobby}
            >
              🏠 Volver al Lobby
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
