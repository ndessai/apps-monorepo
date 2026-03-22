/**
 * TTS (Text-to-Speech) Types
 *
 * Generic types for text-to-speech functionality without app-specific references.
 */

// ============================================================================
// Voice Configuration
// ============================================================================

/**
 * Information about an available voice
 */
export interface VoiceInfo {
  /** Unique identifier for the voice */
  id: string;
  /** Display name of the voice */
  name: string;
  /** Language code (e.g., "en-US") */
  language: string;
  /** Quality rating (higher is better) */
  quality: number;
  /** Whether network is required */
  isNetworkRequired?: boolean;
}

/**
 * Voice configuration for speaking
 */
export interface VoiceConfig {
  /** Voice identifier (platform-specific) */
  voiceId?: string;
  /** Speech rate (0.0 to 1.0) */
  rate?: number;
  /** Pitch multiplier (0.5 to 2.0) */
  pitch?: number;
  /** Volume (0.0 to 1.0) */
  volume?: number;
}

// ============================================================================
// Stop Triggers
// ============================================================================

/**
 * Configuration for words/phrases that should stop TTS
 */
export interface StopTriggerConfig {
  /** Exact words to match (case-insensitive) */
  words?: string[];
  /** Phrase patterns to match */
  phrases?: string[];
  /** Minimum similarity threshold for fuzzy matching (0-1, default 0.7) */
  similarityThreshold?: number;
}

// ============================================================================
// Progress Tracking
// ============================================================================

/**
 * Progress information during TTS playback
 */
export interface TTSProgressInfo {
  /** Current character index in the text */
  charIndex: number;
  /** Total text length */
  totalLength: number;
  /** Progress as percentage (0-100) */
  percentage: number;
  /** Current word being spoken (if available) */
  currentWord?: string;
  /** Word index in the text */
  wordIndex?: number;
  /** Total word count */
  totalWords?: number;
}

// ============================================================================
// Completion Status
// ============================================================================

/**
 * How the TTS session ended
 */
export type TTSCompletionStatus =
  | 'completed' // Natural completion - read entire text
  | 'interrupted' // Interrupted by stop trigger or manual stop
  | 'cancelled' // Cancelled via cancel() call
  | 'error'; // Error occurred during playback

/**
 * Details about what caused the interruption
 */
export interface TTSInterruptInfo {
  /** What triggered the interrupt */
  trigger: 'stop_trigger' | 'manual_stop' | 'new_speech';
  /** The specific trigger word/phrase if applicable */
  triggerMatch?: string;
  /** Character index where interrupted */
  interruptedAtChar: number;
  /** Word index where interrupted */
  interruptedAtWord?: number;
}

/**
 * Complete information about how TTS finished
 */
export interface TTSFinishInfo {
  /** How the TTS session ended */
  status: TTSCompletionStatus;
  /** Interrupt details if status is 'interrupted' */
  interruptInfo?: TTSInterruptInfo;
  /** Error message if status is 'error' */
  error?: string;
  /** Final character index reached */
  finalCharIndex: number;
  /** Total duration in milliseconds */
  durationMs: number;
  /** The text that was being read */
  text: string;
}

// ============================================================================
// Callbacks
// ============================================================================

export type TTSProgressCallback = (progress: TTSProgressInfo) => void;
export type TTSFinishCallback = (info: TTSFinishInfo) => void;
export type TTSErrorCallback = (error: string, sessionId: string) => void;
export type TTSStartCallback = (sessionId: string) => void;

// ============================================================================
// Session Configuration
// ============================================================================

/**
 * Options for speaking
 */
export interface TTSSpeakOptions {
  /** Voice configuration to use */
  voiceConfig?: VoiceConfig;
  /** Words/phrases that should stop TTS when recognized via voice */
  stopTriggers?: StopTriggerConfig;
  /** Enable progress callbacks */
  trackProgress?: boolean;
}

/**
 * Full configuration for a TTS session
 */
export interface TTSSessionConfig {
  text: string;
  options?: TTSSpeakOptions;
  onProgress?: TTSProgressCallback;
  onFinish?: TTSFinishCallback;
  onError?: TTSErrorCallback;
  onStart?: TTSStartCallback;
}

// ============================================================================
// Native Event Types (for adapter interface)
// ============================================================================

export type TTSEventType =
  | 'tts-start'
  | 'tts-finish'
  | 'tts-cancel'
  | 'tts-progress'
  | 'tts-error'
  | 'tts-pause'
  | 'tts-resume';

export interface TTSStartEvent {
  utteranceId: string;
}

export interface TTSFinishEvent {
  utteranceId: string;
}

export interface TTSCancelEvent {
  utteranceId: string;
}

export interface TTSProgressEvent {
  utteranceId: string;
  /** Character position in the text */
  location: number;
  /** Length of the current word/segment */
  length: number;
}

export interface TTSErrorEvent {
  utteranceId: string;
  error: string;
}

export interface TTSPauseEvent {
  utteranceId: string;
}

export interface TTSResumeEvent {
  utteranceId: string;
}

export type TTSEvent =
  | TTSStartEvent
  | TTSFinishEvent
  | TTSCancelEvent
  | TTSProgressEvent
  | TTSErrorEvent
  | TTSPauseEvent
  | TTSResumeEvent;

export type TTSEventCallback<T extends TTSEventType> = T extends 'tts-progress'
  ? (event: TTSProgressEvent) => void
  : T extends 'tts-error'
    ? (event: TTSErrorEvent) => void
    : (event: TTSStartEvent | TTSFinishEvent | TTSCancelEvent) => void;
