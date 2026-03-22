/**
 * Voice Recognition Types
 *
 * Generic types for speech recognition functionality without app-specific references.
 */

// ============================================================================
// Voice Result
// ============================================================================

/**
 * Result from voice recognition
 */
export interface VoiceResult {
  /** Recognized text */
  text: string;
  /** Whether this is the final result */
  isFinal: boolean;
  /** Confidence score if available (0-1) */
  confidence?: number;
  /** Whether echo filtering was applied */
  wasFiltered: boolean;
  /** Original text before filtering (if filtered) */
  originalText?: string;
  /** Session ID this result belongs to */
  sessionId: string;
}

// ============================================================================
// Session Configuration
// ============================================================================

/**
 * Configuration for voice listening session
 */
export interface VoiceListenConfig {
  /** Enable continuous listening (auto-restart after each result) */
  continuous?: boolean;
  /** Locale for speech recognition (default: 'en-US') */
  locale?: string;
  /** Text to filter as TTS echo */
  echoFilterText?: string;
  /** Words that should bypass echo filter (e.g., command words) */
  preservedWords?: string[];
  /** Echo filter match ratio threshold (0-1, default 0.4) */
  echoFilterThreshold?: number;
  /** Word similarity threshold for fuzzy matching (0-1, default 0.75) */
  wordSimilarityThreshold?: number;
  /** Minimum word length for comparison (default 2) */
  minWordLength?: number;
  /** Delay in ms before restarting continuous mode (default 50) */
  continuousRestartDelayMs?: number;
}

/**
 * Callbacks for voice recognition events
 */
export interface VoiceServiceCallbacks {
  onStart?: (sessionId: string) => void;
  onEnd?: (sessionId: string) => void;
  onResult?: (result: VoiceResult) => void;
  onPartialResult?: (result: VoiceResult) => void;
  onError?: (error: string, sessionId: string) => void;
}

/**
 * Full configuration for a voice session
 */
export interface VoiceSessionConfig {
  config: VoiceListenConfig;
  callbacks: VoiceServiceCallbacks;
}

// ============================================================================
// Voice Session State
// ============================================================================

export type VoiceSessionState = 'idle' | 'listening' | 'processing' | 'stopping';

// ============================================================================
// Native Event Types (for adapter interface)
// ============================================================================

export type VoiceEventType =
  | 'voice-start'
  | 'voice-result'
  | 'voice-end'
  | 'voice-error'
  | 'voice-volume';

export interface VoiceStartEvent {
  sessionId: string;
}

export interface VoiceResultEvent {
  sessionId: string;
  text: string;
  isFinal: boolean;
}

export interface VoiceEndEvent {
  sessionId: string;
}

export interface VoiceErrorEvent {
  sessionId: string;
  error: string;
  code: number;
}

export interface VoiceVolumeEvent {
  sessionId: string;
  volume: number;
}

export type VoiceEvent =
  | VoiceStartEvent
  | VoiceResultEvent
  | VoiceEndEvent
  | VoiceErrorEvent
  | VoiceVolumeEvent;

export type VoiceEventCallback<T extends VoiceEventType> = T extends 'voice-start'
  ? (event: VoiceStartEvent) => void
  : T extends 'voice-result'
    ? (event: VoiceResultEvent) => void
    : T extends 'voice-end'
      ? (event: VoiceEndEvent) => void
      : T extends 'voice-error'
        ? (event: VoiceErrorEvent) => void
        : T extends 'voice-volume'
          ? (event: VoiceVolumeEvent) => void
          : never;
