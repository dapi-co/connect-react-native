#import <React/RCTBridgeModule.h>
#import <UIKit/UIKit.h>
#import <React/RCTEventEmitter.h>

typedef NS_ENUM(NSInteger, RNDapiConnectTarget) {
  RNDapiConnectTargetCamera = 1,
  RNDapiConnectTargetLibrarySingleImage,
};

@interface DapiConnectManager : RCTEventEmitter <RCTBridgeModule>

@end
