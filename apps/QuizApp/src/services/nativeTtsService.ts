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
 */

import { NativeTTS, TTSProgressEvent, TTSEvent } from '../native/NativeTTS';

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
let lastReportedCharIndex = 0;

// Track if listeners are registered (they stay registered for app lifetime)
let listenersRegistered = false;

// Listener subscriptions
let startSubscription: any = null;
let finishSubscription: any = null;
let cancelSubscription: any = null;
let progressSubscription: any = null;

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

    // Try to select a high-quality voice
    try {
      const voices = await NativeTTS.getVoices();
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

  console.log(`NativeTTS: Starting session ${sessionId}, text length: ${text.length}`);

  // Set up fresh state for this question
  currentText = text;
  currentProgressCallback = onProgress || null;
  currentFinishCallback = onFinish || null;
  lastReportedCharIndex = 0;
  isSpeaking = true;

  try {
    await NativeTTS.speak(text, {});
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
 */
export async function setVoice(voiceId: string): Promise<void> {
  try {
    await NativeTTS.setDefaultVoice(voiceId);
  } catch (error) {
    console.error('NativeTTS: Failed to set voice');
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
 * @param onProgress - Called with character index as speech progresses
 * @param onFinish - Called when speech completes naturally
 */
export function startReading(
  text: string,
  _wpm: number,
  onProgress: ProgressCallback,
  onFinish: FinishCallback
): void {
  // Reset index and start fresh
  lastReportedCharIndex = 0;

  // Fire and forget - speakText handles everything
  speakText(text, onProgress, onFinish).catch((error) => {
    console.error('NativeTTS: startReading failed:', error);
  });
}

/**
 * Stop reading immediately
 * Resets progress index and clears all callbacks
 */
export function stopReading(): void {
  // Reset index
  lastReportedCharIndex = 0;

  // Use existing stopSpeaking which handles everything
  stopSpeaking();
}

/**
 * Check if currently reading
 */
export function isReading(): boolean {
  return isSpeaking;
}

/**
 * Cleanup on unmount
 */
export function cleanup(): void {
  stopReading();
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

  if (charIndex > lastReportedCharIndex) {
    lastReportedCharIndex = charIndex;
    currentProgressCallback(charIndex);
  }
}
