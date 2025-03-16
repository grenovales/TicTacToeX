/**
 * TicTacToe game engine
 */

import { GameAction, GameDifficulty, GameMode, GameState, Move, Player, TicTacToeEngine } from './types';

/**
 * Creates a new TicTacToe game engine
 */
export function createTicTacToeEngine(
  initialBoardSize: number = 3,
  initialGameMode: GameMode = 'single',
  initialDifficulty: GameDifficulty = 'unbeatable'
): TicTacToeEngine {
  // Initialize state
  let state: GameState = createInitialState(initialBoardSize, initialGameMode, initialDifficulty);
  const listeners: ((state: GameState) => void)[] = [];

  // Notify all listeners of state changes
  const notifyListeners = () => {
    listeners.forEach(listener => listener({ ...state }));
  };

  // Create a new board with the given size
  function createBoard(size: number): Player[][] {
    return Array(size).fill(null).map(() => Array(size).fill(null));
  }

  // Create initial game state
  function createInitialState(
    boardSize: number, 
    gameMode: GameMode, 
    difficulty: GameDifficulty
  ): GameState {
    return {
      board: createBoard(boardSize),
      currentPlayer: 'X', // X always starts
      winner: null,
      isDraw: false,
      isGameOver: false,
      winningLine: null,
      boardSize,
      moveHistory: [],
      gameMode,
      difficulty
    };
  }

  // Check if a move is valid
  function isValidMove(position: [number, number]): boolean {
    const [row, col] = position;
    
    // Check if the position is within the board boundaries
    if (
      row < 0 || 
      col < 0 || 
      row >= state.boardSize || 
      col >= state.boardSize
    ) {
      return false;
    }
    
    // Check if the position is empty
    return state.board[row][col] === null;
  }

  // Get all available moves
  function getAvailableMoves(): [number, number][] {
    const moves: [number, number][] = [];
    
    for (let row = 0; row < state.boardSize; row++) {
      for (let col = 0; col < state.boardSize; col++) {
        if (state.board[row][col] === null) {
          moves.push([row, col]);
        }
      }
    }
    
    return moves;
  }

  // Check if the game is over (win or draw)
  function checkGameOver(board: Player[][], lastMove?: [number, number]): {
    isGameOver: boolean;
    winner: Player;
    isDraw: boolean;
    winningLine: [number, number][] | null;
  } {
    const size = board.length;
    
    // If we know the last move, we can optimize by only checking rows, columns, and diagonals
    // that include the last move
    if (lastMove) {
      const [row, col] = lastMove;
      const player = board[row][col];
      
      if (!player) return { isGameOver: false, winner: null, isDraw: false, winningLine: null };
      
      // Check row
      let winningLine: [number, number][] = [];
      let isWin = true;
      
      for (let c = 0; c < size; c++) {
        if (board[row][c] !== player) {
          isWin = false;
          break;
        }
        winningLine.push([row, c]);
      }
      
      if (isWin) {
        return { isGameOver: true, winner: player, isDraw: false, winningLine };
      }
      
      // Check column
      winningLine = [];
      isWin = true;
      
      for (let r = 0; r < size; r++) {
        if (board[r][col] !== player) {
          isWin = false;
          break;
        }
        winningLine.push([r, col]);
      }
      
      if (isWin) {
        return { isGameOver: true, winner: player, isDraw: false, winningLine };
      }
      
      // Check diagonal (if the move is on a diagonal)
      if (row === col) {
        winningLine = [];
        isWin = true;
        
        for (let i = 0; i < size; i++) {
          if (board[i][i] !== player) {
            isWin = false;
            break;
          }
          winningLine.push([i, i]);
        }
        
        if (isWin) {
          return { isGameOver: true, winner: player, isDraw: false, winningLine };
        }
      }
      
      // Check anti-diagonal (if the move is on the anti-diagonal)
      if (row + col === size - 1) {
        winningLine = [];
        isWin = true;
        
        for (let i = 0; i < size; i++) {
          if (board[i][size - 1 - i] !== player) {
            isWin = false;
            break;
          }
          winningLine.push([i, size - 1 - i]);
        }
        
        if (isWin) {
          return { isGameOver: true, winner: player, isDraw: false, winningLine };
        }
      }
    } else {
      // If we don't know the last move, we need to check all rows, columns, and diagonals
      
      // Check rows
      for (let row = 0; row < size; row++) {
        const player = board[row][0];
        if (player) {
          let isWin = true;
          for (let col = 1; col < size; col++) {
            if (board[row][col] !== player) {
              isWin = false;
              break;
            }
          }
          
          if (isWin) {
            const winningLine: [number, number][] = Array(size).fill(0).map((_, i) => [row, i]);
            return { isGameOver: true, winner: player, isDraw: false, winningLine };
          }
        }
      }
      
      // Check columns
      for (let col = 0; col < size; col++) {
        const player = board[0][col];
        if (player) {
          let isWin = true;
          for (let row = 1; row < size; row++) {
            if (board[row][col] !== player) {
              isWin = false;
              break;
            }
          }
          
          if (isWin) {
            const winningLine: [number, number][] = Array(size).fill(0).map((_, i) => [i, col]);
            return { isGameOver: true, winner: player, isDraw: false, winningLine };
          }
        }
      }
      
      // Check diagonal
      const diagonalPlayer = board[0][0];
      if (diagonalPlayer) {
        let isWin = true;
        for (let i = 1; i < size; i++) {
          if (board[i][i] !== diagonalPlayer) {
            isWin = false;
            break;
          }
        }
        
        if (isWin) {
          const winningLine: [number, number][] = Array(size).fill(0).map((_, i) => [i, i]);
          return { isGameOver: true, winner: diagonalPlayer, isDraw: false, winningLine };
        }
      }
      
      // Check anti-diagonal
      const antiDiagonalPlayer = board[0][size - 1];
      if (antiDiagonalPlayer) {
        let isWin = true;
        for (let i = 1; i < size; i++) {
          if (board[i][size - 1 - i] !== antiDiagonalPlayer) {
            isWin = false;
            break;
          }
        }
        
        if (isWin) {
          const winningLine: [number, number][] = Array(size).fill(0).map((_, i) => [i, size - 1 - i]);
          return { isGameOver: true, winner: antiDiagonalPlayer, isDraw: false, winningLine };
        }
      }
    }
    
    // Check for draw (if all cells are filled)
    let isDraw = true;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row][col] === null) {
          isDraw = false;
          break;
        }
      }
      if (!isDraw) break;
    }
    
    return {
      isGameOver: isDraw,
      winner: null,
      isDraw,
      winningLine: null
    };
  }

  // Make a move on the board
  function makeMove(position: [number, number]): void {
    if (state.isGameOver || !isValidMove(position)) {
      return;
    }
    
    const [row, col] = position;
    const newBoard = state.board.map(r => [...r]);
    newBoard[row][col] = state.currentPlayer;
    
    const move: Move = {
      player: state.currentPlayer,
      position,
      timestamp: Date.now()
    };
    
    const gameOverStatus = checkGameOver(newBoard, position);
    
    state = {
      ...state,
      board: newBoard,
      currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
      moveHistory: [...state.moveHistory, move],
      ...gameOverStatus
    };
    
    notifyListeners();
    
    // If it's single player mode and the game is not over, make AI move
    if (
      state.gameMode === 'single' && 
      !state.isGameOver && 
      state.currentPlayer === 'O'
    ) {
      setTimeout(() => {
        const aiMove = getBestMove();
        if (aiMove) {
          makeMove(aiMove);
        }
      }, 500); // Add a small delay for better UX
    }
  }

  // Minimax algorithm for AI
  function minimax(
    board: Player[][],
    depth: number,
    isMaximizing: boolean,
    alpha: number = -Infinity,
    beta: number = Infinity
  ): { score: number; position?: [number, number] } {
    // For 3x3 boards, we can search the entire game tree
    // For larger boards, we need to limit the search depth to avoid performance issues
    const maxDepth = state.boardSize === 3 ? Infinity : 5;
    
    const gameOverStatus = checkGameOver(board);
    
    // Terminal states
    if (gameOverStatus.isGameOver || depth >= maxDepth) {
      if (gameOverStatus.winner === 'O') {
        return { score: 10 - depth }; // AI wins, prefer quicker wins
      } else if (gameOverStatus.winner === 'X') {
        return { score: depth - 10 }; // Human wins, prefer slower losses
      } else if (gameOverStatus.isDraw) {
        return { score: 0 }; // Draw
      } else if (depth >= maxDepth) {
        // Heuristic evaluation for non-terminal states at max depth
        return { score: evaluateBoard(board) };
      }
    }
    
    let bestScore = isMaximizing ? -Infinity : Infinity;
    let bestMove: [number, number] | undefined;
    
    // Get all available moves
    const availableMoves: [number, number][] = [];
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board.length; col++) {
        if (board[row][col] === null) {
          availableMoves.push([row, col]);
        }
      }
    }
    
    // Randomize move order for more varied gameplay
    shuffleArray(availableMoves);
    
    for (const [row, col] of availableMoves) {
      // Make the move
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = isMaximizing ? 'O' : 'X';
      
      // Recursive call
      const result = minimax(newBoard, depth + 1, !isMaximizing, alpha, beta);
      
      // Update best score and move
      if (isMaximizing) {
        if (result.score > bestScore) {
          bestScore = result.score;
          bestMove = [row, col];
        }
        alpha = Math.max(alpha, bestScore);
      } else {
        if (result.score < bestScore) {
          bestScore = result.score;
          bestMove = [row, col];
        }
        beta = Math.min(beta, bestScore);
      }
      
      // Alpha-beta pruning
      if (beta <= alpha) {
        break;
      }
    }
    
    return { score: bestScore, position: bestMove };
  }

  // Heuristic evaluation function for the board
  function evaluateBoard(board: Player[][]): number {
    const size = board.length;
    let score = 0;
    
    // Check rows, columns, and diagonals for potential wins
    
    // Rows
    for (let row = 0; row < size; row++) {
      score += evaluateLine(board[row]);
    }
    
    // Columns
    for (let col = 0; col < size; col++) {
      const column = board.map(row => row[col]);
      score += evaluateLine(column);
    }
    
    // Diagonal
    const diagonal = board.map((row, i) => row[i]);
    score += evaluateLine(diagonal);
    
    // Anti-diagonal
    const antiDiagonal = board.map((row, i) => row[size - 1 - i]);
    score += evaluateLine(antiDiagonal);
    
    return score;
  }

  // Evaluate a line (row, column, or diagonal)
  function evaluateLine(line: Player[]): number {
    const size = line.length;
    let score = 0;
    
    const countX = line.filter(cell => cell === 'X').length;
    const countO = line.filter(cell => cell === 'O').length;
    const countEmpty = line.filter(cell => cell === null).length;
    
    // If O can win in this line
    if (countX === 0 && countO > 0) {
      score += Math.pow(2, countO);
    }
    
    // If X can win in this line
    if (countO === 0 && countX > 0) {
      score -= Math.pow(2, countX);
    }
    
    return score;
  }

  // Get the best move for the AI based on difficulty
  function getBestMove(): [number, number] | null {
    if (state.isGameOver) {
      return null;
    }
    
    const availableMoves = getAvailableMoves();
    if (availableMoves.length === 0) {
      return null;
    }

    const difficulties = {
      easy: {
        bestMoveChance: 0.3, // 30% chance of making the best move
      },
      medium: {
        bestMoveChance: 0.6, // 60% chance of making the best move
      },
      hard: {
        bestMoveChance: 0.9, // 90% chance of making the best move
      }
    };

    if (state.difficulty !== 'unbeatable') {
      const bestMoveChance = difficulties[state.difficulty].bestMoveChance;

      if (Math.random() < bestMoveChance) { 
        const { position } = minimax(state.board, 0, true);
        return position || availableMoves[Math.floor(Math.random() * availableMoves.length)];
      } else {
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
      }
    }
    
    
    // For hard and unbeatable difficulties, always make the best move
    const { position } = minimax(state.board, 0, true);
    return position || availableMoves[0];
  }

  // Shuffle an array (Fisher-Yates algorithm)
  function shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Reset the game
  function resetGame(): void {
    state = createInitialState(state.boardSize, state.gameMode, state.difficulty);
    notifyListeners();
  }

  // Change the board size
  function changeBoardSize(size: number): void {
    if (size < 3 || size > 10) {
      throw new Error('Board size must be between 3 and 10');
    }
    
    state = createInitialState(size, state.gameMode, state.difficulty);
    notifyListeners();
  }

  // Change the game mode
  function changeGameMode(mode: GameMode): void {
    state = createInitialState(state.boardSize, mode, state.difficulty);
    notifyListeners();
  }

  // Change the difficulty
  function changeDifficulty(difficulty: GameDifficulty): void {
    state = {
      ...state,
      difficulty
    };
    notifyListeners();
  }

  // Undo the last move
  function undoMove(): void {
    if (state.moveHistory.length === 0) {
      return;
    }
    
    // If it's single player mode, undo both the AI's move and the player's move
    if (state.gameMode === 'single') {
      // If the last move was made by the AI (O), undo two moves
      const lastMove = state.moveHistory[state.moveHistory.length - 1];
      
      if (lastMove.player === 'O' && state.moveHistory.length >= 2) {
        // Remove the last two moves
        const newHistory = state.moveHistory.slice(0, -2);
        
        // Recreate the board from the move history
        const newBoard = createBoard(state.boardSize);
        for (const move of newHistory) {
          const [row, col] = move.position;
          newBoard[row][col] = move.player;
        }
        
        state = {
          ...state,
          board: newBoard,
          currentPlayer: 'X', // After undoing, it's always the player's turn
          winner: null,
          isDraw: false,
          isGameOver: false,
          winningLine: null,
          moveHistory: newHistory
        };
      } else if (lastMove.player === 'X') {
        // If the last move was made by the player (X), undo just that move
        const newHistory = state.moveHistory.slice(0, -1);
        
        // Recreate the board from the move history
        const newBoard = createBoard(state.boardSize);
        for (const move of newHistory) {
          const [row, col] = move.position;
          newBoard[row][col] = move.player;
        }
        
        state = {
          ...state,
          board: newBoard,
          currentPlayer: 'X',
          winner: null,
          isDraw: false,
          isGameOver: false,
          winningLine: null,
          moveHistory: newHistory
        };
      }
    } else {
      // For two-player modes, just undo the last move
      const newHistory = state.moveHistory.slice(0, -1);
      
      // Recreate the board from the move history
      const newBoard = createBoard(state.boardSize);
      for (const move of newHistory) {
        const [row, col] = move.position;
        newBoard[row][col] = move.player;
      }
      
      state = {
        ...state,
        board: newBoard,
        currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
        winner: null,
        isDraw: false,
        isGameOver: false,
        winningLine: null,
        moveHistory: newHistory
      };
    }
    
    notifyListeners();
  }

  // Join a remote game
  function joinRemoteGame(roomId: string): void {
    state = {
      ...createInitialState(state.boardSize, 'remote', state.difficulty),
      roomId
    };
    notifyListeners();
  }

  // Handle actions
  function dispatch(action: GameAction): void {
    switch (action.type) {
      case 'MAKE_MOVE':
        makeMove(action.position);
        break;
      case 'RESET_GAME':
        resetGame();
        break;
      case 'CHANGE_BOARD_SIZE':
        changeBoardSize(action.size);
        break;
      case 'CHANGE_GAME_MODE':
        changeGameMode(action.mode);
        break;
      case 'CHANGE_DIFFICULTY':
        changeDifficulty(action.difficulty);
        break;
      case 'UNDO_MOVE':
        undoMove();
        break;
      case 'JOIN_REMOTE_GAME':
        joinRemoteGame(action.roomId);
        break;
      default:
        console.error('Unknown action:', action);
    }
  }

  // Subscribe to state changes
  function subscribe(listener: (state: GameState) => void): () => void {
    listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };
  }

  // Return the public API
  return {
    getState: () => ({ ...state }),
    dispatch,
    getAvailableMoves,
    getBestMove,
    isValidMove,
    subscribe
  };
} 