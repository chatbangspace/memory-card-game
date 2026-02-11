import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StarRating, StarProgress, StarComparison } from '@/components/StarRating';
import { calculateStarsByDifficulty, getStarBonus } from '@/hooks/useStarRating';
import { Difficulty, GameRecord } from '@/hooks/useGameStats';

interface GameResultModalProps {
  gameState: 'won' | 'lost';
  difficulty: Difficulty;
  score: number;
  moves: number;
  remainingTime: number;
  timeLimit: number;
  onRestart: () => void;
  onBack: () => void;
  previousBestRecord?: GameRecord;
}

export function GameResultModal({
  gameState,
  difficulty,
  score,
  moves,
  remainingTime,
  timeLimit,
  onRestart,
  onBack,
  previousBestRecord,
}: GameResultModalProps) {
  const stars = calculateStarsByDifficulty(score, difficulty);
  const bonus = getStarBonus(stars);
  const totalScore = score + bonus;
  const timeUsed = timeLimit - remainingTime;

  const difficultyLabel = {
    easy: '초급',
    medium: '중급',
    hard: '고급',
  }[difficulty];

  if (gameState === 'won') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="bg-white w-full max-w-sm p-8 rounded-2xl shadow-2xl">
          {/* 헤더 */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold text-green-600 mb-2">성공!</h2>
            <p className="text-gray-600">모든 카드를 찾았습니다!</p>
          </div>

          {/* 별점 표시 */}
          <div className="bg-yellow-50 rounded-lg p-4 mb-6 text-center">
            <div className="mb-3">
              <StarRating stars={stars} size="lg" animated />
            </div>
            <p className="text-sm text-gray-600">
              {stars === 3 && '완벽한 플레이입니다! 🌟'}
              {stars === 2 && '좋은 플레이입니다! ⭐'}
              {stars === 1 && '도전해주셔서 감사합니다! 💪'}
            </p>
          </div>

          {/* 점수 진행도 */}
          <div className="mb-6">
            <StarProgress
              score={score}
              maxScore={difficulty === 'easy' ? 100 : difficulty === 'medium' ? 120 : 150}
              showPercentage
            />
          </div>

          {/* 게임 통계 */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-600">기본 점수</div>
                <div className="text-2xl font-bold text-blue-600">{score}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">별점 보너스</div>
                <div className="text-2xl font-bold text-yellow-600">+{bonus}</div>
              </div>
            </div>

            <div className="border-t border-blue-200 pt-3">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">시도 횟수</span>
                <span className="font-bold">{moves}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">사용 시간</span>
                <span className="font-bold">{timeUsed}초</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">남은 시간</span>
                <span className="font-bold">{remainingTime}초</span>
              </div>
            </div>

            <div className="border-t border-blue-200 pt-3">
              <div className="flex justify-between">
                <span className="text-gray-700 font-bold">총 점수</span>
                <span className="text-2xl font-bold text-green-600">{totalScore}</span>
              </div>
            </div>
          </div>

          {/* 이전 기록과 비교 */}
          {previousBestRecord && (
            <div className="bg-purple-50 rounded-lg p-4 mb-6">
              <div className="text-xs text-gray-600 mb-3">이전 최고 기록</div>
              <StarComparison
                currentStars={stars}
                previousStars={previousBestRecord.stars}
                showImprovement
              />
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1"
            >
              난이도 선택
            </Button>
            <Button
              onClick={onRestart}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              다시 하기
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 게임 오버 화면
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-white w-full max-w-sm p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">⏰</div>
          <h2 className="text-3xl font-bold text-red-600 mb-2">시간 초과!</h2>
          <p className="text-gray-600">시간 내에 모든 카드를 찾지 못했습니다.</p>
        </div>

        <div className="bg-red-50 rounded-lg p-4 mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-600">난이도</div>
              <div className="text-lg font-bold text-red-600">{difficultyLabel}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600">시도 횟수</div>
              <div className="text-lg font-bold text-red-600">{moves}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            난이도 선택
          </Button>
          <Button
            onClick={onRestart}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            다시 하기
          </Button>
        </div>
      </Card>
    </div>
  );
}
