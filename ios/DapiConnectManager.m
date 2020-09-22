#import "DapiConnectManager.h"
#import <React/RCTConvert.h>
#import <React/RCTUtils.h>
#import <DapiConnect/DapiConnect.h>

@interface DapiConnectManager () <DPCConnectDelegate>

@end

@implementation DapiConnectManager
{
    bool hasListeners;
}

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents {
    return @[@"EventConnectSuccessful", @"EventConnectFailure"];
}

- (void)startObserving {
    hasListeners = YES;
}

- (void)stopObserving {
    hasListeners = NO;
}

RCT_EXPORT_METHOD(newClientWithConfigurations:(NSDictionary *)configs) {
    dispatch_async(dispatch_get_main_queue(), ^{
        DPCConfigurations *configurations = [self configurationsFromDictionary:configs];
        DPCClient *client = [[DPCClient alloc] initWithConfigurations:configurations];
    });
}

RCT_EXPORT_METHOD(presentConnect) {
    dispatch_async(dispatch_get_main_queue(), ^{
        DPCClient *lastClient = [self getLastClientIfAvailable];
        DPCConnect *connect = lastClient.connect;
        if (connect) {
            connect.delegate = self;
            [connect present];
        } else {
            // TODO: We need to handle the case of not having initialized connect (it would happen in case of false positive configurations object being passed to DapiClient)
            // In this case, JS module will have a an instance of DapiClient, but DapiConnect Native SDK does NOT.
        }
    });
}

- (void)connectBeneficiaryInfoForBankWithID:(nonnull NSString *)bankID beneficiaryInfo:(nonnull void (^)(DPCBeneficiaryInfo * _Nullable))info {
    info(nil);
}

- (void)connectDidFailConnectingToBankID:(nonnull NSString *)bankID withError:(nonnull NSString *)error {
    id body = @{
        @"bankID": bankID,
        @"error": error
    };
    if (hasListeners)
        [self sendEventWithName:@"EventConnectFailure" body:body];
}

- (void)connectDidProceedWithBankID:(nonnull NSString *)bankID userID:(nonnull NSString *)userID {
    
}

- (void)connectDidSuccessfullyConnectToBankID:(nonnull NSString *)bankID userID:(nonnull NSString *)userID {
    id body = @{
        @"bankID": bankID,
        @"userID": userID
    };
    if (hasListeners)
        [self sendEventWithName:@"EventConnectSuccessful" body:body];
}


- (DPCClient *)getLastClientIfAvailable {
    DPCClient *lastClient = DPCClient.instances.lastObject;
    if (!lastClient) {
        NSLog(@"No client exists. Make sure you construct new DapiClient first");
    }
    return lastClient;
}

- (DPCConfigurations *)configurationsFromDictionary:(NSDictionary *)dictionary {
    NSString *appKey = [dictionary objectForKey:@"appKey"];
    NSString *clientUserID = [dictionary objectForKey:@"clientUserID"];
    NSString *environment = [dictionary objectForKey:@"environment"];
    NSArray<NSString *> *countries = [dictionary objectForKey:@"countries"];
    BOOL isExperimental = [[dictionary objectForKey:@"isExperimental"] boolValue];
    NSString* baseURL = [dictionary objectForKey:@"baseURL"];
    NSString *colorScheme = [dictionary objectForKey:@"colorScheme"];
    NSDictionary* overridenEndpoints = [dictionary objectForKey:@"endpoints"];
    NSDictionary* endpointExtraQueryItems = [dictionary objectForKey:@"endpointExtraQueryItems"];
    NSDictionary* endpointExtraHeaderFields = [dictionary objectForKey:@"endpointExtraHeaderFields"];
    NSDictionary* endpointExtraBody = [dictionary objectForKey:@"endpointExtraBody"];
    
    // init native objects
    NSURLComponents *urlComponents = [[NSURLComponents alloc] initWithString:baseURL];
    DPCAppEnvironment parsedEnvironment = [self parseEnvironment:environment];
    
    DPCConfigurations *configurations = [[DPCConfigurations alloc] initWithAppKey:appKey baseUrl:urlComponents countries:countries clientUserID:clientUserID];
    configurations.colorScheme = [self parseColorScheme:colorScheme];
    configurations.environment = parsedEnvironment;
    configurations.isExperimental = isExperimental;
    configurations.endpoints = [self parseEndpoints:overridenEndpoints];
    configurations.endPointExtraBody = endpointExtraBody;
    configurations.endPointExtraHeaderFields = endpointExtraHeaderFields;
    configurations.endPointExtraQueryItems = endpointExtraQueryItems;
    
    return configurations;
}

- (DPCAppEnvironment)parseEnvironment:(NSString *)environment {
    NSString *lowercasedEnv = [environment lowercaseString];
    if ([lowercasedEnv isEqualToString:@"sandbox"]) {
        return DPCAppEnvironmentSandbox;
    } else if ([lowercasedEnv isEqualToString:@"production"]) {
        return DPCAppEnvironmentProduction;
    } else {
        return nil;
    }
}

- (DPCColorScheme)parseColorScheme:(NSString *)color {
    NSString *lowercasedColor = [color lowercaseString];
    if ([lowercasedColor isEqualToString:@"neon"]) {
        return DPCColorSchemeNeon;
    } else if ([lowercasedColor isEqualToString:@"bw"]) {
        return DPCColorSchemeBW;
    } else {
        return DPCColorSchemeGeneral;
    }
}

- (NSDictionary<DPCEndPoint, NSString *> *)parseEndpoints:(NSDictionary *)endpoints {
    NSMutableDictionary<DPCEndPoint, NSString *> *result = [NSMutableDictionary dictionary];
    
    [endpoints enumerateKeysAndObjectsUsingBlock:^(id  _Nonnull key, id  _Nonnull obj, BOOL * _Nonnull stop) {
        if ([key isKindOfClass:[NSString class]] && [obj isKindOfClass:[NSString class]]) {
            NSString *k = (NSString *)key;
            NSString *v = (NSString *)obj;
            
            if (![k isEqualToString:v]) {
                DPCEndPoint endpoint = [self nativeEndpointToJSEndpoint:k];
                if (endpoint) {
                    [result setObject:v forKey:endpoint];
                }
            }
        }
    }];
    
    return result;
}

- (DPCEndPoint)nativeEndpointToJSEndpoint:(NSString *)endpoint {
    
    if ([endpoint isEqualToString:@"exchangeToken"]) {
        return DPCEndPointExchangeToken;
    } else if ([endpoint isEqualToString:@"getIdentity"]) {
        return DPCEndPointGetIdentity;
    } else if ([endpoint isEqualToString:@"getAccounts"]) {
        return DPCEndPointGetAccounts;
    } else if ([endpoint isEqualToString:@"getAccountMetadata"]) {
        return DPCEndPointGetAccountMetadata;
    } else if ([endpoint isEqualToString:@"getBalance"]) {
        return DPCEndPointGetBalance;
    } else if ([endpoint isEqualToString:@"getTransactions"]) {
        return DPCEndPointGetTransactions;
    } else if ([endpoint isEqualToString:@"getBeneficiaries"]) {
        return DPCEndPointGetBeneficiaries;
    } else if ([endpoint isEqualToString:@"createBeneficiary"]) {
        return DPCEndPointCreateBeneficiary;
    } else if ([endpoint isEqualToString:@"createTransfer"]) {
        return DPCEndPointCreateTransfer;
    } else if ([endpoint isEqualToString:@"resumeJob"]) {
        return DPCEndPointResumeJob;
    } else {
        return nil;
    }
}

@end