import './DeckDisplay.css';

interface DeckDisplayProps {
  remainingTiles: number;
  drawnTiles: number[];
}

export const DeckDisplay = ({ remainingTiles, drawnTiles }: DeckDisplayProps) => {
  const lastDrawn = drawnTiles.slice(-3).reverse();

  return (
    <div className="deck-display">
      <div className="deck-info">
        <div className="deck-icon">🎒</div>
        <div className="deck-count">{remainingTiles}</div>
        <div className="deck-label">fichas restantes</div>
      </div>

      {lastDrawn.length > 0 && (
        <div className="last-drawn">
          <div className="last-drawn-label">Últimas extraídas:</div>
          <div className="last-drawn-tiles">
            {lastDrawn.map((tile, index) => (
              <div key={index} className="mini-tile">
                {tile}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
