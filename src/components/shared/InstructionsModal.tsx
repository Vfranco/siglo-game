import { motion } from 'framer-motion';
import './InstructionsModal.css';

interface InstructionsModalProps {
  onContinue: () => void;
}

export const InstructionsModal = ({ onContinue }: InstructionsModalProps) => {
  return (
    <motion.div
      className="instructions-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="instructions-modal"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="instructions-header">
          <h1 className="instructions-title">🎲 ¿Cómo Jugar Siglo?</h1>
        </div>

        <div className="instructions-content">
          <div className="instruction-section">
            <h3>🎯 Objetivo del Juego</h3>
            <p>Alcanzar <strong>99 o 100 puntos (SIGLO)</strong> o tener la <strong>mayor pinta</strong> sin pasarte de 100.</p>
          </div>

          <div className="instruction-section">
            <h3>🎮 Cómo Jugar</h3>
            <ul>
              <li><strong>Pide Ficha:</strong> Saca una ficha aleatoria del 1 al 90</li>
              <li><strong>Comodín:</strong> Se revela al inicio (valor 1-30), puedes activarlo/desactivarlo</li>
              <li><strong>Quedarse:</strong> Plántate con tu pinta actual y espera a los demás</li>
              <li><strong>Pasarse:</strong> Si superas 100 puntos, pierdes automáticamente</li>
            </ul>
          </div>

          <div className="instruction-section">
            <h3>🏆 Ganar la Partida</h3>
            <ul>
              <li>🥇 <strong>Siglo:</strong> Llegar a 99 o 100 puntos exactos</li>
              <li>🥈 <strong>Mayor Pinta:</strong> Todos se plantaron → gana quien tenga más puntos</li>
              <li>🥉 <strong>Único Superviviente:</strong> Los demás se pasaron → ganas tú</li>
            </ul>
          </div>

          <div className="instruction-section highlight">
            <h3>💰 Apuestas</h3>
            <p>Cada jugador apuesta fichas al inicio. El ganador se lleva todo el <strong>POT</strong>.</p>
          </div>

          <div className="instruction-tip">
            <strong>💡 Consejo:</strong> ¡Usa el comodín estratégicamente! Puede ser la diferencia entre ganar y perder.
          </div>
        </div>

        <div className="instructions-footer">
          <button className="btn-continue" onClick={onContinue}>
            ¡Entendido! Vamos a Jugar 🎮
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
