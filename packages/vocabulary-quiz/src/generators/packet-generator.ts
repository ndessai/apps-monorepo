/**
 * Quiz Packet Generator
 * Generates complete vocabulary quiz packets with tossups and bonuses
 */

import type {
  VocabularyTossupQuestion,
  VocabularyBonusQuestion,
  VocabularyQuizData,
  QuizGenerationOptions,
  VocabularyCategory,
  QuestionDifficulty,
} from '../types';
import { getAllWords, getWordsByCategory } from '../data/words';
import { generateVocabularyTossup } from './tossup-generator';
import { generateVocabularyBonus } from './bonus-generator';

const DEFAULT_GENERATION_OPTIONS: Required<QuizGenerationOptions> = {
  categories: ['HumanBehavior', 'EmotionsFeelings', 'MedicalScientific', 'LiteraryArtistic', 'AbstractConcepts', 'ActionsVerbs'],
  difficulty: 'high_school',
  tossupCount: 10,
  includeBonuses: true,
  bonusPattern: 'etymology',
};

/**
 * Generate a complete vocabulary quiz packet
 */
export function generateVocabularyQuizPacket(
  options: QuizGenerationOptions = {}
): VocabularyQuizData {
  const opts = { ...DEFAULT_GENERATION_OPTIONS, ...options };

  // Get available words
  let availableWords = getAllWords();

  // Filter by categories if specified
  if (opts.categories && opts.categories.length > 0) {
    availableWords = availableWords.filter(w =>
      opts.categories!.includes(w.category)
    );
  }

  // Filter by difficulty if specified (allow adjacent difficulties too)
  if (opts.difficulty) {
    const difficultyOrder: QuestionDifficulty[] = ['middle_school', 'high_school', 'college', 'open'];
    const targetIndex = difficultyOrder.indexOf(opts.difficulty);
    const allowedDifficulties = difficultyOrder.filter((_, i) =>
      Math.abs(i - targetIndex) <= 1
    );
    availableWords = availableWords.filter(w =>
      allowedDifficulties.includes(w.difficulty)
    );
  }

  // Shuffle words
  const shuffledWords = shuffleArray([...availableWords]);

  // Select words for tossups
  const selectedWords = shuffledWords.slice(0, Math.min(opts.tossupCount, shuffledWords.length));

  // Generate tossups
  const tossups = selectedWords.map(word =>
    generateVocabularyTossup(word, { difficulty: opts.difficulty })
  );

  // Generate bonuses if requested
  const bonuses: VocabularyBonusQuestion[] = [];
  if (opts.includeBonuses) {
    for (let i = 0; i < tossups.length; i++) {
      const bonus = generateVocabularyBonus(
        selectedWords[i],
        tossups[i].id,
        { difficulty: opts.difficulty, pattern: opts.bonusPattern }
      );
      if (bonus) {
        bonuses.push(bonus);
      }
    }
  }

  // Calculate metadata
  const categoryBreakdown = calculateCategoryBreakdown(tossups);
  const difficultyBreakdown = calculateDifficultyBreakdown(tossups);

  return {
    tossups,
    bonuses,
    metadata: {
      generatedAt: new Date().toISOString(),
      wordCount: selectedWords.length,
      categoryBreakdown,
      difficultyBreakdown,
    },
  };
}

/**
 * Generate a quiz packet for a specific category
 */
export function generateCategoryQuizPacket(
  category: VocabularyCategory,
  options: Omit<QuizGenerationOptions, 'categories'> = {}
): VocabularyQuizData {
  return generateVocabularyQuizPacket({
    ...options,
    categories: [category],
  });
}

/**
 * Generate a quiz packet with balanced category distribution
 */
export function generateBalancedQuizPacket(
  options: Omit<QuizGenerationOptions, 'categories'> = {}
): VocabularyQuizData {
  const tossupCount = options.tossupCount || DEFAULT_GENERATION_OPTIONS.tossupCount;
  const categories: VocabularyCategory[] = [
    'HumanBehavior',
    'EmotionsFeelings',
    'MedicalScientific',
    'LiteraryArtistic',
    'AbstractConcepts',
    'ActionsVerbs',
  ];

  const perCategory = Math.floor(tossupCount / categories.length);
  const remainder = tossupCount % categories.length;

  const tossups: VocabularyTossupQuestion[] = [];
  const bonuses: VocabularyBonusQuestion[] = [];

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const count = perCategory + (i < remainder ? 1 : 0);

    // Get words for this category
    let categoryWords = getWordsByCategory(category);

    // Filter by difficulty if specified
    if (options.difficulty) {
      categoryWords = categoryWords.filter(w => w.difficulty === options.difficulty);
    }

    // Shuffle and select
    const shuffled = shuffleArray([...categoryWords]);
    const selected = shuffled.slice(0, count);

    // Generate questions
    for (const word of selected) {
      const tossup = generateVocabularyTossup(word, { difficulty: options.difficulty });
      tossups.push(tossup);

      if (options.includeBonuses !== false) {
        const bonus = generateVocabularyBonus(word, tossup.id, { difficulty: options.difficulty });
        if (bonus) {
          bonuses.push(bonus);
        }
      }
    }
  }

  // Shuffle final order
  const shuffledTossups = shuffleArray(tossups);

  // Calculate metadata
  const categoryBreakdown = calculateCategoryBreakdown(shuffledTossups);
  const difficultyBreakdown = calculateDifficultyBreakdown(shuffledTossups);

  return {
    tossups: shuffledTossups,
    bonuses,
    metadata: {
      generatedAt: new Date().toISOString(),
      wordCount: shuffledTossups.length,
      categoryBreakdown,
      difficultyBreakdown,
    },
  };
}

/**
 * Generate a sample quiz for testing
 */
export function generateSampleQuiz(): VocabularyQuizData {
  return generateVocabularyQuizPacket({
    tossupCount: 5,
    includeBonuses: true,
    difficulty: 'high_school',
  });
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Calculate category breakdown from tossups
 */
function calculateCategoryBreakdown(
  tossups: VocabularyTossupQuestion[]
): Record<VocabularyCategory, number> {
  const breakdown: Record<VocabularyCategory, number> = {
    HumanBehavior: 0,
    EmotionsFeelings: 0,
    MedicalScientific: 0,
    LiteraryArtistic: 0,
    AbstractConcepts: 0,
    ActionsVerbs: 0,
  };

  for (const tossup of tossups) {
    if (tossup.subcategory in breakdown) {
      breakdown[tossup.subcategory as VocabularyCategory]++;
    }
  }

  return breakdown;
}

/**
 * Calculate difficulty breakdown from tossups
 */
function calculateDifficultyBreakdown(
  tossups: VocabularyTossupQuestion[]
): Record<QuestionDifficulty, number> {
  const breakdown: Record<QuestionDifficulty, number> = {
    middle_school: 0,
    high_school: 0,
    college: 0,
    open: 0,
  };

  for (const tossup of tossups) {
    if (tossup.difficulty in breakdown) {
      breakdown[tossup.difficulty]++;
    }
  }

  return breakdown;
}
