#import "DapiConnectManager.h"
#import <React/RCTConvert.h>
#import <React/RCTUtils.h>
#import <DapiConnect/DapiConnect.h>
#import <WebKit/WebKit.h>

@interface DapiConnectManager () <DPCConnectDelegate>

@property (nonatomic, assign) BOOL hasListeners;

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
        @"EventAutoFlowWillTransfer",
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
    [Dapi startWithAppKey:appKey clientUserID:clientUserID completion:^(Dapi * _Nullable dapi, NSError * _Nullable error) {
        if (dapi) {
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

RCT_EXPORT_METHOD(clientUserID:(NSString *)clientUserID resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(Dapi.sharedInstance.clientUserID);
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

RCT_EXPORT_METHOD(getAccountsMetadata:(NSString *)userID resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    DPCBankConnection *bankConnection = [self bankConnectionForUserID:userID];
    [bankConnection getAccountMetadata:^(DPCBankMetadata * _Nullable accounts, NSError * _Nullable error, NSString * _Nullable operationID) {
        [self respondForDictionaryRepresentableObject:accounts error:error resolver:resolve rejecter:reject];
    }];
}

RCT_EXPORT_METHOD(createTransfer:(NSString *)userID accountID:(NSString *)accountID beneficiary:(NSDictionary<NSString *, id> *)beneficiary amount:(NSUInteger)amount remark:(NSString *)remark resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    DPCBankConnection *bankConnection = [self bankConnectionForUserID:userID];
    __block DPCAccount *account;
    [bankConnection.accounts enumerateObjectsUsingBlock:^(DPCAccount * _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
        if ([obj.accountID isEqualToString:accountID]) {
            *stop = YES;
            account = obj;
        }
    }];
    DPCBeneficiary *nativeBeneficiary = [self nativeBeneficiaryInfoFromDictionary:beneficiary];
    [bankConnection createTransferFromAccount:account toBeneficiary:nativeBeneficiary amount:amount remark:remark completion:^(DPCAccount * _Nullable account, NSUInteger amount, NSError * _Nullable error, NSString * _Nullable operationID) {
        if (error) {
            reject(@"1012", error.localizedDescription, error);
        } else {
            NSDictionary *accountDictionary;
            if ([account respondsToSelector:@selector(dictionaryRepresentation)]) {
                accountDictionary = [accountDictionary valueForKey:@"dictionaryRepresentation"];
            }
            resolve(@{
                @"account": accountDictionary ?: [NSNull null],
                @"amount": [NSNumber numberWithUnsignedInteger:amount]
                    });
        }
    }];
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
        id body = @{
        @"bankID": bankID,
        @"userID": connection.userID
    };
    if (self.hasListeners)
        [self sendEventWithName:self.supportedEvents[0] body:body];
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