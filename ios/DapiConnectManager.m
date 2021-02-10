#import "DapiConnectManager.h"
#import <React/RCTConvert.h>
#import <React/RCTUtils.h>
#import <DapiConnect/DapiConnect.h>
#import <WebKit/WebKit.h>

@interface DapiConnectManager () <DPCConnectDelegate, DPCAutoFlowDelegate>

@property (nonatomic, assign) BOOL hasListeners;
@property (nonatomic, strong) WKWebView *webView;
@property (nonatomic, copy) NSString *connectBeneficiaryInfoCallback;
@property (nonatomic, copy) NSString *autoFlowBeneficiaryInfoCallback;

@end

@implementation DapiConnectManager

// MARK: - Native Module Setup
RCT_EXPORT_MODULE();

- (instancetype)init
{
    self = [super init];
    if (self) {
        self.webView = [[WKWebView alloc] init];
    }
    return self;
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[
        // connect
        @"EventConnectSuccessful",
        @"EventConnectFailure",
        // autoflow
        @"EventAutoFlowSuccessful",
        @"EventAutoFlowFailure",
        @"EventAutoFlowWillTransfer",
    ];
}

- (void)startObserving {
    self.hasListeners = YES;
}

- (void)stopObserving {
    self.hasListeners = NO;
}

// MARK: - Client
RCT_EXPORT_METHOD(newClientWithConfigurations:(NSDictionary *)configs) {
    dispatch_async(dispatch_get_main_queue(), ^{
        DPCClient * __unused client = [self getClientWithConfigurations:configs];
    });
}

RCT_EXPORT_METHOD(setUserID:(NSString *)userID configurations:(NSDictionary *)configs) {
    dispatch_async(dispatch_get_main_queue(), ^{
        DPCClient * __unused client = [self getClientWithConfigurations:configs];
        client.userID = userID;
    });
}

RCT_EXPORT_METHOD(userID:(NSDictionary *)configs callback:(RCTResponseSenderBlock)callback) {
    dispatch_async(dispatch_get_main_queue(), ^{
        DPCClient * __unused client = [self getClientWithConfigurations:configs];
        callback(@[[NSNull null], client.userID]);
    });
}

RCT_EXPORT_METHOD(setClientUserID:(NSString *)clientUserID configurations:(NSDictionary *)configs) {
    dispatch_async(dispatch_get_main_queue(), ^{
        DPCClient * __unused client = [self getClientWithConfigurations:configs];
        client.configurations.clientUserID = clientUserID;
    });
}

RCT_EXPORT_METHOD(clientUserID:(NSDictionary *)configs callback:(RCTResponseSenderBlock)callback) {
    dispatch_async(dispatch_get_main_queue(), ^{
        DPCClient * __unused client = [self getClientWithConfigurations:configs];
        callback(@[[NSNull null], client.configurations.clientUserID]);
    });
}

// MARK: - Connect
RCT_EXPORT_METHOD(presentConnect:(NSString *)beneficiaryCallback configurations:(NSDictionary *)configurations) {
    dispatch_async(dispatch_get_main_queue(), ^{
        
        if (!beneficiaryCallback || [beneficiaryCallback isEqualToString:@""]) {
            if (self.hasListeners) {
                id body = @{
                    @"bankID": [NSNull null],
                    @"error": @"Missing beneficiaryInfoCallback"
                };
                [self sendEventWithName:@"EventConnectFailure" body:body];
            }
            return;
        }
        
        DPCClient *client = [self getClientWithConfigurations:configurations];
        DPCConnect *connect = client.connect;
        connect.delegate = self;
        
        if (connect) {
            self.connectBeneficiaryInfoCallback = beneficiaryCallback;
            [connect present];
        } else {
            // TODO: We need to handle the case of not having initialized connect (it would happen in case of false positive configurations object being passed to DapiClient)
            // In this case, JS module will have a an instance of DapiClient, but DapiConnect Native SDK does NOT.
        }
    });
}

RCT_EXPORT_METHOD(dismissConnect:(NSDictionary *)configurations) {
    dispatch_async(dispatch_get_main_queue(), ^{
        DPCClient *client = [self getClientWithConfigurations:configurations];
        DPCConnect *connect = client.connect;
        [connect dismissWithCompletion:nil];
    });
}

RCT_EXPORT_METHOD(getConnections:(NSDictionary *)configurations callback:(RCTResponseSenderBlock)callback) {
    dispatch_async(dispatch_get_main_queue(), ^{
        DPCClient *client = [self getClientWithConfigurations:configurations];
        DPCConnect *connect = client.connect;
        
        if (connect) {
            NSArray<DPCConnectionDetails *> *connectionDetails = [connect getConnections];
            NSMutableArray<NSDictionary<NSString *, id> *> *connections = [NSMutableArray array];
            [connectionDetails enumerateObjectsUsingBlock:^(DPCConnectionDetails * _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
                NSMutableDictionary *connection = @{
                    @"userID": obj.userID,
                    @"clientUserID": obj.clientUserID,
                    @"bankID": obj.bankID,
                    @"bankName": obj.bankName,
                    @"beneficiaryCoolDownPeriod": [NSNumber numberWithDouble:obj.beneficiaryCoolDownPeriod],
                    @"countryName": obj.countryName,
                    @"isCreateBeneficiaryEndpointRequired": [NSNumber numberWithDouble:obj.isCreateBeneficiaryEndpointRequired],
                }.mutableCopy;
                
                NSMutableArray<NSDictionary<NSString *, id> *> *accounts = [NSMutableArray array];
                [obj.accounts enumerateObjectsUsingBlock:^(DPCAccount * _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
                    NSDictionary *account = @{
                        @"iban": obj.iban,
                        @"number": obj.number,
                        @"currency": obj.currency,
                        @"type": obj.type,
                        @"name": obj.name,
                        @"id": obj.accountID,
                        @"isFavourite": [NSNumber numberWithDouble:obj.isFavourite],
                    };
                    
                    [accounts addObject:account];
                }];
                
                [connection setObject:accounts forKey:@"accounts"];
                
                [connections addObject:connection];
            }];
            
            callback(@[[NSNull null], connections]);
        } else {
            NSString *error = @"Couldn't find an initialized connect, make sure you have successfully initialized DapiClient";
            callback(@[error, [NSNull null]]);
        }
        
    });
}

// MARK: - Connect Delegate
- (void)connectBeneficiaryInfoForBankWithID:(nonnull NSString *)bankID beneficiaryInfo:(nonnull void (^)(DPCBeneficiaryInfo * _Nullable))info {
    NSMutableString *mutableCallback = self.connectBeneficiaryInfoCallback.mutableCopy;
    [mutableCallback appendFormat:@"(`%@`)", bankID];
    NSString *callback = mutableCallback;
    [self.webView evaluateJavaScript:callback completionHandler:^(id beneficiaryInfoJsonObject, NSError *iifeError) {
        BOOL isObject = [beneficiaryInfoJsonObject isKindOfClass:[NSDictionary class]];
        if (isObject) {
            NSDictionary<NSString *, id> *beneficiaryInfoDictionary = (NSDictionary *)beneficiaryInfoJsonObject;
            DPCBeneficiaryInfo * beneficiaryInfo = [self nativeBeneficiaryInfoFromDictionary:beneficiaryInfoDictionary];
            info(beneficiaryInfo);
        } else {
            info(nil);
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

- (void)connectDidProceedWithBankID:(nonnull NSString *)bankID userID:(nonnull NSString *)userID {
    
}

- (void)connectDidSuccessfullyConnectToBankID:(nonnull NSString *)bankID userID:(nonnull NSString *)userID {
    id body = @{
        @"bankID": bankID,
        @"userID": userID
    };
    if (self.hasListeners)
        [self sendEventWithName:self.supportedEvents[0] body:body];
}


// MARK: - AutoFlow
RCT_EXPORT_METHOD(presentAutoFlow:(NSString *)beneficiaryCallback configurations:(NSDictionary *)configurations) {
    dispatch_async(dispatch_get_main_queue(), ^{
        
        if (!beneficiaryCallback || [beneficiaryCallback isEqualToString:@""]) {
            if (self.hasListeners) {
                id body = @{
                    @"bankID": [NSNull null],
                    @"error": @"Missing beneficiaryInfoCallback"
                };
                [self sendEventWithName:self.supportedEvents[3] body:body];
            }
            return;
        }
        
        DPCClient *client = [self getClientWithConfigurations:configurations];
        DPCAutoFlow *autoFlow = client.autoFlow;
        autoFlow.autoflowDelegate = self;
        autoFlow.connectDelegate = self;
        
        if (autoFlow) {
            self.autoFlowBeneficiaryInfoCallback = beneficiaryCallback;
            [autoFlow present];
        } else {
            // TODO: We need to handle the case of not having initialized connect (it would happen in case of false positive configurations object being passed to DapiClient)
            // In this case, JS module will have a an instance of DapiClient, but DapiConnect Native SDK does NOT.
        }
    });
}

RCT_EXPORT_METHOD(dismissAutoFlow:(NSDictionary *)configurations) {
    dispatch_async(dispatch_get_main_queue(), ^{
        DPCClient *client = [self getClientWithConfigurations:configurations];
        DPCAutoFlow *autoFlow = client.autoFlow;
        [autoFlow dismissWithCompletion:nil];
    });
}

// MARK: - AutoFlow Delegate
- (void)autoFlow:(nonnull DPCAutoFlow *)autoFlow beneficiaryInfoForBankWithID:(nonnull NSString *)bankID beneficiaryInfo:(nonnull void (^)(DPCBeneficiaryInfo * _Nullable))info {
    NSMutableString *mutableCallback = self.autoFlowBeneficiaryInfoCallback.mutableCopy;
    [mutableCallback appendFormat:@"(`%@`)", bankID];
    NSString *callback = mutableCallback;
    [self.webView evaluateJavaScript:callback completionHandler:^(id beneficiaryInfoJsonObject, NSError *iifeError) {
        BOOL isObject = [beneficiaryInfoJsonObject isKindOfClass:[NSDictionary class]];
        if (isObject) {
            NSDictionary<NSString *, id> *beneficiaryInfoDictionary = (NSDictionary *)beneficiaryInfoJsonObject;
            DPCBeneficiaryInfo * beneficiaryInfo = [self nativeBeneficiaryInfoFromDictionary:beneficiaryInfoDictionary];
            info(beneficiaryInfo);
        } else {
            info(nil);
        }
    }];
}

- (void)autoFlow:(DPCAutoFlow *)autoFlow didFailToTransferFromAccount:(DPCAccount *)senderAccount toAccuntID:(NSString *)recipientAccountID withError:(NSError *)error {
    id body = @{
        @"error": error.localizedDescription,
        @"senderAccountID": senderAccount.accountID,
        @"receiverID": recipientAccountID,
    };
    if (self.hasListeners)
        [self sendEventWithName:self.supportedEvents[3] body:body];
}

- (void)autoFlow:(DPCAutoFlow *)autoFlow didSuccessfullyTransferAmount:(NSUInteger)amount fromAccount:(DPCAccount *)senderAccount toAccuntID:(NSString *)recipientAccountID {
    id body = @{
        @"amount": [NSNumber numberWithDouble:amount],
        @"senderAccountID": senderAccount.accountID,
        @"receiverID": recipientAccountID,
    };
    if (self.hasListeners)
        [self sendEventWithName:self.supportedEvents[2] body:body];
}

- (void)autoFlow:(DPCAutoFlow *)autoFlow willTransferAmount:(NSUInteger)amount fromAccount:(DPCAccount *)senderAccount {
    id body = @{
        @"amount": [NSNumber numberWithDouble:amount],
        @"senderAccountID": senderAccount.accountID,
    };
    if (self.hasListeners)
        [self sendEventWithName:self.supportedEvents[4] body:body];
}

// MARK: - Data
RCT_EXPORT_METHOD(getIdentity:(NSDictionary *)configurations resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        DPCClient *client = [self getClientWithConfigurations:configurations];
        DPCData *data = client.data;
        if (data) {
            [data getIdentity:^(DPCIdentity * _Nullable identity, NSError * _Nullable error, NSString * _Nullable jobID) {
                [self respondForDictionaryRepresentableObject:identity error:error resolver:resolve rejecter:reject];
            }];
        } else {
            NSError *castingError = [NSError errorWithDomain:@"com.dapi.dapiconnect.reactnative" code:1012 userInfo:@{NSLocalizedDescriptionKey: @"Couldn't find an initialized data, make sure you have successfully initialized DapiClient"}];
            reject(@"1015", castingError.localizedDescription, castingError);
        }
    });
}

RCT_EXPORT_METHOD(getAccounts:(NSDictionary *)configurations resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    DPCClient *client = [self getClientWithConfigurations:configurations];
    DPCData *data = client.data;
    if (data) {
        [data getAccounts:^(NSArray<DPCAccount *> * _Nullable accounts, NSError * _Nullable error, NSString * _Nullable jobID) {
            [self respondForDictionaryRepresentableObject:accounts error:error resolver:resolve rejecter:reject];
        }];
    } else {
        NSError *castingError = [NSError errorWithDomain:@"com.dapi.dapiconnect.reactnative" code:1012 userInfo:@{NSLocalizedDescriptionKey: @"Couldn't find an initialized data, make sure you have successfully initialized DapiClient"}];
        reject(@"1015", castingError.localizedDescription, castingError);
    }
}

RCT_EXPORT_METHOD(getBalance:(NSString *)accountID configurations:(NSDictionary *)configurations resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    DPCClient *client = [self getClientWithConfigurations:configurations];
    DPCData *data = client.data;
    if (data) {
        [data getBalanceForAccountID:accountID completion:^(DPCBalance * _Nullable balance, NSError * _Nullable error, NSString * _Nullable jobID) {
            [self respondForDictionaryRepresentableObject:balance error:error resolver:resolve rejecter:reject];
        }];
    } else {
        NSError *castingError = [NSError errorWithDomain:@"com.dapi.dapiconnect.reactnative" code:1012 userInfo:@{NSLocalizedDescriptionKey: @"Couldn't find an initialized data, make sure you have successfully initialized DapiClient"}];
        reject(@"1015", castingError.localizedDescription, castingError);
    }
}

RCT_EXPORT_METHOD(getTransactions:(NSString *)accountID startDate:(NSDate *)startDate endDate:(NSDate *)endDate configurations:(NSDictionary *)configurations resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    DPCClient *client = [self getClientWithConfigurations:configurations];
    DPCData *data = client.data;
    if (data) {
        [data getTransactionsForAccountID:accountID fromDate:startDate toDate:endDate completion:^(NSArray<DPCTransaction *> * _Nullable transactions, NSError * _Nullable error, NSString * _Nullable jobID) {
            [self respondForDictionaryRepresentableObject:transactions error:error resolver:resolve rejecter:reject];
        }];
    } else {
        NSError *castingError = [NSError errorWithDomain:@"com.dapi.dapiconnect.reactnative" code:1012 userInfo:@{NSLocalizedDescriptionKey: @"Couldn't find an initialized data, make sure you have successfully initialized DapiClient"}];
        reject(@"1015", castingError.localizedDescription, castingError);
    }
}

// MARK:- Auth
RCT_EXPORT_METHOD(delinkUser:(NSDictionary *)configurations resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    DPCClient *client = [self getClientWithConfigurations:configurations];
    DPCAuth *auth = client.auth;
    if (auth) {
        [auth delinkUser:^(DPCResult * _Nullable result, NSError * _Nullable error) {
            [self respondForDictionaryRepresentableObject:result error:error resolver:resolve rejecter:reject];
        }];
    } else {
        NSError *castingError = [NSError errorWithDomain:@"com.dapi.dapiconnect.reactnative" code:1012 userInfo:@{NSLocalizedDescriptionKey: @"Couldn't find an initialized auth, make sure you have successfully initialized DapiClient"}];
        reject(@"1015", castingError.localizedDescription, castingError);
    }
}

// MARK:- Metadata
RCT_EXPORT_METHOD(getAccountsMetadata:(NSDictionary *)configurations resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    DPCClient *client = [self getClientWithConfigurations:configurations];
    DPCMetadata *metadata = client.metadata;
    if (metadata) {
        [metadata getAccountMetadata:^(DPCBankMetadata * _Nullable accounts, NSError * _Nullable error, NSString * _Nullable jobID) {
            [self respondForDictionaryRepresentableObject:accounts error:error resolver:resolve rejecter:reject];
        }];
    } else {
        NSError *castingError = [NSError errorWithDomain:@"com.dapi.dapiconnect.reactnative" code:1012 userInfo:@{NSLocalizedDescriptionKey: @"Couldn't find an initialized metadata, make sure you have successfully initialized DapiClient"}];
        reject(@"1015", castingError.localizedDescription, castingError);
    }
}

// MARK:- Payment
RCT_EXPORT_METHOD(getBeneficiaries:(NSDictionary *)configurations resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    DPCClient *client = [self getClientWithConfigurations:configurations];
    DPCPayment *payment = client.payment;
    if (payment) {
        [payment getBeneficiaries:^(NSArray<DPCBeneficiary *> * _Nullable beneficiaries, NSError * _Nullable error, NSString * _Nullable jobID) {
            [self respondForDictionaryRepresentableObject:beneficiaries error:error resolver:resolve rejecter:reject];
        }];
    } else {
        NSError *castingError = [NSError errorWithDomain:@"com.dapi.dapiconnect.reactnative" code:1012 userInfo:@{NSLocalizedDescriptionKey: @"Couldn't find an initialized payment, make sure you have successfully initialized DapiClient"}];
        reject(@"1012", castingError.localizedDescription, castingError);
    }
}

RCT_EXPORT_METHOD(createBeneficiary:(NSDictionary *)createBeneficiaryRequest configurations:(NSDictionary *)configurations resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    DPCClient *client = [self getClientWithConfigurations:configurations];
    DPCPayment *payment = client.payment;
    if (payment) {
        DPCBeneficiaryInfo *beneficiaryInfo = [self nativeBeneficiaryInfoFromDictionary:createBeneficiaryRequest];
        if (beneficiaryInfo) {
            [payment createBeneficiaryWithInfo:beneficiaryInfo completion:^(DPCResult * _Nullable result, NSError * _Nullable error, NSString * _Nullable jobID) {
                [self respondForDictionaryRepresentableObject:beneficiaryInfo error:error resolver:resolve rejecter:reject];
            }];
        } else {
            NSError *castingError = [NSError errorWithDomain:@"com.dapi.dapiconnect.reactnative" code:1017 userInfo:@{NSLocalizedDescriptionKey: @"Couldn't construct beneficiary object from passed object"}];
            reject(@"1017", castingError.localizedDescription, castingError);
        }
    } else {
        NSError *castingError = [NSError errorWithDomain:@"com.dapi.dapiconnect.reactnative" code:1012 userInfo:@{NSLocalizedDescriptionKey: @"Couldn't find an initialized payment, make sure you have successfully initialized DapiClient"}];
        reject(@"1012", castingError.localizedDescription, castingError);
    }
}

RCT_EXPORT_METHOD(createTransferToIban:(NSString *)iban name:(NSString *)name senderID:(NSString *)senderID amount:(nonnull NSNumber *)amount remark:(NSString *)remark configurations:(NSDictionary *)configurations resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    DPCClient *client = [self getClientWithConfigurations:configurations];
    DPCPayment *payment = client.payment;
    if (payment) {
        [payment createTransferWithSenderID:senderID amount:amount iban:iban name:name completion:^(DPCResult * _Nullable result, NSError * _Nullable error, NSString * _Nullable jobID) {
            [self respondForDictionaryRepresentableObject:result error:error resolver:resolve rejecter:reject];
        }];
    } else {
        NSError *castingError = [NSError errorWithDomain:@"com.dapi.dapiconnect.reactnative" code:1012 userInfo:@{NSLocalizedDescriptionKey: @"Couldn't find an initialized payment, make sure you have successfully initialized DapiClient"}];
        reject(@"1012", castingError.localizedDescription, castingError);
    }
}

RCT_EXPORT_METHOD(createTransferToReceiverID:(NSString *)receiverID senderID:(NSString *)senderID amount:(nonnull NSNumber *)amount remark:(NSString *)remark configurations:(NSDictionary *)configurations resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    DPCClient *client = [self getClientWithConfigurations:configurations];
    DPCPayment *payment = client.payment;
    if (payment) {
        [payment createTransferWithSenderID:senderID amount:amount toReceiverID:receiverID completion:^(DPCResult * _Nullable result, NSError * _Nullable error, NSString * _Nullable jobID) {
            [self respondForDictionaryRepresentableObject:result error:error resolver:resolve rejecter:reject];
        }];
    } else {
        NSError *castingError = [NSError errorWithDomain:@"com.dapi.dapiconnect.reactnative" code:1012 userInfo:@{NSLocalizedDescriptionKey: @"Couldn't find an initialized payment, make sure you have successfully initialized DapiClient"}];
        reject(@"1012", castingError.localizedDescription, castingError);
    }
}

RCT_EXPORT_METHOD(createTransferToAccountNumber:(NSString *)accountNumber name:(NSString *)name senderID:(NSString *)senderID amount:(nonnull NSNumber *)amount remark:(NSString *)remark configurations:(NSDictionary *)configurations resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    DPCClient *client = [self getClientWithConfigurations:configurations];
    DPCPayment *payment = client.payment;
    if (payment) {
        [payment createTransferWithSenderID:senderID amount:amount toAccountNumber:accountNumber name:name completion:^(DPCResult * _Nullable result, NSError * _Nullable error, NSString * _Nullable jobID) {
            [self respondForDictionaryRepresentableObject:result error:error resolver:resolve rejecter:reject];
        }];
    } else {
        NSError *castingError = [NSError errorWithDomain:@"com.dapi.dapiconnect.reactnative" code:1012 userInfo:@{NSLocalizedDescriptionKey: @"Couldn't find an initialized payment, make sure you have successfully initialized DapiClient"}];
        reject(@"1012", castingError.localizedDescription, castingError);
    }
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
- (DPCClient *)getClientWithConfigurations:(NSDictionary *)configurations {
    DPCConfigurations *configs = [self configurationsFromDictionary:configurations];
    __block DPCClient *client;
    [DPCClient.instances enumerateObjectsUsingBlock:^(DPCClient * _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
        if ([obj.configurations isEqualToConfigurations:configs]) {
            client = obj;
        }
    }];
    if (!client) {
        client = [[DPCClient alloc] initWithConfigurations:configs];
    }
    return client;
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

- (DPCBeneficiaryInfo *)nativeBeneficiaryInfoFromDictionary:(NSDictionary<NSString *,id> *)beneficiaryInfoDictionary {
    DPCBeneficiaryInfo *beneficiaryInfo = [[DPCBeneficiaryInfo alloc] init];
    NSDictionary<NSString *, id> *lineAddressDictionary = [beneficiaryInfoDictionary objectForKey:@"linesAddress"];
    beneficiaryInfo.linesAddress = [[DPCLinesAddress alloc] initWithDictionary:lineAddressDictionary];
    beneficiaryInfo.accountNumber = [beneficiaryInfoDictionary objectForKey:@"accountNumber"];
    beneficiaryInfo.name = [beneficiaryInfoDictionary objectForKey:@"name"];
    beneficiaryInfo.bankName = [beneficiaryInfoDictionary objectForKey:@"bankName"];
    beneficiaryInfo.swiftCode = [beneficiaryInfoDictionary objectForKey:@"swiftCode"];
    beneficiaryInfo.sendingSwiftCode = [beneficiaryInfoDictionary objectForKey:@"sendingSwiftCode"];
    beneficiaryInfo.iban = [beneficiaryInfoDictionary objectForKey:@"iban"];
    beneficiaryInfo.phoneNumber = [beneficiaryInfoDictionary objectForKey:@"phoneNumber"];
    beneficiaryInfo.country = [beneficiaryInfoDictionary objectForKey:@"country"];
    beneficiaryInfo.sendingCountry = [beneficiaryInfoDictionary objectForKey:@"sendingCountry"];
    beneficiaryInfo.branchAddress = [beneficiaryInfoDictionary objectForKey:@"branchAddress"];
    beneficiaryInfo.branchName = [beneficiaryInfoDictionary objectForKey:@"branchName"];
    return beneficiaryInfo;
}

@end
