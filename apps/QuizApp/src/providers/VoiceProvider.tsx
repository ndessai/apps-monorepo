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

  // Initialize voice service on mount
  useEffect(() => {
    const init = async () => {
      const available = await voiceService.initialize();
      setIsAvailable(available);
    };

    init();

    // Cleanup on unmount
    return () => {
      voiceService.cleanup();
    };
  }, []);

  // Start listening for speech
  const startListening = useCallback(async (options: ListeningOptions = {}): Promise<boolean> => {
    setError(null);
    optionsRef.current = options;

    const success = await voiceService.startListening(
      {
        continuous: options.continuous ?? false,
        filterTTSEcho: options.filterTTS ?? false,
        language: 'en-US',
      },
      {
        onStart: () => {
          setIsListening(true);
          optionsRef.current.onStart?.();
        },
        onEnd: () => {
          // Only set isListening false if not continuous
          if (!optionsRef.current.continuous) {
            setIsListening(false);
          }
          optionsRef.current.onEnd?.();
        },
        onResult: (text: string) => {
          setLastResult(text);
          optionsRef.current.onResult?.(text);
        },
        onPartialResult: (text: string) => {
          optionsRef.current.onPartialResult?.(text);
        },
        onError: (errorMsg: string) => {
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
