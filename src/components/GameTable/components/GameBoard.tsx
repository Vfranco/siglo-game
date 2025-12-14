import { ReactNode } from 'react';
import './GameBoard.css';

interface GameBoardProps {
  children: ReactNode;
}

export const GameBoard = ({ children }: GameBoardProps) => {
  return (
    <div className="game-board">
      <div className="felt-texture"></div>
      <div className="game-content">
        {children}
      </div>
    </div>
  );
};
