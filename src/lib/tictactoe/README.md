# TicTacToe Game Library

A comprehensive TicTacToe game engine with advanced features.

## Features

- **Variable Board Sizes**: Support for different board sizes (3x3, 4x4, etc.)
- **Multiple Game Modes**:
  - Single Player (vs AI)
  - Local Multiplayer (two players on the same device)
  - Remote Multiplayer (via PartyKit)
- **Adjustable AI Difficulty**:
  - Easy: Makes random moves with occasional good moves
  - Medium: Makes good moves with occasional mistakes
  - Hard: Always makes the best move
  - Unbeatable: Uses minimax algorithm with alpha-beta pruning
- **Optimized Performance**: 
  - Efficient win detection
  - Alpha-beta pruning for faster AI decision making
  - Depth-limited search for larger board sizes
- **Remote Play Support**: 
  - Built-in PartyKit integration
  - Real-time synchronization
  - Chat functionality

## Usage

### Basic Usage

```typescript
import { createTicTacToeGame } from '@lib/tictactoe';

// Create a new game with default settings (3x3 board, single player, unbeatable AI)
const game = createTicTacToeGame();

// Get the current game state
const state = game.getState();

// Make a move
game.dispatch({ type: 'MAKE_MOVE', position: [0, 0] });

// Subscribe to state changes
const unsubscribe = game.subscribe((state) => {
  console.log('Game state updated:', state);
});

// Clean up when done
unsubscribe();
```

### Customizing the Game

```typescript
import { createTicTacToeGame } from '@lib/tictactoe';

// Create a 4x4 game with medium difficulty
const game = createTicTacToeGame(4, 'single', 'medium');

// Change the board size
game.dispatch({ type: 'CHANGE_BOARD_SIZE', size: 5 });

// Change the game mode
game.dispatch({ type: 'CHANGE_GAME_MODE', mode: 'local' });

// Change the difficulty
game.dispatch({ type: 'CHANGE_DIFFICULTY', difficulty: 'hard' });
```

### Remote Multiplayer

```typescript
import { TicTacToeRemoteAdapter, generateRoomId } from '@lib/tictactoe';

// Generate a room ID
const roomId = generateRoomId();

// Create a remote adapter
const remote = new TicTacToeRemoteAdapter(
  roomId,
  'player-123',
  'Player 1',
  (state) => {
    console.log('Game state updated:', state);
  },
  (players) => {
    console.log('Players updated:', players);
  },
  (message) => {
    console.log('Chat message:', message);
  }
);

// Connect to the remote server
remote.connect();

// Make a move
remote.dispatchAction({ type: 'MAKE_MOVE', position: [0, 0] });

// Send a chat message
remote.sendChatMessage('Hello, world!');

// Disconnect when done
remote.disconnect();
```

## Implementation Details

### Game Engine

The game engine uses a state-based architecture with a reducer pattern. Actions are dispatched to modify the state, and listeners are notified of state changes.

### AI Algorithm

The AI uses the minimax algorithm with alpha-beta pruning to find the best move. For 3x3 boards, it can search the entire game tree. For larger boards, it uses a depth-limited search with a heuristic evaluation function.

### Remote Multiplayer

Remote multiplayer is implemented using PartyKit, a serverless WebSocket platform. The client-side adapter handles connection management, message serialization, and reconnection logic.

## Future Improvements

- Add support for custom win conditions
- Implement time travel (undo/redo)
- Add support for spectators in remote play
- Implement game recording and replay
- Add support for tournaments 