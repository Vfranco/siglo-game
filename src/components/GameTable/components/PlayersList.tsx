import { Player } from '../../../types';
import './PlayersList.css';

interface PlayersListProps {
  players: Player[];
  currentTurnIndex: number;
  currentPlayerId: string;
}

export const PlayersList = ({
  players,
  currentTurnIndex,
  currentPlayerId,
}: PlayersListProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'busted':
        return '💥';
      case 'winner':
        return '🏆';
      case 'stood':
        return '✋';
      default:
        return '🎮';
    }
  };

  const calculatePlayerTotal = (player: Player) => {
    const handTotal = player.hand.reduce((sum, tile) => sum + tile, 0);
    return player.wildcardActive ? handTotal + 15 : handTotal; // Assuming wildcard value
  };

  return (
    <div className="players-list-game">
      <h3 className="players-list-title">Jugadores</h3>
      <div className="players-grid">
        {players.map((player, index) => {
          const isCurrentTurn = index === currentTurnIndex;
          const isMe = player.id === currentPlayerId;
          const total = calculatePlayerTotal(player);

          return (
            <div
              key={player.id}
              className={`player-card-game ${isCurrentTurn ? 'current-turn' : ''} ${
                isMe ? 'me' : ''
              }`}
            >
              <div className="player-card-header">
                <div className="player-card-name">
                  {player.name}
                  {isMe && <span className="me-badge">TÚ</span>}
                </div>
                <div className="player-card-status">
                  {getStatusIcon(player.status)}
                </div>
              </div>

              <div className="player-card-body">
                <div className="player-card-tiles">
                  {player.hand.length > 0 ? (
                    <>
                      {player.hand.map((tile, idx) => (
                        <div key={idx} className="mini-tile-display">
                          {isMe ? tile : '?'}
                        </div>
                      ))}
                      {player.wildcardActive && (
                        <div className="mini-tile-display wildcard-mini">★</div>
                      )}
                    </>
                  ) : (
                    <div className="no-tiles">Sin fichas</div>
                  )}
                </div>

                {isMe && player.hand.length > 0 && (
                  <div className="player-card-total">
                    Total: <strong>{total}</strong>
                  </div>
                )}
              </div>

              {isCurrentTurn && player.status === 'playing' && (
                <div className="turn-indicator">
                  <div className="turn-pulse"></div>
                  Su turno
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
