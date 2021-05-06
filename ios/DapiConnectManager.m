#import "DapiConnectManager.h"
#import <React/RCTConvert.h>
#import <React/RCTUtils.h>
#import <DapiConnect/DapiConnect.h>
#import <WebKit/WebKit.h>

@interface DapiConnectManager () <DPCConnectDelegate>

@property (nonatomic, assign) BOOL hasListeners;
@property (nonatomic, assign) BOOL isStarted;

@end

@implementation DapiConnectManager

// MARK: - Native Module Setup
RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[
        // connect
        @"EventConnectSuccessful",
        @"EventConnectFailure",
        @"EventDapiUIWillTransfer",
        @"EventConnectDismissed",
        @"EventConnectBankRequest",
        @"EventDapiTransferUIDismissed",
    ];
}

- (void)startObserving {
    self.hasListeners = YES;
}

- (void)stopObserving {
    self.hasListeners = NO;
}

- (DPCBankConnection *)bankConnectionForUserID:(NSString *)userID {
    __block DPCBankConnection *bankConnection;
    [Dapi.sharedInstance.getConnections enumerateObjectsUsingBlock:^(DPCBankConnection * _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
        if ([obj.userID isEqualToString:userID]) {
            *stop = YES;
            bankConnection = obj;
        }
    }];
    
    return bankConnection;
}

RCT_EXPORT_METHOD(start:(NSString *)appKey clientUserID:(NSString *)clientUserID configurations:(NSDictionary<NSString *, id> *)configs resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    
    DPCConfigurations *configurations = [self nativeConfigurations:configs];

    [Dapi startWithAppKey:appKey clientUserID:clientUserID configuration:configurations completion:^(Dapi * _Nullable dapi, NSError * _Nullable error) {
        if (dapi) {
            self.isStarted = YES;
            resolve(nil);
        } else {
            reject(@"3001", error.localizedDescription, error);
        }
    }];
}

RCT_EXPORT_METHOD(presentConnect) {
    dispatch_async(dispatch_get_main_queue(), ^{
        [Dapi.sharedInstance presentConnect:self];
    });
}

RCT_EXPORT_METHOD(dismissConnect) {
    dispatch_async(dispatch_get_main_queue(), ^{
        [Dapi.sharedInstance dismissConnect];
    });
}

RCT_EXPORT_METHOD(setClientUserID:(NSString *)clientUserID) {
    Dapi.sharedInstance.clientUserID = clientUserID;
}

RCT_EXPORT_METHOD(clientUserID:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(Dapi.sharedInstance.clientUserID);
}

RCT_EXPORT_METHOD(setConfigurations:(NSDictionary<NSString *, id> *)configs) {
    DPCConfigurations *configurations = [self nativeConfigurations:configs];
    
    Dapi.sharedInstance.configurations = configurations;
}

RCT_EXPORT_METHOD(configurations:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    NSDictionary<NSString *, id> *jsConfigurations = [self jsConfigurations:Dapi.sharedInstance.configurations];
    resolve(jsConfigurations);
}

RCT_EXPORT_METHOD(isStarted:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    resolve([NSNumber numberWithBool:self.isStarted]);
}

RCT_EXPORT_METHOD(getConnections:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    NSMutableArray *arrayObjects = [NSMutableArray array];
    
    [Dapi.sharedInstance.getConnections enumerateObjectsUsingBlock:^(DPCBankConnection * _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
        if ([obj respondsToSelector:@selector(dictionaryRepresentation)]) {
            NSDictionary<NSString *, id> *dictionaryResponse = [obj valueForKey:@"dictionaryRepresentation"];
            [arrayObjects addObject:dictionaryResponse];
        }
    }];
    
    resolve(arrayObjects);
}

RCT_EXPORT_METHOD(getIdentity:(NSString *)userID resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    DPCBankConnection *bankConnection = [self bankConnectionForUserID:userID];
    [bankConnection getIdentity:^(DPCIdentity * _Nullable identity, NSError * _Nullable error, NSString * _Nullable jobID) {
        [self respondForDictionaryRepresentableObject:identity error:error resolver:resolve rejecter:reject];
    }];
}

RCT_EXPORT_METHOD(getAccounts:(NSString *)userID resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    DPCBankConnection *bankConnection = [self bankConnectionForUserID:userID];
    [bankConnection getAccounts:^(NSArray<DPCAccount *> * _Nullable accounts, NSError * _Nullable error, NSString * _Nullable operationID) {
        [self respondForDictionaryRepresentableObject:accounts error:error resolver:resolve rejecter:reject];
    }];
}

RCT_EXPORT_METHOD(getTransactions:(NSString *)userID accountID:(NSString *)accountID startDate:(NSDate *)startDate endDate:(NSDate *)endDate resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    DPCBankConnection *bankConnection = [self bankConnectionForUserID:userID];
    __block DPCAccount *account;
    [bankConnection.accounts enumerateObjectsUsingBlock:^(DPCAccount * _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
        if ([obj.accountID isEqualToString:accountID]) {
            *stop = YES;
            account = obj;
        }
    }];
    [bankConnection getTransactionsForAccount:account fromDate:startDate toDate:endDate completion:^(NSArray<DPCTransaction *> * _Nullable transactions, NSError * _Nullable error, NSString * _Nullable operationID) {
        [self respondForDictionaryRepresentableObject:transactions error:error resolver:resolve rejecter:reject];
    }];
}

RCT_EXPORT_METHOD(delete:(NSString *)userID resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    DPCBankConnection *bankConnection = [self bankConnectionForUserID:userID];
    [bankConnection delete:^(DPCResult * _Nullable result, NSError * _Nullable error) {
        if (error) {
            reject(@"1012", error.localizedDescription, error);
        } else {
            resolve(nil);
        }
    }];
}

RCT_EXPORT_METHOD(getBeneficiaries:(NSString *)userID resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    DPCBankConnection *bankConnection = [self bankConnectionForUserID:userID];
    [bankConnection getBeneficiaries:^(NSArray<DPCBankBeneficiary *> * _Nullable beneficiaries, NSError * _Nullable error, NSString * _Nullable operationID) {
        [self respondForDictionaryRepresentableObject:beneficiaries error:error resolver:resolve rejecter:reject];
    }];
}

RCT_EXPORT_METHOD(createBeneficiary:(NSString *)userID beneficiary:(NSDictionary<NSString *, id> *)beneficiary resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        DPCBankConnection *bankConnection = [self bankConnectionForUserID:userID];
        DPCBeneficiary *nativeBeneficiary = [self nativeBeneficiaryInfoFromDictionary:beneficiary];
        [bankConnection createBeneficiary:nativeBeneficiary completion:^(DPCResult * _Nullable result, NSError * _Nullable error, NSString * _Nullable operationID) {
            [self respondForDictionaryRepresentableObject:result error:error resolver:resolve rejecter:reject];
        }];
    });
}

RCT_EXPORT_METHOD(getAccountsMetadata:(NSString *)userID resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    DPCBankConnection *bankConnection = [self bankConnectionForUserID:userID];
    [bankConnection getAccountMetadata:^(DPCBankMetadata * _Nullable accounts, NSError * _Nullable error, NSString * _Nullable operationID) {
        [self respondForDictionaryRepresentableObject:accounts error:error resolver:resolve rejecter:reject];
    }];
}

RCT_EXPORT_METHOD(createTransferToExistingBeneficiary:(NSString *)userID accountID:(NSString *)accountID receiverID:(NSString *)receiverID amount:(double)amount remark:(NSString *)remark resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        DPCBankConnection *bankConnection = [self bankConnectionForUserID:userID];
        __block DPCAccount *account;
        [bankConnection.accounts enumerateObjectsUsingBlock:^(DPCAccount * _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
            if ([obj.accountID isEqualToString:accountID]) {
                *stop = YES;
                account = obj;
            }
        }];
        
        [bankConnection createTransferToExistingBeneficiaryFromAccount:account beneficiaryID:receiverID amount:amount remark:remark completion:^(DPCAccount * _Nullable account, double amount, NSError * _Nullable error, NSString * _Nullable operationID) {
            if (error) {
                if (@available(iOS 8.0, *)) {
                    if ([error.description containsString:@"User canceled account selection"]) {
                        [self emitAccountSelectionCanceledEvent];
                    }
                }
                reject(@"1012", error.localizedDescription, error);
            } else {
                resolve(@{
                    @"account": account.accountID ?: [NSNull null],
                    @"amount": [NSNumber numberWithDouble:amount]
                        });
            }

        }];
    });
}

RCT_EXPORT_METHOD(createTransfer:(NSString *)userID accountID:(NSString *)accountID beneficiary:(NSDictionary<NSString *, id> *)beneficiary amount:(double)amount remark:(NSString *)remark resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        DPCBankConnection *bankConnection = [self bankConnectionForUserID:userID];
        __block DPCAccount *account;
        [bankConnection.accounts enumerateObjectsUsingBlock:^(DPCAccount * _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
            if ([obj.accountID isEqualToString:accountID]) {
                *stop = YES;
                account = obj;
            }
        }];
        DPCBeneficiary *nativeBeneficiary = [self nativeBeneficiaryInfoFromDictionary:beneficiary];
        [bankConnection createTransferFromAccount:account toBeneficiary:nativeBeneficiary amount:amount remark:remark completion:^(DPCAccount * _Nullable account, double amount, NSError * _Nullable error, NSString * _Nullable operationID) {
            if (error) {
                if (@available(iOS 8.0, *)) {
                    if ([error.description containsString:@"User canceled account selection"]) {
                        [self emitAccountSelectionCanceledEvent];
                    }
                }
                reject(@"1012", error.localizedDescription, error);
            } else {
                resolve(@{
                    @"account": account.accountID ?: [NSNull null],
                    @"amount": [NSNumber numberWithDouble:amount]
                        });
            }
        }];
    });
}


- (void)connectDidFailConnectingToBankID:(nonnull NSString *)bankID withError:(nonnull NSString *)error {
    id body = @{
        @"bankID": bankID,
        @"error": error
    };
    if (self.hasListeners)
        [self sendEventWithName:self.supportedEvents[1] body:body];
}

- (void)connectDidSuccessfullyConnectToBankID:(nonnull NSString *)bankID connection:(nonnull DPCBankConnection *)connection {
        
    NSDictionary<NSString *, id> *connectionDictionary;
    if ([connection respondsToSelector:@selector(dictionaryRepresentation)]) {
        connectionDictionary = [connection valueForKey:@"dictionaryRepresentation"];
    }

    id body = @{
        @"bankID": bankID,
        @"connection": connectionDictionary ?: [NSNull null]
    };

    if (self.hasListeners)
        [self sendEventWithName:self.supportedEvents[0] body:body];
}

- (void)connectDidRequestBank:(NSString *)bankName iban:(NSString *)iban {
    id body = @{
        @"bankName": bankName ?: [NSNull null],
        @"iban": iban ?: [NSNull null]
    };
    if (self.hasListeners)
        [self sendEventWithName:self.supportedEvents[4] body:body];
}

- (void)connectDidDismiss {
    if (self.hasListeners)
        [self sendEventWithName:self.supportedEvents[3] body:nil];
}

// MARK: - Helper Methods
- (void)respondForDictionaryRepresentableObject:(NSObject *)object error:(NSError *)error resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject{
    
    if (error) {
        reject(@"1011", error.localizedDescription, error);
    } else if ([object isKindOfClass:[NSArray class]]) {
        NSArray *arrayObjects = (NSArray *)object;
        
        [arrayObjects enumerateObjectsUsingBlock:^(id  _Nonnull element, NSUInteger idx, BOOL * _Nonnull stop) {
            if ([element respondsToSelector:@selector(dictionaryRepresentation)]) {
                NSDictionary<NSString *, id> *dictionaryResponse = [element valueForKey:@"dictionaryRepresentation"];
                resolve(dictionaryResponse);
                *stop = YES;
            } else {
                NSError *error = [NSError errorWithDomain:@"com.dapi.dapiconnect.reactnative" code:1012 userInfo:@{NSLocalizedDescriptionKey: @"Couldn't construct JSON representation of native array objects"}];
                reject(@"1012", error.localizedDescription, error);
                *stop = YES;
            }
        }];
    } else {
        if ([object respondsToSelector:@selector(dictionaryRepresentation)]) {
            NSDictionary<NSString *, id> *dictionaryResponse = [object valueForKey:@"dictionaryRepresentation"];
            resolve(dictionaryResponse);
        } else {
            NSError *castingError = [NSError errorWithDomain:@"com.dapi.dapiconnect.reactnative" code:1012 userInfo:@{NSLocalizedDescriptionKey: @"Couldn't construct JSON representation of native array objects"}];
            reject(@"1012", castingError.localizedDescription, castingError);
        }
    }
}

// MARK: - Helper Methods

- (void)emitAccountSelectionCanceledEvent {
    if (self.hasListeners)
        [self sendEventWithName:self.supportedEvents[5] body:nil];
}

- (DPCConfigurations *)nativeConfigurations:(NSDictionary<NSString *, id> *)configs {
    NSArray *countries = [configs objectForKey:@"countries"];
    NSString *environment = [configs objectForKey:@"environment"];
    
    DPCConfigurations *configurations = [[DPCConfigurations alloc] initWithCountries:countries environment:environment];
    
    NSDictionary<NSString *, NSDictionary<NSString *, NSString *> *> *endPointExtraHeaderFields = [configs objectForKey:@"endPointExtraHeaderFields"];
    NSDictionary<NSString *, NSDictionary<NSString *, id> *> *endPointExtraBody = [configs objectForKey:@"endPointExtraBody"];
    NSDictionary<NSString *, NSString *> *endpoints = [configs objectForKey:@"endpoints"];

    configurations.endPointExtraHeaderFields = endPointExtraHeaderFields;
    configurations.endPointExtraBody = endPointExtraBody;
    configurations.endpoints = endpoints;
    NSNumber *showCloseButton = [configs objectForKey:@"showCloseButton"];
    NSNumber *showLogos = [configs objectForKey:@"showLogos"];
    NSNumber *showAddButton = [configs objectForKey:@"showAddButton"];
    
    if (showCloseButton != nil) {
        configurations.showCloseButton = showCloseButton.boolValue;
    }
    
    if (showLogos != nil) {
        configurations.showLogos = showLogos.boolValue;
    }
    
    if (showAddButton != nil) {
        configurations.showAddAccountButton = showAddButton.boolValue;
    }

    return configurations;
}

- (NSDictionary<NSString *, id> *)jsConfigurations:(DPCConfigurations *)configs {
    return @{
        @"countries": configs.countries ?: [NSNull null],
        @"environment": configs.environment ?: [NSNull null],
        @"endpoints": configs.endpoints ?: [NSNull null],
        @"endPointExtraQueryItems": configs.endPointExtraQueryItems ?: [NSNull null],
        @"endPointExtraHeaderFields": configs.endPointExtraHeaderFields ?: [NSNull null],
        @"endPointExtraBody": configs.endPointExtraBody ?: [NSNull null],
        @"showCloseButton": [NSNumber numberWithBool:configs.showCloseButton],
        @"showLogos": [NSNumber numberWithBool:configs.showCloseButton],
        @"showAddButton": [NSNumber numberWithBool:configs.showAddAccountButton],
    };
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
    } else if ([endpoint isEqualToString:@"getTransactions"]) {
        return DPCEndPointGetTransactions;
    } else if ([endpoint isEqualToString:@"createTransfer"]) {
        return DPCEndPointCreateTransfer;
    } else if ([endpoint isEqualToString:@"resumeJob"]) {
        return DPCEndPointResumeJob;
    } else {
        return nil;
    }
}

- (DPCBeneficiary *)nativeBeneficiaryInfoFromDictionary:(NSDictionary<NSString *,id> *)beneficiaryInfoDictionary {
    DPCBeneficiary *beneficiary = [[DPCBeneficiary alloc] init];
    NSDictionary<NSString *, id> *lineAddressDictionary = [beneficiaryInfoDictionary objectForKey:@"address"];
    beneficiary.linesAddress = [[DPCLinesAddress alloc] initWithDictionary:lineAddressDictionary];
    beneficiary.accountNumber = [beneficiaryInfoDictionary objectForKey:@"accountNumber"];
    beneficiary.name = [beneficiaryInfoDictionary objectForKey:@"name"];
    beneficiary.bankName = [beneficiaryInfoDictionary objectForKey:@"bankName"];
    beneficiary.swiftCode = [beneficiaryInfoDictionary objectForKey:@"swiftCode"];
    beneficiary.iban = [beneficiaryInfoDictionary objectForKey:@"iban"];
    beneficiary.phoneNumber = [beneficiaryInfoDictionary objectForKey:@"phoneNumber"];
    beneficiary.country = [beneficiaryInfoDictionary objectForKey:@"country"];
    beneficiary.branchAddress = [beneficiaryInfoDictionary objectForKey:@"branchAddress"];
    beneficiary.branchName = [beneficiaryInfoDictionary objectForKey:@"branchName"];
    return beneficiary;
}

@end