import { useState } from 'react';
import './ReBetting.css';

interface ReBettingProps {
  playerCoins: number;
  onPlaceBet: (amount: number) => void;
  currentHighestBet: number;
  allBetsPlaced: boolean;
}

export const ReBetting = ({
  playerCoins,
  onPlaceBet,
  currentHighestBet,
  allBetsPlaced,
}: ReBettingProps) => {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [error, setError] = useState<string>('');

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setBetAmount(value);
    setError('');
  };

  const handlePlaceBet = () => {
    if (betAmount < 100) {
      setError('La apuesta mínima es 100 coins');
      return;
    }

    if (betAmount > playerCoins) {
      setError('No tienes suficientes coins');
      return;
    }

    onPlaceBet(betAmount);
  };

  const handleQuickBet = (amount: number) => {
    if (amount <= playerCoins) {
      setBetAmount(amount);
      setError('');
    }
  };

  return (
    <div className="rebetting-overlay">
      <div className="rebetting-modal">
        <div className="rebetting-header">
          <span className="rebetting-icon">💥</span>
          <h2>¡Todos se pasaron de 100!</h2>
          <p className="rebetting-subtitle">Nueva ronda - Apuesta nuevamente</p>
        </div>

        {!allBetsPlaced ? (
          <div className="rebetting-content">
            <div className="coins-available">
              <span>💰 Coins disponibles: </span>
              <strong>{playerCoins}</strong>
            </div>

            {currentHighestBet > 0 && (
              <div className="highest-bet-info">
                <span>🔥 Apuesta más alta: </span>
                <strong>{currentHighestBet} coins</strong>
                <p className="info-text">
                  Deberás igualar esta cantidad si es mayor a tu apuesta
                </p>
              </div>
            )}

            <div className="bet-input-group">
              <label htmlFor="bet-amount">Tu apuesta (mínimo 100)</label>
              <input
                id="bet-amount"
                type="number"
                min="100"
                max={playerCoins}
                value={betAmount}
                onChange={handleBetChange}
                className="bet-input"
              />
              {error && <span className="error-message">{error}</span>}
            </div>

            <div className="quick-bet-buttons">
              <button
                className="btn-quick-bet"
                onClick={() => handleQuickBet(100)}
                disabled={playerCoins < 100}
              >
                100
              </button>
              <button
                className="btn-quick-bet"
                onClick={() => handleQuickBet(500)}
                disabled={playerCoins < 500}
              >
                500
              </button>
              <button
                className="btn-quick-bet"
                onClick={() => handleQuickBet(1000)}
                disabled={playerCoins < 1000}
              >
                1000
              </button>
              <button
                className="btn-quick-bet"
                onClick={() => handleQuickBet(playerCoins)}
                disabled={playerCoins < 100}
              >
                All-in
              </button>
            </div>

            <button
              className="btn-confirm-bet"
              onClick={handlePlaceBet}
              disabled={betAmount < 100 || betAmount > playerCoins}
            >
              Apostar {betAmount} coins
            </button>
          </div>
        ) : (
          <div className="waiting-bets">
            <span className="waiting-icon">⏳</span>
            <p>Esperando que los demás jugadores apuesten...</p>
            <p className="your-bet">Tu apuesta: {betAmount} coins</p>
          </div>
        )}
      </div>
    </div>
  );
};
