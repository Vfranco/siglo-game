import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../../utils/animations';
import { useAuthContext } from '../../contexts/AuthContext';
import { useGameSounds } from '../../hooks/useGameSounds';
import './CoinsSelection.css';

const COIN_OPTIONS = [1000, 2000, 3000, 4000];

export const CoinsSelection = () => {
  const [selectedCoins, setSelectedCoins] = useState<number | null>(null);
  const [playerName, setPlayerName] = useState('');
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const sounds = useGameSounds();

  useEffect(() => {
    const name = localStorage.getItem('playerName');
    if (!name || !user) {
      navigate('/');
      return;
    }
    setPlayerName(name);
  }, [navigate, user]);

  const handleCoinSelect = (amount: number) => {
    sounds.playCoinSelect();
    setSelectedCoins(amount);
  };

  const handleContinue = useCallback(() => {
    if (selectedCoins && user) {
      localStorage.setItem('playerCoins', selectedCoins.toString());
      localStorage.setItem('userId', user.uid);
      navigate('/lobby');
    }
  }, [selectedCoins, navigate, user]);

  // Keyboard shortcuts: 1-4 para seleccionar, Enter para continuar
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '4') {
        const index = parseInt(e.key) - 1;
        handleCoinSelect(COIN_OPTIONS[index]);
      } else if (e.key === 'Enter' && selectedCoins) {
        handleContinue();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedCoins, handleContinue]);

  return (
    <motion.div
      className="coins-selection-screen"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <div className="coins-container">
        <div className="coins-header">
          <h2 className="welcome-text">Bienvenido, {playerName}</h2>
          <h1 className="coins-title">Selecciona tus Coins</h1>
          <p className="coins-subtitle">
            Elige la cantidad de coins con la que quieres empezar a jugar
          </p>
        </div>

        <div className="coins-options">
          {COIN_OPTIONS.map((amount, index) => (
            <button
              key={amount}
              className={`coin-option ${selectedCoins === amount ? 'selected' : ''}`}
              onClick={() => handleCoinSelect(amount)}
            >
              <div className="coin-icon">💰</div>
              <div className="coin-amount">{amount.toLocaleString()}</div>
              <div className="coin-label">coins</div>
              <div className="keyboard-number">{index + 1}</div>
            </button>
          ))}
        </div>

        <div className="coins-actions">
          <button
            className="btn-secondary"
            onClick={() => navigate('/')}
          >
            Atrás
          </button>
          <button
            className="btn-primary"
            onClick={handleContinue}
            disabled={selectedCoins === null}
          >
            Continuar al Lobby <span className="keyboard-hint">↵</span>
          </button>
        </div>

        <div className="coins-info">
          <p className="info-text">
            💡 Podrás usar estos coins para apostar en cada ronda del juego
          </p>
        </div>
      </div>
    </motion.div>
  );
};
