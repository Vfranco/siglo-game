import { motion } from 'framer-motion';
import './WildcardDisplay.css';

interface WildcardDisplayProps {
  value: number;
  revealed: boolean;
  active: boolean;
}

export const WildcardDisplay = ({ value, revealed, active }: WildcardDisplayProps) => {
  return (
    <motion.div
      className={`wildcard-display ${active ? 'active' : ''}`}
      whileHover={{ scale: 1.05 }}
    >
      <div className="wildcard-label">COMODÍN</div>
      <div className="wildcard-card">
        {revealed ? (
          <motion.div
            className="wildcard-value"
            initial={{ rotateY: 90 }}
            animate={{ rotateY: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="wildcard-number">{value}</span>
          </motion.div>
        ) : (
          <div className="wildcard-hidden">?</div>
        )}
      </div>
      {active && <div className="wildcard-active-badge">ACTIVO</div>}
    </motion.div>
  );
};
