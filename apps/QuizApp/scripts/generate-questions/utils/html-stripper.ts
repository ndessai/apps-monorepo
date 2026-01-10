/**
 * HTML Stripping Utilities
 *
 * Strips HTML tags from QB Reader questions while preserving text content
 */

import * as cheerio from 'cheerio';

/**
 * Strip HTML tags from text while preserving content
 */
export function stripHtml(html: string): string {
  if (!html) return '';

  // Load HTML into cheerio
  const $ = cheerio.load(html);

  // Get text content
  let text = $.root().text();

  // Clean up whitespace
  text = text
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .replace(/\n+/g, ' ') // Remove newlines
    .trim();

  return text;
}

/**
 * Strip HTML but preserve power mark indicators
 * QB Reader uses (*) to mark power position
 */
export function stripHtmlPreservePowerMark(html: string): { text: string; powerMarkIndex: number } {
  if (!html) return { text: '', powerMarkIndex: -1 };

  // Check for power mark before stripping
  const powerMarkMatch = html.match(/\(\*\)/);
  const hasPowerMark = !!powerMarkMatch;

  // Strip HTML
  let text = stripHtml(html);

  // Find power mark position in cleaned text
  let powerMarkIndex = -1;
  if (hasPowerMark) {
    powerMarkIndex = text.indexOf('(*)');
    // Remove the power mark from the text
    if (powerMarkIndex !== -1) {
      text = text.replace('(*)', '').replace(/\s+/g, ' ').trim();
    }
  }

  return { text, powerMarkIndex };
}

/**
 * Clean answer text - remove formatting hints but keep core answer
 */
export function cleanAnswerText(answerHtml: string): string {
  if (!answerHtml) return '';

  const $ = cheerio.load(answerHtml);

  // Get the primary answer (usually underlined or bold+underlined)
  const underlined = $('u').first().text();
  const bolded = $('b').first().text();

  // Prefer underlined text as the main answer
  if (underlined) {
    return underlined.trim();
  }

  if (bolded) {
    return bolded.trim();
  }

  // Fall back to stripping all HTML
  return stripHtml(answerHtml);
}

/**
 * Remove pronunciation guides like [PRON] or (PRON)
 */
export function removePronunciationGuides(text: string): string {
  return text
    .replace(/\[(?:pronounced?|PRON)[^\]]*\]/gi, '')
    .replace(/\((?:pronounced?|PRON)[^)]*\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Clean text for display - normalize quotes, dashes, etc.
 */
export function normalizeText(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'") // Smart single quotes to straight
    .replace(/[\u201C\u201D]/g, '"') // Smart double quotes to straight
    .replace(/[\u2013\u2014]/g, '-') // En/em dashes to hyphen
    .replace(/\u2026/g, '...') // Ellipsis
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}
