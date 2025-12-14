import './LobbyTopBar.css';

interface LobbyTopBarProps {
  playerName: string;
  playerCoins: number;
  onLogout: () => void;
}

export const LobbyTopBar = ({ playerName, playerCoins, onLogout }: LobbyTopBarProps) => {
  return (
    <div className="lobby-top-bar">
      <div className="lobby-top-bar-content">
        <div className="lobby-top-bar-left">
          <div className="game-logo">
            <span className="logo-icon">🎲</span>
            <span className="logo-text">Siglo!</span>
          </div>
        </div>

        <div className="lobby-top-bar-center">
          <button 
            className="logout-button"
            onClick={onLogout}
            title="Cerrar sesión"
          >
            <span className="logout-icon">🚪</span>
            <span className="logout-text">Cerrar Sesión</span>
          </button>
        </div>

        <div className="lobby-top-bar-right">
          <div className="player-coins-lobby">
            <span className="coins-icon">🪙</span>
            <span className="coins-amount">{playerCoins}</span>
          </div>
          <div className="player-profile-lobby">
            <div className="player-avatar-lobby">
              {playerName.charAt(0).toUpperCase()}
            </div>
            <span className="player-name-lobby">{playerName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
