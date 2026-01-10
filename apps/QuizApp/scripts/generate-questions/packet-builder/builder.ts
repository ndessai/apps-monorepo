/**
 * Packet Builder
 *
 * Organizes questions into NAQT-format packets (20 tossups + 20 bonuses)
 */

import * as fs from 'fs';
import * as path from 'path';
import { linkQuestionsFlexible } from './linker.js';
import { PACKET_CONFIG, OUTPUT_PATHS } from '../config.js';
import type {
  TossupQuestion,
  BonusQuestion,
  QuestionCategory,
  QuestionDifficulty,
  Packet,
  PacketMetadata,
  QuestionsMetadata,
  CategoryStats,
} from '../types.js';

interface BuilderInput {
  tossups: TossupQuestion[];
  bonuses: BonusQuestion[];
}

/**
 * Shuffle array (Fisher-Yates)
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Determine the overall difficulty of a packet
 */
function determinePacketDifficulty(
  tossups: TossupQuestion[]
): QuestionDifficulty | 'mixed' {
  const difficulties = new Set(tossups.map(t => t.difficulty));

  if (difficulties.size === 1) {
    return tossups[0].difficulty;
  }

  return 'mixed';
}

/**
 * Get unique categories from questions
 */
function getPacketCategories(tossups: TossupQuestion[]): QuestionCategory[] {
  const categories = new Set(tossups.map(t => t.category));
  return Array.from(categories);
}

/**
 * Build packets from linked question pairs
 */
export function buildPackets(
  input: BuilderInput,
  packetSize: number = PACKET_CONFIG.tossupCount
): Packet[] {
  console.log('\n=== Building Packets ===');
  console.log(`Input: ${input.tossups.length} tossups, ${input.bonuses.length} bonuses`);
  console.log(`Packet size: ${packetSize} tossups + ${packetSize} bonuses`);

  // Link tossups and bonuses
  const pairs = linkQuestionsFlexible(input.tossups, input.bonuses);
  console.log(`Created ${pairs.length} linked pairs`);

  // Shuffle pairs for variety
  const shuffledPairs = shuffle(pairs);

  // Build packets
  const packets: Packet[] = [];
  let packetNumber = 1;

  for (let i = 0; i < shuffledPairs.length; i += packetSize) {
    const packetPairs = shuffledPairs.slice(i, i + packetSize);

    // Skip incomplete packets
    if (packetPairs.length < packetSize) {
      console.log(`Skipping incomplete packet with ${packetPairs.length} pairs`);
      continue;
    }

    const tossups = packetPairs.map(p => p.tossup);
    const bonuses = packetPairs.map(p => p.bonus);

    const packet: Packet = {
      packetId: `packet-${String(packetNumber).padStart(3, '0')}`,
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      difficulty: determinePacketDifficulty(tossups),
      categories: getPacketCategories(tossups),
      tossups,
      bonuses,
    };

    packets.push(packet);
    packetNumber++;
  }

  console.log(`Built ${packets.length} complete packets`);

  return packets;
}

/**
 * Build packets organized by category (for practice mode)
 */
export function buildCategoryPackets(
  input: BuilderInput
): Map<QuestionCategory, { tossups: TossupQuestion[]; bonuses: BonusQuestion[] }> {
  const byCategory = new Map<QuestionCategory, { tossups: TossupQuestion[]; bonuses: BonusQuestion[] }>();

  // Group tossups by category
  for (const tossup of input.tossups) {
    const existing = byCategory.get(tossup.category) || { tossups: [], bonuses: [] };
    existing.tossups.push(tossup);
    byCategory.set(tossup.category, existing);
  }

  // Group bonuses by category
  for (const bonus of input.bonuses) {
    const existing = byCategory.get(bonus.category) || { tossups: [], bonuses: [] };
    existing.bonuses.push(bonus);
    byCategory.set(bonus.category, existing);
  }

  return byCategory;
}

/**
 * Generate metadata for all packets
 */
export function generateMetadata(packets: Packet[]): QuestionsMetadata {
  const packetMetadata: PacketMetadata[] = packets.map(p => ({
    id: p.packetId,
    file: `packets/${p.packetId}.json`,
    difficulty: p.difficulty,
    categories: p.categories,
    tossupCount: p.tossups.length,
    bonusCount: p.bonuses.length,
  }));

  // Calculate category stats
  const categoryStats: Record<QuestionCategory, CategoryStats> = {} as any;
  const allCategories: QuestionCategory[] = [
    'Science', 'Literature', 'History', 'Fine Arts', 'Geography',
    'Social Science', 'Current Events', 'Mathematics', 'Mythology',
    'Philosophy', 'Human Body',
  ];

  for (const category of allCategories) {
    categoryStats[category] = { tossups: 0, bonuses: 0 };
  }

  for (const packet of packets) {
    for (const tossup of packet.tossups) {
      categoryStats[tossup.category].tossups++;
    }
    for (const bonus of packet.bonuses) {
      categoryStats[bonus.category].bonuses++;
    }
  }

  return {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    totalPackets: packets.length,
    totalTossups: packets.reduce((sum, p) => sum + p.tossups.length, 0),
    totalBonuses: packets.reduce((sum, p) => sum + p.bonuses.length, 0),
    packets: packetMetadata,
    categoryStats,
  };
}

/**
 * Save packets to disk
 */
export function savePackets(
  packets: Packet[],
  outputDir: string
): void {
  // Ensure output directory exists
  const packetsDir = path.join(outputDir, 'packets');
  fs.mkdirSync(packetsDir, { recursive: true });

  console.log(`\nSaving ${packets.length} packets to ${packetsDir}`);

  for (const packet of packets) {
    const filePath = path.join(packetsDir, `${packet.packetId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(packet, null, 2));
  }

  // Generate and save metadata
  const metadata = generateMetadata(packets);
  const metadataPath = path.join(outputDir, 'metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  console.log(`Saved metadata to ${metadataPath}`);
}

/**
 * Save category-organized questions (for practice mode)
 */
export function saveCategoryQuestions(
  input: BuilderInput,
  outputDir: string
): void {
  const byCategoryDir = path.join(outputDir, 'by-category');
  fs.mkdirSync(byCategoryDir, { recursive: true });

  const byCategory = buildCategoryPackets(input);

  console.log(`\nSaving category files to ${byCategoryDir}`);

  for (const [category, questions] of byCategory) {
    // Link questions within category
    const pairs = linkQuestionsFlexible(questions.tossups, questions.bonuses);

    const tossups = pairs.map(p => p.tossup);
    const bonuses = pairs.map(p => p.bonus);

    const categoryData = {
      category,
      tossupCount: tossups.length,
      bonusCount: bonuses.length,
      tossups,
      bonuses,
    };

    const fileName = category.toLowerCase().replace(/\s+/g, '-') + '.json';
    const filePath = path.join(byCategoryDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(categoryData, null, 2));

    console.log(`  ${category}: ${tossups.length} tossups, ${bonuses.length} bonuses`);
  }
}

/**
 * Full build process: create packets and category files
 */
export function buildAll(
  input: BuilderInput,
  outputDir: string
): { packets: Packet[]; metadata: QuestionsMetadata } {
  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  // Build and save packets
  const packets = buildPackets(input);
  savePackets(packets, outputDir);

  // Save category-organized files
  saveCategoryQuestions(input, outputDir);

  // Return results
  const metadata = generateMetadata(packets);

  return { packets, metadata };
}

export default {
  buildPackets,
  buildCategoryPackets,
  generateMetadata,
  savePackets,
  saveCategoryQuestions,
  buildAll,
};
