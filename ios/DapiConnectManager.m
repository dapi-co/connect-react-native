#import "DapiConnectManager.h"
#import <React/RCTConvert.h>
#import <React/RCTUtils.h>

@interface DapiConnectManager ()

@end

@implementation DapiConnectManager

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(show:(NSString *)text) {
    dispatch_async(dispatch_get_main_queue(), ^{
        UIAlertController *alertController = [UIAlertController alertControllerWithTitle:text message:text preferredStyle:UIAlertControllerStyleAlert];
        UIAlertAction *action = [UIAlertAction actionWithTitle:@"Ok" style:UIAlertActionStyleDefault handler:nil];
        [alertController addAction:action];
        UIViewController *root = RCTPresentedViewController();
        [root presentViewController:alertController animated:YES completion:nil];
    });
}

@end
