import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../../utils/animations';
import { useAuthContext } from '../../contexts/AuthContext';
import { InstructionsModal } from '../shared/InstructionsModal';
import sigloLogo from '../../assets/images/siglo-image.png';
import './WelcomeScreen.css';

export const WelcomeScreen = () => {
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const navigate = useNavigate();
  const { signIn, user } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      setIsLoading(true);
      setError('');
      
      // Autenticar anónimamente si no está autenticado
      if (!user) {
        await signIn();
      }
      
      // Guardar el nombre en localStorage
      localStorage.setItem('playerName', trimmedName);
      
      // Mostrar instrucciones antes de continuar
      setShowInstructions(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Error en autenticación:', err);
      setError('Error al iniciar sesión. Intenta de nuevo.');
      setIsLoading(false);
    }
  };

  const handleContinueAfterInstructions = () => {
    setShowInstructions(false);
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
      {showInstructions && (
        <InstructionsModal onContinue={handleContinueAfterInstructions} />
      )}
      
      <div className="welcome-container">
        <div className="logo-container">
          <img src={sigloLogo} alt="SIGLO!" className="game-logo" />
          
          {/* Fichas flotantes debajo del logo */}
          <div className="chips-container">
            <motion.div 
              className="floating-chip chip-left"
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 5, 0, -5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="chip-inner">
                <span className="chip-number">84</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="floating-chip chip-right"
              animate={{ 
                y: [0, -12, 0],
                rotate: [0, -5, 0, 5, 0]
              }}
              transition={{ 
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              <div className="chip-inner">
                <span className="chip-number">16</span>
              </div>
            </motion.div>
          </div>
          
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
            disabled={!playerName.trim() || isLoading}
          >
            {isLoading ? 'Conectando...' : 'Continuar'} {!isLoading && <span className="keyboard-hint">↵</span>}
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
