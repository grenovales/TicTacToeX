import React, { useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@components/ui/text';
import { Player, GameState } from '@lib/tictactoe';
import { isWinningCell, range } from '@lib/tictactoe';

interface BoardProps {
  /**
   * The current game state
   */
  gameState: GameState;
  
  /**
   * Callback when a cell is pressed
   */
  onCellPress?: (row: number, col: number) => void;
  
  /**
   * Whether the board is disabled (no interactions)
   */
  disabled?: boolean;
  
  /**
   * Size of the board (default: 3)
   */
  size?: number;
  
  /**
   * Custom cell renderer
   */
  renderCell?: (props: {
    row: number;
    col: number;
    value: Player;
    isWinning: boolean;
    onPress: () => void;
    disabled: boolean;
  }) => React.ReactNode;
}

/**
 * A flexible TicTacToe board component that can adapt to different board sizes
 */
export function Board({
  gameState,
  onCellPress,
  disabled = false,
  size = 3,
  renderCell,
}: BoardProps) {
  // Use the board size from the game state if available, otherwise use the size prop
  const boardSize = gameState?.boardSize || size;
  
  // Generate row and column indices
  const indices = useMemo(() => range(0, boardSize), [boardSize]);
  
  // Calculate font size based on board size
  const fontSize = useMemo(() => {
    return Math.max(24, 72 / boardSize);
  }, [boardSize]);

  // Default cell renderer
  const defaultRenderCell = (props: {
    row: number;
    col: number;
    value: Player;
    isWinning: boolean;
    onPress: () => void;
    disabled: boolean;
  }) => {
    const { row, col, value, isWinning, onPress, disabled: cellDisabled } = props;
    
    return (
      <TouchableOpacity
        key={`cell-${row}-${col}`}
        className={`flex-1 justify-center items-center border border-gray-300 ${isWinning ? 'bg-green-200' : ''}`}
        onPress={onPress}
        disabled={cellDisabled}
        activeOpacity={cellDisabled ? 1 : 0.7}
        accessibilityLabel={`Cell ${row},${col} ${value || 'empty'}`}
        accessibilityRole="button"
        accessibilityState={{ disabled: cellDisabled }}
      >
        <Text 
          className={`font-bold ${value === 'X' ? 'text-red-500' : 'text-blue-500'}`}
          style={{ fontSize }}
        >
          {value || ''}
        </Text>
      </TouchableOpacity>
    );
  };

  // Handle cell press
  const handleCellPress = (row: number, col: number) => {
    if (!disabled && onCellPress && !gameState.board[row][col] && !gameState.isGameOver) {
      onCellPress(row, col);
    }
  };

  return (
    <View className="w-full aspect-square max-w-[500px] self-center">
      {indices.map(row => (
        <View key={`row-${row}`} className="flex-row flex-1">
          {indices.map(col => {
            const value = gameState.board[row][col];
            const isWinning = isWinningCell(row, col, gameState.winningLine);
            const cellDisabled = disabled || !!value || gameState.isGameOver;
            
            const cellProps = {
              row,
              col,
              value,
              isWinning,
              onPress: () => handleCellPress(row, col),
              disabled: cellDisabled,
            };
            
            return renderCell 
              ? renderCell(cellProps)
              : defaultRenderCell(cellProps);
          })}
        </View>
      ))}
    </View>
  );
} 