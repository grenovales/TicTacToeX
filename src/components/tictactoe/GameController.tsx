import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button } from '@components/ui/button';
import { Text } from '@components/ui/text';
import { 
  createTicTacToeGame, 
  GameState, 
  getGameResultMessage 
} from '@lib/tictactoe';
import { useGameSettings } from '@lib/hooks/useGameSettings';
import { Board } from './Board';

interface GameControllerProps {
  /**
   * Callback when the game state changes
   */
  onStateChange?: (state: GameState) => void;
}

/**
 * A component that manages the TicTacToe game state and provides controls
 */
export function GameController({
  onStateChange,
}: GameControllerProps) {
  // Get game settings
  const { boardSize, gameMode, difficulty } = useGameSettings();
  
  // Create the game engine
  const [gameEngine] = useState(() => 
    createTicTacToeGame(boardSize, gameMode, difficulty)
  );
  
  // Game state
  const [gameState, setGameState] = useState<GameState>(gameEngine.getState());
  
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
  
  // Handle cell press
  const handleCellPress = (row: number, col: number) => {
    gameEngine.dispatch({ type: 'MAKE_MOVE', position: [row, col] });
  };
  
  // Reset the game
  const resetGame = () => {
    gameEngine.dispatch({ type: 'RESET_GAME' });
  };
  
  // Undo the last move
  const undoMove = () => {
    gameEngine.dispatch({ type: 'UNDO_MOVE' });
  };
  
  return (
    <View className="flex-1 p-4 max-w-[600px] w-full self-center">
      {/* Game status */}
      <View className="mb-4 items-center">
        <Text className="text-xl font-bold">
          {getGameResultMessage(gameState)}
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
            disabled={gameState.moveHistory.length === 0}
          >
            <Text>Undo Move</Text>
          </Button>
        </View>
      </View>
    </View>
  );
} 