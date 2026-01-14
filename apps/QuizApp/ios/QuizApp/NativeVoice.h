#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <Speech/Speech.h>
#import <AVFoundation/AVFoundation.h>

@interface NativeVoice : RCTEventEmitter <RCTBridgeModule, SFSpeechRecognizerDelegate>

@end
