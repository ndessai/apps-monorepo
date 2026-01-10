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
export type TTSFinishCallback = () => void;

// Current TTS state
let isSpeaking = false;
let currentProgressCallback: TTSProgressCallback | null = null;
let currentFinishCallback: TTSFinishCallback | null = null;
let currentText = '';
let startTime = 0;

/**
 * Initialize TTS engine
 * Should be called when app starts
 */
export async function initializeTTS(): Promise<void> {
  try {
    // Set default language
    try {
      await Tts.setDefaultLanguage('en-US');
    } catch (error) {
      console.warn('Failed to set default language:', error);
    }

    // Set default rate to achieve ~150 WPM
    // Note: setDefaultRate has issues on iOS simulator, so we skip it
    // The rate can be set per-speak call if needed
    // try {
    //   await Tts.setDefaultRate(DEFAULT_RATE);
    // } catch (error) {
    //   console.warn('Failed to set default rate:', error);
    // }

    // Set default pitch
    try {
      await Tts.setDefaultPitch(1.0);
    } catch (error) {
      console.warn('Failed to set default pitch:', error);
    }

    // Get available voices and select a high-quality one
    try {
      const voices = await Tts.voices();
      const enVoices = voices.filter((v) => v.language === 'en-US');

      // Prefer enhanced/premium voices if available
      const goodVoice = enVoices.find((v) =>
        v.name.toLowerCase().includes('enhanced') ||
        v.name.toLowerCase().includes('premium') ||
        (v.quality && v.quality >= 300)
      );

      if (goodVoice) {
        await Tts.setDefaultVoice(goodVoice.id);
      }
    } catch (error) {
      console.warn('Failed to set voice:', error);
    }

    // Set up event listeners
    Tts.addEventListener('tts-start', handleTTSStart);
    Tts.addEventListener('tts-finish', handleTTSFinish);
    Tts.addEventListener('tts-cancel', handleTTSCancel);
    Tts.addEventListener('tts-progress', handleTTSProgress);

    console.log('TTS initialized successfully');
  } catch (error) {
    console.error('Failed to initialize TTS:', error);
    // Don't throw - allow app to continue without TTS
    console.warn('Continuing without full TTS support');
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
 * @param onFinish Callback when speech finishes
 */
export async function speakText(
  text: string,
  onProgress?: TTSProgressCallback,
  onFinish?: TTSFinishCallback
): Promise<void> {
  try {
    currentText = text;
    currentProgressCallback = onProgress || null;
    currentFinishCallback = onFinish || null;
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
  try {
    // Clear progress interval first to stop updates
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }

    if (isSpeaking) {
      // iOS TTS stop is unreliable, use multiple strategies
      try {
        // Strategy 1: Call stop without await (synchronous call)
        Tts.stop();
      } catch (stopError) {
        console.warn('Stop call failed, trying pause:', stopError);
        // Strategy 2: Try pause instead
        try {
          Tts.pause();
        } catch (pauseError) {
          console.warn('Pause failed, force stopping by speaking silence:', pauseError);
          // Strategy 3: Interrupt with a very short silence
          try {
            Tts.speak(' ', {
              iosVoiceId: 'com.apple.ttsbundle.Samantha-compact',
              rate: 10.0, // Very fast to finish quickly
            });
          } catch (silenceError) {
            console.warn('All stop strategies failed:', silenceError);
          }
        }
      }
    }
  } catch (error) {
    console.warn('Failed to stop TTS:', error);
  } finally {
    // Always clean up state regardless of stop() success
    isSpeaking = false;
    currentProgressCallback = null;
    currentFinishCallback = null;
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
 * Uses a linear approximation based on actual TTS speed
 * Calibrated to match actual iOS TTS reading speed
 */
function calculateCharPosition(elapsedMs: number, totalText: string): number {
  if (!totalText) return 0;

  // Adjust duration to match actual TTS speed
  // Fine-tuned factor to synchronize text reveal with speech
  const totalDuration = calculateReadingDuration(totalText);
  const adjustedDuration = totalDuration * 0.85; // Slightly faster than estimated

  const progress = Math.min(elapsedMs / adjustedDuration, 1);
  return Math.floor(progress * totalText.length);
}

// Event handlers
function handleTTSStart(_event: any): void {
  console.log('TTS started');
  isSpeaking = true;
  startTime = Date.now();

  // Start progress updates immediately
  if (currentProgressCallback) {
    // Give an immediate progress update to show first character
    currentProgressCallback(1);
    startProgressTracking();
  }
}

function handleTTSFinish(_event: any): void {
  console.log('TTS finished');
  isSpeaking = false;

  // Ensure text is fully revealed
  if (currentProgressCallback && currentText) {
    currentProgressCallback(currentText.length);
  }

  // Call finish callback
  if (currentFinishCallback) {
    currentFinishCallback();
  }

  currentProgressCallback = null;
  currentFinishCallback = null;

  // Clear progress interval
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

function handleTTSCancel(_event: any): void {
  console.log('TTS cancelled');
  isSpeaking = false;
  currentProgressCallback = null;
}

function handleTTSProgress(event: any): void {
  // Android provides 'start' and 'end' properties from onRangeStart callback
  // iOS does not provide progress events with character positions
  if (event && event.start !== undefined) {
    // Android: use the 'start' property which contains the character position
    currentProgressCallback?.(event.start);
  } else if (event && event.offset !== undefined) {
    // Fallback for any platform that might use 'offset'
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
  }, 50); // Update every 50ms for smoother text reveal
}
