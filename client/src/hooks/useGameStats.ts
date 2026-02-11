import { useState, useEffect, useCallback } from 'react';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameRecord {
  id: string;
  difficulty: Difficulty;
  score: number;
  stars: number;
  moves: number;
  timeUsed: number;
  timestamp: number;
}

export interface DifficultyStats {
  totalGames: number;
  bestScore: number;
  bestStars: number;
  averageScore: number;
  averageStars: number;
  totalStarCount: number;
  records: GameRecord[];
}

export interface GameStats {
  easy: DifficultyStats;
  medium: DifficultyStats;
  hard: DifficultyStats;
}

const STORAGE_KEY = 'memory_card_game_stats';
const MAX_RECORDS_PER_DIFFICULTY = 20;

const DEFAULT_STATS: GameStats = {
  easy: {
    totalGames: 0,
    bestScore: 0,
    bestStars: 0,
    averageScore: 0,
    averageStars: 0,
    totalStarCount: 0,
    records: [],
  },
  medium: {
    totalGames: 0,
    bestScore: 0,
    bestStars: 0,
    averageScore: 0,
    averageStars: 0,
    totalStarCount: 0,
    records: [],
  },
  hard: {
    totalGames: 0,
    bestScore: 0,
    bestStars: 0,
    averageScore: 0,
    averageStars: 0,
    totalStarCount: 0,
    records: [],
  },
};

/**
 * 게임 통계를 관리하는 훅
 */
export function useGameStats() {
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);
  const [isLoaded, setIsLoaded] = useState(false);

  // 초기 로드
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setStats(parsed);
      } else {
        setStats(DEFAULT_STATS);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      setStats(DEFAULT_STATS);
    }
    setIsLoaded(true);
  }, []);

  const saveStats = useCallback((newStats: GameStats) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
      setStats(newStats);
    } catch (error) {
      console.error('Failed to save stats:', error);
    }
  }, []);

  /**
   * 게임 기록 추가
   */
  const addGameRecord = useCallback(
    (record: Omit<GameRecord, 'id'>) => {
      const newRecord: GameRecord = {
        ...record,
        id: `${record.difficulty}_${Date.now()}`,
      };

      const newStats = { ...stats };
      const diffStats = newStats[record.difficulty];

      // 기록 추가
      diffStats.records.push(newRecord);

      // 최근 20개만 유지
      if (diffStats.records.length > MAX_RECORDS_PER_DIFFICULTY) {
        diffStats.records = diffStats.records.slice(-MAX_RECORDS_PER_DIFFICULTY);
      }

      // 통계 업데이트
      updateDifficultyStats(diffStats);

      saveStats(newStats);
      return newRecord;
    },
    [stats, saveStats]
  );

  /**
   * 난이도별 통계 업데이트
   */
  const updateDifficultyStats = (diffStats: DifficultyStats) => {
    const records = diffStats.records;

    if (records.length === 0) {
      diffStats.totalGames = 0;
      diffStats.bestScore = 0;
      diffStats.bestStars = 0;
      diffStats.averageScore = 0;
      diffStats.averageStars = 0;
      diffStats.totalStarCount = 0;
      return;
    }

    diffStats.totalGames = records.length;
    diffStats.bestScore = Math.max(...records.map(r => r.score));
    diffStats.bestStars = Math.max(...records.map(r => r.stars));
    diffStats.averageScore = Math.round(
      records.reduce((sum, r) => sum + r.score, 0) / records.length
    );
    diffStats.averageStars = Number(
      (records.reduce((sum, r) => sum + r.stars, 0) / records.length).toFixed(1)
    );
    diffStats.totalStarCount = records.reduce((sum, r) => sum + r.stars, 0);
  };

  /**
   * 특정 난이도의 최고 기록 조회
   */
  const getBestRecord = useCallback(
    (difficulty: Difficulty): GameRecord | null => {
      const records = stats[difficulty].records;
      if (records.length === 0) return null;
      return records.reduce((best, current) =>
        current.score > best.score ? current : best
      );
    },
    [stats]
  );

  /**
   * 특정 난이도의 최근 기록 조회
   */
  const getRecentRecords = useCallback(
    (difficulty: Difficulty, limit: number = 5): GameRecord[] => {
      const records = stats[difficulty].records;
      return records.slice(-limit).reverse();
    },
    [stats]
  );

  /**
   * 전체 통계 조회
   */
  const getTotalStats = useCallback(() => {
    const allRecords = [
      ...stats.easy.records,
      ...stats.medium.records,
      ...stats.hard.records,
    ];

    return {
      totalGames: allRecords.length,
      totalStars: allRecords.reduce((sum, r) => sum + r.stars, 0),
      averageScore: allRecords.length > 0
        ? Math.round(allRecords.reduce((sum, r) => sum + r.score, 0) / allRecords.length)
        : 0,
      bestScore: allRecords.length > 0
        ? Math.max(...allRecords.map(r => r.score))
        : 0,
    };
  }, [stats]);

  /**
   * 통계 초기화
   */
  const resetStats = useCallback(() => {
    if (confirm('모든 게임 기록을 삭제하시겠습니까?')) {
      localStorage.removeItem(STORAGE_KEY);
      setStats(DEFAULT_STATS);
    }
  }, []);

  return {
    stats,
    isLoaded,
    addGameRecord,
    getBestRecord,
    getRecentRecords,
    getTotalStats,
    resetStats,
    loadStats,
  };
}
