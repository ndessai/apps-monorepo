#!/usr/bin/env tsx
/**
 * Question Generation Script
 *
 * Main entry point for generating quiz questions from QB Reader and AI
 *
 * Usage:
 *   npm run generate              # Generate all questions
 *   npm run generate:qbreader     # Only fetch from QB Reader
 *   npm run generate:ai           # Only generate AI questions
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { program } from 'commander';

import { fetchAllCategories, getQuestionStats } from './qbreader/index.js';
import { generateAllHumanBodyQuestions } from './ai-generator/index.js';
import { buildAll } from './packet-builder/index.js';
import { printValidationSummary } from './validators/validator.js';
import { OUTPUT_PATHS, TARGET_COUNTS } from './config.js';
import type { TossupQuestion, BonusQuestion, QuestionCategory } from './types.js';

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve output path relative to script location
const OUTPUT_DIR = path.resolve(__dirname, OUTPUT_PATHS.packetsDir, '..');

interface GenerationResult {
  tossups: TossupQuestion[];
  bonuses: BonusQuestion[];
}

/**
 * Fetch questions from QB Reader
 */
async function fetchQBReaderQuestions(): Promise<GenerationResult> {
  console.log('\n========================================');
  console.log('   FETCHING FROM QB READER');
  console.log('========================================\n');

  const allTossups: TossupQuestion[] = [];
  const allBonuses: BonusQuestion[] = [];

  try {
    const results = await fetchAllCategories();

    for (const [category, result] of results) {
      allTossups.push(...result.tossups);
      allBonuses.push(...result.bonuses);
    }

    // Print stats
    const stats = getQuestionStats(results);
    console.log('\n=== QB Reader Fetch Summary ===');
    console.log(`Total tossups: ${stats.totalTossups}`);
    console.log(`Total bonuses: ${stats.totalBonuses}`);
    console.log('\nBy category:');
    for (const [cat, counts] of Object.entries(stats.byCategory)) {
      console.log(`  ${cat}: ${counts.tossups} tossups, ${counts.bonuses} bonuses`);
    }
  } catch (error) {
    console.error('Error fetching from QB Reader:', error);
  }

  return { tossups: allTossups, bonuses: allBonuses };
}

/**
 * Generate Human Body questions using AI
 */
async function generateAIQuestions(): Promise<GenerationResult> {
  console.log('\n========================================');
  console.log('   GENERATING AI QUESTIONS');
  console.log('========================================\n');

  try {
    const result = await generateAllHumanBodyQuestions();

    console.log('\n=== AI Generation Summary ===');
    console.log(`Total tossups: ${result.stats.tossups}`);
    console.log(`Total bonuses: ${result.stats.bonuses}`);
    console.log('\nBy subcategory:');
    for (const [subcat, counts] of Object.entries(result.stats.bySubcategory)) {
      console.log(`  ${subcat}: ${counts.tossups} tossups, ${counts.bonuses} bonuses`);
    }

    return { tossups: result.tossups, bonuses: result.bonuses };
  } catch (error) {
    console.error('Error generating AI questions:', error);
    return { tossups: [], bonuses: [] };
  }
}

/**
 * Main generation function
 */
async function generate(options: {
  source: 'all' | 'qbreader' | 'ai';
  skipValidation?: boolean;
}): Promise<void> {
  console.log('========================================');
  console.log('   QUIZ QUESTION GENERATOR');
  console.log('========================================');
  console.log(`Source: ${options.source}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log('========================================\n');

  const allTossups: TossupQuestion[] = [];
  const allBonuses: BonusQuestion[] = [];

  // Fetch from QB Reader
  if (options.source === 'all' || options.source === 'qbreader') {
    const qbResult = await fetchQBReaderQuestions();
    allTossups.push(...qbResult.tossups);
    allBonuses.push(...qbResult.bonuses);
  }

  // Generate AI questions
  if (options.source === 'all' || options.source === 'ai') {
    const aiResult = await generateAIQuestions();
    allTossups.push(...aiResult.tossups);
    allBonuses.push(...aiResult.bonuses);
  }

  // Check if we have any questions
  if (allTossups.length === 0 || allBonuses.length === 0) {
    console.error('\nNo questions generated. Exiting.');
    process.exit(1);
  }

  // Validate questions
  if (!options.skipValidation) {
    printValidationSummary(allTossups, allBonuses);
  }

  // Build packets
  console.log('\n========================================');
  console.log('   BUILDING PACKETS');
  console.log('========================================\n');

  const { packets, metadata } = buildAll(
    { tossups: allTossups, bonuses: allBonuses },
    OUTPUT_DIR
  );

  // Final summary
  console.log('\n========================================');
  console.log('   GENERATION COMPLETE');
  console.log('========================================');
  console.log(`Packets created: ${metadata.totalPackets}`);
  console.log(`Total tossups: ${metadata.totalTossups}`);
  console.log(`Total bonuses: ${metadata.totalBonuses}`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log('========================================\n');
}

/**
 * Save raw data for debugging
 */
function saveRawData(
  tossups: TossupQuestion[],
  bonuses: BonusQuestion[],
  source: string
): void {
  const rawDir = path.resolve(__dirname, 'raw-data', source);
  fs.mkdirSync(rawDir, { recursive: true });

  fs.writeFileSync(
    path.join(rawDir, 'tossups.json'),
    JSON.stringify(tossups, null, 2)
  );

  fs.writeFileSync(
    path.join(rawDir, 'bonuses.json'),
    JSON.stringify(bonuses, null, 2)
  );

  console.log(`Raw data saved to ${rawDir}`);
}

// CLI setup
program
  .name('generate-questions')
  .description('Generate quiz questions from QB Reader and AI')
  .option('-s, --source <source>', 'Source: all, qbreader, or ai', 'all')
  .option('--skip-validation', 'Skip validation step')
  .action(async (options) => {
    try {
      await generate({
        source: options.source as 'all' | 'qbreader' | 'ai',
        skipValidation: options.skipValidation,
      });
    } catch (error) {
      console.error('Generation failed:', error);
      process.exit(1);
    }
  });

program.parse();
