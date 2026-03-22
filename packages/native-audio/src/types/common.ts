/**
 * Common types shared between TTS and Voice services
 */

/**
 * Subscription returned by event listeners
 */
export interface Subscription {
  remove: () => void;
}

/**
 * Session state for both TTS and Voice
 */
export type SessionState = 'idle' | 'active' | 'paused' | 'stopping';

/**
 * Generate unique session ID
 */
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
