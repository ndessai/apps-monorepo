/**
 * VoiceProvider
 *
 * React context that exposes the voiceService to components.
 * Provides a unified interface for voice recognition across the app.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as voiceService from '../services/voiceService';

// Options for starting voice listening
export interface ListeningOptions {
  continuous?: boolean;          // Auto-restart when speech ends
  filterTTS?: boolean;           // Filter out TTS echo
  onResult?: (text: string) => void;  // Callback for each result
  onPartialResult?: (text: string) => void;  // Callback for partial results
  onStart?: () => void;          // Callback when listening starts
  onEnd?: () => void;            // Callback when listening ends
}

// Context value type
interface VoiceContextType {
  // State
  isListening: boolean;
  isAvailable: boolean;
  lastResult: string;
  error: string | null;

  // Actions
  requestPermission: () => Promise<boolean>;  // Request mic permission on-demand
  startListening: (options?: ListeningOptions) => Promise<boolean>;
  stopListening: () => Promise<void>;

  // TTS coordination
  enableTTSFilter: (text: string) => void;
  disableTTSFilter: () => void;
}

const VoiceContext = createContext<VoiceContextType | null>(null);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [lastResult, setLastResult] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Track current options for callback access
  const optionsRef = useRef<ListeningOptions>({});

  // Auto-check availability on mount (doesn't request permission, just checks capability)
  // This ensures isAvailable is set correctly even if user has already granted permission
  useEffect(() => {
    const checkAvailability = async () => {
      const available = await voiceService.checkAvailability();
      if (available) {
        // If voice is available, also initialize the service
        const initialized = await voiceService.initialize();
        setIsAvailable(initialized);
        console.log('[VoiceProvider] Auto-initialized, isAvailable:', initialized);
      }
    };
    checkAvailability();

    // Cleanup on unmount
    return () => {
      voiceService.cleanup();
    };
  }, []);

  // Request microphone permission on-demand
  const requestPermission = useCallback(async (): Promise<boolean> => {
    console.log('[VoiceProvider] requestPermission called');
    const available = await voiceService.initialize();
    setIsAvailable(available);
    console.log('[VoiceProvider] Permission result, isAvailable:', available);
    return available;
  }, []);

  // Sync isListening state with voiceService when it becomes false externally
  // This handles cases where voiceService is stopped by something else (e.g., audioActionsService)
  useEffect(() => {
    if (!isListening) {
      // We already know we're not listening, no need to sync
      return;
    }

    const syncInterval = setInterval(() => {
      const actuallyListening = voiceService.isListening();
      // If voiceService says we're not listening, sync our state
      // This catches cases where audioActionsService (which uses continuous mode) stops
      // NOTE: Don't clear optionsRef here - only set isListening to false
      // The optionsRef will be updated when startListening is called again
      if (!actuallyListening) {
        console.log('[VoiceProvider] Syncing isListening to false (stopped externally)');
        setIsListening(false);
        // Don't clear optionsRef.current here - it might be in the middle of being
        // set by a new startListening call. The new startListening will set it.
      }
    }, 100); // Check more frequently for faster response

    return () => clearInterval(syncInterval);
  }, [isListening]);

  // Start listening for speech
  const startListening = useCallback(async (options: ListeningOptions = {}): Promise<boolean> => {
    console.log('[VoiceProvider] startListening called with options:', {
      continuous: options.continuous,
      filterTTS: options.filterTTS,
      hasOnResult: !!options.onResult,
      hasOnEnd: !!options.onEnd,
    });
    setError(null);
    optionsRef.current = options;
    console.log('[VoiceProvider] optionsRef.current set, keys:', Object.keys(optionsRef.current));

    const success = await voiceService.startListening(
      {
        continuous: options.continuous ?? false,
        filterTTSEcho: options.filterTTS ?? false,
        language: 'en-US',
      },
      {
        onStart: () => {
          console.log('[VoiceProvider] onStart callback triggered');
          setIsListening(true);
          optionsRef.current.onStart?.();
        },
        onEnd: () => {
          console.log('[VoiceProvider] onEnd callback triggered');
          console.log('[VoiceProvider] - has onEnd in options:', !!optionsRef.current.onEnd);
          // Only set isListening false if not continuous
          if (!optionsRef.current.continuous) {
            setIsListening(false);
          }
          optionsRef.current.onEnd?.();
        },
        onResult: (text: string) => {
          console.log('[VoiceProvider] onResult callback triggered with:', text);
          console.log('[VoiceProvider] - has onResult in options:', !!optionsRef.current.onResult);
          console.log('[VoiceProvider] - optionsRef.current keys:', Object.keys(optionsRef.current));
          setLastResult(text);
          if (optionsRef.current.onResult) {
            console.log('[VoiceProvider] Calling optionsRef.current.onResult');
            optionsRef.current.onResult(text);
          } else {
            console.log('[VoiceProvider] WARNING: optionsRef.current.onResult is undefined!');
          }
        },
        onPartialResult: (text: string) => {
          optionsRef.current.onPartialResult?.(text);
        },
        onError: (errorMsg: string) => {
          console.log('[VoiceProvider] onError callback triggered:', errorMsg);
          setError(errorMsg);
          setIsListening(false);
        },
      }
    );

    if (success) {
      setIsListening(true);
    }

    return success;
  }, []);

  // Stop listening for speech
  const stopListening = useCallback(async (): Promise<void> => {
    await voiceService.stopListening();
    setIsListening(false);
    optionsRef.current = {};
  }, []);

  // Enable TTS echo filtering
  const enableTTSFilter = useCallback((text: string): void => {
    voiceService.setTTSFilterText(text);
  }, []);

  // Disable TTS echo filtering
  const disableTTSFilter = useCallback((): void => {
    voiceService.clearTTSFilter();
  }, []);

  const value: VoiceContextType = {
    isListening,
    isAvailable,
    lastResult,
    error,
    requestPermission,
    startListening,
    stopListening,
    enableTTSFilter,
    disableTTSFilter,
  };

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
};

/**
 * Hook to access voice context
 */
export const useVoice = (): VoiceContextType => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};
