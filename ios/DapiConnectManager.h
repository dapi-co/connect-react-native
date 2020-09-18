#import <React/RCTBridgeModule.h>
#import <UIKit/UIKit.h>

typedef NS_ENUM(NSInteger, RNDapiConnectTarget) {
  RNDapiConnectTargetCamera = 1,
  RNDapiConnectTargetLibrarySingleImage,
};

@interface DapiConnectManager : NSObject <RCTBridgeModule>

@end
