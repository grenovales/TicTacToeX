/**
 * TicTacToe game library
 * 
 * This library provides a complete TicTacToe game engine with:
 * - Variable board sizes (3x3, 4x4, etc.)
 * - Multiple game modes (single player, local multiplayer, remote multiplayer)
 * - Adjustable AI difficulty (easy, medium, hard, unbeatable)
 * - Remote multiplayer support via PartyKit
 */

// Export types
export * from './types';

// Export game engine
export { createTicTacToeEngine } from './engine';

// Export remote adapter
export { TicTacToeRemoteAdapter } from './remote';

// Re-export common utilities
import { createTicTacToeEngine } from './engine';
import { GameDifficulty, GameMode, GameState, TicTacToeEngine } from './types';

/**
 * Create a new TicTacToe game with the specified options
 */
export function createTicTacToeGame(
  boardSize: number = 3,
  gameMode: GameMode = 'single',
  difficulty: GameDifficulty = 'unbeatable'
): TicTacToeEngine {
  return createTicTacToeEngine(boardSize, gameMode, difficulty);
}

/**
 * Helper function to get the cell index from row and column
 */
export function getCellIndex(row: number, col: number, boardSize: number): number {
  return row * boardSize + col;
}

/**
 * Helper function to get the row and column from cell index
 */
export function getRowCol(index: number, boardSize: number): [number, number] {
  const row = Math.floor(index / boardSize);
  const col = index % boardSize;
  return [row, col];
}

/**
 * Helper function to create a range of numbers
 */
export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start }, (_, i) => start + i);
}

/**
 * Helper function to determine if a cell is part of the winning line
 */
export function isWinningCell(
  row: number,
  col: number,
  winningLine: [number, number][] | null
): boolean {
  if (!winningLine) return false;
  
  return winningLine.some(([r, c]) => r === row && c === col);
}

/**
 * Helper function to get a descriptive game result message
 */
export function getGameResultMessage(state: GameState): string {
  if (!state.isGameOver) {
    return `Current player: ${state.currentPlayer}`;
  }
  
  if (state.isDraw) {
    return 'Game ended in a draw!';
  }
  
  return `Player ${state.winner} wins!`;
}

/**
 * Helper function to generate a random room ID for remote play
 */
export function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Helper function to determine if a move is valid
 */
export function isValidMove(board: (string | null)[][], row: number, col: number): boolean {
  // Check if the position is within the board boundaries
  if (
    row < 0 || 
    col < 0 || 
    row >= board.length || 
    col >= board[0].length
  ) {
    return false;
  }
  
  // Check if the position is empty
  return board[row][col] === null;
} 