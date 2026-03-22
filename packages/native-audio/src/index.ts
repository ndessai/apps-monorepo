/**
 * @monorepo/native-audio
 *
 * A generic native audio package for React Native applications providing:
 * - Text-to-Speech with progress tracking and interrupt status
 * - Voice recognition with TTS echo filtering
 * - Coordinated TTS + Voice with automatic synchronization
 *
 * @example
 * ```typescript
 * import {
 *   useAudioCoordinator,
 *   type ITTSAdapter,
 *   type IVoiceAdapter,
 * } from '@monorepo/native-audio';
 *
 * // Create adapters wrapping your native modules
 * const ttsAdapter: ITTSAdapter = new MyTTSAdapter();
 * const voiceAdapter: IVoiceAdapter = new MyVoiceAdapter();
 *
 * // Use the coordinator hook
 * const audio = useAudioCoordinator({
 *   ttsAdapter,
 *   voiceAdapter,
 *   stopTriggers: ['buzz', 'stop'],
 * });
 *
 * // Speak with automatic echo filtering
 * await audio.speak('What is the capital of France?');
 *
 * // Start listening (echo filtered automatically)
 * await audio.startListening();
 *
 * // Check for interrupts
 * if (audio.lastFinishInfo?.status === 'interrupted') {
 *   handleBuzz();
 * }
 * ```
 */

// Types
export * from './types';

// Services
export * from './services';

// Hooks
export * from './hooks';

// Utilities
export * from './utils';
