/**
 * Settings screen for TicTacToe
 */

import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Text } from '@components/ui/text';
import { Button } from '@components/ui/button';
import { useRouter } from 'expo-router';
import { GameDifficulty, GameMode } from '@lib/tictactoe';
import { useGameSettings } from '@lib/hooks/useGameSettings';
import { Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Settings() {
  const router = useRouter();
  const { 
    boardSize: savedBoardSize, 
    setBoardSize, 
    gameMode: savedGameMode, 
    setGameMode, 
    difficulty: savedDifficulty, 
    setDifficulty,
    nickname: savedNickname,
    setNickname,
    roomId: savedRoomId,
    setRoomId
  } = useGameSettings();

  // Create local state for temporary settings
  const [tempBoardSize, setTempBoardSize] = useState(savedBoardSize);
  const [tempGameMode, setTempGameMode] = useState(savedGameMode);
  const [tempDifficulty, setTempDifficulty] = useState(savedDifficulty);
  const [tempNickname, setTempNickname] = useState(savedNickname || '');
  const [tempRoomId, setTempRoomId] = useState(savedRoomId || '');

  // Generate a random room ID when remote mode is selected and no room ID exists
  useEffect(() => {
    if (tempGameMode === 'remote' && !tempRoomId) {
      const randomRoomId = Math.random().toString(36).substring(2, 10);
      setTempRoomId(randomRoomId);
    }
  }, [tempGameMode, tempRoomId]);

  // Board size options
  const boardSizeOptions = [3, 4, 5, 6];
  
  // Difficulty options
  const difficultyOptions: GameDifficulty[] = ['easy', 'medium', 'hard', 'unbeatable'];
  
  // Game mode options
  const gameModeOptions: GameMode[] = ['single', 'local', 'remote'];

  // Share room ID
  const shareRoomId = async () => {
    try {
      await Share.share({
        message: `Join my TicTacToe game with room ID: ${tempRoomId}`,
      });
    } catch (error) {
      console.error('Error sharing room ID:', error);
    }
  };

  // Save settings and go back
  const handleSave = () => {
    // Apply all settings at once when save is clicked
    setBoardSize(tempBoardSize);
    setGameMode(tempGameMode);
    setDifficulty(tempDifficulty);
    
    // Save remote game settings if applicable
    if (tempGameMode === 'remote') {
      setNickname(tempNickname);
      setRoomId(tempRoomId);
    }
    
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
            <Text className="text-xl font-bold mb-3">Remote Game Settings</Text>
            
            {/* Nickname input */}
            <View className="mb-4">
              <Text className="text-base font-medium mb-2">Your Nickname</Text>
              <TextInput
                value={tempNickname}
                onChangeText={setTempNickname}
                placeholder="Enter your nickname"
                className="border border-gray-300 rounded-md p-2 bg-white"
              />
            </View>
            
            {/* Room ID display with share button */}
            <View className="mb-4">
              <Text className="text-base font-medium mb-2">Room ID</Text>
              <View className="flex-row items-center">
                <TextInput
                  value={tempRoomId}
                  onChangeText={setTempRoomId}
                  placeholder="Room ID"
                  className="border border-gray-300 rounded-md p-2 bg-white flex-1 mr-2"
                />
                <TouchableOpacity 
                  onPress={shareRoomId}
                  className="bg-blue-500 p-2 rounded-md"
                >
                  <Ionicons name="share-outline" size={24} color="white" />
                </TouchableOpacity>
              </View>
              <Text className="text-xs text-gray-500 mt-1">
                Share this Room ID with others to join your game
              </Text>
            </View>
          </View>
        )}

        {/* Save button */}
        <Button 
          onPress={handleSave} 
          className="mt-4"
          disabled={tempGameMode === 'remote' && !tempNickname}
        >
          <Text>Save Settings</Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
} 