import { useState, useEffect, useCallback } from 'react';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

export interface GameConfig {
  difficulty: Difficulty;
  cardCount: number;
  pairCount: number;
  timeLimit: number;
}

const DIFFICULTY_CONFIG: Record<Difficulty, GameConfig> = {
  easy: {
    difficulty: 'easy',
    cardCount: 6,
    pairCount: 3,
    timeLimit: 60,
  },
  medium: {
    difficulty: 'medium',
    cardCount: 12,
    pairCount: 6,
    timeLimit: 90,
  },
  hard: {
    difficulty: 'hard',
    cardCount: 16,
    pairCount: 8,
    timeLimit: 120,
  },
};

const CARD_EMOJIS = ['🌹', '🌻', '🌷', '🌸', '🌺', '🌼', '🌞', '🌝'];

export function useMemoryCardGame(difficulty: Difficulty) {
  const config = DIFFICULTY_CONFIG[difficulty];
  
  const [cards, setCards] = useState<Card[]>([]);
  const [firstCard, setFirstCard] = useState<number | null>(null);
  const [secondCard, setSecondCard] = useState<number | null>(null);
  const [matchedCount, setMatchedCount] = useState(0);
  const [moves, setMoves] = useState(0);
  const [remainingTime, setRemainingTime] = useState(config.timeLimit);
  const [isGameActive, setIsGameActive] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

  // 게임 초기화
  const initializeGame = useCallback(() => {
    const emojis = CARD_EMOJIS.slice(0, config.pairCount);
    const cardPairs = [...emojis, ...emojis];
    const shuffled = cardPairs.sort(() => Math.random() - 0.5);
    
    const newCards: Card[] = shuffled.map((emoji, index) => ({
      id: index,
      emoji,
      flipped: false,
      matched: false,
    }));
    
    setCards(newCards);
    setFirstCard(null);
    setSecondCard(null);
    setMatchedCount(0);
    setMoves(0);
    setRemainingTime(config.timeLimit);
    setIsGameActive(true);
    setGameState('playing');
  }, [config]);

  // 게임 시작 시 초기화
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // 타이머 로직
  useEffect(() => {
    if (!isGameActive || gameState !== 'playing') return;

    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          setIsGameActive(false);
          setGameState('lost');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive, gameState]);

  // 카드 클릭 핸들러
  const handleCardClick = useCallback((cardId: number) => {
    if (!isGameActive || isProcessing || gameState !== 'playing') return;

    const clickedCard = cards[cardId];
    if (clickedCard.flipped || clickedCard.matched) return;

    // 첫 번째 카드 선택
    if (firstCard === null) {
      setFirstCard(cardId);
      const newCards = [...cards];
      newCards[cardId].flipped = true;
      setCards(newCards);
      return;
    }

    // 두 번째 카드 선택
    if (secondCard === null && firstCard !== cardId) {
      setSecondCard(cardId);
      setIsProcessing(true);
      setMoves(prev => prev + 1);

      const newCards = [...cards];
      newCards[cardId].flipped = true;
      setCards(newCards);

      // 매칭 확인
      setTimeout(() => {
        if (cards[firstCard].emoji === cards[cardId].emoji) {
          // 매칭 성공
          newCards[firstCard].matched = true;
          newCards[cardId].matched = true;
          setCards(newCards);
          setMatchedCount(prev => {
            const newMatched = prev + 1;
            // 게임 완료 확인
            if (newMatched === config.pairCount) {
              setIsGameActive(false);
              setGameState('won');
            }
            return newMatched;
          });
        } else {
          // 매칭 실패 - 카드 뒤집기
          newCards[firstCard].flipped = false;
          newCards[cardId].flipped = false;
          setCards(newCards);
        }

        setFirstCard(null);
        setSecondCard(null);
        setIsProcessing(false);
      }, 1000);
    }
  }, [cards, firstCard, secondCard, isProcessing, isGameActive, gameState, config.pairCount]);

  // 게임 점수 계산
  const calculateScore = useCallback(() => {
    if (gameState !== 'won') return 0;
    
    const baseScore = 100;
    const timeBonus = Math.max(0, remainingTime * 2);
    const movesPenalty = Math.max(0, moves * 5);
    
    return Math.max(50, baseScore + timeBonus - movesPenalty);
  }, [gameState, remainingTime, moves]);

  return {
    cards,
    config,
    firstCard,
    secondCard,
    matchedCount,
    moves,
    remainingTime,
    isGameActive,
    isProcessing,
    gameState,
    handleCardClick,
    initializeGame,
    calculateScore,
  };
}
