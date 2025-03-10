import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Alert } from 'react-native';
import { Button } from '@components/ui/button';
import { Text } from '@components/ui/text';
import { 
  createTicTacToeGame, 
  GameState, 
  getGameResultMessage,
  TicTacToeRemoteAdapter
} from '@lib/tictactoe';
import { PartyState } from '@lib/tictactoe/remote';
import { useGameSettings } from '@lib/hooks/useGameSettings';
import { Board } from './Board';

interface GameControllerProps {
  /**
   * Callback when the game state changes
   */
  onStateChange?: (state: GameState) => void;
  
  /**
   * Callback when a player joins the game
   */
  onPlayerJoin?: (playerName: string) => void;
  
  /**
   * Callback when a player leaves the game
   */
  onPlayerLeave?: (playerName: string) => void;
}

/**
 * A component that manages the TicTacToe game state and provides controls
 */
export function GameController({
  onStateChange,
  onPlayerJoin,
  onPlayerLeave,
}: GameControllerProps) {
  // Get game settings
  const { boardSize, gameMode, difficulty, nickname, roomId } = useGameSettings();
  
  // Create the game engine
  const [gameEngine] = useState(() => 
    createTicTacToeGame(boardSize, gameMode, difficulty)
  );
  
  // Game state
  const [gameState, setGameState] = useState<GameState | null>(() => {
    try {
      return gameEngine.getState();
    } catch (error) {
      console.error('Error initializing game state:', error);
      return null;
    }
  });
  
  // Remote game state
  const [remotePlayers, setRemotePlayers] = useState<PartyState['players']>({});
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const remoteAdapterRef = useRef<TicTacToeRemoteAdapter | null>(null);
  const previousPlayersRef = useRef<PartyState['players']>({});
  
  // Handle players change to detect joins and leaves
  const handlePlayersChange = useCallback((players: PartyState['players']) => {
    const prevPlayers = previousPlayersRef.current;
    
    // Check for new players
    Object.entries(players).forEach(([id, player]) => {
      if (!prevPlayers[id] && player.connected && onPlayerJoin) {
        onPlayerJoin(player.name);
      }
    });
    
    // Check for players who left
    Object.entries(prevPlayers).forEach(([id, player]) => {
      if ((!players[id] || !players[id].connected) && player.connected && onPlayerLeave) {
        onPlayerLeave(player.name);
      }
    });
    
    // Update remote players state
    setRemotePlayers(players);
    
    // Update previous players ref
    previousPlayersRef.current = { ...players };
  }, [onPlayerJoin, onPlayerLeave]);
  
  // Subscribe to game state changes
  useEffect(() => {
    const unsubscribe = gameEngine.subscribe((state) => {
      setGameState(state);
      if (onStateChange) {
        onStateChange(state);
      }
    });
    
    return unsubscribe;
  }, [gameEngine, onStateChange]);
  
  // Update game when settings change
  useEffect(() => {
    gameEngine.dispatch({ type: 'CHANGE_BOARD_SIZE', size: boardSize });
    gameEngine.dispatch({ type: 'CHANGE_GAME_MODE', mode: gameMode });
    gameEngine.dispatch({ type: 'CHANGE_DIFFICULTY', difficulty });
  }, [boardSize, gameMode, difficulty, gameEngine]);
  
  // Handle remote game connection
  useEffect(() => {
    // Only connect if we're in remote mode and have a nickname and room ID
    if (gameMode === 'remote' && nickname && roomId) {
      setConnectionStatus('connecting');
      
      // Generate a unique player ID
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      try {
        // Create remote adapter
        const remoteAdapter = new TicTacToeRemoteAdapter(
          roomId,
          playerId,
          nickname,
          // State change handler
          (state) => {
            // Update local game state with remote state
            if (state) {
              setGameState(state);
            }
          },
          // Players change handler
          handlePlayersChange,
          // Chat message handler (not implemented in UI yet)
          (message) => {
            console.log('Chat message:', message);
          }
        );
        
        // Connect to remote game
        remoteAdapter.connect();
        setConnectionStatus('connected');
        
        // Store reference to adapter
        remoteAdapterRef.current = remoteAdapter;
        
        // Join the remote game
        gameEngine.dispatch({ type: 'JOIN_REMOTE_GAME', roomId });
        
        // Cleanup on unmount
        return () => {
          remoteAdapter.disconnect();
          remoteAdapterRef.current = null;
          setConnectionStatus('disconnected');
        };
      } catch (error) {
        console.error('Error connecting to remote game:', error);
        setConnectionStatus('disconnected');
        Alert.alert(
          'Connection Error',
          'Failed to connect to the remote game. Please try again.'
        );
      }
    }
  }, [gameMode, nickname, roomId, gameEngine, handlePlayersChange]);
  
  // Sync remote actions
  useEffect(() => {
    if (gameMode === 'remote' && remoteAdapterRef.current) {
      // Forward local actions to remote
      const unsubscribe = gameEngine.subscribe((state) => {
        // Only send if we're connected
        if (remoteAdapterRef.current && connectionStatus === 'connected') {
          // We don't need to send every state change, just when moves are made
          // This is handled by the remote adapter's dispatchAction method
        }
      });
      
      return unsubscribe;
    }
  }, [gameMode, connectionStatus, gameEngine]);
  
  // Handle cell press
  const handleCellPress = (row: number, col: number) => {
    const action = { type: 'MAKE_MOVE' as const, position: [row, col] as [number, number] };
    
    // Dispatch to local game engine
    gameEngine.dispatch(action);
    
    // If in remote mode, also dispatch to remote
    if (gameMode === 'remote' && remoteAdapterRef.current) {
      remoteAdapterRef.current.dispatchAction(action);
    }
  };
  
  // Reset the game
  const resetGame = () => {
    const action = { type: 'RESET_GAME' as const };
    
    // Dispatch to local game engine
    gameEngine.dispatch(action);
    
    // If in remote mode, also dispatch to remote
    if (gameMode === 'remote' && remoteAdapterRef.current) {
      remoteAdapterRef.current.dispatchAction(action);
    }
  };
  
  // Undo the last move
  const undoMove = () => {
    const action = { type: 'UNDO_MOVE' as const };
    
    // Dispatch to local game engine
    gameEngine.dispatch(action);
    
    // If in remote mode, also dispatch to remote
    if (gameMode === 'remote' && remoteAdapterRef.current) {
      remoteAdapterRef.current.dispatchAction(action);
    }
  };
  
  // Render remote player status
  const renderRemoteStatus = () => {
    if (gameMode !== 'remote') return null;
    
    const playerCount = Object.keys(remotePlayers || {}).length;
    
    return (
      <View className="mb-4 p-3 bg-gray-200 rounded-md">
        <Text className="text-sm font-medium">
          {connectionStatus === 'connecting' ? 'Connecting to game...' : 
           connectionStatus === 'connected' ? `Connected to room: ${roomId}` : 
           'Disconnected'}
        </Text>
        
        <Text className="text-sm mt-1">
          {playerCount === 0 ? 'Waiting for players to join...' : 
           `${playerCount} player${playerCount !== 1 ? 's' : ''} connected`}
        </Text>
        
        {/* List connected players */}
        {remotePlayers && Object.entries(remotePlayers).map(([id, player]) => (
          <Text key={id} className="text-xs mt-1">
            {player?.name || 'Unknown'} {player?.connected ? '(online)' : '(offline)'} 
            {player?.role ? ` - ${player.role}` : ''}
          </Text>
        ))}
      </View>
    );
  };
  
  return (
    <View className="flex-1 p-4 max-w-[600px] w-full self-center">
      {/* Remote game status */}
      {renderRemoteStatus()}
      
      {/* Game status */}
      <View className="mb-4 items-center">
        <Text className="text-xl font-bold">
          {gameState ? getGameResultMessage(gameState) : 'Loading game...'}
        </Text>
      </View>
      
      {/* Game board */}
      <Board
        gameState={gameState}
        onCellPress={handleCellPress}
      />
      
      {/* Game controls */}
      <View className="mt-6">
        {/* Reset and Undo buttons */}
        <View className="flex-row justify-between mb-4">
          <Button 
            onPress={resetGame}
            className="flex-1 mx-1"
          >
            <Text>Reset Game</Text>
          </Button>
          
          <Button 
            onPress={undoMove}
            className="flex-1 mx-1"
            disabled={!gameState?.moveHistory || gameState.moveHistory.length === 0}
          >
            <Text>Undo Move</Text>
          </Button>
        </View>
      </View>
    </View>
  );
} 