/**
 * Packet Generation Script
 * Generates vocabulary quiz packets and outputs them to the packets directory
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  generateVocabularyQuizPacket,
  generateBalancedQuizPacket,
  generateCategoryQuizPacket,
  insertPowerMark,
  type VocabularyQuizData,
  type VocabularyTossupQuestion,
  type VocabularyBonusQuestion,
  type VocabularyCategory,
} from '../src';

// Output directory
const OUTPUT_DIR = path.join(__dirname, '..', 'packets');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Format a tossup question for display
 */
function formatTossup(tossup: VocabularyTossupQuestion, index: number): string {
  const lines: string[] = [];

  lines.push(`## Tossup ${index + 1}`);
  lines.push(`**Category:** ${tossup.subcategory} / ${tossup.detailedCategory}`);
  lines.push(`**Difficulty:** ${tossup.difficulty}`);
  lines.push('');

  // Question with power mark
  const textWithPowerMark = insertPowerMark(tossup, '(★)');
  lines.push(textWithPowerMark);
  lines.push('');

  lines.push(`**ANSWER: ${tossup.answer}**`);
  if (tossup.acceptableAnswers.length > 1) {
    lines.push(`*(Accept: ${tossup.acceptableAnswers.join(', ')})*`);
  }
  lines.push('');

  // Explanation
  lines.push('<details>');
  lines.push('<summary>Explanation</summary>');
  lines.push('');
  lines.push(tossup.explanation);
  lines.push('</details>');
  lines.push('');

  return lines.join('\n');
}

/**
 * Format a bonus question for display
 */
function formatBonus(bonus: VocabularyBonusQuestion, index: number): string {
  const lines: string[] = [];

  lines.push(`## Bonus ${index + 1}`);
  lines.push(`**Category:** ${bonus.subcategory} / ${bonus.detailedCategory}`);
  lines.push(`**Pattern:** ${bonus.pattern}`);
  lines.push('');

  // Lead-in
  lines.push(bonus.leadin);
  lines.push('');

  // Parts
  for (let i = 0; i < 3; i++) {
    const part = bonus.parts[i];
    lines.push(`**[${part.pointValue}]** ${part.text}`);
    lines.push(`**ANSWER: ${part.answer}**`);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Format a complete packet for display
 */
function formatPacket(packet: VocabularyQuizData, title: string): string {
  const lines: string[] = [];

  lines.push(`# ${title}`);
  lines.push('');
  lines.push(`Generated: ${packet.metadata.generatedAt}`);
  lines.push(`Total Questions: ${packet.metadata.wordCount} tossups, ${packet.bonuses.length} bonuses`);
  lines.push('');

  // Category breakdown
  lines.push('### Category Distribution');
  for (const [category, count] of Object.entries(packet.metadata.categoryBreakdown)) {
    if (count > 0) {
      lines.push(`- ${category}: ${count}`);
    }
  }
  lines.push('');

  // Difficulty breakdown
  lines.push('### Difficulty Distribution');
  for (const [difficulty, count] of Object.entries(packet.metadata.difficultyBreakdown)) {
    if (count > 0) {
      lines.push(`- ${difficulty}: ${count}`);
    }
  }
  lines.push('');

  lines.push('---');
  lines.push('');

  // Tossups
  lines.push('# TOSSUPS');
  lines.push('');
  for (let i = 0; i < packet.tossups.length; i++) {
    lines.push(formatTossup(packet.tossups[i], i));
    lines.push('---');
    lines.push('');
  }

  // Bonuses
  if (packet.bonuses.length > 0) {
    lines.push('# BONUSES');
    lines.push('');
    for (let i = 0; i < packet.bonuses.length; i++) {
      lines.push(formatBonus(packet.bonuses[i], i));
      lines.push('---');
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Generate and save a packet
 */
function generateAndSavePacket(
  packet: VocabularyQuizData,
  filename: string,
  title: string
): void {
  // Save as markdown
  const markdown = formatPacket(packet, title);
  fs.writeFileSync(path.join(OUTPUT_DIR, `${filename}.md`), markdown);

  // Save as JSON
  fs.writeFileSync(
    path.join(OUTPUT_DIR, `${filename}.json`),
    JSON.stringify(packet, null, 2)
  );

  console.log(`✓ Generated ${filename} (${packet.tossups.length} tossups, ${packet.bonuses.length} bonuses)`);
}

// ============================================
// GENERATE PACKETS
// ============================================

console.log('Generating Vocabulary Quiz Packets...\n');

// 1. Standard mixed packet (10 questions)
const standardPacket = generateVocabularyQuizPacket({
  tossupCount: 10,
  includeBonuses: true,
  difficulty: 'high_school',
});
generateAndSavePacket(standardPacket, 'standard-packet', 'Standard Vocabulary Packet');

// 2. Balanced packet (equal from each category)
const balancedPacket = generateBalancedQuizPacket({
  tossupCount: 12,
  includeBonuses: true,
  difficulty: 'high_school',
});
generateAndSavePacket(balancedPacket, 'balanced-packet', 'Balanced Category Packet');

// 3. College difficulty packet
const collegePacket = generateVocabularyQuizPacket({
  tossupCount: 10,
  includeBonuses: true,
  difficulty: 'college',
});
generateAndSavePacket(collegePacket, 'college-packet', 'College Difficulty Packet');

// 4. Middle school packet
const middleSchoolPacket = generateVocabularyQuizPacket({
  tossupCount: 10,
  includeBonuses: true,
  difficulty: 'middle_school',
});
generateAndSavePacket(middleSchoolPacket, 'middle-school-packet', 'Middle School Packet');

// 5. Category-specific packets
const categories: VocabularyCategory[] = [
  'HumanBehavior',
  'EmotionsFeelings',
  'MedicalScientific',
  'LiteraryArtistic',
  'AbstractConcepts',
  'ActionsVerbs',
];

for (const category of categories) {
  const categoryPacket = generateCategoryQuizPacket(category, {
    tossupCount: 5,
    includeBonuses: true,
    difficulty: 'high_school',
  });

  const filename = `category-${category.toLowerCase().replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`;
  generateAndSavePacket(categoryPacket, filename, `${category} Category Packet`);
}

console.log('\n✅ All packets generated successfully!');
console.log(`📁 Output directory: ${OUTPUT_DIR}`);
