/**
 * Home screen
 */

import React from 'react';
import { View, SafeAreaView, ScrollView } from 'react-native';
import { Text } from '@components/ui/text';
import { GameController } from '@components/tictactoe';

export default function Home() {
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="flex-grow p-4">
        <View className="mb-6 items-center">
          <Text className="text-3xl font-bold mb-2">TicTacToeX</Text>
          <Text className="text-base text-gray-600 mb-4">A game of X's and O's</Text>
        </View>     
        <GameController />
      </ScrollView>
    </SafeAreaView>
  );
}