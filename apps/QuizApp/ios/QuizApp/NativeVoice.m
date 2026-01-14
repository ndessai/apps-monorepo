#import "NativeVoice.h"

@implementation NativeVoice {
    SFSpeechRecognizer *_speechRecognizer;
    SFSpeechAudioBufferRecognitionRequest *_recognitionRequest;
    SFSpeechRecognitionTask *_recognitionTask;
    AVAudioEngine *_audioEngine;
    BOOL _hasListeners;
    NSString *_currentSessionId;
    NSInteger _sessionCounter;
    BOOL _isRecognizing;
}

RCT_EXPORT_MODULE()

- (instancetype)init {
    self = [super init];
    if (self) {
        _audioEngine = [[AVAudioEngine alloc] init];
        _hasListeners = NO;
        _sessionCounter = 0;
        _isRecognizing = NO;
    }
    return self;
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[
        @"voice-start",
        @"voice-result",
        @"voice-end",
        @"voice-error",
        @"voice-volume"
    ];
}

- (void)startObserving {
    _hasListeners = YES;
}

- (void)stopObserving {
    _hasListeners = NO;
}

#pragma mark - Exported Methods

RCT_EXPORT_METHOD(requestPermission:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {

    // Request speech recognition permission
    [SFSpeechRecognizer requestAuthorization:^(SFSpeechRecognizerAuthorizationStatus authStatus) {
        switch (authStatus) {
            case SFSpeechRecognizerAuthorizationStatusAuthorized: {
                // Now request microphone permission
                AVAudioSession *session = [AVAudioSession sharedInstance];
                [session requestRecordPermission:^(BOOL granted) {
                    dispatch_async(dispatch_get_main_queue(), ^{
                        if (granted) {
                            // Initialize speech recognizer after permissions granted
                            self->_speechRecognizer = [[SFSpeechRecognizer alloc] initWithLocale:[NSLocale localeWithLocaleIdentifier:@"en-US"]];
                            self->_speechRecognizer.delegate = self;
                            resolve(@(YES));
                        } else {
                            resolve(@(NO));
                        }
                    });
                }];
                break;
            }
            case SFSpeechRecognizerAuthorizationStatusDenied:
            case SFSpeechRecognizerAuthorizationStatusRestricted:
            case SFSpeechRecognizerAuthorizationStatusNotDetermined:
            default:
                dispatch_async(dispatch_get_main_queue(), ^{
                    resolve(@(NO));
                });
                break;
        }
    }];
}

RCT_EXPORT_METHOD(isAvailable:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {

    // Check if speech recognition is available
    SFSpeechRecognizerAuthorizationStatus status = [SFSpeechRecognizer authorizationStatus];
    BOOL speechAuthorized = (status == SFSpeechRecognizerAuthorizationStatusAuthorized);

    // Check microphone permission
    AVAudioSession *session = [AVAudioSession sharedInstance];
    BOOL micAuthorized = (session.recordPermission == AVAudioSessionRecordPermissionGranted);

    // Check if recognizer is available
    BOOL recognizerAvailable = _speechRecognizer ? _speechRecognizer.isAvailable : NO;

    resolve(@(speechAuthorized && micAuthorized && recognizerAvailable));
}

RCT_EXPORT_METHOD(start:(NSDictionary *)options
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {

    // Check if already recognizing
    if (_isRecognizing) {
        reject(@"already_recognizing", @"Speech recognition is already in progress", nil);
        return;
    }

    // Initialize speech recognizer if needed
    if (!_speechRecognizer) {
        NSString *locale = options[@"locale"] ?: @"en-US";
        _speechRecognizer = [[SFSpeechRecognizer alloc] initWithLocale:[NSLocale localeWithLocaleIdentifier:locale]];
        _speechRecognizer.delegate = self;
    }

    // Check availability
    if (!_speechRecognizer.isAvailable) {
        reject(@"not_available", @"Speech recognition is not available", nil);
        return;
    }

    // Generate session ID
    _sessionCounter++;
    _currentSessionId = [NSString stringWithFormat:@"voice_%ld", (long)_sessionCounter];

    // Cancel any existing task
    if (_recognitionTask) {
        [_recognitionTask cancel];
        _recognitionTask = nil;
    }

    // Configure audio session for recording
    NSError *error = nil;
    AVAudioSession *audioSession = [AVAudioSession sharedInstance];
    [audioSession setCategory:AVAudioSessionCategoryPlayAndRecord
                  withOptions:AVAudioSessionCategoryOptionDefaultToSpeaker |
                              AVAudioSessionCategoryOptionAllowBluetooth |
                              AVAudioSessionCategoryOptionMixWithOthers
                        error:&error];

    if (error) {
        reject(@"audio_session_error", [NSString stringWithFormat:@"Failed to configure audio session: %@", error.localizedDescription], error);
        return;
    }

    [audioSession setActive:YES withOptions:AVAudioSessionSetActiveOptionNotifyOthersOnDeactivation error:&error];
    if (error) {
        reject(@"audio_session_error", [NSString stringWithFormat:@"Failed to activate audio session: %@", error.localizedDescription], error);
        return;
    }

    // Create recognition request
    _recognitionRequest = [[SFSpeechAudioBufferRecognitionRequest alloc] init];
    _recognitionRequest.shouldReportPartialResults = YES;

    // Enable on-device recognition if available (iOS 13+)
    if (@available(iOS 13.0, *)) {
        if (_speechRecognizer.supportsOnDeviceRecognition) {
            _recognitionRequest.requiresOnDeviceRecognition = NO; // Allow network for better accuracy
        }
    }

    AVAudioInputNode *inputNode = _audioEngine.inputNode;

    // Create recognition task
    NSString *sessionId = _currentSessionId;
    __weak typeof(self) weakSelf = self;

    _recognitionTask = [_speechRecognizer recognitionTaskWithRequest:_recognitionRequest resultHandler:^(SFSpeechRecognitionResult * _Nullable result, NSError * _Nullable taskError) {
        __strong typeof(weakSelf) strongSelf = weakSelf;
        if (!strongSelf) return;

        // Ignore if session changed
        if (![strongSelf->_currentSessionId isEqualToString:sessionId]) {
            return;
        }

        if (result) {
            NSString *text = result.bestTranscription.formattedString;
            BOOL isFinal = result.isFinal;

            if (strongSelf->_hasListeners) {
                [strongSelf sendEventWithName:@"voice-result" body:@{
                    @"sessionId": sessionId,
                    @"text": text,
                    @"isFinal": @(isFinal)
                }];
            }

            if (isFinal) {
                [strongSelf stopRecognitionInternal];
            }
        }

        if (taskError) {
            // Don't report error if we intentionally cancelled
            if (taskError.code != 216 && taskError.code != 1) { // Cancelled or No speech detected
                if (strongSelf->_hasListeners) {
                    [strongSelf sendEventWithName:@"voice-error" body:@{
                        @"sessionId": sessionId,
                        @"error": taskError.localizedDescription,
                        @"code": @(taskError.code)
                    }];
                }
            }
            [strongSelf stopRecognitionInternal];
        }
    }];

    // Configure audio input
    AVAudioFormat *recordingFormat = [inputNode outputFormatForBus:0];
    [inputNode installTapOnBus:0 bufferSize:1024 format:recordingFormat block:^(AVAudioPCMBuffer * _Nonnull buffer, AVAudioTime * _Nonnull when) {
        __strong typeof(weakSelf) strongSelf = weakSelf;
        if (strongSelf && strongSelf->_recognitionRequest) {
            [strongSelf->_recognitionRequest appendAudioPCMBuffer:buffer];
        }
    }];

    // Start audio engine
    [_audioEngine prepare];
    NSError *startError = nil;
    [_audioEngine startAndReturnError:&startError];

    if (startError) {
        [self stopRecognitionInternal];
        reject(@"audio_engine_error", [NSString stringWithFormat:@"Failed to start audio engine: %@", startError.localizedDescription], startError);
        return;
    }

    _isRecognizing = YES;

    // Send start event
    if (_hasListeners) {
        [self sendEventWithName:@"voice-start" body:@{@"sessionId": sessionId}];
    }

    resolve(sessionId);
}

RCT_EXPORT_METHOD(stop:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {

    if (!_isRecognizing) {
        resolve(nil);
        return;
    }

    // End the audio request to get final result
    [_recognitionRequest endAudio];

    // Give time for final result, then stop
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.3 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [self stopRecognitionInternal];
        resolve(nil);
    });
}

RCT_EXPORT_METHOD(cancel:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {

    [self stopRecognitionInternal];
    resolve(nil);
}

RCT_EXPORT_METHOD(isRecognizing:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    resolve(@(_isRecognizing));
}

#pragma mark - SFSpeechRecognizerDelegate

- (void)speechRecognizer:(SFSpeechRecognizer *)speechRecognizer availabilityDidChange:(BOOL)available {
    if (!available && _isRecognizing) {
        // Speech recognition became unavailable while recognizing
        if (_hasListeners && _currentSessionId) {
            [self sendEventWithName:@"voice-error" body:@{
                @"sessionId": _currentSessionId,
                @"error": @"Speech recognition became unavailable",
                @"code": @(-1)
            }];
        }
        [self stopRecognitionInternal];
    }
}

#pragma mark - Private Helpers

- (void)stopRecognitionInternal {
    if (!_isRecognizing && !_recognitionTask) {
        return;
    }

    NSString *sessionId = _currentSessionId;

    // Stop audio engine
    if (_audioEngine.isRunning) {
        [_audioEngine stop];
        [_audioEngine.inputNode removeTapOnBus:0];
    }

    // Cancel recognition task
    if (_recognitionTask) {
        [_recognitionTask cancel];
        _recognitionTask = nil;
    }

    // Clear recognition request
    _recognitionRequest = nil;

    _isRecognizing = NO;

    // Send end event
    if (_hasListeners && sessionId) {
        [self sendEventWithName:@"voice-end" body:@{@"sessionId": sessionId}];
    }
}

@end
