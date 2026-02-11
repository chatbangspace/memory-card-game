import React, { createContext, useContext } from 'react';
import { useGameState, GameState, Plant } from '@/hooks/useGameState';

interface GameContextType {
  gameState: GameState;
  isLoaded: boolean;
  updateScore: (points: number) => void;
  waterPlant: (plantId: string) => void;
  completeMission: (missionType: 'memory' | 'spot' | 'language', points: number) => void;
  resetDaily: () => void;
  addPlant: (plant: Plant) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const gameState = useGameState();

  return (
    <GameContext.Provider value={gameState}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
