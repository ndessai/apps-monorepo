/**
 * TTS Wrapper Service
 *
 * Controls text-to-speech at the clause/phrase level, providing:
 * - Clause-by-clause text progression based on WPM
 * - Character index tracking for text highlighting
 * - Clean stop behavior (just stops queuing chunks, no native stop() needed)
 *
 * This wrapper solves the iOS TTS stop() reliability issues by
 * sending one clause at a time to the TTS engine. When stopped,
 * only the current clause (if any) finishes - no continuation.
 */

import * as ttsService from './ttsService';

// ============ Types ============

export type ProgressCallback = (charIndex: number) => void;
export type FinishCallback = () => void;

interface ChunkInfo {
  text: string;
  startIndex: number; // char position in original text
  endIndex: number;
  wordCount: number;
}

// ============ State ============

let chunks: ChunkInfo[] = [];
let currentChunkIndex = 0;
let isActive = false;
let chunkTimer: ReturnType<typeof setTimeout> | null = null;

let progressCallback: ProgressCallback | null = null;
let finishCallback: FinishCallback | null = null;

// ============ Chunk Parsing ============

/**
 * Parse text into chunks split on major punctuation (commas, semicolons, colons, periods)
 */
function parseChunks(text: string): ChunkInfo[] {
  const result: ChunkInfo[] = [];

  // Split on major punctuation, keeping the punctuation with the preceding text
  const parts = text.split(/(?<=[,;:.])\s+/);

  let currentIndex = 0;

  for (const part of parts) {
    const trimmedPart = part.trim();
    if (!trimmedPart) continue;

    // Find the actual position in the original text
    const startIndex = text.indexOf(trimmedPart, currentIndex);
    const endIndex = startIndex + trimmedPart.length;
    const wordCount = trimmedPart.split(/\s+/).filter((w) => w).length;

    result.push({
      text: trimmedPart,
      startIndex,
      endIndex,
      wordCount,
    });

    currentIndex = endIndex;
  }

  return result;
}

// ============ Core Logic ============

/**
 * Speak the next chunk and schedule the following one
 */
function speakNextChunk(msPerWord: number): void {
  // Check if we should stop
  if (!isActive) {
    console.log(`Wrapper: Stopped, not speaking more chunks`);
    return;
  }

  // Check if we're done
  if (currentChunkIndex >= chunks.length) {
    console.log(`Wrapper: Finished all ${chunks.length} chunks`);
    isActive = false;

    // Call finish callback
    const cb = finishCallback;
    finishCallback = null;
    progressCallback = null;

    if (cb) {
      cb();
    }
    return;
  }

  const chunkInfo = chunks[currentChunkIndex];

  console.log(
    `Wrapper: Speaking chunk ${currentChunkIndex + 1}/${chunks.length}: "${chunkInfo.text.substring(0, 40)}..." (${chunkInfo.wordCount} words)`
  );

  // Report progress (end of current chunk for highlighting)
  if (progressCallback) {
    progressCallback(chunkInfo.endIndex);
  }

  // Speak the chunk (fire and forget)
  ttsService.speakWord(chunkInfo.text);

  // Move to next chunk
  currentChunkIndex++;

  // Schedule next chunk based on word count and WPM timing
  const chunkDuration = chunkInfo.wordCount * msPerWord;
  chunkTimer = setTimeout(() => speakNextChunk(msPerWord), chunkDuration);
}

// ============ Public API ============

/**
 * Initialize the wrapper service
 * Delegates to underlying ttsService
 */
export async function initialize(): Promise<void> {
  await ttsService.initializeTTS();
}

/**
 * Start reading text chunk-by-chunk (clauses/phrases)
 *
 * @param text - Full text to read
 * @param wpm - Words per minute (e.g., 150 for NAQT standard)
 * @param onProgress - Called with char index as each chunk is spoken
 * @param onFinish - Called when all chunks have been spoken
 */
export function startReading(
  text: string,
  wpm: number,
  onProgress: ProgressCallback,
  onFinish: FinishCallback
): void {
  // Stop any existing reading
  stopReading();

  // Parse text into chunks
  chunks = parseChunks(text);

  // Handle empty text
  if (chunks.length === 0) {
    console.log('Wrapper: Empty text, calling finish immediately');
    onFinish();
    return;
  }

  // Calculate timing
  const msPerWord = Math.round(60000 / wpm);

  console.log(
    `Wrapper: Starting "${text.substring(0, 30)}...", ${chunks.length} chunks at ${wpm} WPM (${msPerWord}ms/word)`
  );
  chunks.forEach((c, i) =>
    console.log(`  Chunk ${i + 1}: "${c.text.substring(0, 50)}..." (${c.wordCount} words)`)
  );

  // Set up state
  currentChunkIndex = 0;
  isActive = true;
  progressCallback = onProgress;
  finishCallback = onFinish;

  // Report initial progress (start of first chunk)
  if (progressCallback && chunks.length > 0) {
    progressCallback(chunks[0].startIndex);
  }

  // Start speaking
  speakNextChunk(msPerWord);
}

/**
 * Stop reading
 * Current chunk (if any) finishes naturally - no TTS stop() call needed
 */
export function stopReading(): void {
  if (!isActive && chunkTimer === null) {
    return;
  }

  console.log(`Wrapper: Stopped at chunk ${currentChunkIndex}/${chunks.length}`);

  isActive = false;

  // Clear the timer - no more chunks will be queued
  if (chunkTimer) {
    clearTimeout(chunkTimer);
    chunkTimer = null;
  }

  // Clear callbacks to prevent any late events
  progressCallback = null;
  finishCallback = null;

  // Reset state
  chunks = [];
  currentChunkIndex = 0;
}

/**
 * Check if currently reading
 */
export function isReading(): boolean {
  return isActive;
}

/**
 * Cleanup on unmount
 */
export function cleanup(): void {
  stopReading();
}
