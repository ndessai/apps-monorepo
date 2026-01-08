/**
 * Text-to-Speech Service
 *
 * Wrapper around react-native-tts for quiz question reading
 * Provides word-by-word progress tracking for highlighting
 */

import Tts from 'react-native-tts';

// TTS configuration
const TARGET_WPM = 150; // Words per minute (NAQT standard)
const DEFAULT_RATE = 0.5; // TTS rate to achieve ~150 WPM (adjust based on testing)

// Progress callback type
export type TTSProgressCallback = (charIndex: number) => void;

// Current TTS state
let isSpeaking = false;
let currentProgressCallback: TTSProgressCallback | null = null;
let currentText = '';
let startTime = 0;

/**
 * Initialize TTS engine
 * Should be called when app starts
 */
export async function initializeTTS(): Promise<void> {
  try {
    // Set default language
    await Tts.setDefaultLanguage('en-US');

    // Set default rate to achieve ~150 WPM
    await Tts.setDefaultRate(DEFAULT_RATE);

    // Set default pitch
    await Tts.setDefaultPitch(1.0);

    // Get available voices and select a high-quality one
    const voices = await Tts.voices();
    const enVoices = voices.filter((v) => v.language === 'en-US');

    // Prefer enhanced/premium voices if available
    const goodVoice = enVoices.find((v) =>
      v.name.toLowerCase().includes('enhanced') ||
      v.name.toLowerCase().includes('premium') ||
      v.quality >= 300
    );

    if (goodVoice) {
      await Tts.setDefaultVoice(goodVoice.id);
    }

    // Set up event listeners
    Tts.addEventListener('tts-start', handleTTSStart);
    Tts.addEventListener('tts-finish', handleTTSFinish);
    Tts.addEventListener('tts-cancel', handleTTSCancel);
    Tts.addEventListener('tts-progress', handleTTSProgress);

    console.log('TTS initialized successfully');
  } catch (error) {
    console.error('Failed to initialize TTS:', error);
    throw error;
  }
}

/**
 * Clean up TTS listeners
 * Should be called when component unmounts
 */
export function cleanupTTS(): void {
  Tts.removeAllListeners('tts-start');
  Tts.removeAllListeners('tts-finish');
  Tts.removeAllListeners('tts-cancel');
  Tts.removeAllListeners('tts-progress');
}

/**
 * Speak text with word-by-word progress tracking
 * @param text Text to speak
 * @param onProgress Callback for character position updates
 */
export async function speakText(
  text: string,
  onProgress?: TTSProgressCallback
): Promise<void> {
  try {
    currentText = text;
    currentProgressCallback = onProgress || null;
    startTime = Date.now();

    isSpeaking = true;
    await Tts.speak(text);
  } catch (error) {
    console.error('Failed to speak text:', error);
    isSpeaking = false;
    throw error;
  }
}

/**
 * Stop speaking immediately
 */
export function stopSpeaking(): void {
  if (isSpeaking) {
    Tts.stop();
    isSpeaking = false;
    currentProgressCallback = null;
  }
}

/**
 * Check if currently speaking
 */
export function getIsSpeaking(): boolean {
  return isSpeaking;
}

/**
 * Calculate estimated reading duration for text
 * @param text Text to analyze
 * @returns Duration in milliseconds
 */
export function calculateReadingDuration(text: string): number {
  const words = text.split(/\s+/).length;
  const minutes = words / TARGET_WPM;
  return Math.ceil(minutes * 60 * 1000); // Convert to milliseconds
}

/**
 * Get available TTS voices
 */
export async function getVoices(): Promise<any[]> {
  try {
    return await Tts.voices();
  } catch (error) {
    console.error('Failed to get voices:', error);
    return [];
  }
}

/**
 * Set TTS voice
 * @param voiceId Voice ID to use
 */
export async function setVoice(voiceId: string): Promise<void> {
  try {
    await Tts.setDefaultVoice(voiceId);
  } catch (error) {
    console.error('Failed to set voice:', error);
  }
}

/**
 * Set TTS speaking rate
 * @param rate Speaking rate (0.5 = slow, 1.0 = normal, 2.0 = fast)
 */
export async function setRate(rate: number): Promise<void> {
  try {
    await Tts.setDefaultRate(rate);
  } catch (error) {
    console.error('Failed to set rate:', error);
  }
}

/**
 * Calculate character position from elapsed time
 * Uses a linear approximation based on TARGET_WPM
 */
function calculateCharPosition(elapsedMs: number, totalText: string): number {
  if (!totalText) return 0;

  const totalDuration = calculateReadingDuration(totalText);
  const progress = Math.min(elapsedMs / totalDuration, 1);
  return Math.floor(progress * totalText.length);
}

// Event handlers
function handleTTSStart(_event: any): void {
  console.log('TTS started');
  isSpeaking = true;
  startTime = Date.now();

  // Start progress updates
  if (currentProgressCallback) {
    startProgressTracking();
  }
}

function handleTTSFinish(_event: any): void {
  console.log('TTS finished');
  isSpeaking = false;
  currentProgressCallback = null;
}

function handleTTSCancel(_event: any): void {
  console.log('TTS cancelled');
  isSpeaking = false;
  currentProgressCallback = null;
}

function handleTTSProgress(event: any): void {
  // On some platforms, this event provides position/offset
  // Fall back to time-based calculation if not available
  if (event && event.offset !== undefined) {
    currentProgressCallback?.(event.offset);
  }
}

/**
 * Start progress tracking with interval
 * Provides smooth character-by-character updates
 */
let progressInterval: NodeJS.Timeout | null = null;

function startProgressTracking(): void {
  if (progressInterval) {
    clearInterval(progressInterval);
  }

  progressInterval = setInterval(() => {
    if (!isSpeaking || !currentProgressCallback) {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      return;
    }

    const elapsed = Date.now() - startTime;
    const charIndex = calculateCharPosition(elapsed, currentText);
    currentProgressCallback(charIndex);
  }, 100); // Update every 100ms for smooth highlighting
}
