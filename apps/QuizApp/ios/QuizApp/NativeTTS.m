#import "NativeTTS.h"

@implementation NativeTTS {
    AVSpeechSynthesizer *_synthesizer;
    AVSpeechSynthesisVoice *_defaultVoice;
    float _defaultRate;
    float _defaultPitch;
    BOOL _hasListeners;
    NSString *_currentUtteranceId;
}

RCT_EXPORT_MODULE()

- (instancetype)init {
    self = [super init];
    if (self) {
        _synthesizer = [[AVSpeechSynthesizer alloc] init];
        _synthesizer.delegate = self;
        _defaultRate = AVSpeechUtteranceDefaultSpeechRate;
        _defaultPitch = 1.0;
        _hasListeners = NO;
    }
    return self;
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[
        @"tts-start",
        @"tts-finish",
        @"tts-cancel",
        @"tts-progress",
        @"tts-error",
        @"tts-pause",
        @"tts-resume"
    ];
}

- (void)startObserving {
    _hasListeners = YES;
}

- (void)stopObserving {
    _hasListeners = NO;
}

#pragma mark - Exported Methods

RCT_EXPORT_METHOD(speak:(NSString *)text
                  options:(NSDictionary *)options
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {

    AVSpeechUtterance *utterance = [[AVSpeechUtterance alloc] initWithString:text];

    // Generate utterance ID
    NSString *utteranceId = [NSString stringWithFormat:@"%lu", (unsigned long)utterance.hash];
    _currentUtteranceId = utteranceId;

    // Apply voice from options or default
    NSString *voiceId = options[@"voiceId"];
    if (voiceId) {
        utterance.voice = [AVSpeechSynthesisVoice voiceWithIdentifier:voiceId];
    } else if (_defaultVoice) {
        utterance.voice = _defaultVoice;
    } else {
        utterance.voice = [AVSpeechSynthesisVoice voiceWithLanguage:@"en-US"];
    }

    // Apply rate from options or default
    NSNumber *rateNum = options[@"rate"];
    if (rateNum) {
        float rate = [rateNum floatValue];
        utterance.rate = AVSpeechUtteranceMinimumSpeechRate + rate * (AVSpeechUtteranceMaximumSpeechRate - AVSpeechUtteranceMinimumSpeechRate);
    } else {
        utterance.rate = _defaultRate;
    }

    // Apply pitch from options or default
    NSNumber *pitchNum = options[@"pitch"];
    if (pitchNum) {
        utterance.pitchMultiplier = [pitchNum floatValue];
    } else {
        utterance.pitchMultiplier = _defaultPitch;
    }

    // Apply volume
    NSNumber *volumeNum = options[@"volume"];
    if (volumeNum) {
        utterance.volume = [volumeNum floatValue];
    }

    // Configure audio session
    [self configureAudioSession];

    // Speak
    [_synthesizer speakUtterance:utterance];
    resolve(utteranceId);
}

RCT_EXPORT_METHOD(stop:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    BOOL stopped = [_synthesizer stopSpeakingAtBoundary:AVSpeechBoundaryImmediate];
    resolve(@(stopped));
}

RCT_EXPORT_METHOD(pause:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    BOOL paused = [_synthesizer pauseSpeakingAtBoundary:AVSpeechBoundaryImmediate];
    resolve(@(paused));
}

RCT_EXPORT_METHOD(resume:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    BOOL resumed = [_synthesizer continueSpeaking];
    resolve(@(resumed));
}

RCT_EXPORT_METHOD(isSpeaking:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    resolve(@(_synthesizer.isSpeaking));
}

RCT_EXPORT_METHOD(getVoices:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    NSArray<AVSpeechSynthesisVoice *> *voices = [AVSpeechSynthesisVoice speechVoices];
    NSMutableArray *result = [NSMutableArray arrayWithCapacity:voices.count];

    for (AVSpeechSynthesisVoice *voice in voices) {
        NSInteger quality = 300;
        switch (voice.quality) {
            case AVSpeechSynthesisVoiceQualityEnhanced:
                quality = 500;
                break;
            case AVSpeechSynthesisVoiceQualityPremium:
                quality = 600;
                break;
            default:
                quality = 300;
                break;
        }

        [result addObject:@{
            @"id": voice.identifier,
            @"name": voice.name,
            @"language": voice.language,
            @"quality": @(quality)
        }];
    }

    resolve(result);
}

RCT_EXPORT_METHOD(setDefaultVoice:(NSString *)voiceId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    AVSpeechSynthesisVoice *voice = [AVSpeechSynthesisVoice voiceWithIdentifier:voiceId];
    if (voice) {
        _defaultVoice = voice;
        resolve(nil);
    } else {
        reject(@"not_found", [NSString stringWithFormat:@"Voice not found with id: %@", voiceId], nil);
    }
}

RCT_EXPORT_METHOD(setDefaultRate:(float)rate
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    _defaultRate = AVSpeechUtteranceMinimumSpeechRate + rate * (AVSpeechUtteranceMaximumSpeechRate - AVSpeechUtteranceMinimumSpeechRate);
    resolve(nil);
}

RCT_EXPORT_METHOD(setDefaultPitch:(float)pitch
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    _defaultPitch = pitch;
    resolve(nil);
}

RCT_EXPORT_METHOD(setDefaultLanguage:(NSString *)language
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    AVSpeechSynthesisVoice *voice = [AVSpeechSynthesisVoice voiceWithLanguage:language];
    if (voice) {
        _defaultVoice = voice;
        resolve(nil);
    } else {
        reject(@"not_found", [NSString stringWithFormat:@"Language not found: %@", language], nil);
    }
}

#pragma mark - AVSpeechSynthesizerDelegate

- (void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer didStartSpeechUtterance:(AVSpeechUtterance *)utterance {
    if (!_hasListeners) return;
    NSString *utteranceId = _currentUtteranceId ?: [NSString stringWithFormat:@"%lu", (unsigned long)utterance.hash];
    [self sendEventWithName:@"tts-start" body:@{@"utteranceId": utteranceId}];
}

- (void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer didFinishSpeechUtterance:(AVSpeechUtterance *)utterance {
    if (!_hasListeners) return;
    NSString *utteranceId = _currentUtteranceId ?: [NSString stringWithFormat:@"%lu", (unsigned long)utterance.hash];
    [self sendEventWithName:@"tts-finish" body:@{@"utteranceId": utteranceId}];
    _currentUtteranceId = nil;
}

- (void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer didCancelSpeechUtterance:(AVSpeechUtterance *)utterance {
    if (!_hasListeners) return;
    NSString *utteranceId = _currentUtteranceId ?: [NSString stringWithFormat:@"%lu", (unsigned long)utterance.hash];
    [self sendEventWithName:@"tts-cancel" body:@{@"utteranceId": utteranceId}];
    _currentUtteranceId = nil;
}

- (void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer willSpeakRangeOfSpeechString:(NSRange)characterRange utterance:(AVSpeechUtterance *)utterance {
    if (!_hasListeners) return;
    NSString *utteranceId = _currentUtteranceId ?: [NSString stringWithFormat:@"%lu", (unsigned long)utterance.hash];
    [self sendEventWithName:@"tts-progress" body:@{
        @"utteranceId": utteranceId,
        @"location": @(characterRange.location),
        @"length": @(characterRange.length)
    }];
}

- (void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer didPauseSpeechUtterance:(AVSpeechUtterance *)utterance {
    if (!_hasListeners) return;
    NSString *utteranceId = _currentUtteranceId ?: [NSString stringWithFormat:@"%lu", (unsigned long)utterance.hash];
    [self sendEventWithName:@"tts-pause" body:@{@"utteranceId": utteranceId}];
}

- (void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer didContinueSpeechUtterance:(AVSpeechUtterance *)utterance {
    if (!_hasListeners) return;
    NSString *utteranceId = _currentUtteranceId ?: [NSString stringWithFormat:@"%lu", (unsigned long)utterance.hash];
    [self sendEventWithName:@"tts-resume" body:@{@"utteranceId": utteranceId}];
}

#pragma mark - Private Helpers

- (void)configureAudioSession {
    NSError *error = nil;
    AVAudioSession *session = [AVAudioSession sharedInstance];
    [session setCategory:AVAudioSessionCategoryPlayback
                    mode:AVAudioSessionModeVoicePrompt
                 options:AVAudioSessionCategoryOptionDuckOthers
                   error:&error];
    if (error) {
        NSLog(@"NativeTTS: Failed to set audio session category: %@", error);
        return;
    }
    [session setActive:YES withOptions:AVAudioSessionSetActiveOptionNotifyOthersOnDeactivation error:&error];
    if (error) {
        NSLog(@"NativeTTS: Failed to activate audio session: %@", error);
    }
}

@end
