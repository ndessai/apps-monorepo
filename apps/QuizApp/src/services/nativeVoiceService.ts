/**
 * Native Voice Service
 *
 * Voice recognition service using custom native module (NativeVoice).
 * Provides session-based tracking, TTS echo filtering, and a single source
 * of truth for voice state across the app.
 *
 * Key features:
 * - Native iOS SFSpeechRecognizer integration
 * - Native Android SpeechRecognizer integration
 * - Session tracking with native session IDs
 * - One-time listener registration (prevents callback issues)
 * - TTS echo filtering to avoid interpreting spoken questions as user input
 * - Simpler state management with isStopping flag pattern
 */

import { Platform, PermissionsAndroid } from 'react-native';
import { NativeVoice, VoiceResultEvent, VoiceStartEvent, VoiceEndEvent, VoiceErrorEvent } from '../native/NativeVoice';
import * as tts from './nativeTtsService';

// Configuration for voice listening
export interface VoiceConfig {
  continuous?: boolean;        // Auto-restart when speech ends
  filterTTSEcho?: boolean;     // Filter text matching TTS output
  language?: string;           // Default: 'en-US'
}

// Callbacks for voice events
export interface VoiceServiceCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onResult?: (text: string) => void;
  onPartialResult?: (text: string) => void;
  onError?: (error: string) => void;
}

// Session tracking
let activeSessionId: string | null = null;

// Voice state
let isInitialized = false;
let isCurrentlyListening = false;
let isStopping = false;
let currentConfig: VoiceConfig = {};
let currentCallbacks: VoiceServiceCallbacks = {};
let lastResult = '';

// TTS filtering state
let ttsFilterText = '';
let ttsFilterEnabled = false;

// Command words that should never be filtered out by TTS echo filtering
// These are voice commands that need to be detected even if spoken during TTS playback
const PRESERVED_COMMAND_WORDS = ['buzz', 'bus', 'buz', 'buds', 'buzzer', 'pause', 'stop'];

// Listener registration tracking (registered once for app lifetime)
let listenersRegistered = false;

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  const matrix: number[][] = [];

  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const maxLen = Math.max(s1.length, s2.length);
  return 1 - matrix[s1.length][s2.length] / maxLen;
}

/**
 * Check if speech contains a preserved command word (buzz, stop, pause, etc.)
 * Uses fuzzy matching to catch variations like "bus" for "buzz"
 */
function containsCommandWord(speechText: string): boolean {
  const words = speechText.toLowerCase().split(/\s+/);

  for (const word of words) {
    // Exact match check
    if (PRESERVED_COMMAND_WORDS.includes(word)) {
      console.log(`[NativeVoiceService] Command word detected (exact): "${word}"`);
      return true;
    }

    // Fuzzy match check (0.7 threshold for variations like "bus" -> "buzz")
    for (const command of PRESERVED_COMMAND_WORDS) {
      if (calculateSimilarity(word, command) >= 0.7) {
        console.log(`[NativeVoiceService] Command word detected (fuzzy): "${word}" ~ "${command}"`);
        return true;
      }
    }
  }

  return false;
}

/**
 * Filter out TTS echo from speech text
 * Returns empty string if >50% of words match TTS text
 * IMPORTANT: Always preserves speech containing command words (buzz, stop, pause)
 */
function filterTTSEcho(speechText: string): string {
  // CRITICAL: Check for command words FIRST - never filter these out
  // This ensures "buzz" or "stop" commands are always detected even if
  // the cumulative speech contains TTS echo words
  if (containsCommandWord(speechText)) {
    console.log('[NativeVoiceService] Speech contains command word - bypassing TTS filter');
    return speechText;
  }

  // Get current TTS text from nativeTtsService - this is the primary source
  const currentTTSText = tts.getCurrentText();
  // Use the dynamically fetched TTS text, or fall back to manually set filter text
  const filterText = currentTTSText || ttsFilterText;

  if (!filterText) {
    console.log('[NativeVoiceService] No TTS text to filter against');
    return speechText;
  }

  console.log(`[NativeVoiceService] Filtering speech "${speechText}" against TTS text (${filterText.length} chars)`);

  const speechWords = speechText.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
  const ttsWords = filterText.toLowerCase().split(/\s+/).filter((w) => w.length >= 2);

  if (ttsWords.length === 0 || speechWords.length === 0) {
    return speechText;
  }

  let matchCount = 0;
  for (const speechWord of speechWords) {
    // Skip very short words (articles, etc.)
    if (speechWord.length < 2) continue;

    for (const ttsWord of ttsWords) {
      if (speechWord === ttsWord || calculateSimilarity(speechWord, ttsWord) >= 0.75) {
        matchCount++;
        console.log(`[NativeVoiceService] Word match: "${speechWord}" ~ "${ttsWord}"`);
        break;
      }
    }
  }

  // If >40% of speech words match TTS words, filter it out (lowered threshold for better filtering)
  const matchRatio = speechWords.length > 0 ? matchCount / speechWords.length : 0;
  console.log(`[NativeVoiceService] Match ratio: ${matchCount}/${speechWords.length} = ${(matchRatio * 100).toFixed(1)}%`);

  if (matchRatio > 0.4) {
    console.log('[NativeVoiceService] Filtering TTS echo:', speechText);
    return '';
  }

  return speechText;
}

// --- Event Handlers (registered once) ---

function handleVoiceStart(event: VoiceStartEvent): void {
  // Ignore if stopping or session mismatch
  if (isStopping || activeSessionId !== event.sessionId) {
    console.log('[NativeVoiceService] Ignoring start event (stopping or session mismatch)');
    return;
  }

  console.log(`[NativeVoiceService] Session ${event.sessionId} started`);
  isCurrentlyListening = true;
  currentCallbacks.onStart?.();
}

function handleVoiceResult(event: VoiceResultEvent): void {
  // Ignore if stopping or session mismatch
  if (isStopping || activeSessionId !== event.sessionId) {
    console.log('[NativeVoiceService] Ignoring result event (stopping or session mismatch)');
    return;
  }

  const rawText = event.text || '';
  const isFinal = event.isFinal;

  console.log(`[NativeVoiceService] Result: "${rawText}", final: ${isFinal}, filterTTSEcho: ${currentConfig.filterTTSEcho}`);

  // Apply TTS echo filtering if enabled in config
  let processedText = rawText;
  if (currentConfig.filterTTSEcho && rawText.trim().length > 0) {
    processedText = filterTTSEcho(rawText);
    if (processedText === '' && rawText.trim().length > 0) {
      console.log('[NativeVoiceService] Speech filtered as TTS echo, not forwarding to callbacks');
      // Still handle continuous mode restart for final results
      if (isFinal && currentConfig.continuous && isCurrentlyListening && !isStopping) {
        console.log('[NativeVoiceService] Continuous mode: restarting after filtered result...');
        restartListening();
      }
      return;
    }
  }

  if (processedText.trim().length > 0) {
    if (isFinal) {
      lastResult = processedText;
      currentCallbacks.onResult?.(processedText);
    } else {
      currentCallbacks.onPartialResult?.(processedText);
    }
  }

  // Handle continuous mode restart after final result
  if (isFinal && currentConfig.continuous && isCurrentlyListening && !isStopping) {
    console.log('[NativeVoiceService] Continuous mode: restarting...');
    restartListening();
  }
}

function handleVoiceEnd(event: VoiceEndEvent): void {
  // Ignore if stopping or session mismatch
  if (isStopping || activeSessionId !== event.sessionId) {
    console.log('[NativeVoiceService] Ignoring end event (stopping or session mismatch)');
    return;
  }

  console.log(`[NativeVoiceService] Session ${event.sessionId} ended`);

  // Only notify end if not in continuous mode
  if (!currentConfig.continuous) {
    isCurrentlyListening = false;
    currentCallbacks.onEnd?.();
  }
}

function handleVoiceError(event: VoiceErrorEvent): void {
  // Ignore if stopping or session mismatch
  if (isStopping || activeSessionId !== event.sessionId) {
    console.log('[NativeVoiceService] Ignoring error event (stopping or session mismatch)');
    return;
  }

  console.error(`[NativeVoiceService] Error: ${event.error} (code: ${event.code})`);

  // Some errors are recoverable in continuous mode
  // iOS: 1 = No speech detected, 216 = Cancelled
  // Android: 7 = No speech match (ERROR_NO_MATCH), 8 = Speech timeout (ERROR_SPEECH_TIMEOUT)
  const recoverableErrorCodes = [1, 7, 8, 216];
  if (currentConfig.continuous && recoverableErrorCodes.includes(event.code)) {
    console.log('[NativeVoiceService] Recoverable error in continuous mode, restarting...');
    setTimeout(() => {
      if (isCurrentlyListening && !isStopping) {
        restartListening();
      }
    }, 500);
    return;
  }

  isCurrentlyListening = false;
  currentCallbacks.onError?.(event.error);
}

/**
 * Register event listeners (done once for app lifetime)
 */
function registerListeners(): void {
  if (listenersRegistered) {
    return;
  }

  console.log('[NativeVoiceService] Registering event listeners');

  NativeVoice.addEventListener('voice-start', handleVoiceStart);
  NativeVoice.addEventListener('voice-result', handleVoiceResult);
  NativeVoice.addEventListener('voice-end', handleVoiceEnd);
  NativeVoice.addEventListener('voice-error', handleVoiceError);

  listenersRegistered = true;
}

/**
 * Restart listening (for continuous mode)
 */
async function restartListening(): Promise<void> {
  if (!isCurrentlyListening || isStopping) {
    return;
  }

  try {
    // Small delay before restarting
    await new Promise(resolve => setTimeout(resolve, 100));

    if (!isCurrentlyListening || isStopping) {
      return;
    }

    console.log('[NativeVoiceService] Restarting listening');
    const sessionId = await NativeVoice.start({ locale: currentConfig.language || 'en-US' });
    activeSessionId = sessionId;
  } catch (error) {
    console.error('[NativeVoiceService] Failed to restart:', error);
    isCurrentlyListening = false;
    currentCallbacks.onError?.('Failed to restart listening');
  }
}

/**
 * Initialize the voice service
 * Call this once when app starts
 */
export async function initialize(): Promise<boolean> {
  if (isInitialized) {
    return true;
  }

  try {
    // Register listeners first (one-time)
    registerListeners();

    // Request permission using our cross-platform function
    const granted = await requestPermission();
    if (!granted) {
      console.warn('[NativeVoiceService] Permission denied');
      return false;
    }

    isInitialized = true;
    console.log('[NativeVoiceService] Initialized');
    return true;
  } catch (error) {
    console.error('[NativeVoiceService] Failed to initialize:', error);
    isInitialized = false;
    return false;
  }
}

/**
 * Check if voice recognition is available
 */
export async function checkAvailability(): Promise<boolean> {
  try {
    await NativeVoice.requestPermission();
    const isAvailable = await NativeVoice.isAvailable();
    return isAvailable;
  } catch {
    return false;
  }
}

/**
 * Request microphone and speech recognition permissions
 * Handles platform-specific permission requests
 */
export async function requestPermission(): Promise<boolean> {
  try {
    // Register listeners if not already done
    registerListeners();

    // On Android, we need to use PermissionsAndroid for runtime permission
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'This app needs access to your microphone for voice recognition.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        isInitialized = true;
        return true;
      }
      return false;
    }

    // On iOS, the native module handles the permission request
    const granted = await NativeVoice.requestPermission();
    if (granted) {
      isInitialized = true;
    }
    return granted;
  } catch (error) {
    console.error('[NativeVoiceService] Permission request failed:', error);
    return false;
  }
}

/**
 * Start listening for speech
 */
export async function startListening(
  config: VoiceConfig = {},
  callbacks: VoiceServiceCallbacks = {}
): Promise<boolean> {
  try {
    // If already listening, update callbacks and return
    if (isCurrentlyListening && activeSessionId !== null) {
      console.log('[NativeVoiceService] Already listening, updating callbacks');
      currentCallbacks = callbacks;
      currentConfig = config;
      return true;
    }

    // Ensure initialized and listeners registered
    registerListeners();

    // Check availability
    const isAvailable = await NativeVoice.isAvailable();
    if (!isAvailable) {
      console.warn('[NativeVoiceService] Voice recognition not available');
      // Try to initialize/request permission using cross-platform function
      const granted = await requestPermission();
      if (!granted) {
        return false;
      }
    }

    // Store config and callbacks BEFORE starting
    currentConfig = config;
    currentCallbacks = callbacks;
    lastResult = '';

    // Enable TTS filtering if requested
    if (config.filterTTSEcho) {
      ttsFilterEnabled = true;
    }

    console.log('[NativeVoiceService] Starting listening...');

    // Start listening - native module returns session ID
    const sessionId = await NativeVoice.start({ locale: config.language || 'en-US' });
    activeSessionId = sessionId;
    isCurrentlyListening = true;

    console.log(`[NativeVoiceService] Started session ${sessionId}`);
    return true;
  } catch (error) {
    console.error('[NativeVoiceService] Failed to start:', error);
    activeSessionId = null;
    currentCallbacks = {};
    isCurrentlyListening = false;
    return false;
  }
}

/**
 * Stop listening for speech
 */
export async function stopListening(): Promise<void> {
  // Set stopping flag FIRST to block all event handlers
  isStopping = true;

  const wasSession = activeSessionId;

  // Invalidate session
  activeSessionId = null;
  currentCallbacks = {};
  ttsFilterEnabled = false;
  ttsFilterText = '';

  console.log(`[NativeVoiceService] Stopping session ${wasSession}`);

  if (isCurrentlyListening) {
    isCurrentlyListening = false;
    try {
      await NativeVoice.cancel();
    } catch {
      // Ignore errors during stop
    }
  }

  // Clear stopping flag
  isStopping = false;

  console.log('[NativeVoiceService] Stopped');
}

/**
 * Check if currently listening
 */
export function isListening(): boolean {
  return isCurrentlyListening && activeSessionId !== null && !isStopping;
}

/**
 * Get the last speech result
 */
export function getLastResult(): string {
  return lastResult;
}

/**
 * Set TTS text for echo filtering
 * Call this when TTS starts reading a question
 */
export function setTTSFilterText(text: string): void {
  ttsFilterText = text;
  ttsFilterEnabled = true;
  console.log('[NativeVoiceService] TTS filter enabled');
}

/**
 * Clear TTS filter
 * Call this when user buzzes or TTS finishes
 */
export function clearTTSFilter(): void {
  ttsFilterText = '';
  ttsFilterEnabled = false;
  console.log('[NativeVoiceService] TTS filter disabled');
}

/**
 * Check if TTS filtering is enabled
 */
export function isTTSFilterEnabled(): boolean {
  return ttsFilterEnabled;
}

/**
 * Clean up voice service
 * Call when the app is closing or quiz screen unmounts
 */
export function cleanup(): void {
  stopListening();
  isInitialized = false;
}
