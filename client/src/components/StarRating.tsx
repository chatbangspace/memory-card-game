import { Star } from 'lucide-react';
import { generateStarArray } from '@/hooks/useStarRating';

interface StarRatingProps {
  stars: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

export function StarRating({
  stars,
  size = 'md',
  showLabel = true,
  animated = true,
}: StarRatingProps) {
  const starArray = generateStarArray(stars);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const labelText = {
    1: '좋은 시도!',
    2: '잘했어요!',
    3: '완벽해요!',
  }[stars];

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {starArray.map((filled, index) => (
          <div
            key={index}
            className={`${animated ? 'animate-in fade-in' : ''}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Star
              className={`${sizeClasses[size]} ${
                filled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              } transition-all`}
            />
          </div>
        ))}
      </div>
      {showLabel && (
        <span className="text-sm font-semibold text-gray-700">
          {labelText}
        </span>
      )}
    </div>
  );
}

/**
 * 별점 진행 바 컴포넌트
 */
interface StarProgressProps {
  score: number;
  maxScore: number;
  showPercentage?: boolean;
}

export function StarProgress({
  score,
  maxScore,
  showPercentage = true,
}: StarProgressProps) {
  const percentage = (score / maxScore) * 100;

  let color = 'bg-red-500';
  let label = '1별';

  if (percentage >= 70) {
    color = 'bg-yellow-400';
    label = '3별';
  } else if (percentage >= 40) {
    color = 'bg-yellow-500';
    label = '2별';
  }

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">별점 진행도</span>
        {showPercentage && (
          <span className="text-sm font-bold text-gray-700">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="text-xs text-gray-600 mt-1">
        {label} - {score}/{maxScore}
      </div>
    </div>
  );
}

/**
 * 별점 비교 컴포넌트 (이전 기록과 비교)
 */
interface StarComparisonProps {
  currentStars: number;
  previousStars?: number;
  showImprovement?: boolean;
}

export function StarComparison({
  currentStars,
  previousStars,
  showImprovement = true,
}: StarComparisonProps) {
  const improved = previousStars ? currentStars > previousStars : false;
  const same = previousStars === currentStars;

  return (
    <div className="flex items-center gap-4">
      <div>
        <div className="text-xs text-gray-600 mb-1">현재 기록</div>
        <StarRating stars={currentStars} size="lg" showLabel={false} />
      </div>

      {previousStars !== undefined && (
        <>
          <div className="text-gray-400">vs</div>
          <div>
            <div className="text-xs text-gray-600 mb-1">이전 기록</div>
            <StarRating stars={previousStars} size="lg" showLabel={false} />
          </div>
        </>
      )}

      {showImprovement && previousStars !== undefined && (
        <div className="ml-auto">
          {improved && (
            <div className="text-green-600 font-bold text-sm">
              ↑ 향상됨!
            </div>
          )}
          {same && (
            <div className="text-gray-600 font-bold text-sm">
              = 동일
            </div>
          )}
          {!improved && !same && (
            <div className="text-orange-600 font-bold text-sm">
              ↓ 하락
            </div>
          )}
        </div>
      )}
    </div>
  );
}
