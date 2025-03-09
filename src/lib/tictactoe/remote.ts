/**
 * TicTacToe remote multiplayer adapter using PartyKit
 */

import { GameAction, GameState, Move, Player } from './types';

// Define the message types for PartyKit communication
export type PartyMessage = 
  | { type: 'JOIN_GAME'; playerId: string; playerName: string }
  | { type: 'LEAVE_GAME'; playerId: string }
  | { type: 'GAME_ACTION'; action: GameAction; playerId: string }
  | { type: 'SYNC_STATE'; state: GameState }
  | { type: 'CHAT_MESSAGE'; message: string; playerId: string; playerName: string };

export type PartyState = {
  gameState: GameState;
  players: {
    [playerId: string]: {
      name: string;
      role: Player; // 'X', 'O', or null (spectator)
      connected: boolean;
      lastActivity: number;
    };
  };
  chatHistory: {
    message: string;
    playerId: string;
    playerName: string;
    timestamp: number;
  }[];
};

/**
 * This is a client-side adapter for PartyKit.
 * The actual PartyKit server implementation would be in a separate project.
 * 
 * For a complete implementation, you would need to:
 * 1. Create a PartyKit project
 * 2. Implement the server-side logic
 * 3. Deploy the PartyKit server
 * 
 * This adapter provides the client-side interface to interact with the PartyKit server.
 */
export class TicTacToeRemoteAdapter {
  private ws: WebSocket | null = null;
  private playerId: string;
  private playerName: string;
  private roomId: string;
  private onStateChange: (state: GameState) => void;
  private onPlayersChange: (players: PartyState['players']) => void;
  private onChatMessage: (message: PartyState['chatHistory'][0]) => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(
    roomId: string,
    playerId: string,
    playerName: string,
    onStateChange: (state: GameState) => void,
    onPlayersChange: (players: PartyState['players']) => void,
    onChatMessage: (message: PartyState['chatHistory'][0]) => void
  ) {
    this.roomId = roomId;
    this.playerId = playerId;
    this.playerName = playerName;
    this.onStateChange = onStateChange;
    this.onPlayersChange = onPlayersChange;
    this.onChatMessage = onChatMessage;
  }

  /**
   * Connect to the PartyKit server
   */
  connect(): void {
    // In a real implementation, you would use your PartyKit server URL
    // For now, we'll use a placeholder URL
    const url = `wss://your-partykit-server.com/party/${this.roomId}`;
    
    this.ws = new WebSocket(url);
    
    this.ws.onopen = () => {
      console.log('Connected to PartyKit server');
      this.reconnectAttempts = 0;
      
      // Join the game
      this.send({
        type: 'JOIN_GAME',
        playerId: this.playerId,
        playerName: this.playerName
      });
    };
    
    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as PartyMessage;
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
    
    this.ws.onclose = () => {
      console.log('Disconnected from PartyKit server');
      this.attemptReconnect();
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.ws?.close();
    };
  }

  /**
   * Attempt to reconnect to the PartyKit server
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Disconnect from the PartyKit server
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // Leave the game
      this.send({
        type: 'LEAVE_GAME',
        playerId: this.playerId
      });
      
      this.ws.close();
    }
    
    this.ws = null;
  }

  /**
   * Send a message to the PartyKit server
   */
  private send(message: PartyMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  /**
   * Handle a message from the PartyKit server
   */
  private handleMessage(message: PartyMessage): void {
    switch (message.type) {
      case 'SYNC_STATE':
        this.onStateChange(message.state);
        break;
      case 'JOIN_GAME':
      case 'LEAVE_GAME':
        // The server will send a SYNC_STATE message with the updated players
        break;
      case 'GAME_ACTION':
        // The server will process the action and send a SYNC_STATE message
        break;
      case 'CHAT_MESSAGE':
        this.onChatMessage({
          message: message.message,
          playerId: message.playerId,
          playerName: message.playerName,
          timestamp: Date.now()
        });
        break;
    }
  }

  /**
   * Dispatch a game action to the PartyKit server
   */
  dispatchAction(action: GameAction): void {
    this.send({
      type: 'GAME_ACTION',
      action,
      playerId: this.playerId
    });
  }

  /**
   * Send a chat message to the PartyKit server
   */
  sendChatMessage(message: string): void {
    this.send({
      type: 'CHAT_MESSAGE',
      message,
      playerId: this.playerId,
      playerName: this.playerName
    });
  }
}

/**
 * This is a placeholder for the PartyKit server implementation.
 * In a real implementation, you would create a separate PartyKit project.
 * 
 * Here's a sketch of what the PartyKit server implementation might look like:
 * 
 * ```typescript
 * import { Party } from "partykit/server";
 * import { GameAction, GameState, PartyMessage, PartyState } from "./types";
 * import { createTicTacToeEngine } from "./engine";
 * 
 * export default class TicTacToeParty implements Party {
 *   private state: PartyState = {
 *     gameState: createTicTacToeEngine().getState(),
 *     players: {},
 *     chatHistory: []
 *   };
 *   
 *   private engine = createTicTacToeEngine();
 *   
 *   constructor(readonly room: Party.Room) {
 *     // Initialize the game engine
 *     this.engine.subscribe((state) => {
 *       this.state.gameState = state;
 *       this.broadcastState();
 *     });
 *   }
 *   
 *   onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
 *     // Send the current state to the new connection
 *     conn.send(JSON.stringify({
 *       type: 'SYNC_STATE',
 *       state: this.state.gameState
 *     }));
 *   }
 *   
 *   onMessage(message: string, sender: Party.Connection) {
 *     try {
 *       const parsedMessage = JSON.parse(message) as PartyMessage;
 *       this.handleMessage(parsedMessage, sender);
 *     } catch (error) {
 *       console.error('Error parsing message:', error);
 *     }
 *   }
 *   
 *   private handleMessage(message: PartyMessage, sender: Party.Connection) {
 *     switch (message.type) {
 *       case 'JOIN_GAME':
 *         this.handleJoinGame(message, sender);
 *         break;
 *       case 'LEAVE_GAME':
 *         this.handleLeaveGame(message);
 *         break;
 *       case 'GAME_ACTION':
 *         this.handleGameAction(message);
 *         break;
 *       case 'CHAT_MESSAGE':
 *         this.handleChatMessage(message);
 *         break;
 *     }
 *   }
 *   
 *   private handleJoinGame(message: Extract<PartyMessage, { type: 'JOIN_GAME' }>, conn: Party.Connection) {
 *     // Add the player to the game
 *     this.state.players[message.playerId] = {
 *       name: message.playerName,
 *       role: this.assignPlayerRole(message.playerId),
 *       connected: true,
 *       lastActivity: Date.now()
 *     };
 *     
 *     // Broadcast the updated state
 *     this.broadcastState();
 *   }
 *   
 *   private handleLeaveGame(message: Extract<PartyMessage, { type: 'LEAVE_GAME' }>) {
 *     // Mark the player as disconnected
 *     if (this.state.players[message.playerId]) {
 *       this.state.players[message.playerId].connected = false;
 *     }
 *     
 *     // Broadcast the updated state
 *     this.broadcastState();
 *   }
 *   
 *   private handleGameAction(message: Extract<PartyMessage, { type: 'GAME_ACTION' }>) {
 *     // Check if the player is allowed to make this action
 *     const player = this.state.players[message.playerId];
 *     if (!player || !player.connected) {
 *       return;
 *     }
 *     
 *     // Check if it's the player's turn
 *     if (
 *       message.action.type === 'MAKE_MOVE' &&
 *       player.role !== this.state.gameState.currentPlayer
 *     ) {
 *       return;
 *     }
 *     
 *     // Dispatch the action to the game engine
 *     this.engine.dispatch(message.action);
 *     
 *     // Update the player's last activity
 *     player.lastActivity = Date.now();
 *   }
 *   
 *   private handleChatMessage(message: Extract<PartyMessage, { type: 'CHAT_MESSAGE' }>) {
 *     // Add the message to the chat history
 *     this.state.chatHistory.push({
 *       message: message.message,
 *       playerId: message.playerId,
 *       playerName: message.playerName,
 *       timestamp: Date.now()
 *     });
 *     
 *     // Limit the chat history to the last 100 messages
 *     if (this.state.chatHistory.length > 100) {
 *       this.state.chatHistory = this.state.chatHistory.slice(-100);
 *     }
 *     
 *     // Broadcast the chat message
 *     this.room.broadcast(JSON.stringify(message));
 *   }
 *   
 *   private assignPlayerRole(playerId: string): Player {
 *     // Count the number of players with each role
 *     const roles = Object.values(this.state.players).reduce(
 *       (acc, player) => {
 *         if (player.role === 'X') acc.X++;
 *         else if (player.role === 'O') acc.O++;
 *         return acc;
 *       },
 *       { X: 0, O: 0 }
 *     );
 *     
 *     // Assign the role with the fewest players
 *     if (roles.X <= roles.O) {
 *       return 'X';
 *     } else {
 *       return 'O';
 *     }
 *   }
 *   
 *   private broadcastState() {
 *     this.room.broadcast(JSON.stringify({
 *       type: 'SYNC_STATE',
 *       state: this.state.gameState
 *     }));
 *   }
 * }
 * ```
 */ 