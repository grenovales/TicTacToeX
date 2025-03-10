import { useState, useEffect, useCallback } from 'react';
import { GameDifficulty, GameMode } from '@lib/tictactoe';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the game settings state
interface GameSettingsState {
  boardSize: number;
  gameMode: GameMode;
  difficulty: GameDifficulty;
  nickname: string | null;
  roomId: string | null;
  setBoardSize: (size: number) => void;
  setGameMode: (mode: GameMode) => void;
  setDifficulty: (difficulty: GameDifficulty) => void;
  setNickname: (nickname: string) => void;
  setRoomId: (roomId: string) => void;
}

// Create a Zustand store for game settings
export const useGameSettingsStore = create<GameSettingsState>()(
  persist(
    (set) => ({
      boardSize: 3,
      gameMode: 'single',
      difficulty: 'unbeatable',
      nickname: null,
      roomId: null,
      setBoardSize: (size) => set({ boardSize: size }),
      setGameMode: (mode) => set({ gameMode: mode }),
      setDifficulty: (difficulty) => set({ difficulty }),
      setNickname: (nickname) => set({ nickname }),
      setRoomId: (roomId) => set({ roomId }),
    }),
    {
      name: 'tictactoe-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

/**
 * Hook to manage game settings
 * Uses Zustand for global state management and persists settings to AsyncStorage
 */
export function useGameSettings() {
  // Get settings from the store
  const {
    boardSize,
    gameMode,
    difficulty,
    nickname,
    roomId,
    setBoardSize,
    setGameMode,
    setDifficulty,
    setNickname,
    setRoomId,
  } = useGameSettingsStore();

  return {
    boardSize,
    setBoardSize,
    gameMode,
    setGameMode,
    difficulty,
    setDifficulty,
    nickname,
    setNickname,
    roomId,
    setRoomId,
  };
} 