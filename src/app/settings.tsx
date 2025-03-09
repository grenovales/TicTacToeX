/**
 * Settings screen for TicTacToe
 */

import React from 'react';
import { View, SafeAreaView, ScrollView } from 'react-native';
import { Text } from '@components/ui/text';
import { Button } from '@components/ui/button';
import { useRouter } from 'expo-router';
import { GameDifficulty, GameMode } from '@lib/tictactoe';
import { useGameSettings } from '@lib/hooks/useGameSettings';

export default function Settings() {
  const router = useRouter();
  const { 
    boardSize, 
    setBoardSize, 
    gameMode, 
    setGameMode, 
    difficulty, 
    setDifficulty 
  } = useGameSettings();

  // Board size options
  const boardSizeOptions = [3, 4, 5, 6];
  
  // Difficulty options
  const difficultyOptions: GameDifficulty[] = ['easy', 'medium', 'hard', 'unbeatable'];
  
  // Game mode options
  const gameModeOptions: GameMode[] = ['single', 'local'];

  // Save settings and go back
  const handleSave = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="flex-grow p-4">
        <View className="mb-6 items-center">
          <Text className="text-3xl font-bold mb-2">Game Settings</Text>
          <Text className="text-base text-gray-600 mb-4">Customize your TicTacToe experience</Text>
        </View>

        {/* Board size selector */}
        <View className="mb-6">
          <Text className="text-xl font-bold mb-3">Board Size</Text>
          <View className="flex-row flex-wrap">
            {boardSizeOptions.map((size) => (
              <Button
                key={`size-${size}`}
                onPress={() => setBoardSize(size)}
                className={`mr-2 mb-2 ${boardSize === size ? 'border-2' : ''}`}
                variant={boardSize === size ? 'default' : 'outline'}
              >
                <Text>{size}x{size}</Text>
              </Button>
            ))}
          </View>
        </View>
        
        {/* Game mode selector */}
        <View className="mb-6">
          <Text className="text-xl font-bold mb-3">Game Mode</Text>
          <View className="flex-row flex-wrap">
            {gameModeOptions.map((mode) => (
              <Button
                key={`mode-${mode}`}
                onPress={() => setGameMode(mode)}
                className={`mr-2 mb-2 ${gameMode === mode ? 'border-2' : ''}`}
                variant={gameMode === mode ? 'default' : 'outline'}
              >
                <Text>{mode === 'single' ? 'vs AI' : 'vs Friend'}</Text>
              </Button>
            ))}
          </View>
        </View>
        
        {/* Difficulty selector (only show if game mode is single player) */}
        {gameMode === 'single' && (
          <View className="mb-6">
            <Text className="text-xl font-bold mb-3">Difficulty</Text>
            <View className="flex-row flex-wrap">
              {difficultyOptions.map((option) => (
                <Button
                  key={`difficulty-${option}`}
                  onPress={() => setDifficulty(option)}
                  className={`mr-2 mb-2 ${difficulty === option ? 'border-2' : ''}`}
                  variant={difficulty === option ? 'default' : 'outline'}
                >
                  <Text>{option}</Text>
                </Button>
              ))}
            </View>
          </View>
        )}

        {/* Save button */}
        <Button 
          onPress={handleSave} 
          className="mt-4"
        >
          <Text>Save Settings</Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
} 