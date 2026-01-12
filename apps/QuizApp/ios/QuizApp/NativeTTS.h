#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <AVFoundation/AVFoundation.h>

@interface NativeTTS : RCTEventEmitter <RCTBridgeModule, AVSpeechSynthesizerDelegate>

@end
