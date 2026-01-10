/**
 * Answer Parser
 *
 * Parses QB Reader answer strings to extract primary answer and acceptable alternatives
 *
 * QB Reader answer format examples:
 * - "<b><u>Carbon</u></b> [accept <b>C</b>]"
 * - "<req>George</req> <b><u>Washington</u></b>"
 * - "<b><u>DNA</u></b> [or <b>deoxyribonucleic acid</b>; prompt on nucleic acid]"
 */

import * as cheerio from 'cheerio';
import { stripHtml, removePronunciationGuides } from './html-stripper.js';
import type { ParsedAnswer } from '../types.js';

/**
 * Parse answer HTML to extract primary answer and acceptable alternatives
 */
export function parseAnswer(answerHtml: string): ParsedAnswer {
  if (!answerHtml) {
    return { primaryAnswer: '', acceptableAnswers: [] };
  }

  const $ = cheerio.load(answerHtml);
  const acceptableAnswers: string[] = [];

  // 1. Extract primary answer (usually underlined or bold+underlined)
  let primaryAnswer = '';

  // Try underlined first (most common for primary answer)
  const underlinedText = $('u').first().text().trim();
  if (underlinedText) {
    primaryAnswer = underlinedText;
  }

  // If no underlined, try bold
  if (!primaryAnswer) {
    const boldText = $('b').first().text().trim();
    if (boldText) {
      primaryAnswer = boldText;
    }
  }

  // Fall back to text before brackets
  if (!primaryAnswer) {
    const textBeforeBracket = answerHtml.split('[')[0];
    primaryAnswer = stripHtml(textBeforeBracket);
  }

  // Clean up primary answer
  primaryAnswer = cleanAnswer(primaryAnswer);

  // Add primary answer to acceptable list
  if (primaryAnswer) {
    acceptableAnswers.push(primaryAnswer);
  }

  // 2. Extract alternatives from [accept ...] brackets
  const acceptMatches = answerHtml.matchAll(/\[(?:accept|or)\s+([^\]]+)\]/gi);
  for (const match of acceptMatches) {
    const alternatives = parseAlternatives(match[1]);
    acceptableAnswers.push(...alternatives);
  }

  // 3. Extract from [prompt on ...] - these are partial answers that should be accepted
  const promptMatches = answerHtml.matchAll(/\[prompt\s+(?:on\s+)?([^\]]+)\]/gi);
  for (const match of promptMatches) {
    const alternatives = parseAlternatives(match[1]);
    acceptableAnswers.push(...alternatives);
  }

  // 4. Look for <req> tags (required parts)
  $('req').each((_, el) => {
    const reqText = $(el).text().trim();
    if (reqText && !acceptableAnswers.includes(reqText)) {
      // Combine required part with primary answer
      const combined = `${reqText} ${primaryAnswer}`.trim();
      if (combined && !acceptableAnswers.includes(combined)) {
        acceptableAnswers.unshift(combined); // Add as first acceptable
      }
    }
  });

  // 5. Add common variations
  const variations = generateCommonVariations(primaryAnswer, acceptableAnswers);
  acceptableAnswers.push(...variations);

  // 6. Deduplicate and clean
  const uniqueAnswers = [...new Set(
    acceptableAnswers
      .map(cleanAnswer)
      .filter(a => a.length > 0)
  )];

  return {
    primaryAnswer: primaryAnswer || uniqueAnswers[0] || '',
    acceptableAnswers: uniqueAnswers,
  };
}

/**
 * Parse alternatives from a bracketed section
 * e.g., "C; or carbon-12" -> ["C", "carbon-12"]
 */
function parseAlternatives(text: string): string[] {
  const alternatives: string[] = [];

  // Split by semicolon, "or", or comma
  const parts = text.split(/[;,]|\bor\b/i);

  for (let part of parts) {
    // Strip HTML and clean
    part = stripHtml(part);
    part = cleanAnswer(part);

    if (part) {
      alternatives.push(part);
    }
  }

  return alternatives;
}

/**
 * Clean an answer string
 */
function cleanAnswer(answer: string): string {
  if (!answer) return '';

  return answer
    .replace(/<[^>]*>/g, '') // Remove any remaining HTML
    .replace(/\[.*?\]/g, '') // Remove bracketed content
    .replace(/\(.*?\)/g, '') // Remove parenthetical content (often pronunciation)
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/^[,;:\s]+/, '') // Remove leading punctuation
    .replace(/[,;:\s]+$/, '') // Remove trailing punctuation
    .trim();
}

/**
 * Generate common variations of an answer
 */
function generateCommonVariations(primary: string, existing: string[]): string[] {
  const variations: string[] = [];
  const lowerPrimary = primary.toLowerCase();

  // Don't generate variations for very short answers
  if (primary.length < 3) {
    return variations;
  }

  // If primary has "the" prefix, add version without
  if (lowerPrimary.startsWith('the ')) {
    const withoutThe = primary.substring(4);
    if (!existing.some(a => a.toLowerCase() === withoutThe.toLowerCase())) {
      variations.push(withoutThe);
    }
  }

  // If primary doesn't have "the", add version with
  if (!lowerPrimary.startsWith('the ') && !lowerPrimary.startsWith('a ')) {
    const withThe = `The ${primary}`;
    if (!existing.some(a => a.toLowerCase() === withThe.toLowerCase())) {
      variations.push(withThe);
    }
  }

  // Handle possessives
  if (primary.endsWith("'s")) {
    const withoutPossessive = primary.slice(0, -2);
    if (!existing.some(a => a.toLowerCase() === withoutPossessive.toLowerCase())) {
      variations.push(withoutPossessive);
    }
  }

  return variations;
}

/**
 * Parse a simpler answer format (for AI-generated questions)
 */
export function parseSimpleAnswer(answer: string): ParsedAnswer {
  const cleaned = cleanAnswer(answer);
  return {
    primaryAnswer: cleaned,
    acceptableAnswers: [cleaned],
  };
}

/**
 * Combine multiple answer sources into a single acceptableAnswers array
 */
export function combineAcceptableAnswers(
  primary: string,
  ...alternativeSources: string[][]
): string[] {
  const all = [primary, ...alternativeSources.flat()];

  return [...new Set(
    all
      .map(cleanAnswer)
      .filter(a => a.length > 0)
  )];
}
