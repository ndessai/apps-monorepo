package com.quizapp.nativetss

import android.os.Build
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.Locale

class NativeTTSModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = null
    private var isReady = false
    private var defaultRate = 1.0f
    private var defaultPitch = 1.0f
    private val pendingInitPromises = mutableListOf<Promise>()

    override fun getName() = "NativeTTS"

    init {
        tts = TextToSpeech(reactContext, this)
    }

    override fun onInit(status: Int) {
        isReady = status == TextToSpeech.SUCCESS
        if (isReady) {
            setupProgressListener()
            // Set default language
            tts?.setLanguage(Locale.US)
        }
        synchronized(pendingInitPromises) {
            pendingInitPromises.forEach { promise ->
                if (isReady) {
                    promise.resolve("success")
                } else {
                    promise.reject("init_failed", "TTS initialization failed")
                }
            }
            pendingInitPromises.clear()
        }
    }

    private fun setupProgressListener() {
        tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(utteranceId: String) {
                sendEvent("tts-start", Arguments.createMap().apply {
                    putString("utteranceId", utteranceId)
                })
            }

            override fun onDone(utteranceId: String) {
                sendEvent("tts-finish", Arguments.createMap().apply {
                    putString("utteranceId", utteranceId)
                })
            }

            @Deprecated("Deprecated in Java")
            override fun onError(utteranceId: String) {
                sendEvent("tts-error", Arguments.createMap().apply {
                    putString("utteranceId", utteranceId)
                    putString("error", "Speech synthesis error")
                })
            }

            override fun onError(utteranceId: String, errorCode: Int) {
                sendEvent("tts-error", Arguments.createMap().apply {
                    putString("utteranceId", utteranceId)
                    putString("error", "Speech synthesis error: $errorCode")
                })
            }

            override fun onStop(utteranceId: String, interrupted: Boolean) {
                sendEvent("tts-cancel", Arguments.createMap().apply {
                    putString("utteranceId", utteranceId)
                })
            }

            override fun onRangeStart(utteranceId: String, start: Int, end: Int, frame: Int) {
                sendEvent("tts-progress", Arguments.createMap().apply {
                    putString("utteranceId", utteranceId)
                    putInt("location", start)
                    putInt("length", end - start)
                })
            }
        })
    }

    private fun sendEvent(eventName: String, params: WritableMap) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @ReactMethod
    fun speak(text: String, options: ReadableMap, promise: Promise) {
        if (!isReady) {
            promise.reject("not_ready", "TTS not initialized")
            return
        }

        val utteranceId = text.hashCode().toString()

        // Build params bundle
        val params = Bundle().apply {
            val volume = if (options.hasKey("volume")) options.getDouble("volume").toFloat() else 1.0f
            putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, volume)
        }

        // Apply rate from options or default
        val rate = if (options.hasKey("rate")) options.getDouble("rate").toFloat() else defaultRate
        tts?.setSpeechRate(rate)

        // Apply pitch from options or default
        val pitch = if (options.hasKey("pitch")) options.getDouble("pitch").toFloat() else defaultPitch
        tts?.setPitch(pitch)

        // Apply voice if specified
        if (options.hasKey("voiceId") && Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            val voiceId = options.getString("voiceId")
            val voice = tts?.voices?.find { it.name == voiceId }
            if (voice != null) {
                tts?.voice = voice
            }
        }

        val result = tts?.speak(text, TextToSpeech.QUEUE_FLUSH, params, utteranceId)
        if (result == TextToSpeech.SUCCESS) {
            promise.resolve(utteranceId)
        } else {
            promise.reject("speak_error", "Failed to speak")
        }
    }

    @ReactMethod
    fun stop(promise: Promise) {
        val result = tts?.stop()
        promise.resolve(result == TextToSpeech.SUCCESS)
    }

    @ReactMethod
    fun pause(promise: Promise) {
        // Android TTS doesn't have native pause support
        promise.reject("not_supported", "Pause not supported on Android")
    }

    @ReactMethod
    fun resume(promise: Promise) {
        // Android TTS doesn't have native resume support
        promise.reject("not_supported", "Resume not supported on Android")
    }

    @ReactMethod
    fun isSpeaking(promise: Promise) {
        promise.resolve(tts?.isSpeaking ?: false)
    }

    @ReactMethod
    fun getVoices(promise: Promise) {
        if (!isReady) {
            promise.resolve(Arguments.createArray())
            return
        }

        val voices = Arguments.createArray()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            tts?.voices?.forEach { voice ->
                voices.pushMap(Arguments.createMap().apply {
                    putString("id", voice.name)
                    putString("name", voice.name)
                    putString("language", voice.locale.toLanguageTag())
                    putInt("quality", voice.quality)
                    putBoolean("isNetworkRequired", voice.isNetworkConnectionRequired)
                })
            }
        }
        promise.resolve(voices)
    }

    @ReactMethod
    fun setDefaultVoice(voiceId: String, promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            val voice = tts?.voices?.find { it.name == voiceId }
            if (voice != null) {
                tts?.voice = voice
                promise.resolve(null)
            } else {
                promise.reject("not_found", "Voice not found: $voiceId")
            }
        } else {
            promise.reject("not_supported", "Requires API 21+")
        }
    }

    @ReactMethod
    fun setDefaultRate(rate: Double, promise: Promise) {
        defaultRate = rate.toFloat()
        tts?.setSpeechRate(defaultRate)
        promise.resolve(null)
    }

    @ReactMethod
    fun setDefaultPitch(pitch: Double, promise: Promise) {
        defaultPitch = pitch.toFloat()
        tts?.setPitch(defaultPitch)
        promise.resolve(null)
    }

    @ReactMethod
    fun setDefaultLanguage(language: String, promise: Promise) {
        val locale = if (language.contains("-")) {
            val parts = language.split("-")
            Locale(parts[0], parts.getOrElse(1) { "" })
        } else {
            Locale(language)
        }

        val result = tts?.setLanguage(locale)
        when (result) {
            TextToSpeech.LANG_AVAILABLE,
            TextToSpeech.LANG_COUNTRY_AVAILABLE,
            TextToSpeech.LANG_COUNTRY_VAR_AVAILABLE -> {
                promise.resolve(null)
            }
            else -> {
                promise.reject("lang_not_supported", "Language not supported: $language")
            }
        }
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
        tts?.stop()
        tts?.shutdown()
        super.onCatalystInstanceDestroy()
    }
}
