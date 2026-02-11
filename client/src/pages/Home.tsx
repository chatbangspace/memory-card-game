import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Flower, RotateCcw, Volume2 } from 'lucide-react';
import { useMemoryCardGame, type Difficulty } from '@/hooks/useMemoryCardGame';
import { useGameStats } from '@/hooks/useGameStats';
import { calculateStarsByDifficulty, getStarBonus } from '@/hooks/useStarRating';
import { StarRating, StarProgress, StarComparison } from '@/components/StarRating';

export default function Home() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [showResults, setShowResults] = useState(false);

  if (!selectedDifficulty) {
    return <DifficultySelection onSelect={setSelectedDifficulty} />;
  }

  return (
    <GameScreen
      difficulty={selectedDifficulty}
      onBack={() => {
        setSelectedDifficulty(null);
        setShowResults(false);
      }}
      onShowResults={() => setShowResults(true)}
      showResults={showResults}
    />
  );
}

// 난이도 선택 화면
function DifficultySelection({ onSelect }: { onSelect: (difficulty: Difficulty) => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white/80 backdrop-blur-md border-b border-green-100 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-6 flex items-center gap-3">
          <Flower className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold text-green-700">카드 뒤집기</h1>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🎮</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">난이도를 선택하세요</h2>
          <p className="text-gray-600">자신의 수준에 맞는 난이도를 선택하고 게임을 시작하세요!</p>
        </div>

        <div className="w-full max-w-sm space-y-4">
          {/* 초급 */}
          <Card
            className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
            onClick={() => onSelect('easy')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-blue-700 mb-1">초급</h3>
                <p className="text-sm text-gray-600">6장 | 60초</p>
              </div>
              <div className="text-4xl">🌱</div>
            </div>
          </Card>

          {/* 중급 */}
          <Card
            className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
            onClick={() => onSelect('medium')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-yellow-700 mb-1">중급</h3>
                <p className="text-sm text-gray-600">12장 | 90초</p>
              </div>
              <div className="text-4xl">🌿</div>
            </div>
          </Card>

          {/* 고급 */}
          <Card
            className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
            onClick={() => onSelect('hard')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-red-700 mb-1">고급</h3>
                <p className="text-sm text-gray-600">16장 | 120초</p>
              </div>
              <div className="text-4xl">🌳</div>
            </div>
          </Card>
        </div>

        {/* 안내 문구 */}
        <div className="mt-12 text-center text-sm text-gray-600 max-w-sm">
          <p>💡 <strong>팁:</strong> 처음 시작하시면 초급부터 시작하는 것을 추천합니다.</p>
        </div>
      </div>
    </div>
  );
}

// 게임 화면
function GameScreen({
  difficulty,
  onBack,
  onShowResults,
  showResults,
}: {
  difficulty: Difficulty;
  onBack: () => void;
  onShowResults: () => void;
  showResults: boolean;
}) {
  const {
    cards,
    config,
    matchedCount,
    moves,
    remainingTime,
    isGameActive,
    gameState,
    handleCardClick,
    initializeGame,
    calculateScore,
  } = useMemoryCardGame(difficulty);

  const { addGameRecord, getBestRecord } = useGameStats();
  const [bestRecord, setBestRecord] = useState<any>(null);

  // 게임 완료 시 기록 저장
  useEffect(() => {
    if (gameState === 'won') {
      const score = calculateScore();
      const stars = calculateStarsByDifficulty(score, difficulty);
      const bonus = getStarBonus(stars);
      const totalScore = score + bonus;

      // 게임 기록 추가
      addGameRecord({
        difficulty,
        score: totalScore,
        stars,
        moves,
        timeUsed: config.timeLimit - remainingTime,
        timestamp: Date.now(),
      });

      // 이전 최고 기록 조회
      const best = getBestRecord(difficulty);
      setBestRecord(best);
    }
  }, [gameState]);

  const difficultyLabel = {
    easy: '초급',
    medium: '중급',
    hard: '고급',
  }[difficulty];

  const difficultyColor = {
    easy: 'blue',
    medium: 'yellow',
    hard: 'red',
  }[difficulty];

  const timePercentage = (remainingTime / config.timeLimit) * 100;
  const timeColor = timePercentage > 50 ? 'bg-green-500' : timePercentage > 25 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 pb-20">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="text-xs"
            >
              ← 돌아가기
            </Button>
            <h1 className="text-xl font-bold text-green-700">카드 뒤집기 {difficultyLabel}</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={initializeGame}
              className="text-xs"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* 게임 정보 */}
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="bg-blue-50 rounded-lg p-2">
              <div className="text-xs text-gray-600">시도</div>
              <div className="text-xl font-bold text-blue-600">{moves}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-2">
              <div className="text-xs text-gray-600">맞춘 쌍</div>
              <div className="text-xl font-bold text-green-600">{matchedCount}/{config.pairCount}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-2">
              <div className="text-xs text-gray-600">남은 시간</div>
              <div className="text-xl font-bold text-red-600">{remainingTime}초</div>
            </div>
          </div>

          {/* 시간 게이지 */}
          <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${timeColor} transition-all duration-300`}
              style={{ width: `${timePercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 게임 보드 */}
      <div className="max-w-md mx-auto px-4 py-6">
        <div
          className={`grid gap-3 ${
            config.cardCount === 6
              ? 'grid-cols-3'
              : config.cardCount === 12
              ? 'grid-cols-4'
              : 'grid-cols-4'
          }`}
        >
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={!isGameActive || card.matched}
              className={`aspect-square rounded-xl font-4xl transition-all transform ${
                card.flipped || card.matched
                  ? 'bg-gradient-to-br from-green-100 to-green-50 text-4xl shadow-md'
                  : 'bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
              } ${!isGameActive && 'opacity-75 cursor-not-allowed'} ${
                card.matched && 'ring-2 ring-green-500'
              }`}
            >
              {card.flipped || card.matched ? card.emoji : '?'}
            </button>
          ))}
        </div>
      </div>

      {/* 게임 결과 */}
      {gameState !== 'playing' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-white w-full max-w-sm p-8 rounded-2xl shadow-2xl">
            {gameState === 'won' ? (
              <>
                {/* 헤더 */}
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4 animate-bounce">🎉</div>
                  <h2 className="text-3xl font-bold text-green-600 mb-2">성공!</h2>
                  <p className="text-gray-600">모든 카드를 찾았습니다!</p>
                </div>

                {/* 별점 표시 */}
                <div className="bg-yellow-50 rounded-lg p-4 mb-6 text-center">
                  <div className="mb-3 flex justify-center">
                    <StarRating 
                      stars={calculateStarsByDifficulty(calculateScore(), difficulty)} 
                      size="lg" 
                      animated 
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {calculateStarsByDifficulty(calculateScore(), difficulty) === 3 && '완벽한 플레이입니다! 🌟'}
                    {calculateStarsByDifficulty(calculateScore(), difficulty) === 2 && '좋은 플레이입니다! ⭐'}
                    {calculateStarsByDifficulty(calculateScore(), difficulty) === 1 && '도전해주셔서 감사합니다! 💪'}
                  </p>
                </div>

                {/* 점수 진행도 */}
                <div className="mb-6">
                  <StarProgress
                    score={calculateScore()}
                    maxScore={difficulty === 'easy' ? 100 : difficulty === 'medium' ? 120 : 150}
                    showPercentage
                  />
                </div>

                {/* 게임 통계 */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-600">기본 점수</div>
                      <div className="text-2xl font-bold text-blue-600">{calculateScore()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">별점 보너스</div>
                      <div className="text-2xl font-bold text-yellow-600">+{getStarBonus(calculateStarsByDifficulty(calculateScore(), difficulty))}</div>
                    </div>
                  </div>

                  <div className="border-t border-blue-200 pt-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700">시도 횟수</span>
                      <span className="font-bold">{moves}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700">사용 시간</span>
                      <span className="font-bold">{config.timeLimit - remainingTime}초</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700">남은 시간</span>
                      <span className="font-bold">{remainingTime}초</span>
                    </div>
                  </div>

                  <div className="border-t border-blue-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700 font-bold">총 점수</span>
                      <span className="text-2xl font-bold text-green-600">
                        {calculateScore() + getStarBonus(calculateStarsByDifficulty(calculateScore(), difficulty))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 이전 기록과 비교 */}
                {bestRecord && bestRecord.stars !== calculateStarsByDifficulty(calculateScore(), difficulty) && (
                  <div className="bg-purple-50 rounded-lg p-4 mb-6">
                    <div className="text-xs text-gray-600 mb-3">이전 최고 기록</div>
                    <StarComparison
                      currentStars={calculateStarsByDifficulty(calculateScore(), difficulty)}
                      previousStars={bestRecord.stars}
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
                    onClick={initializeGame}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    다시 하기
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">⏰</div>
                  <h2 className="text-3xl font-bold text-red-600 mb-2">시간 초과!</h2>
                  <p className="text-gray-600">시간 내에 모든 카드를 찾지 못했습니다.</p>
                </div>

                <div className="bg-red-50 rounded-lg p-4 mb-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">찾은 쌍:</span>
                    <span className="font-bold">{matchedCount}/{config.pairCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">시도 횟수:</span>
                    <span className="font-bold">{moves}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">사용 시간:</span>
                    <span className="font-bold">{config.timeLimit}초</span>
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
                    onClick={initializeGame}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    다시 하기
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
