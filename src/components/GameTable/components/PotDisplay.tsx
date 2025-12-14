import './PotDisplay.css';

interface PotDisplayProps {
  pot: number;
}

export const PotDisplay = ({ pot }: PotDisplayProps) => {
  return (
    <div className="pot-display">
      <div className="pot-label">POT</div>
      <div className="pot-amount">
        <span className="pot-icon">💰</span>
        <span className="pot-value">{pot.toLocaleString()}</span>
        <span className="pot-coins">coins</span>
      </div>
    </div>
  );
};
