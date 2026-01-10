/**
 * Question Validators
 *
 * Schema validation for generated questions using Zod
 */

import { z } from 'zod';
import type { TossupQuestion, BonusQuestion, Packet } from '../types.js';

// Category enum
const QuestionCategorySchema = z.enum([
  'Science',
  'Literature',
  'History',
  'Fine Arts',
  'Geography',
  'Social Science',
  'Current Events',
  'Mathematics',
  'Mythology',
  'Philosophy',
  'Human Body',
]);

// Difficulty enum
const QuestionDifficultySchema = z.enum([
  'middle_school',
  'high_school',
  'college',
  'open',
]);

// Question source enum
const QuestionSourceSchema = z.enum(['qbreader', 'ai-generated', 'manual']);

// Bonus part schema
const BonusPartSchema = z.object({
  text: z.string().min(10, 'Part text too short').max(500, 'Part text too long'),
  answer: z.string().min(1, 'Answer required').max(200, 'Answer too long'),
  acceptableAnswers: z.array(z.string()).min(1, 'At least one acceptable answer required'),
  pointValue: z.number().optional(),
});

// Tossup schema
export const TossupSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
  category: QuestionCategorySchema,
  subcategory: z.string().optional(),
  difficulty: QuestionDifficultySchema,
  text: z.string().min(50, 'Question text too short').max(2000, 'Question text too long'),
  powerMarkPosition: z.number().min(0, 'Power mark must be positive'),
  answer: z.string().min(1, 'Answer required').max(200, 'Answer too long'),
  acceptableAnswers: z.array(z.string()).min(1, 'At least one acceptable answer required'),
  explanation: z.string().optional(),
  source: QuestionSourceSchema.optional(),
  sourceId: z.string().optional(),
});

// Bonus schema
export const BonusSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
  linkedTossupId: z.string(), // Can be empty before linking
  category: QuestionCategorySchema,
  subcategory: z.string().optional(),
  difficulty: QuestionDifficultySchema,
  parts: z.tuple([BonusPartSchema, BonusPartSchema, BonusPartSchema]),
  leadin: z.string().optional(),
  source: QuestionSourceSchema.optional(),
  sourceId: z.string().optional(),
});

// Packet schema
export const PacketSchema = z.object({
  packetId: z.string().regex(/^packet-\d{3}$/, 'Invalid packet ID format'),
  version: z.string(),
  generatedAt: z.string().datetime(),
  difficulty: z.union([QuestionDifficultySchema, z.literal('mixed')]),
  categories: z.array(QuestionCategorySchema),
  tossups: z.array(TossupSchema).length(20, 'Packet must have exactly 20 tossups'),
  bonuses: z.array(BonusSchema).length(20, 'Packet must have exactly 20 bonuses'),
});

// Validation result type
interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a single tossup
 */
export function validateTossup(tossup: any): ValidationResult {
  const result = TossupSchema.safeParse(tossup);

  if (result.success) {
    // Additional semantic validation
    const errors: string[] = [];

    // Check power mark is within text bounds
    if (tossup.powerMarkPosition >= tossup.text.length) {
      errors.push(`Power mark position (${tossup.powerMarkPosition}) exceeds text length (${tossup.text.length})`);
    }

    // Check primary answer is in acceptable answers
    if (!tossup.acceptableAnswers.includes(tossup.answer)) {
      errors.push('Primary answer not in acceptableAnswers array');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  return {
    valid: false,
    errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
  };
}

/**
 * Validate a single bonus
 */
export function validateBonus(bonus: any): ValidationResult {
  const result = BonusSchema.safeParse(bonus);

  if (result.success) {
    const errors: string[] = [];

    // Check each part has answer in acceptable answers
    for (let i = 0; i < 3; i++) {
      const part = bonus.parts[i];
      if (!part.acceptableAnswers.includes(part.answer)) {
        errors.push(`Part ${i + 1}: Primary answer not in acceptableAnswers`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  return {
    valid: false,
    errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
  };
}

/**
 * Validate a packet
 */
export function validatePacket(packet: any): ValidationResult {
  const result = PacketSchema.safeParse(packet);

  if (result.success) {
    const errors: string[] = [];

    // Check all bonuses link to valid tossups in the packet
    const tossupIds = new Set(packet.tossups.map((t: TossupQuestion) => t.id));
    for (const bonus of packet.bonuses) {
      if (!tossupIds.has(bonus.linkedTossupId)) {
        errors.push(`Bonus ${bonus.id} links to non-existent tossup ${bonus.linkedTossupId}`);
      }
    }

    // Check for duplicate IDs
    const allIds = [
      ...packet.tossups.map((t: TossupQuestion) => t.id),
      ...packet.bonuses.map((b: BonusQuestion) => b.id),
    ];
    const uniqueIds = new Set(allIds);
    if (uniqueIds.size !== allIds.length) {
      errors.push('Duplicate question IDs found in packet');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  return {
    valid: false,
    errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
  };
}

/**
 * Validate all questions in a dataset
 */
export function validateDataset(
  tossups: TossupQuestion[],
  bonuses: BonusQuestion[]
): { validTossups: number; validBonuses: number; errors: string[] } {
  const errors: string[] = [];
  let validTossups = 0;
  let validBonuses = 0;

  // Validate tossups
  for (const tossup of tossups) {
    const result = validateTossup(tossup);
    if (result.valid) {
      validTossups++;
    } else {
      errors.push(`Tossup ${tossup.id}: ${result.errors.join(', ')}`);
    }
  }

  // Validate bonuses
  for (const bonus of bonuses) {
    const result = validateBonus(bonus);
    if (result.valid) {
      validBonuses++;
    } else {
      errors.push(`Bonus ${bonus.id}: ${result.errors.join(', ')}`);
    }
  }

  return {
    validTossups,
    validBonuses,
    errors,
  };
}

/**
 * Print validation summary
 */
export function printValidationSummary(
  tossups: TossupQuestion[],
  bonuses: BonusQuestion[]
): void {
  const result = validateDataset(tossups, bonuses);

  console.log('\n=== Validation Summary ===');
  console.log(`Tossups: ${result.validTossups}/${tossups.length} valid`);
  console.log(`Bonuses: ${result.validBonuses}/${bonuses.length} valid`);

  if (result.errors.length > 0) {
    console.log(`\nErrors (${result.errors.length}):`);
    // Show first 10 errors
    for (const error of result.errors.slice(0, 10)) {
      console.log(`  - ${error}`);
    }
    if (result.errors.length > 10) {
      console.log(`  ... and ${result.errors.length - 10} more`);
    }
  }
}

export default {
  validateTossup,
  validateBonus,
  validatePacket,
  validateDataset,
  printValidationSummary,
  TossupSchema,
  BonusSchema,
  PacketSchema,
};
