import { motion } from 'framer-motion';
import { PlayerStatus, BustedHistory } from '../../../types';
import './PlayerHand.css';

interface PlayerHandProps {
  hand: number[];
  total: number;
  wildcardActive: boolean;
  wildcardValue: number;
  playerName: string;
  status: PlayerStatus;
  bustedHistory?: BustedHistory | null;
}

export const PlayerHand = ({
  hand,
  total,
  wildcardActive,
  wildcardValue,
  playerName,
  status,
  bustedHistory,
}: PlayerHandProps) => {
  const getTotalColor = () => {
    if (total === 99 || total === 100) return 'siglo';
    if (total > 100) return 'busted';
    if (total >= 90) return 'close';
    return 'safe';
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'busted':
        return '¡Te pasaste de 100!';
      case 'winner':
        return '¡SIGLO! ¡Ganaste!';
      case 'stood':
        return 'Te quedaste con tu mano';
      default:
        return '';
    }
  };

  return (
    <div className="player-hand-container">
      <div className="player-hand-header">
        <h3 className="player-hand-name">{playerName}</h3>
        {status !== 'playing' && (
          <div className={`status-message ${status}`}>
            {getStatusMessage()}
          </div>
        )}
      </div>

      <div className="player-hand-tiles">
        {hand.length === 0 && !wildcardActive && status === 'busted' && bustedHistory ? (
          <motion.div 
            className="busted-history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="busted-history-header">
              <div className="busted-icon">💥</div>
              <div className="busted-title">¡Te pasaste!</div>
            </div>
            
            <div className="busted-history-tiles">
              <div className="history-label">Tu partida fue:</div>
              <div className="history-tiles-container">
                {bustedHistory.hand.map((tile, index) => (
                  <div key={index} className="history-tile">
                    {tile}
                  </div>
                ))}
                {bustedHistory.wildcardActive && (
                  <div className="history-tile wildcard">
                    {bustedHistory.wildcardValue}★
                  </div>
                )}
              </div>
              <div className="history-total">
                Total: <span className="history-total-value">{bustedHistory.total}</span>
              </div>
            </div>
            
            <div className="busted-message">
              <p>Fichas devueltas a la bolsa</p>
              <p className="encouragement">¡Sigue intentándolo! 🎲</p>
            </div>
          </motion.div>
        ) : (
          <>
            {hand.map((tile, index) => (
              <motion.div
                key={index}
                className="tile"
                initial={{ scale: 0, rotateY: 180 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{
                  delay: index * 0.1,
                  type: 'spring',
                  stiffness: 200,
                }}
              >
                <div className="tile-value">{tile}</div>
              </motion.div>
            ))}

            {wildcardActive && (
              <motion.div
                className="tile wildcard-tile"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <div className="tile-value">{wildcardValue}</div>
                <div className="tile-badge">★</div>
              </motion.div>
            )}
          </>
        )}
      </div>

      <div className="player-hand-total">
        <div className="total-calculation">
          {hand.join(' + ')}
          {wildcardActive && ` + ${wildcardValue}★`}
        </div>
        <div className={`total-value ${getTotalColor()}`}>
          = {total}
        </div>
      </div>
    </div>
  );
};
