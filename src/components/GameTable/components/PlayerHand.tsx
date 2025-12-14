import { motion } from 'framer-motion';
import { PlayerStatus } from '../../../types';
import './PlayerHand.css';

interface PlayerHandProps {
  hand: number[];
  total: number;
  wildcardActive: boolean;
  wildcardValue: number;
  playerName: string;
  status: PlayerStatus;
}

export const PlayerHand = ({
  hand,
  total,
  wildcardActive,
  wildcardValue,
  playerName,
  status,
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
