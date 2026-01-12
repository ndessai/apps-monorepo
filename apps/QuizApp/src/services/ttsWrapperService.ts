/**
 * TTS Wrapper Service
 *
 * Controls text-to-speech at the clause/phrase level, providing:
 * - Clause-by-clause text progression
 * - Character index tracking for text highlighting (translates chunk progress to full text)
 * - Clean stop behavior
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
 * Speak the next chunk with progress tracking
 */
async function speakNextChunk(): Promise<void> {
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
  const chunkIdx = currentChunkIndex; // Capture for closure

  console.log(
    `Wrapper: Speaking chunk ${currentChunkIndex + 1}/${chunks.length}: "${chunkInfo.text.substring(0, 40)}..." (${chunkInfo.wordCount} words)`
  );

  // Create progress handler that translates chunk position to full text position
  const handleChunkProgress = (chunkCharIndex: number) => {
    if (!isActive || currentChunkIndex !== chunkIdx) {
      return; // Ignore if stopped or moved to different chunk
    }

    // Translate chunk character index to full text character index
    const fullTextCharIndex = chunkInfo.startIndex + chunkCharIndex;

    if (progressCallback) {
      progressCallback(fullTextCharIndex);
    }
  };

  // Create finish handler that moves to next chunk
  const handleChunkFinish = () => {
    if (!isActive) {
      return; // Stopped, don't continue
    }

    // Report end of chunk progress
    if (progressCallback) {
      progressCallback(chunkInfo.endIndex);
    }

    // Move to next chunk
    currentChunkIndex++;

    // Speak next chunk
    speakNextChunk();
  };

  // Speak the chunk with progress tracking
  try {
    await ttsService.speakChunk(chunkInfo.text, handleChunkProgress, handleChunkFinish);
  } catch (error) {
    console.error('Wrapper: Error speaking chunk:', error);
    // Try to continue with next chunk
    if (isActive) {
      currentChunkIndex++;
      speakNextChunk();
    }
  }
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
 * @param wpm - Words per minute (currently unused, TTS controls pace)
 * @param onProgress - Called with char index in full text as speech progresses
 * @param onFinish - Called when all chunks have been spoken
 */
export function startReading(
  text: string,
  _wpm: number,
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

  console.log(
    `Wrapper: Starting "${text.substring(0, 30)}...", ${chunks.length} chunks`
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
  speakNextChunk();
}

/**
 * Stop reading
 * Stops both the chunk scheduling and the current TTS speech
 */
export function stopReading(): void {
  if (!isActive) {
    return;
  }

  console.log(`Wrapper: Stopped at chunk ${currentChunkIndex}/${chunks.length}`);

  isActive = false;

  // Stop current TTS speech
  ttsService.stopSpeaking();

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
