import { useCallback } from 'react';

export interface StarRatingConfig {
  maxScore: number;
  minScore: number;
  thresholds: {
    three: number; // 3별 이상의 점수 비율 (%)
    two: number;   // 2별 이상의 점수 비율 (%)
    one: number;   // 1별 이상의 점수 비율 (%)
  };
}

export interface StarRatingResult {
  stars: number;
  percentage: number;
  message: string;
  color: string;
}

// 기본 별점 설정
const DEFAULT_CONFIG: StarRatingConfig = {
  maxScore: 150,
  minScore: 50,
  thresholds: {
    three: 70,  // 70% 이상: 3별
    two: 40,    // 40% 이상: 2별
    one: 0,     // 0% 이상: 1별
  },
};

/**
 * 게임 점수를 기반으로 별점을 계산하는 훅
 * @param score 게임에서 얻은 점수
 * @param config 별점 계산 설정 (선택사항)
 * @returns 별점, 퍼센티지, 메시지, 색상
 */
export function useStarRating(
  score: number,
  config: Partial<StarRatingConfig> = {}
): StarRatingResult {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const calculateStars = useCallback((): StarRatingResult => {
    // 점수를 0-100% 범위로 정규화
    const normalizedScore = Math.min(100, Math.max(0, score));

    let stars = 1;
    let message = '좋은 시도!';
    let color = 'text-yellow-500';

    if (normalizedScore >= finalConfig.thresholds.three) {
      stars = 3;
      message = '완벽해요! 🌟';
      color = 'text-yellow-400';
    } else if (normalizedScore >= finalConfig.thresholds.two) {
      stars = 2;
      message = '잘했어요! ⭐';
      color = 'text-yellow-500';
    } else {
      stars = 1;
      message = '좋은 시도! 💪';
      color = 'text-gray-400';
    }

    return {
      stars,
      percentage: normalizedScore,
      message,
      color,
    };
  }, [score, finalConfig]);

  return calculateStars();
}

/**
 * 난이도별 별점 계산 함수
 */
export function calculateStarsByDifficulty(
  score: number,
  difficulty: 'easy' | 'medium' | 'hard'
): number {
  const difficultyConfig: Record<string, Partial<StarRatingConfig>> = {
    easy: {
      maxScore: 100,
      thresholds: { three: 70, two: 40, one: 0 },
    },
    medium: {
      maxScore: 120,
      thresholds: { three: 75, two: 45, one: 0 },
    },
    hard: {
      maxScore: 150,
      thresholds: { three: 80, two: 50, one: 0 },
    },
  };

  const config = difficultyConfig[difficulty];
  const normalizedScore = Math.min(100, Math.max(0, score));

  if (normalizedScore >= (config?.thresholds?.three || 70)) return 3;
  if (normalizedScore >= (config?.thresholds?.two || 40)) return 2;
  return 1;
}

/**
 * 별점에 따른 보너스 포인트 계산
 */
export function getStarBonus(stars: number): number {
  const bonusMap: Record<number, number> = {
    1: 0,
    2: 10,
    3: 25,
  };
  return bonusMap[stars] || 0;
}

/**
 * 별점 배열 생성 (UI 렌더링용)
 */
export function generateStarArray(stars: number): boolean[] {
  return [stars >= 1, stars >= 2, stars >= 3];
}
