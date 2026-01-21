/**
 * Native TTS Service
 *
 * Direct interface to native text-to-speech using custom native module.
 *
 * Key features:
 * - Direct stop() without workarounds
 * - Native character-level progress events
 * - Proper audio session configuration
 * - Index resets on new text or stop
 * - Multiple voice types for different feedback styles
 */

import { Platform } from 'react-native';
import { NativeTTS, TTSProgressEvent, TTSEvent } from '../native/NativeTTS';

// Voice types for different TTS contexts
export type VoiceType = 'standard' | 'positiveFeedback' | 'hystericalFeedback' | 'sarcasticFeedback';

// Platform-specific voice IDs for each voice type
// TODO: Fill in actual voice IDs for each platform
const VOICE_IDS = {
  ios: {
    standard: '', // Will use default/auto-selected voice
    positiveFeedback: '', // TODO: Fill in iOS voice ID
    hystericalFeedback: 'com.apple.speech.synthesis.voice.Hysterical', 
    sarcasticFeedback: 'com.apple.speech.synthesis.voice.Fred', // can also use 'com.apple.speech.synthesis.voice.Junior' for a more kiddish tone
  },
  android: {
    standard: '', // Will use default/auto-selected voice
    positiveFeedback: '', // TODO: Fill in Android voice ID
    hystericalFeedback: '', // TODO: Fill in Android voice ID
    sarcasticFeedback: '', // TODO: Fill in Android voice ID
  },
};

/**
 * Get the voice ID for a given voice type on the current platform
 * Returns empty string if the configured voice is not available on this device
 */
function getVoiceIdForType(voiceType: VoiceType): string {
  const platformVoices = Platform.OS === 'ios' ? VOICE_IDS.ios : VOICE_IDS.android;
  const voiceId = platformVoices[voiceType] || '';

  // If no voice configured, return empty (will use default)
  if (!voiceId) {
    return '';
  }

  // Validate that the voice is available on this device
  if (availableVoiceIds.size > 0 && !availableVoiceIds.has(voiceId)) {
    console.warn(`NativeTTS: Voice ID "${voiceId}" for type "${voiceType}" is not available on this device, using default`);
    return '';
  }

  return voiceId;
}

/**
 * Check if a character is a space or punctuation (word boundary)
 */
function isWordBoundary(char: string): boolean {
  // Space, punctuation, and common sentence delimiters
  return /[\s.,!?;:'"()\-—–\n\r\t]/.test(char);
}

// Callback types
export type ProgressCallback = (charIndex: number) => void;
export type FinishCallback = () => void;

// Session tracking - each speakText call gets a unique session ID
// This prevents events from old sessions affecting new questions
let currentSessionId = 0;
let activeSessionId: number | null = null;

// Current TTS state
let isInitialized = false;
let isSpeaking = false;
let isStopping = false; // Flag to ignore all events during stop sequence
let currentProgressCallback: ProgressCallback | null = null;
let currentFinishCallback: FinishCallback | null = null;
let currentText = '';
let lastReadText = ''; // Persists after stopReading() for echo filtering in answer tray
let lastReportedCharIndex = 0;
let currentVoiceType: VoiceType = 'standard';

// Silent reading state (text reveal without TTS)
let silentReadingTimerId: ReturnType<typeof setInterval> | null = null;
let isSilentReading = false;

// Pause state for Learn mode
let isPaused = false;
let pausedCharIndex = 0;
let pausedText = '';
let pausedWpm = 150;
let pausedProgressCallback: ProgressCallback | null = null;
let pausedFinishCallback: FinishCallback | null = null;
let pausedVoiceType: VoiceType = 'standard';
let pausedWordBoundaries: number[] = [];
let pausedCurrentWordIndex = 0;

// Track if listeners are registered (they stay registered for app lifetime)
let listenersRegistered = false;

// Listener subscriptions
let startSubscription: any = null;
let finishSubscription: any = null;
let cancelSubscription: any = null;
let progressSubscription: any = null;

// Cache of available voice IDs (populated during initialization)
let availableVoiceIds: Set<string> = new Set();

/**
 * Completely reset all speech state
 */
function resetState(): void {
  isSpeaking = false;
  isStopping = false;
  currentProgressCallback = null;
  currentFinishCallback = null;
  currentText = '';
  lastReportedCharIndex = 0;
}

/**
 * Initialize TTS engine
 * Should be called when app starts
 */
export async function initializeTTS(): Promise<void> {
  if (isInitialized) {
    return;
  }

  try {
    // Register listeners ONCE for the lifetime of the app
    if (!listenersRegistered) {
      startSubscription = NativeTTS.addEventListener('tts-start', handleTTSStart);
      finishSubscription = NativeTTS.addEventListener('tts-finish', handleTTSFinish);
      cancelSubscription = NativeTTS.addEventListener('tts-cancel', handleTTSCancel);
      progressSubscription = NativeTTS.addEventListener('tts-progress', handleTTSProgress);
      listenersRegistered = true;
    }

    // Set default language
    try {
      await NativeTTS.setDefaultLanguage('en-US');
    } catch (error) {
      console.warn('NativeTTS: Failed to set language');
    }

    // Set default pitch
    try {
      await NativeTTS.setDefaultPitch(1.0);
    } catch (error) {
      console.warn('NativeTTS: Failed to set pitch');
    }

    // Try to select a high-quality voice and cache available voice IDs
    try {
      const voices = await NativeTTS.getVoices();

      // Cache all available voice IDs for validation
      availableVoiceIds = new Set(voices.map((v) => v.id).filter(Boolean));
      console.log(`NativeTTS: Cached ${availableVoiceIds.size} available voices`);

      const enVoices = voices.filter((v) => v.language?.startsWith('en'));
      const goodVoice = enVoices.find(
        (v) =>
          v.name?.toLowerCase().includes('enhanced') ||
          v.name?.toLowerCase().includes('premium') ||
          (v.quality && v.quality >= 400)
      );
      if (goodVoice) {
        await NativeTTS.setDefaultVoice(goodVoice.id);
      }
    } catch (error) {
      console.warn('NativeTTS: Failed to set voice');
    }

    isInitialized = true;
    console.log('NativeTTS: Initialized');
  } catch (error) {
    console.error('NativeTTS: Initialization failed:', error);
  }
}

/**
 * Clean up TTS state
 * Called when quiz screen unmounts
 */
export function cleanupTTS(): void {
  // Stop any active speech
  stopSpeaking();

  // Clear the active session so late events are ignored
  activeSessionId = null;

  // Note: We keep listeners registered to prevent warnings
}

/**
 * Speak text with progress tracking (internal)
 */
async function speakText(
  text: string,
  voiceType: VoiceType = 'standard',
  onProgress?: ProgressCallback,
  onFinish?: FinishCallback
): Promise<void> {
  // Ensure initialized
  if (!isInitialized) {
    await initializeTTS();
  }

  // Stop any ongoing speech and fully reset state
  await stopSpeakingAsync();

  // Create new session - this invalidates any pending events from previous questions
  currentSessionId++;
  activeSessionId = currentSessionId;
  const sessionId = currentSessionId;

  console.log(`NativeTTS: Starting session ${sessionId}, voiceType: ${voiceType}, text length: ${text.length}`);

  // Set up fresh state for this question
  currentText = text;
  lastReadText = text; // Persist for echo filtering even after stop
  currentVoiceType = voiceType;
  // For non-standard voice types, don't track progress (no highlighting needed)
  currentProgressCallback = voiceType === 'standard' ? (onProgress || null) : null;
  currentFinishCallback = onFinish || null;
  lastReportedCharIndex = 0;
  isSpeaking = true;

  try {
    // Get voice ID for the requested voice type
    const voiceId = getVoiceIdForType(voiceType);
    const speakOptions: Record<string, unknown> = {};

    // Only set voiceId if we have one configured for this type
    if (voiceId) {
      speakOptions.voiceId = voiceId;
    }

    await NativeTTS.speak(text, speakOptions);
  } catch (error) {
    console.error('NativeTTS: Speak failed:', error);
    // Only reset if this is still the active session
    if (activeSessionId === sessionId) {
      resetState();
      activeSessionId = null;
    }
    throw error;
  }
}

/**
 * Stop speaking asynchronously (for internal use)
 */
async function stopSpeakingAsync(): Promise<void> {
  // Set stopping flag FIRST to block all event handlers immediately
  isStopping = true;

  // Invalidate current session
  const wasSession = activeSessionId;
  activeSessionId = null;

  // Clear callbacks BEFORE any TTS operations to prevent them from being called
  currentProgressCallback = null;
  currentFinishCallback = null;

  if (!isSpeaking) {
    isStopping = false;
    return;
  }

  console.log(`NativeTTS: Stopping session ${wasSession}`);
  isSpeaking = false;

  // Actually stop the speech - direct call, no workarounds needed!
  try {
    await NativeTTS.stop();
  } catch {
    // Ignore errors during stop
  }

  // Clear stopping flag after operations complete
  isStopping = false;

  // Small delay to let everything settle before starting new speech
  await new Promise((resolve) => setTimeout(resolve, 50));
}

/**
 * Stop speaking immediately (synchronous interface)
 */
export function stopSpeaking(): void {
  // Set stopping flag FIRST to block all event handlers immediately
  isStopping = true;

  // Invalidate current session
  const wasSession = activeSessionId;
  activeSessionId = null;

  // Clear callbacks BEFORE any TTS operations to prevent them from being called
  currentProgressCallback = null;
  currentFinishCallback = null;

  if (!isSpeaking) {
    isStopping = false;
    return;
  }

  console.log(`NativeTTS: Stopping session ${wasSession} (sync)`);
  isSpeaking = false;

  // Fire and forget - direct stop call
  NativeTTS.stop()
    .catch(() => {})
    .finally(() => {
      isStopping = false;
    });
}

/**
 * Check if currently speaking
 */
export function getIsSpeaking(): boolean {
  return isSpeaking;
}

/**
 * Calculate estimated reading duration
 * @param text - Text to calculate duration for
 * @param wpm - Words per minute (passed from caller)
 */
export function calculateReadingDuration(text: string, wpm: number): number {
  const words = text.split(/\s+/).length;
  const minutes = words / wpm;
  return Math.ceil(minutes * 60 * 1000);
}

/**
 * Get available TTS voices
 */
export async function getVoices(): Promise<any[]> {
  try {
    return await NativeTTS.getVoices();
  } catch (error) {
    console.error('NativeTTS: Failed to get voices');
    return [];
  }
}

/**
 * Set TTS voice
 * Validates that the voice ID is supported by the device before setting
 * @param voiceId - The voice ID to set
 * @returns true if voice was set successfully, false if voice is not available
 */
export async function setVoice(voiceId: string): Promise<boolean> {
  try {
    // Ensure we have the voice cache populated
    if (availableVoiceIds.size === 0) {
      await initializeTTS();
    }

    // Validate the voice ID is available on this device
    if (!availableVoiceIds.has(voiceId)) {
      console.warn(`NativeTTS: Voice ID "${voiceId}" is not available on this device`);
      return false;
    }

    await NativeTTS.setDefaultVoice(voiceId);
    return true;
  } catch (error) {
    console.error('NativeTTS: Failed to set voice:', error);
    return false;
  }
}

/**
 * Set TTS rate
 */
export async function setRate(rate: number): Promise<void> {
  try {
    await NativeTTS.setDefaultRate(rate);
  } catch (error) {
    console.error('NativeTTS: Failed to set rate');
  }
}

/**
 * Start reading text with progress callbacks
 *
 * @param text - Text to read
 * @param _wpm - Words per minute (unused, TTS controls pace)
 * @param onProgress - Called with character index as speech progresses (only for 'standard' voiceType)
 * @param onFinish - Called when speech completes naturally
 * @param voiceType - Type of voice to use (default: 'standard')
 */
export function startReading(
  text: string,
  _wpm: number,
  onProgress: ProgressCallback,
  onFinish: FinishCallback,
  voiceType: VoiceType = 'standard'
): void {
  // Reset index and start fresh
  lastReportedCharIndex = 0;

  // Fire and forget - speakText handles everything
  speakText(text, voiceType, onProgress, onFinish).catch((error) => {
    console.error('NativeTTS: startReading failed:', error);
  });
}

/**
 * Start reading text WITHOUT TTS (silent mode)
 * Reveals text at the configured WPM rate using a timer
 * Used when readQuestions setting is disabled
 *
 * @param text - Text to reveal
 * @param wpm - Words per minute for reveal speed
 * @param onProgress - Called with character index as text is revealed
 * @param onFinish - Called when all text has been revealed
 */
export function startReadingWithoutTTS(
  text: string,
  wpm: number,
  onProgress: ProgressCallback,
  onFinish: FinishCallback
): void {
  // Stop any ongoing reading (TTS or silent)
  stopReading();

  // Create new session
  currentSessionId++;
  activeSessionId = currentSessionId;
  const sessionId = currentSessionId;

  console.log(`NativeTTS: Starting silent reading session ${sessionId}, WPM: ${wpm}, text length: ${text.length}`);

  // Set up state
  currentText = text;
  lastReadText = text; // Persist for echo filtering even after stop
  currentProgressCallback = onProgress;
  currentFinishCallback = onFinish;
  lastReportedCharIndex = 0;
  isSilentReading = true;

  // Find word boundaries for smoother progress updates
  const wordBoundaries: number[] = [];
  let inWord = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const isBoundary = /[\s.,!?;:'"()\-—–\n\r\t]/.test(char);
    if (isBoundary && inWord) {
      wordBoundaries.push(i);
      inWord = false;
    } else if (!isBoundary) {
      inWord = true;
    }
  }
  // Add final position
  wordBoundaries.push(text.length);

  // Calculate time per word boundary
  const totalWords = wordBoundaries.length;
  const totalDuration = (text.split(/\s+/).length / wpm) * 60000;
  const msPerWord = totalDuration / totalWords;

  let currentWordIndex = 0;

  // Report initial progress
  if (onProgress) {
    onProgress(0);
  }

  // Start interval to reveal text word by word
  silentReadingTimerId = setInterval(() => {
    // Check if session is still active
    if (activeSessionId !== sessionId || isStopping) {
      if (silentReadingTimerId) {
        clearInterval(silentReadingTimerId);
        silentReadingTimerId = null;
      }
      isSilentReading = false;
      return;
    }

    currentWordIndex++;

    if (currentWordIndex >= wordBoundaries.length) {
      // Finished - report full length
      if (currentProgressCallback) {
        currentProgressCallback(text.length);
      }

      // Clear timer
      if (silentReadingTimerId) {
        clearInterval(silentReadingTimerId);
        silentReadingTimerId = null;
      }

      // Capture callback before clearing
      const finishCallback = currentFinishCallback;

      // Clear state
      activeSessionId = null;
      isSilentReading = false;
      currentProgressCallback = null;
      currentFinishCallback = null;

      // Call finish callback
      if (finishCallback) {
        finishCallback();
      }
    } else {
      // Report progress at word boundary
      const charIndex = wordBoundaries[currentWordIndex - 1];
      lastReportedCharIndex = charIndex;
      if (currentProgressCallback) {
        currentProgressCallback(charIndex);
      }
    }
  }, msPerWord);
}

/**
 * Stop reading immediately and fully reset state
 * Resets progress index, clears callbacks, and invalidates session
 */
export function stopReading(): void {
  console.log('NativeTTS: stopReading called - full reset');

  // Set stopping flag FIRST to block all event handlers
  isStopping = true;

  // Invalidate session immediately
  activeSessionId = null;

  // Reset ALL state including paused state
  lastReportedCharIndex = 0;
  currentText = '';
  currentProgressCallback = null;
  currentFinishCallback = null;
  isPaused = false;
  pausedCharIndex = 0;
  pausedText = '';
  pausedProgressCallback = null;
  pausedFinishCallback = null;
  pausedVoiceType = 'standard';
  pausedWordBoundaries = [];
  pausedCurrentWordIndex = 0;

  // Stop silent reading timer if active
  if (silentReadingTimerId) {
    clearInterval(silentReadingTimerId);
    silentReadingTimerId = null;
    isSilentReading = false;
  }

  // Stop native TTS if speaking
  if (isSpeaking) {
    isSpeaking = false;
    NativeTTS.stop()
      .catch(() => {})
      .finally(() => {
        isStopping = false;
      });
  } else {
    isStopping = false;
  }
}

/**
 * Check if currently reading (TTS or silent)
 */
export function isReading(): boolean {
  return isSpeaking || isSilentReading;
}

/**
 * Get the current or last read text (for voice echo filtering)
 * Returns currentText if TTS is active, otherwise returns lastReadText
 * This allows answer tray to filter echoes even after TTS has stopped
 */
export function getCurrentText(): string {
  return currentText || lastReadText;
}

/**
 * Clear the last read text (call when moving to next question)
 * This prevents filtering against stale question text
 */
export function clearLastReadText(): void {
  lastReadText = '';
  console.log('NativeTTS: Cleared lastReadText for new question');
}

/**
 * Cleanup on unmount
 */
export function cleanup(): void {
  stopReading();
}

/**
 * Pause reading (for Learn mode)
 * Stores current position and state so reading can be resumed later
 */
export function pauseReading(): void {
  if (!isSpeaking && !isSilentReading) {
    console.log('NativeTTS: pauseReading called but not reading');
    return;
  }

  if (isPaused) {
    console.log('NativeTTS: Already paused');
    return;
  }

  console.log(`NativeTTS: Pausing at character ${lastReportedCharIndex}`);

  // Save current state for resume
  isPaused = true;
  pausedCharIndex = lastReportedCharIndex;
  pausedText = currentText;
  pausedProgressCallback = currentProgressCallback;
  pausedFinishCallback = currentFinishCallback;
  pausedVoiceType = currentVoiceType;

  // Stop silent reading timer if active
  if (silentReadingTimerId) {
    clearInterval(silentReadingTimerId);
    silentReadingTimerId = null;
  }

  // Stop native TTS if speaking (fire and forget)
  if (isSpeaking) {
    isSpeaking = false;
    NativeTTS.stop().catch(() => {});
  }

  isSilentReading = false;

  // Clear callbacks to prevent any late events from firing
  currentProgressCallback = null;
  currentFinishCallback = null;
}

/**
 * Resume reading from paused position (for Learn mode)
 * Continues TTS from where it was paused
 */
export function resumeReading(): void {
  if (!isPaused) {
    console.log('NativeTTS: resumeReading called but not paused');
    return;
  }

  console.log(`NativeTTS: Resuming from character ${pausedCharIndex}`);

  // Get remaining text from paused position
  const remainingText = pausedText.slice(pausedCharIndex);

  if (remainingText.trim().length === 0) {
    // Nothing left to read, call finish callback
    console.log('NativeTTS: No remaining text, calling finish');
    isPaused = false;
    const finishCallback = pausedFinishCallback;
    clearPausedState();
    if (finishCallback) {
      finishCallback();
    }
    return;
  }

  // Restore callbacks
  const progressCallback = pausedProgressCallback;
  const finishCallback = pausedFinishCallback;
  const baseCharIndex = pausedCharIndex;
  const voiceType = pausedVoiceType;

  // Clear paused state
  isPaused = false;
  clearPausedState();

  // Create wrapper callbacks that adjust for the offset
  const adjustedProgressCallback: ProgressCallback = (charIndex) => {
    // Add base offset to report correct position in full text
    const adjustedIndex = baseCharIndex + charIndex;
    lastReportedCharIndex = adjustedIndex;
    if (progressCallback) {
      progressCallback(adjustedIndex);
    }
  };

  const adjustedFinishCallback: FinishCallback = () => {
    if (finishCallback) {
      finishCallback();
    }
  };

  // Start reading the remaining text
  // Use speakText internal function via startReading
  currentText = pausedText; // Keep full text for reference
  lastReadText = pausedText;
  currentProgressCallback = adjustedProgressCallback;
  currentFinishCallback = adjustedFinishCallback;
  currentVoiceType = voiceType;
  lastReportedCharIndex = baseCharIndex;

  // Create new session
  currentSessionId++;
  activeSessionId = currentSessionId;
  isSpeaking = true;

  // Get voice ID and speak remaining text
  const voiceId = getVoiceIdForType(voiceType);
  const speakOptions: Record<string, unknown> = {};
  if (voiceId) {
    speakOptions.voiceId = voiceId;
  }

  NativeTTS.speak(remainingText, speakOptions).catch((error) => {
    console.error('NativeTTS: Resume speak failed:', error);
    resetState();
  });
}

/**
 * Check if reading is paused
 */
export function getIsPaused(): boolean {
  return isPaused;
}

/**
 * Clear paused state
 */
function clearPausedState(): void {
  pausedCharIndex = 0;
  pausedText = '';
  pausedProgressCallback = null;
  pausedFinishCallback = null;
  pausedVoiceType = 'standard';
  pausedWordBoundaries = [];
  pausedCurrentWordIndex = 0;
}

/**
 * Initialize the TTS service
 * Alias for initializeTTS for API compatibility
 */
export async function initialize(): Promise<void> {
  await initializeTTS();
}

// --- TTS Event Handlers ---

function handleTTSStart(_event: TTSEvent): void {
  // Ignore if stopping or no active session (speech was stopped)
  if (isStopping || activeSessionId === null) {
    console.log('NativeTTS: Ignoring start event (stopping or no session)');
    return;
  }

  const sessionId = activeSessionId;
  console.log(`NativeTTS: Session ${sessionId} started`);

  isSpeaking = true;
  lastReportedCharIndex = 0;

  // Report initial progress
  if (currentProgressCallback) {
    currentProgressCallback(1);
  }
}

function handleTTSFinish(_event: TTSEvent): void {
  // Ignore if stopping or no active session (speech was stopped or this is from old session)
  if (isStopping || activeSessionId === null) {
    console.log('NativeTTS: Ignoring finish event (stopping or no session)');
    return;
  }

  const sessionId = activeSessionId;
  console.log(`NativeTTS: Session ${sessionId} finished`);

  // Report full text length
  if (currentProgressCallback && currentText) {
    lastReportedCharIndex = currentText.length;
    currentProgressCallback(currentText.length);
  }

  // Capture callback before clearing
  const finishCallback = currentFinishCallback;

  // Clear session and state
  activeSessionId = null;
  isSpeaking = false;
  currentProgressCallback = null;
  currentFinishCallback = null;

  // Call finish callback
  if (finishCallback) {
    finishCallback();
  }
}

function handleTTSCancel(_event: TTSEvent): void {
  // Ignore if stopping or no active session
  if (isStopping || activeSessionId === null) {
    console.log('NativeTTS: Ignoring cancel event (stopping or no session)');
    return;
  }

  console.log(`NativeTTS: Session ${activeSessionId} cancelled`);

  activeSessionId = null;
  isSpeaking = false;
  currentProgressCallback = null;
  currentFinishCallback = null;
}

function handleTTSProgress(event: TTSProgressEvent): void {
  // Ignore if stopping, no active session, or no callback
  if (isStopping || activeSessionId === null || !currentProgressCallback) {
    return;
  }

  // Get character index from native event
  const charIndex = event.location;

  // Only report progress if we've moved forward
  if (charIndex > lastReportedCharIndex) {
    // For standard voice type, only invoke callback on word boundaries
    // (space or punctuation) to reduce UI flickering, sometimes the progress is invoked on beginning of the word
    const isAtEnd = charIndex >= currentText.length;
    const charAtPosition = charIndex < currentText.length && charIndex >= 1 ? currentText[charIndex-1] : '';
    const shouldReport = isAtEnd || isWordBoundary(charAtPosition);
    const nextWordBoundaryIndex = currentText.slice(charIndex).search(/[\s.,!?;:'"()\-—–\n\r\t]/);

    if (shouldReport) {
      lastReportedCharIndex = charIndex;
      currentProgressCallback(nextWordBoundaryIndex >= 0 ? charIndex + nextWordBoundaryIndex : charIndex);
    }
  }
}
