/**
 * Power Mark Position Calculator
 *
 * Calculates the position in a question where the "power" portion ends.
 * Buzzing before the power mark earns 15 points (vs 10 for after).
 */

/**
 * Calculate power mark position from question text
 *
 * Strategy:
 * 1. Look for explicit (*) power marker
 * 2. Look for first sentence break after 20% of the question
 * 3. Default to ~30% of question length before "For ten points"
 */
export function calculatePowerMarkPosition(
  cleanText: string,
  originalHtml?: string
): number {
  const textLength = cleanText.length;

  if (textLength === 0) return 0;

  // 1. Check for explicit power marker (*) in original HTML
  if (originalHtml) {
    const powerMarkerMatch = originalHtml.match(/\(\*\)/);
    if (powerMarkerMatch) {
      // Find approximate position after stripping HTML
      // This is a heuristic - find text before (*) and measure its length
      const beforeMarker = originalHtml.substring(0, powerMarkerMatch.index);
      const strippedBefore = beforeMarker.replace(/<[^>]*>/g, '').trim();
      const position = strippedBefore.length;

      // Ensure it's within bounds and reasonable (10-80% of question)
      if (position > textLength * 0.1 && position < textLength * 0.8) {
        return Math.min(position, textLength - 1);
      }
    }
  }

  // 2. Find "For ten points" position
  const ftpPatterns = [
    /for\s+(?:ten|10)\s+points?/i,
    /ftp/i,
    /f\.?t\.?p\.?/i,
  ];

  let ftpPosition = -1;
  for (const pattern of ftpPatterns) {
    const match = cleanText.match(pattern);
    if (match && match.index !== undefined) {
      ftpPosition = match.index;
      break;
    }
  }

  // 3. Calculate power position
  if (ftpPosition > 0) {
    // Power mark should be roughly 30-40% into the question, before FTP
    // This gives players enough time to buzz early for power
    const targetPowerEnd = Math.floor(ftpPosition * 0.4);

    // Find the nearest sentence end after the target position
    const sentenceBreaks = findSentenceBreaks(cleanText);
    for (const breakPos of sentenceBreaks) {
      if (breakPos >= targetPowerEnd && breakPos < ftpPosition) {
        return breakPos;
      }
    }

    // If no good sentence break, use the target position
    return Math.max(targetPowerEnd, Math.floor(textLength * 0.2));
  }

  // 4. Default: Use first third of the question
  // Find a sentence break near 33% mark
  const targetPosition = Math.floor(textLength * 0.33);
  const sentenceBreaks = findSentenceBreaks(cleanText);

  for (const breakPos of sentenceBreaks) {
    if (breakPos >= textLength * 0.2 && breakPos <= textLength * 0.5) {
      return breakPos;
    }
  }

  // Fallback to 30% of text length
  return Math.floor(textLength * 0.3);
}

/**
 * Find positions of sentence breaks in text
 */
function findSentenceBreaks(text: string): number[] {
  const breaks: number[] = [];
  const sentenceEndPattern = /[.!?]\s+(?=[A-Z])/g;

  let match;
  while ((match = sentenceEndPattern.exec(text)) !== null) {
    breaks.push(match.index + 1); // Position after the punctuation
  }

  return breaks;
}

/**
 * Validate that a power mark position is reasonable
 */
export function validatePowerMarkPosition(
  position: number,
  textLength: number
): boolean {
  // Power mark should be between 10% and 80% of question length
  const minPosition = Math.floor(textLength * 0.1);
  const maxPosition = Math.floor(textLength * 0.8);

  return position >= minPosition && position <= maxPosition;
}

/**
 * Adjust power mark position if it's in the middle of a word
 */
export function adjustToWordBoundary(text: string, position: number): number {
  if (position <= 0 || position >= text.length) {
    return position;
  }

  // If we're already at a space, return as-is
  if (text[position] === ' ') {
    return position;
  }

  // Look backwards for the nearest space
  let backwardPos = position;
  while (backwardPos > 0 && text[backwardPos] !== ' ') {
    backwardPos--;
  }

  // Look forwards for the nearest space
  let forwardPos = position;
  while (forwardPos < text.length && text[forwardPos] !== ' ') {
    forwardPos++;
  }

  // Return the closer word boundary
  const backwardDist = position - backwardPos;
  const forwardDist = forwardPos - position;

  return backwardDist <= forwardDist ? backwardPos : forwardPos;
}
