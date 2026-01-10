/**
 * QB Reader to App Schema Transformer
 *
 * Transforms QB Reader question format to QuizApp format
 */

import { v4 as uuidv4 } from 'uuid';
import { DIFFICULTY_MAP, CATEGORY_MAP } from '../config.js';
import {
  stripHtml,
  stripHtmlPreservePowerMark,
  normalizeText,
  calculatePowerMarkPosition,
  adjustToWordBoundary,
  parseAnswer,
} from '../utils/index.js';
import type {
  QBReaderTossup,
  QBReaderBonus,
  TossupQuestion,
  BonusQuestion,
  BonusPart,
  QuestionCategory,
  QuestionDifficulty,
} from '../types.js';

/**
 * Transform QB Reader tossup to App tossup format
 */
export function transformTossup(qbTossup: QBReaderTossup): TossupQuestion | null {
  try {
    // Map category
    const category = mapCategory(qbTossup.category);
    if (!category) {
      return null; // Skip unmapped categories (e.g., Trash)
    }

    // Strip HTML and get clean text
    const { text: cleanText, powerMarkIndex } = stripHtmlPreservePowerMark(qbTossup.question);
    const normalizedText = normalizeText(cleanText);

    if (!normalizedText || normalizedText.length < 50) {
      console.warn(`Skipping short tossup: ${qbTossup._id}`);
      return null;
    }

    // Calculate power mark position
    let powerMarkPosition: number;
    if (powerMarkIndex >= 0) {
      powerMarkPosition = powerMarkIndex;
    } else {
      powerMarkPosition = calculatePowerMarkPosition(normalizedText, qbTossup.question);
    }

    // Adjust to word boundary
    powerMarkPosition = adjustToWordBoundary(normalizedText, powerMarkPosition);

    // Parse answer
    const { primaryAnswer, acceptableAnswers } = parseAnswer(qbTossup.answer);

    if (!primaryAnswer) {
      console.warn(`Skipping tossup with no answer: ${qbTossup._id}`);
      return null;
    }

    // Map difficulty
    const difficulty = mapDifficulty(qbTossup.difficulty);

    // Map subcategory
    const subcategory = qbTossup.subcategory || qbTossup.alternate_subcategory || undefined;

    return {
      id: uuidv4(),
      category,
      subcategory,
      difficulty,
      text: normalizedText,
      powerMarkPosition,
      answer: primaryAnswer,
      acceptableAnswers,
      source: 'qbreader',
      sourceId: qbTossup._id,
    };
  } catch (error) {
    console.error(`Error transforming tossup ${qbTossup._id}:`, error);
    return null;
  }
}

/**
 * Transform QB Reader bonus to App bonus format
 */
export function transformBonus(qbBonus: QBReaderBonus): BonusQuestion | null {
  try {
    // Validate 3 parts
    if (!qbBonus.parts || qbBonus.parts.length !== 3) {
      return null;
    }

    if (!qbBonus.answers || qbBonus.answers.length !== 3) {
      return null;
    }

    // Map category
    const category = mapCategory(qbBonus.category);
    if (!category) {
      return null;
    }

    // Transform parts
    const parts: BonusPart[] = [];
    for (let i = 0; i < 3; i++) {
      const partText = normalizeText(stripHtml(qbBonus.parts[i]));
      const { primaryAnswer, acceptableAnswers } = parseAnswer(qbBonus.answers[i]);

      if (!partText || !primaryAnswer) {
        return null; // Skip if any part is invalid
      }

      parts.push({
        text: partText,
        answer: primaryAnswer,
        acceptableAnswers,
        pointValue: 10,
      });
    }

    // Clean leadin
    const leadin = qbBonus.leadin
      ? normalizeText(stripHtml(qbBonus.leadin))
      : undefined;

    // Map difficulty
    const difficulty = mapDifficulty(qbBonus.difficulty);

    // Map subcategory
    const subcategory = qbBonus.subcategory || qbBonus.alternate_subcategory || undefined;

    return {
      id: uuidv4(),
      linkedTossupId: '', // Will be set during packet building
      category,
      subcategory,
      difficulty,
      parts: parts as [BonusPart, BonusPart, BonusPart],
      leadin,
      source: 'qbreader',
      sourceId: qbBonus._id,
    };
  } catch (error) {
    console.error(`Error transforming bonus ${qbBonus._id}:`, error);
    return null;
  }
}

/**
 * Map QB Reader category to App category
 */
export function mapCategory(qbCategory: string): QuestionCategory | null {
  const mapped = CATEGORY_MAP[qbCategory];

  if (mapped === null || mapped === undefined) {
    return null; // Skip unmapped categories
  }

  return mapped as QuestionCategory;
}

/**
 * Map QB Reader difficulty (0-10) to App difficulty
 */
export function mapDifficulty(qbDifficulty: number): QuestionDifficulty {
  // Clamp to valid range
  const clamped = Math.max(0, Math.min(10, Math.round(qbDifficulty)));
  return DIFFICULTY_MAP[clamped] || 'high_school';
}

/**
 * Batch transform tossups
 */
export function transformTossups(qbTossups: QBReaderTossup[]): TossupQuestion[] {
  const transformed: TossupQuestion[] = [];

  for (const qbTossup of qbTossups) {
    const tossup = transformTossup(qbTossup);
    if (tossup) {
      transformed.push(tossup);
    }
  }

  console.log(`Transformed ${transformed.length}/${qbTossups.length} tossups`);
  return transformed;
}

/**
 * Batch transform bonuses
 */
export function transformBonuses(qbBonuses: QBReaderBonus[]): BonusQuestion[] {
  const transformed: BonusQuestion[] = [];

  for (const qbBonus of qbBonuses) {
    const bonus = transformBonus(qbBonus);
    if (bonus) {
      transformed.push(bonus);
    }
  }

  console.log(`Transformed ${transformed.length}/${qbBonuses.length} bonuses`);
  return transformed;
}

export default {
  transformTossup,
  transformBonus,
  transformTossups,
  transformBonuses,
  mapCategory,
  mapDifficulty,
};
