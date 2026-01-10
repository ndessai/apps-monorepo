/**
 * AI Question Generator
 *
 * Generates Human Body questions using AI (Claude or local generation)
 * Note: This implementation uses template-based generation for reliability
 * For production, integrate with Claude API or OpenAI API
 */

import { v4 as uuidv4 } from 'uuid';
import {
  SYSTEM_PROMPT,
  getTossupPrompt,
  getBonusPrompt,
  DIFFICULTY_DESCRIPTIONS,
} from './prompts.js';
import {
  HUMAN_BODY_TOPICS,
  getAllTopicsFlat,
  getAllSubcategories,
} from './human-body-topics.js';
import type {
  TossupQuestion,
  BonusQuestion,
  BonusPart,
  QuestionDifficulty,
} from '../types.js';

// Generation statistics
interface GenerationStats {
  tossups: number;
  bonuses: number;
  bySubcategory: Record<string, { tossups: number; bonuses: number }>;
  byDifficulty: Record<QuestionDifficulty, { tossups: number; bonuses: number }>;
}

/**
 * Initialize generation stats
 */
function createStats(): GenerationStats {
  const stats: GenerationStats = {
    tossups: 0,
    bonuses: 0,
    bySubcategory: {},
    byDifficulty: {
      middle_school: { tossups: 0, bonuses: 0 },
      high_school: { tossups: 0, bonuses: 0 },
      college: { tossups: 0, bonuses: 0 },
      open: { tossups: 0, bonuses: 0 },
    },
  };

  for (const subcategory of getAllSubcategories()) {
    stats.bySubcategory[subcategory] = { tossups: 0, bonuses: 0 };
  }

  return stats;
}

/**
 * Generate a tossup question for a topic
 * This is a template-based generator - replace with AI API call for production
 */
export function generateTossup(
  topic: string,
  subcategory: string,
  difficulty: QuestionDifficulty
): TossupQuestion {
  // For now, use the prompt template as guidance
  // In production, send to Claude API
  const prompt = getTossupPrompt(topic, subcategory, difficulty);

  // Template-based generation (replace with AI call)
  const question = createTemplateQuestion(topic, subcategory, difficulty);

  return {
    id: uuidv4(),
    category: 'Human Body',
    subcategory,
    difficulty,
    text: question.text,
    powerMarkPosition: question.powerMarkPosition,
    answer: question.answer,
    acceptableAnswers: question.acceptableAnswers,
    explanation: question.explanation,
    source: 'ai-generated',
  };
}

/**
 * Generate a bonus question for a topic
 */
export function generateBonus(
  topic: string,
  subcategory: string,
  difficulty: QuestionDifficulty
): BonusQuestion {
  const prompt = getBonusPrompt(topic, subcategory, difficulty);

  // Template-based generation (replace with AI call)
  const bonus = createTemplateBonus(topic, subcategory, difficulty);

  return {
    id: uuidv4(),
    linkedTossupId: '', // Set during packet building
    category: 'Human Body',
    subcategory,
    difficulty,
    parts: bonus.parts,
    leadin: bonus.leadin,
    source: 'ai-generated',
  };
}

/**
 * Generate questions for all Human Body topics
 */
export async function generateAllHumanBodyQuestions(
  targetPerDifficulty: number = 125 // ~500 total per question type
): Promise<{ tossups: TossupQuestion[]; bonuses: BonusQuestion[]; stats: GenerationStats }> {
  const tossups: TossupQuestion[] = [];
  const bonuses: BonusQuestion[] = [];
  const stats = createStats();

  const difficulties: QuestionDifficulty[] = ['middle_school', 'high_school', 'college', 'open'];
  const allTopics = getAllTopicsFlat();

  console.log(`\n=== Generating Human Body Questions ===`);
  console.log(`Total topics: ${allTopics.length}`);
  console.log(`Target per difficulty: ${targetPerDifficulty}`);

  for (const difficulty of difficulties) {
    console.log(`\nGenerating ${difficulty} questions...`);

    // Distribute questions across topics
    const questionsPerTopic = Math.ceil(targetPerDifficulty / allTopics.length);
    let generated = 0;

    for (const { subcategory, topic } of allTopics) {
      if (generated >= targetPerDifficulty) break;

      // Generate tossup
      try {
        const tossup = generateTossup(topic, subcategory, difficulty);
        tossups.push(tossup);
        stats.tossups++;
        stats.bySubcategory[subcategory].tossups++;
        stats.byDifficulty[difficulty].tossups++;
      } catch (error) {
        console.error(`Failed to generate tossup for ${topic}:`, error);
      }

      // Generate bonus
      try {
        const bonus = generateBonus(topic, subcategory, difficulty);
        bonuses.push(bonus);
        stats.bonuses++;
        stats.bySubcategory[subcategory].bonuses++;
        stats.byDifficulty[difficulty].bonuses++;
      } catch (error) {
        console.error(`Failed to generate bonus for ${topic}:`, error);
      }

      generated++;

      // Log progress every 20 questions
      if (generated % 20 === 0) {
        console.log(`  Generated ${generated}/${targetPerDifficulty}`);
      }
    }

    console.log(`  Completed ${difficulty}: ${stats.byDifficulty[difficulty].tossups} tossups, ${stats.byDifficulty[difficulty].bonuses} bonuses`);
  }

  console.log(`\nTotal generated: ${stats.tossups} tossups, ${stats.bonuses} bonuses`);

  return { tossups, bonuses, stats };
}

// ============================================================================
// Template-based question generation (placeholder for AI API)
// These create reasonable questions but should be replaced with AI for variety
// ============================================================================

interface TemplateQuestion {
  text: string;
  powerMarkPosition: number;
  answer: string;
  acceptableAnswers: string[];
  explanation: string;
}

interface TemplateBonus {
  leadin: string;
  parts: [BonusPart, BonusPart, BonusPart];
}

/**
 * Get key term for a topic from the topic definitions
 */
function getKeyTermForTopic(subcategory: string, topic: string): string {
  const topics = HUMAN_BODY_TOPICS[subcategory];
  if (!topics) return topic;

  for (const topicDef of topics) {
    if (topicDef.subtopics.includes(topic)) {
      return topicDef.keyTerms[0] || topic;
    }
  }
  return topic;
}

/**
 * Create a template-based tossup question
 */
function createTemplateQuestion(
  topic: string,
  subcategory: string,
  difficulty: QuestionDifficulty
): TemplateQuestion {
  const keyTerm = getKeyTermForTopic(subcategory, topic);

  // Question templates based on subcategory
  const templates = getQuestionTemplates(subcategory, topic, keyTerm, difficulty);
  const template = templates[Math.floor(Math.random() * templates.length)];

  return {
    text: template.text,
    powerMarkPosition: Math.floor(template.text.length * 0.35),
    answer: template.answer,
    acceptableAnswers: template.acceptableAnswers,
    explanation: template.explanation,
  };
}

/**
 * Create a template-based bonus question
 */
function createTemplateBonus(
  topic: string,
  subcategory: string,
  difficulty: QuestionDifficulty
): TemplateBonus {
  const templates = getBonusTemplates(subcategory, topic, difficulty);
  const template = templates[Math.floor(Math.random() * templates.length)];

  return {
    leadin: template.leadin,
    parts: template.parts,
  };
}

/**
 * Get question templates for a subcategory
 */
function getQuestionTemplates(
  subcategory: string,
  topic: string,
  keyTerm: string,
  difficulty: QuestionDifficulty
): TemplateQuestion[] {
  // Common templates that work across topics
  const complexityModifier = difficulty === 'middle_school' ? '' :
    difficulty === 'high_school' ? 'In human anatomy, ' :
    difficulty === 'college' ? 'In human physiology, ' :
    'This anatomical structure, studied extensively in clinical medicine, ';

  const questionText = `${complexityModifier}this structure is essential for ${topic.toLowerCase()}. It plays a key role in the ${subcategory.toLowerCase()} system and is one of the most studied parts of human anatomy. For ten points, name this ${keyTerm}-related structure.`;

  return [
    {
      text: questionText,
      powerMarkPosition: Math.floor(questionText.length * 0.35),
      answer: keyTerm.charAt(0).toUpperCase() + keyTerm.slice(1),
      acceptableAnswers: [keyTerm, keyTerm.charAt(0).toUpperCase() + keyTerm.slice(1)],
      explanation: `The ${keyTerm} is a key component of the ${subcategory} system, involved in ${topic.toLowerCase()}.`,
    },
  ];
}

/**
 * Get bonus templates for a subcategory
 */
function getBonusTemplates(
  subcategory: string,
  topic: string,
  difficulty: QuestionDifficulty
): TemplateBonus[] {
  const topics = HUMAN_BODY_TOPICS[subcategory] || [];
  const topicDef = topics.find(t => t.subtopics.includes(topic)) || topics[0];
  const keyTerms = topicDef?.keyTerms || ['structure', 'organ', 'process'];

  return [
    {
      leadin: `For 10 points each, answer these questions about the human ${subcategory.toLowerCase()} system.`,
      parts: [
        {
          text: `Name the primary structure associated with ${topic.toLowerCase()}.`,
          answer: keyTerms[0] || subcategory,
          acceptableAnswers: [keyTerms[0] || subcategory],
          pointValue: 10,
        },
        {
          text: `What is the main function of the ${keyTerms[0] || 'structure'} in the ${subcategory.toLowerCase()} system?`,
          answer: topic,
          acceptableAnswers: [topic],
          pointValue: 10,
        },
        {
          text: `Name another component of the ${subcategory.toLowerCase()} system related to ${topic.toLowerCase()}.`,
          answer: keyTerms[1] || keyTerms[0] || subcategory,
          acceptableAnswers: [keyTerms[1] || keyTerms[0] || subcategory],
          pointValue: 10,
        },
      ] as [BonusPart, BonusPart, BonusPart],
    },
  ];
}

export default {
  generateTossup,
  generateBonus,
  generateAllHumanBodyQuestions,
};
