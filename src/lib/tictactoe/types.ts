/**
 * TicTacToe game types
 */

export type Player = 'X' | 'O' | null;

export type GameMode = 'single' | 'local' | 'remote';

export type GameDifficulty = 'easy' | 'medium' | 'hard' | 'unbeatable';

export type GameState = {
  board: Player[][];
  currentPlayer: Player;
  winner: Player;
  isDraw: boolean;
  isGameOver: boolean;
  winningLine: [number, number][] | null;
  boardSize: number;
  moveHistory: Move[];
  gameMode: GameMode;
  difficulty: GameDifficulty;
  roomId?: string; // For remote play
};

export type Move = {
  player: Player;
  position: [number, number]; // [row, col]
  timestamp: number;
};

export type GameAction = 
  | { type: 'MAKE_MOVE'; position: [number, number] }
  | { type: 'RESET_GAME' }
  | { type: 'CHANGE_BOARD_SIZE'; size: number }
  | { type: 'CHANGE_GAME_MODE'; mode: GameMode }
  | { type: 'CHANGE_DIFFICULTY'; difficulty: GameDifficulty }
  | { type: 'UNDO_MOVE' }
  | { type: 'JOIN_REMOTE_GAME'; roomId: string };

export interface TicTacToeEngine {
  getState: () => GameState;
  dispatch: (action: GameAction) => void;
  getAvailableMoves: () => [number, number][];
  getBestMove: () => [number, number] | null;
  isValidMove: (position: [number, number]) => boolean;
  subscribe: (listener: (state: GameState) => void) => () => void;
} 