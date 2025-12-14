export type RoundState = 'lobby' | 'in_round' | 'resolving' | 'finished';

export type PlayerStatus = 'waiting' | 'playing' | 'stood' | 'busted' | 'winner';

export interface Player {
  id: string;
  name: string;
  coins: number;
  hand: number[];
  status: PlayerStatus;
  bet: number;
  wildcardActive: boolean;
  isReady?: boolean; // Solo usado en lobby
}

export interface Wildcard {
  value: number;
  revealed: boolean;
}

export interface Game {
  id?: string;
  roomCode: string;
  hostId: string;
  players?: Player[];
  deck: number[];
  drawnTiles: number[];
  wildcard: Wildcard;
  pot: number;
  currentTurnIndex: number;
  roundState: RoundState;
  baseBet: number;
  createdAt?: any; // Firebase Timestamp
  updatedAt?: any; // Firebase Timestamp
}

export interface GameState extends Game {
  // Extended state for UI
}
