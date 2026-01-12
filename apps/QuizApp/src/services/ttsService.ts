/**
 * Text-to-Speech Service
 *
 * Wrapper around react-native-tts for quiz question reading
 * Provides word-by-word progress tracking for highlighting
 *
 * Key design decisions:
 * - Uses session IDs to track which speech events belong to which question
 * - Resets all state when starting new speech to prevent carryover
 * - Keeps listeners registered to avoid "no listeners" warnings
 * - Uses speak(' ') workaround on iOS since stop() has broken BOOL* parameter
 */

import { Platform } from 'react-native';
import Tts from 'react-native-tts';

// TTS configuration
const TARGET_WPM = 150; // Words per minute (NAQT standard)

// Progress callback type
export type TTSProgressCallback = (charIndex: number) => void;
export type TTSFinishCallback = () => void;

// Session tracking - each speakText call gets a unique session ID
// This prevents events from old sessions affecting new questions
let currentSessionId = 0;
let activeSessionId: number | null = null;

// Current TTS state
let isInitialized = false;
let isSpeaking = false;
let currentProgressCallback: TTSProgressCallback | null = null;
let currentFinishCallback: TTSFinishCallback | null = null;
let currentText = '';
let startTime = 0;
let lastReportedCharIndex = 0;
let progressInterval: ReturnType<typeof setInterval> | null = null;

// Track if listeners are registered (they stay registered for app lifetime)
let listenersRegistered = false;

/**
 * Completely reset all speech state
 */
function resetState(): void {
  stopProgressTracking();
  isSpeaking = false;
  currentProgressCallback = null;
  currentFinishCallback = null;
  currentText = '';
  startTime = 0;
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
    // They stay registered to prevent "no listeners" warnings
    if (!listenersRegistered) {
      Tts.addEventListener('tts-start', handleTTSStart);
      Tts.addEventListener('tts-finish', handleTTSFinish);
      Tts.addEventListener('tts-cancel', handleTTSCancel);
      Tts.addEventListener('tts-progress', handleTTSProgress);
      listenersRegistered = true;
    }

    // Set default language
    try {
      await Tts.setDefaultLanguage('en-US');
    } catch (error) {
      console.warn('TTS: Failed to set language');
    }

    // Set default pitch (safe on both platforms)
    try {
      await Tts.setDefaultPitch(1.0);
    } catch (error) {
      console.warn('TTS: Failed to set pitch');
    }

    // Note: We skip setDefaultRate on iOS due to BOOL* parameter issue

    // Try to select a high-quality voice
    try {
      const voices = await Tts.voices();
      const enVoices = voices.filter((v: any) => v.language?.startsWith('en'));
      const goodVoice = enVoices.find(
        (v: any) =>
          v.name?.toLowerCase().includes('enhanced') ||
          v.name?.toLowerCase().includes('premium') ||
          (v.quality && v.quality >= 400)
      );
      if (goodVoice) {
        await Tts.setDefaultVoice(goodVoice.id);
      }
    } catch (error) {
      console.warn('TTS: Failed to set voice');
    }

    isInitialized = true;
    console.log('TTS: Initialized');
  } catch (error) {
    console.error('TTS: Initialization failed:', error);
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
 * Speak text with progress tracking
 */
export async function speakText(
  text: string,
  onProgress?: TTSProgressCallback,
  onFinish?: TTSFinishCallback
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

  console.log(`TTS: Starting session ${sessionId}, text length: ${text.length}`);

  // Set up fresh state for this question
  currentText = text;
  currentProgressCallback = onProgress || null;
  currentFinishCallback = onFinish || null;
  startTime = Date.now();
  lastReportedCharIndex = 0;
  isSpeaking = true;

  try {
    await Tts.speak(text);
  } catch (error) {
    console.error('TTS: Speak failed:', error);
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
  // Invalidate current session first
  const wasSession = activeSessionId;
  activeSessionId = null;

  stopProgressTracking();

  // Clear callbacks
  currentProgressCallback = null;
  currentFinishCallback = null;

  if (!isSpeaking) {
    return;
  }

  console.log(`TTS: Stopping session ${wasSession}`);
  isSpeaking = false;

  // Actually stop the speech
  if (Platform.OS === 'ios') {
    try {
      await Tts.speak(' ');
    } catch {
      // Ignore
    }
  } else {
    try {
      await Tts.stop();
    } catch {
      // Ignore
    }
  }

  // Small delay to let the stop complete before starting new speech
  await new Promise((resolve) => setTimeout(resolve, 50));
}

/**
 * Stop speaking immediately (synchronous interface)
 */
export function stopSpeaking(): void {
  // Invalidate current session first - this ensures events are ignored
  const wasSession = activeSessionId;
  activeSessionId = null;

  stopProgressTracking();

  // Clear callbacks
  currentProgressCallback = null;
  currentFinishCallback = null;

  if (!isSpeaking) {
    return;
  }

  console.log(`TTS: Stopping session ${wasSession} (sync)`);
  isSpeaking = false;

  // Fire and forget - just try to stop
  if (Platform.OS === 'ios') {
    Tts.speak(' ').catch(() => {});
  } else {
    Tts.stop().catch(() => {});
  }
}

/**
 * Check if currently speaking
 */
export function getIsSpeaking(): boolean {
  return isSpeaking;
}

/**
 * Calculate estimated reading duration
 */
export function calculateReadingDuration(text: string): number {
  const words = text.split(/\s+/).length;
  const minutes = words / TARGET_WPM;
  return Math.ceil(minutes * 60 * 1000);
}

/**
 * Get available TTS voices
 */
export async function getVoices(): Promise<any[]> {
  try {
    return await Tts.voices();
  } catch (error) {
    console.error('TTS: Failed to get voices');
    return [];
  }
}

/**
 * Set TTS voice
 */
export async function setVoice(voiceId: string): Promise<void> {
  try {
    await Tts.setDefaultVoice(voiceId);
  } catch (error) {
    console.error('TTS: Failed to set voice');
  }
}

/**
 * Set TTS rate (Android only due to iOS bridge issues)
 */
export async function setRate(rate: number): Promise<void> {
  if (Platform.OS === 'ios') {
    return; // Skip on iOS due to BOOL* parameter issue
  }
  try {
    await Tts.setDefaultRate(rate);
  } catch (error) {
    console.error('TTS: Failed to set rate');
  }
}

// --- Internal functions ---

function stopProgressTracking(): void {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

function startProgressTracking(sessionId: number): void {
  stopProgressTracking();

  progressInterval = setInterval(() => {
    // Stop if session changed or not speaking
    if (activeSessionId !== sessionId || !isSpeaking || !currentProgressCallback) {
      stopProgressTracking();
      return;
    }

    const elapsed = Date.now() - startTime;
    const charIndex = calculateCharPosition(elapsed, currentText);

    if (charIndex > lastReportedCharIndex) {
      lastReportedCharIndex = charIndex;
      currentProgressCallback(charIndex);
    }
  }, 50);
}

function calculateCharPosition(elapsedMs: number, text: string): number {
  if (!text) return 0;

  const totalDuration = calculateReadingDuration(text);
  const adjustedDuration = totalDuration * 0.85;
  const progress = Math.min(elapsedMs / adjustedDuration, 1);

  return Math.floor(progress * text.length);
}

// --- TTS Event Handlers ---

function handleTTSStart(_event: any): void {
  // Ignore if no active session (speech was stopped)
  if (activeSessionId === null) {
    return;
  }

  const sessionId = activeSessionId;
  console.log(`TTS: Session ${sessionId} started`);

  isSpeaking = true;
  startTime = Date.now();
  lastReportedCharIndex = 0;

  if (currentProgressCallback) {
    currentProgressCallback(1);
    startProgressTracking(sessionId);
  }
}

function handleTTSFinish(_event: any): void {
  // Ignore if no active session (speech was stopped or this is from old session)
  if (activeSessionId === null) {
    return;
  }

  const sessionId = activeSessionId;
  console.log(`TTS: Session ${sessionId} finished`);

  stopProgressTracking();

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

function handleTTSCancel(_event: any): void {
  // Ignore if no active session
  if (activeSessionId === null) {
    return;
  }

  console.log(`TTS: Session ${activeSessionId} cancelled`);

  stopProgressTracking();
  activeSessionId = null;
  isSpeaking = false;
  currentProgressCallback = null;
  currentFinishCallback = null;
}

function handleTTSProgress(event: any): void {
  // Ignore if no active session or no callback
  if (activeSessionId === null || !currentProgressCallback) {
    return;
  }

  // Get character index from event (iOS uses 'location', Android uses 'start')
  let charIndex: number | null = null;

  if (event && typeof event.location === 'number') {
    charIndex = event.location;
  } else if (event && typeof event.start === 'number') {
    charIndex = event.start;
  }

  if (charIndex !== null && charIndex > lastReportedCharIndex) {
    // Stop interval tracking since we have native events
    stopProgressTracking();

    lastReportedCharIndex = charIndex;
    currentProgressCallback(charIndex);
  }
}
