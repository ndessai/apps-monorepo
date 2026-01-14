package com.quizapp.nativevoice

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.UUID

class NativeVoiceModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var speechRecognizer: SpeechRecognizer? = null
    private var isRecognizing = false
    private var currentSessionId: String? = null
    private var currentLocale = "en-US"

    override fun getName() = "NativeVoice"

    private fun sendEvent(eventName: String, params: WritableMap) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    private fun createRecognitionListener(): RecognitionListener {
        return object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) {
                val sessionId = currentSessionId ?: return
                sendEvent("voice-start", Arguments.createMap().apply {
                    putString("sessionId", sessionId)
                })
            }

            override fun onBeginningOfSpeech() {
                // Speech input has started
            }

            override fun onRmsChanged(rmsdB: Float) {
                val sessionId = currentSessionId ?: return
                // Normalize RMS to 0-1 range (typical range is -2 to 10)
                val normalizedVolume = ((rmsdB + 2) / 12).coerceIn(0f, 1f)
                sendEvent("voice-volume", Arguments.createMap().apply {
                    putString("sessionId", sessionId)
                    putDouble("volume", normalizedVolume.toDouble())
                })
            }

            override fun onBufferReceived(buffer: ByteArray?) {
                // Audio buffer received
            }

            override fun onEndOfSpeech() {
                // Speech input has ended, waiting for results
            }

            override fun onError(error: Int) {
                val sessionId = currentSessionId ?: return
                isRecognizing = false

                val errorMessage = when (error) {
                    SpeechRecognizer.ERROR_AUDIO -> "Audio recording error"
                    SpeechRecognizer.ERROR_CLIENT -> "Client side error"
                    SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Insufficient permissions"
                    SpeechRecognizer.ERROR_NETWORK -> "Network error"
                    SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Network timeout"
                    SpeechRecognizer.ERROR_NO_MATCH -> "No speech match"
                    SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Recognizer busy"
                    SpeechRecognizer.ERROR_SERVER -> "Server error"
                    SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "Speech timeout"
                    else -> "Unknown error"
                }

                sendEvent("voice-error", Arguments.createMap().apply {
                    putString("sessionId", sessionId)
                    putString("error", errorMessage)
                    putInt("code", error)
                })

                // Also send end event
                sendEvent("voice-end", Arguments.createMap().apply {
                    putString("sessionId", sessionId)
                })
            }

            override fun onResults(results: Bundle?) {
                val sessionId = currentSessionId ?: return
                isRecognizing = false

                val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                val text = matches?.firstOrNull() ?: ""

                sendEvent("voice-result", Arguments.createMap().apply {
                    putString("sessionId", sessionId)
                    putString("text", text)
                    putBoolean("isFinal", true)
                })

                sendEvent("voice-end", Arguments.createMap().apply {
                    putString("sessionId", sessionId)
                })
            }

            override fun onPartialResults(partialResults: Bundle?) {
                val sessionId = currentSessionId ?: return

                val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                val text = matches?.firstOrNull() ?: ""

                if (text.isNotEmpty()) {
                    sendEvent("voice-result", Arguments.createMap().apply {
                        putString("sessionId", sessionId)
                        putString("text", text)
                        putBoolean("isFinal", false)
                    })
                }
            }

            override fun onEvent(eventType: Int, params: Bundle?) {
                // Reserved for future use
            }
        }
    }

    @ReactMethod
    fun requestPermission(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("no_activity", "No activity available")
            return
        }

        val hasPermission = ContextCompat.checkSelfPermission(
            reactApplicationContext,
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED

        if (hasPermission) {
            promise.resolve(true)
        } else {
            // For Android 6+, we need to request permission at runtime
            // The permission should be requested through a PermissionsAndroid call from JS
            // Here we just check if it's already granted
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun isAvailable(promise: Promise) {
        val isAvailable = SpeechRecognizer.isRecognitionAvailable(reactApplicationContext)
        val hasPermission = ContextCompat.checkSelfPermission(
            reactApplicationContext,
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED

        promise.resolve(isAvailable && hasPermission)
    }

    @ReactMethod
    fun start(options: ReadableMap, promise: Promise) {
        if (isRecognizing) {
            promise.reject("already_recognizing", "Speech recognition is already in progress")
            return
        }

        val hasPermission = ContextCompat.checkSelfPermission(
            reactApplicationContext,
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED

        if (!hasPermission) {
            promise.reject("permission_denied", "Microphone permission not granted")
            return
        }

        if (!SpeechRecognizer.isRecognitionAvailable(reactApplicationContext)) {
            promise.reject("not_available", "Speech recognition not available on this device")
            return
        }

        // Get locale from options
        currentLocale = if (options.hasKey("locale")) {
            options.getString("locale") ?: "en-US"
        } else {
            "en-US"
        }

        // Generate session ID
        currentSessionId = UUID.randomUUID().toString()
        val sessionId = currentSessionId!!

        try {
            // Create SpeechRecognizer on main thread
            UiThreadUtil.runOnUiThread {
                try {
                    // Destroy previous recognizer if exists
                    speechRecognizer?.destroy()

                    speechRecognizer = SpeechRecognizer.createSpeechRecognizer(reactApplicationContext)
                    speechRecognizer?.setRecognitionListener(createRecognitionListener())

                    val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                        putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                        putExtra(RecognizerIntent.EXTRA_LANGUAGE, currentLocale)
                        putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                        putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
                        // Enable continuous recognition by keeping mic open
                        putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 3000L)
                        putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 3000L)
                        putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS, 1000L)
                    }

                    speechRecognizer?.startListening(intent)
                    isRecognizing = true
                    promise.resolve(sessionId)
                } catch (e: Exception) {
                    currentSessionId = null
                    promise.reject("start_error", "Failed to start speech recognition: ${e.message}")
                }
            }
        } catch (e: Exception) {
            currentSessionId = null
            promise.reject("start_error", "Failed to start speech recognition: ${e.message}")
        }
    }

    @ReactMethod
    fun stop(promise: Promise) {
        UiThreadUtil.runOnUiThread {
            try {
                speechRecognizer?.stopListening()
                isRecognizing = false
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("stop_error", "Failed to stop: ${e.message}")
            }
        }
    }

    @ReactMethod
    fun cancel(promise: Promise) {
        UiThreadUtil.runOnUiThread {
            try {
                val sessionId = currentSessionId
                speechRecognizer?.cancel()
                isRecognizing = false
                currentSessionId = null

                // Send end event on cancel
                if (sessionId != null) {
                    sendEvent("voice-end", Arguments.createMap().apply {
                        putString("sessionId", sessionId)
                    })
                }

                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("cancel_error", "Failed to cancel: ${e.message}")
            }
        }
    }

    @ReactMethod
    fun isRecognizing(promise: Promise) {
        promise.resolve(isRecognizing)
    }

    // Required for NativeEventEmitter
    @ReactMethod
    fun addListener(eventName: String) {
        // Keep: Required for RN event emitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Keep: Required for RN event emitter
    }

    override fun onCatalystInstanceDestroy() {
        UiThreadUtil.runOnUiThread {
            speechRecognizer?.destroy()
            speechRecognizer = null
        }
        super.onCatalystInstanceDestroy()
    }
}
