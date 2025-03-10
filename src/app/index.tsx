/**
 * Home screen
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, SafeAreaView, ScrollView } from 'react-native';
import { Text } from '@components/ui/text';
import { GameController } from '@components/tictactoe';
import { GameState } from '@lib/tictactoe';
import { useGameSettings } from '@lib/hooks/useGameSettings';

export default function Home() {
  const { gameMode, roomId } = useGameSettings();
  const [notifications, setNotifications] = useState<{message: string, timestamp: number}[]>([]);
  
  // Handle game state changes
  const handleGameStateChange = (state: GameState) => {
    // We could add more notifications based on game state changes here
    if (!state) return;
  };
  
  // Add a notification
  const addNotification = useCallback((message: string) => {
    if (!message) return;
    
    setNotifications(prev => [
      { message, timestamp: Date.now() },
      ...prev.slice(0, 4) // Keep only the 5 most recent notifications
    ]);
  }, []);
  
  // Handle player join
  const handlePlayerJoin = useCallback((playerName: string) => {
    if (!playerName) return;
    
    addNotification(`${playerName} joined the game`);
  }, [addNotification]);
  
  // Handle player leave
  const handlePlayerLeave = useCallback((playerName: string) => {
    if (!playerName) return;
    
    addNotification(`${playerName} left the game`);
  }, [addNotification]);
  
  // Clear old notifications after 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setNotifications(prev => 
        prev.filter(notification => now - notification.timestamp < 5000)
      );
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Render notifications
  const renderNotifications = () => {
    if (notifications.length === 0) return null;
    
    return (
      <View className="mb-4 p-3 bg-gray-100 rounded-md">
        {notifications.map((notification, index) => (
          <Text key={notification.timestamp} className="text-sm mb-1">
            {notification.message}
          </Text>
        ))}
      </View>
    );
  };
  
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="flex-grow p-4">
        <View className="mb-6 items-center">
          <Text className="text-3xl font-bold mb-2">TicTacToeX</Text>
          <Text className="text-base text-gray-600 mb-4">A game of X's and O's</Text>
          
          {/* Show room ID if in remote mode */}
          {gameMode === 'remote' && roomId && (
            <View className="bg-blue-100 p-2 rounded-md mb-4">
              <Text className="text-center text-blue-800">Room ID: {roomId}</Text>
            </View>
          )}
          
          {/* Notifications area */}
          {renderNotifications()}
        </View>     
        <GameController 
          onStateChange={handleGameStateChange}
          onPlayerJoin={handlePlayerJoin}
          onPlayerLeave={handlePlayerLeave}
        />
      </ScrollView>
    </SafeAreaView>
  );
}