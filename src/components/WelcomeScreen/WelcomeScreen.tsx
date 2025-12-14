import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../../utils/animations';
import './WelcomeScreen.css';

export const WelcomeScreen = () => {
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = playerName.trim();

    if (!trimmedName) {
      setError('Por favor ingresa tu nombre');
      return;
    }

    if (trimmedName.length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      return;
    }

    // Guardar el nombre en localStorage temporalmente
    localStorage.setItem('playerName', trimmedName);
    navigate('/coins-selection');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value);
    if (error) setError('');
  };

  return (
    <motion.div
      className="welcome-screen"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <div className="welcome-container">
        <div className="logo-container">
          <h1 className="game-title">SIGLO!</h1>
          <p className="game-subtitle">El juego de los 99 puntos</p>
        </div>

        <form onSubmit={handleSubmit} className="welcome-form">
          <div className="form-group">
            <label htmlFor="playerName">Ingresa tu nombre</label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={handleNameChange}
              placeholder="Tu nombre aquí..."
              maxLength={20}
              autoFocus
              className={`name-input ${error ? 'error' : ''}`}
            />
            {error && <p className="error-message">{error}</p>}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={!playerName.trim()}
          >
            Continuar <span className="keyboard-hint">↵</span>
          </button>
        </form>

        <div className="welcome-footer">
          <p className="game-description">
            Apuesta, juega y alcanza exactamente 99 o 100 puntos para ganar el pot
          </p>
        </div>
      </div>
    </motion.div>
  );
};
