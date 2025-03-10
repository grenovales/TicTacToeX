/**
 * Settings screen for TicTacToe
 */
import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, ScrollView } from 'react-native';
import { Text } from '@components/ui/text';
import { Button } from '@components/ui/button';
import { useRouter } from 'expo-router';
import { GameDifficulty, GameMode } from '@lib/tictactoe';
import { useGameSettings } from '@lib/hooks/useGameSettings';

export default function Settings() {
  const router = useRouter();
  const { 
    boardSize: savedBoardSize, 
    setBoardSize, 
    gameMode: savedGameMode, 
    setGameMode, 
    difficulty: savedDifficulty, 
    setDifficulty,
  } = useGameSettings();

  // Create local state for temporary settings
  const [tempBoardSize, setTempBoardSize] = useState(savedBoardSize);
  const [tempGameMode, setTempGameMode] = useState(savedGameMode);
  const [tempDifficulty, setTempDifficulty] = useState(savedDifficulty);

  // Board size options
  const boardSizeOptions = [3, 4, 5, 6];
  
  // Difficulty options
  const difficultyOptions: GameDifficulty[] = ['easy', 'medium', 'hard', 'unbeatable'];
  
  // Game mode options
  const gameModeOptions: GameMode[] = ['single', 'local', 'remote'];

  // Save settings and go back
  const handleSave = () => {
    // Apply all settings at once when save is clicked
    setBoardSize(tempBoardSize);
    if (tempGameMode !== 'remote') { //remote mode is not supported yet
      setGameMode(tempGameMode);
    }
    setDifficulty(tempDifficulty);
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
                onPress={() => setTempBoardSize(size)}
                className={`mr-2 mb-2 ${tempBoardSize === size ? 'border-2' : ''}`}
                variant={tempBoardSize === size ? 'default' : 'outline'}
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
                onPress={() => setTempGameMode(mode)}
                className={`mr-2 mb-2 ${tempGameMode === mode ? 'border-2' : ''}`}
                variant={tempGameMode === mode ? 'default' : 'outline'}
              >
                <Text>{mode}</Text>
              </Button>
            ))}
          </View>
        </View>
        
        {/* Difficulty selector (only show if game mode is single player) */}
        {tempGameMode === 'single' && (
          <View className="mb-6">
            <Text className="text-xl font-bold mb-3">Difficulty</Text>
            <View className="flex-row flex-wrap">
              {difficultyOptions.map((option) => (
                <Button
                  key={`difficulty-${option}`}
                  onPress={() => setTempDifficulty(option)}
                  className={`mr-2 mb-2 ${tempDifficulty === option ? 'border-2' : ''}`}
                  variant={tempDifficulty === option ? 'default' : 'outline'}
                >
                  <Text>{option}</Text>
                </Button>
              ))}
            </View>
          </View>
        )}

        {/* Remote game settings (only show if game mode is remote) */}
        {tempGameMode === 'remote' && (
          <View className="mb-6">
            <Text className="text-xl font-bold mb-3">Comming Soon!!!</Text>
            <Text className="text-base text-gray-600 mb-4">Remote game settings will be available soon</Text>
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