import './TopBar.css';

interface TopBarProps {
  playerName: string;
  playerCoins: number;
  roomCode: string;
  onLeave: () => void;
}

export const TopBar = ({ playerName, playerCoins, roomCode, onLeave }: TopBarProps) => {
  return (
    <div className="top-bar">
      <div className="top-bar-content">
        <div className="top-bar-left">
          <div className="room-code-badge">
            <span className="room-label">Sala:</span>
            <span className="room-code">{roomCode}</span>
          </div>
        </div>

        <div className="top-bar-center">
          <button 
            className="leave-button"
            onClick={onLeave}
            title="Abandonar partida"
          >
            <span className="leave-icon">🚪</span>
            <span className="leave-text">Salir</span>
          </button>
        </div>

        <div className="top-bar-right">
          <div className="player-coins">
            <span className="coins-icon">🪙</span>
            <span className="coins-amount">{playerCoins}</span>
          </div>
          <div className="player-profile">
            <div className="player-avatar">
              {playerName.charAt(0).toUpperCase()}
            </div>
            <span className="player-name">{playerName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
