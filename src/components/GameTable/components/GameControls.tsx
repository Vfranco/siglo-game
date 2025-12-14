import { PlayerStatus } from '../../../types';
import './GameControls.css';

interface GameControlsProps {
  isMyTurn: boolean;
  myStatus: PlayerStatus;
  onDrawTiles: (count: number) => void;
  onToggleWildcard: () => void;
  onStand: () => void;
  wildcardActive: boolean;
  canDraw: boolean;
}

export const GameControls = ({
  isMyTurn,
  myStatus,
  onDrawTiles,
  onToggleWildcard,
  onStand,
  wildcardActive,
  canDraw,
}: GameControlsProps) => {
  return (
    <div className="game-controls">
      {!isMyTurn && myStatus === 'playing' && (
        <div className="waiting-turn">
          <span className="waiting-icon">⏳</span>
          Esperando tu turno...
        </div>
      )}

      {isMyTurn && myStatus === 'playing' && (
        <>
          <div className="control-group">
            <button
              className="btn-draw"
              onClick={() => onDrawTiles(1)}
              disabled={!canDraw}
            >
              🎲 Pedir Ficha
            </button>
          </div>

          <div className="control-group">
            <button
              className={`btn-wildcard ${wildcardActive ? 'active' : ''}`}
              onClick={onToggleWildcard}
            >
              {wildcardActive ? '★ Comodín Activo' : 'Activar Comodín'}
            </button>
          </div>

          <div className="control-group">
            <button
              className="btn-stand"
              onClick={onStand}
            >
              ✓ Quedarse
            </button>
          </div>
        </>
      )}

      {myStatus === 'busted' && (
        <div className="game-over busted">
          <span className="game-over-icon">💥</span>
          <p>¡Te pasaste de 100!</p>
          <p className="game-over-subtitle">Mejor suerte en la próxima ronda</p>
        </div>
      )}

      {myStatus === 'winner' && (
        <div className="game-over winner">
          <span className="game-over-icon">🏆</span>
          <p>¡SIGLO!</p>
          <p className="game-over-subtitle">¡Ganaste el pot!</p>
        </div>
      )}

      {myStatus === 'stood' && (
        <div className="game-over stood">
          <span className="game-over-icon">✋</span>
          <p>Te quedaste</p>
          <p className="game-over-subtitle">Esperando a los demás jugadores</p>
        </div>
      )}
    </div>
  );
};
