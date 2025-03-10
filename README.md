# TicTacToeX Game
React Native TicTacToe

## Features

### Variable Board Sizes: 
- Support for different board sizes (3x3, 4x4, etc.)

### Multiple Game Modes:
- Single Player (vs Machine)
- Local Multiplayer (two players on the same device)
- Remote Multiplayer (via PartyKit) - **WIP**
### Adjustable Difficulty:
- Easy: Makes random moves with occasional good moves
- Medium: Makes good moves with occasional mistakes
- Hard: Always makes the best move
- Unbeatable: Uses minimax algorithm with alpha-beta pruning

### Remote Multiplayer (WIP):
- Built-in PartyKit integration
- Real-time synchronization
- Chat?
- Tournaments?
- Leader Boards?

## Implementation Details

### Game Engine
The game engine uses a state-based architecture with a reducer pattern. Actions are dispatched to modify the state, and listeners are notified of state changes.

### Algorithm
The machine uses the minimax algorithm with alpha-beta pruning to find the best move. For 3x3 boards, it can search the entire game tree. For larger boards, it uses a depth-limited search with a heuristic evaluation function.

### Remote Multiplayer (WIP)

Remote multiplayer is implemented using PartyKit, a serverless WebSocket platform. The client-side adapter handles connection management, message serialization, and reconnection logic. For PartyKit Server Code visit [TikTacToeX-Party](https://github.com/grenovales/TicTacToeX-Party)

## Future Improvements
- Tournaments? Leader Board?