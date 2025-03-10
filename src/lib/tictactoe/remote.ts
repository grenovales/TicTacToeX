/**
 * TicTacToe remote multiplayer adapter using PartyKit
 */
import { WebSocket } from "partysocket";
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
        //this.onPlayersChange(message.players);
        break;
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