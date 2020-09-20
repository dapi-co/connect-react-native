#import "DapiConnectManager.h"
#import <React/RCTConvert.h>
#import <React/RCTUtils.h>
#import <DapiConnect/DapiConnect.h>

@interface DapiConnectManager ()

@end

@implementation DapiConnectManager

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(show:(NSString *)text) {
    dispatch_async(dispatch_get_main_queue(), ^{
        DPCConfigurations *configs = [[DPCConfigurations alloc] initWithAppKey:@"" baseUrl:[[NSURLComponents alloc] initWithString:@"http://localhost:4561"] countries:@[@"AE"] clientUserID:@"Ennabah"];
        configs.environment = DPCAppEnvironmentSandbox;
        DPCClient *client = [[DPCClient alloc] initWithConfigurations:configs];
        [client.autoFlow present];
    });
}

@end
