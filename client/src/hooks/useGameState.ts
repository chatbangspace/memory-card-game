import { useState, useEffect } from 'react';

export interface Plant {
  id: string;
  name: string;
  emoji: string;
  stage: number;
  maxStage: number;
  x: number;
  y: number;
}

export interface GameState {
  score: number;
  totalScore: number;
  plants: Plant[];
  lastPlayDate: string;
  completedMissions: string[];
  missionStats: {
    memory: { completed: number; totalScore: number };
    spot: { completed: number; totalScore: number };
    language: { completed: number; totalScore: number };
  };
}

const STORAGE_KEY = 'memory_garden_game_state';

const DEFAULT_STATE: GameState = {
  score: 0,
  totalScore: 0,
  plants: [
    { id: '1', name: '장미', emoji: '🌹', stage: 1, maxStage: 3, x: 20, y: 30 },
    { id: '2', name: '해바라기', emoji: '🌻', stage: 2, maxStage: 3, x: 60, y: 40 },
    { id: '3', name: '튤립', emoji: '🌷', stage: 1, maxStage: 3, x: 40, y: 60 },
  ],
  lastPlayDate: new Date().toISOString().split('T')[0],
  completedMissions: [],
  missionStats: {
    memory: { completed: 0, totalScore: 0 },
    spot: { completed: 0, totalScore: 0 },
    language: { completed: 0, totalScore: 0 },
  },
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // 초기 로드
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGameState(parsed);
      } catch (e) {
        console.error('Failed to parse saved game state:', e);
        setGameState(DEFAULT_STATE);
      }
    }
    setIsLoaded(true);
  }, []);

  // 상태 변경 시 저장
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    }
  }, [gameState, isLoaded]);

  const updateScore = (points: number) => {
    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
      totalScore: prev.totalScore + points,
    }));
  };

  const waterPlant = (plantId: string) => {
    setGameState(prev => ({
      ...prev,
      plants: prev.plants.map(plant =>
        plant.id === plantId && plant.stage < plant.maxStage
          ? { ...plant, stage: plant.stage + 1 }
          : plant
      ),
      score: prev.score + 10,
    }));
  };

  const completeMission = (missionType: 'memory' | 'spot' | 'language', points: number) => {
    const missionId = `${missionType}_${new Date().toISOString().split('T')[0]}_${Date.now()}`;
    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
      totalScore: prev.totalScore + points,
      completedMissions: [...prev.completedMissions, missionId],
      missionStats: {
        ...prev.missionStats,
        [missionType]: {
          completed: prev.missionStats[missionType].completed + 1,
          totalScore: prev.missionStats[missionType].totalScore + points,
        },
      },
    }));
  };

  const resetDaily = () => {
    setGameState(prev => ({
      ...prev,
      score: 0,
      lastPlayDate: new Date().toISOString().split('T')[0],
      completedMissions: [],
    }));
  };

  const addPlant = (plant: Plant) => {
    setGameState(prev => ({
      ...prev,
      plants: [...prev.plants, plant],
    }));
  };

  return {
    gameState,
    isLoaded,
    updateScore,
    waterPlant,
    completeMission,
    resetDaily,
    addPlant,
  };
}
