package com.dapi;

import androidx.annotation.Nullable;

import com.dapi.connect.core.base.Dapi;
import com.dapi.connect.core.callbacks.OnDapiConnectListener;
import com.dapi.connect.data.endpoint_models.Accounts;
import com.dapi.connect.data.models.DapiBeneficiary;
import com.dapi.connect.data.models.DapiConfigurations;
import com.dapi.connect.data.models.DapiConnection;
import com.dapi.connect.data.models.DapiEndpoints;
import com.dapi.connect.data.models.DapiError;
import com.dapi.connect.data.models.LinesAddress;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.google.gson.Gson;

import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.Arguments;


import org.jetbrains.annotations.NotNull;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nonnull;

import kotlin.Unit;
import kotlin.jvm.functions.Function1;

@ReactModule(name = DapiConnectModule.NAME)
public class DapiConnectModule extends ReactContextBaseJavaModule {

    public static final String NAME = "DapiConnectManager";

    public DapiConnectModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Nonnull
    @Override
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void start(String appKey, String clientUserID, ReadableMap configurationMap, Promise promise) {
        Dapi.start(
                getCurrentActivity().getApplication(),
                appKey,
                clientUserID,
                getConfigurations(configurationMap), () -> {
                    resolve(null, promise);
                    return null;
                }, error -> {
                    reject(error, promise);
                    return null;
                }

        );
    }

    @ReactMethod
    public void presentConnect() {
        Dapi.presentConnect();
        setConnectListener();
    }

    @ReactMethod
    public void dismissConnect() {
        Dapi.dismissConnect();
    }

    @ReactMethod
    public void getConnections(Promise promise) {
        Dapi.getConnections(connections -> {
            WritableArray connectionsArray = new WritableNativeArray();
            for (DapiConnection connection : connections) {
                try {
                    WritableArray resultAccountMapArray = new WritableNativeArray();
                    for (Accounts.DapiAccount account : connection.getAccounts()) {
                        WritableMap currencyMap = new WritableNativeMap();
                        currencyMap.putString("code", account.getCurrency().getCode());
                        currencyMap.putString("name", account.getCurrency().getName());

                        WritableMap accountMap = new WritableNativeMap();
                        accountMap.putString("iban", account.getIban());
                        accountMap.putString("number", account.getNumber());
                        accountMap.putMap("currency", currencyMap);
                        accountMap.putString("type", account.getType());
                        accountMap.putString("name", account.getName());
                        accountMap.putString("id", account.getId());
                        accountMap.putDouble("balance", account.getBalance().getAmount());
                        resultAccountMapArray.pushMap(accountMap);
                    }

                    WritableMap connectionMap = new WritableNativeMap();
                    connectionMap.putString("userID", connection.getUserID());
                    connectionMap.putString("clientUserID", connection.getClientUserID());
                    connectionMap.putString("bankID", connection.getBankID());
                    connectionMap.putString("bankName", connection.getBankShortName());
                    connectionMap.putString("countryName", connection.getCountry());
                    connectionMap.putArray("accounts", resultAccountMapArray);
                    connectionsArray.pushMap(connectionMap);
                } catch (Exception e) {
                    reject(e.getMessage(), promise);
                }

            }
            resolve(connectionsArray, promise);
            return null;
        }, error -> {
            JSONObject jsonObject = convertToJSONObject(error);
            try {
                reject(JsonConvert.jsonToReact(jsonObject), promise);
            } catch (Exception e) {
                e.printStackTrace();
            }
            return null;
        });
    }


    @ReactMethod
    public void setClientUserID(String clientUserID) {
        Dapi.setClientUserID(clientUserID);
    }

    @ReactMethod
    public void clientUserID(Promise promise) {
        String clientUserID = Dapi.getClientUserID();
        if (clientUserID == null) {
            reject("ClientUserID is not set", promise);
        } else {
            resolve(clientUserID, promise);
        }
    }

    @ReactMethod
    public void getIdentity(String userID, Promise promise) {
        getOperatingConnection(userID, connection -> {
            connection.getIdentity(identity -> {
                resolve(identity, promise);
                return null;
            }, error -> {
                reject(error, promise);
                return null;
            });
            return null;
        }, error -> {
            reject(error, promise);
            return null;
        });
    }

    @ReactMethod
    public void getAccounts(String userID, Promise promise) {

        getOperatingConnection(userID, connection -> {
            connection.getAccounts(identity -> {
                resolve(identity, promise);
                return null;
            }, error -> {
                reject(error, promise);
                return null;
            });
            return null;
        }, error -> {
            reject(error, promise);
            return null;
        });
    }

    @ReactMethod
    public void getTransactions(
            String userID,
            String accountID,
            Dynamic startDate,
            Dynamic endDate,
            Promise promise) {

        long startDateAsLong = (long) startDate.asDouble();
        long endDateAsLong = (long) endDate.asDouble();

        Date startDateObject = new Date(startDateAsLong);
        Date endDateObject = new Date(endDateAsLong);

        getOperatingConnection(userID, connection -> {
            Accounts.DapiAccount account = getDapiAccount(accountID, connection);
            connection.getTransactions(account, startDateObject, endDateObject, transactions -> {
                resolve(transactions, promise);
                return null;
            }, error -> {
                reject(error, promise);
                return null;
            });
            return null;
        }, error -> {
            reject(error, promise);
            return null;
        });
    }

    @ReactMethod
    public void getAccountsMetadata(String userID, Promise promise) {
        getOperatingConnection(userID, connection -> {
            connection.getAccountsMetaData(accountsMetaData -> {
                resolve(accountsMetaData, promise);
                return null;
            }, error -> {
                reject(error, promise);
                return null;
            });
            return null;
        }, error -> {
            reject(error, promise);
            return null;
        });
    }

    @ReactMethod
    public void delete(
            String userID,
            Promise promise
    ) {
        getOperatingConnection(userID, connection -> {
            connection.delete(delink -> {
                resolve(delink, promise);
                return null;
            }, error -> {
                reject(error, promise);
                return null;
            });
            return null;
        }, error -> {
            reject(error, promise);
            return null;
        });
    }

    @ReactMethod
    public void createTransfer(
            String userID,
            String accountID,
            ReadableMap beneficiaryMap,
            int amount,
            String remark,
            Promise promise
    ) {
        getOperatingConnection(userID, connection -> {
            Accounts.DapiAccount account = getDapiAccount(accountID, connection);
            DapiBeneficiary beneficiary = getBeneficiary(beneficiaryMap);
            connection.createTransfer(account, beneficiary, amount, remark, (senderAccount, sentAmount) -> {
                HashMap<String, Object> successfulTransferMap = new HashMap<>();
                successfulTransferMap.put("account", convertToJSONObject(senderAccount));
                successfulTransferMap.put("amount", sentAmount);
                resolve(successfulTransferMap, promise);
                return null;
            }, (failedAccount, error) -> {
                reject(error, promise);
                return null;
            });
            return null;
        }, error -> {
            reject(error, promise);
            return null;
        });
        setTransferListener();
    }


    /**
     * ************ HELPER FUNCTIONS ************
     */

    private <T> void resolve(T data, Promise promise) {
        try {
            promise.resolve(JsonConvert.jsonToReact(convertToJSONObject(data)));
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private <T> void reject(T error, Promise promise) {
        JSONObject jsonObject = convertToJSONObject(error);
        try {
            promise.reject("1015", JsonConvert.jsonToReact(jsonObject));
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private <T> void sendSuccessCallback(T data, Callback callback) {
        callback.invoke(null, data);
    }

    private <T> void sendErrorCallback(T error, Callback callback) {
        callback.invoke(error, null);
    }

    private void sendEvent(ReactContext reactContext,
                           String eventName,
                           @Nullable WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    private DapiConfigurations getConfigurations(ReadableMap configurations) {
        Map<String, Object> extraQueryParameters;
        Map<String, Object> extraHeaderFields;
        Map<String, Object> extraBody;
        DapiEndpoints endpoints;

        if (!configurations.hasKey("endpointExtraQueryItems")) {
            extraQueryParameters = new HashMap<String, Object>();
        } else {
            extraQueryParameters = configurations.getMap("endpointExtraQueryItems").toHashMap();
        }

        if (!configurations.hasKey("endpointExtraHeaderFields")) {
            extraHeaderFields = new HashMap<String, Object>();
        } else {
            extraHeaderFields = configurations.getMap("endpointExtraHeaderFields").toHashMap();
        }

        if (!configurations.hasKey("endpointExtraBody")) {
            extraBody = new HashMap<String, Object>();
        } else {
            extraBody = configurations.getMap("endpointExtraBody").toHashMap();
        }

        if (!configurations.hasKey("endpoints")) {
            endpoints = new DapiEndpoints();
        } else {
            Map<String, Object> endpointsMap = configurations.getMap("endpoints").toHashMap();
            String getIdentity;
            String getAccounts;
            String getTransactions;
            String accountMetaData;
            String delete;

            if (endpointsMap.get("getIdentity") == null) {
                getIdentity = DapiEndpoints.GET_IDENTITY_ENDPOINT;
            } else {
                getIdentity = (String) endpointsMap.get("getIdentity");
            }

            if (endpointsMap.get("getAccounts") == null) {
                getAccounts = DapiEndpoints.GET_ACCOUNTS_ENDPOINT;
            } else {
                getAccounts = (String) endpointsMap.get("getAccounts");
            }


            if (endpointsMap.get("getTransactions") == null) {
                getTransactions = DapiEndpoints.GET_TRANSACTIONS_ENDPOINT;
            } else {
                getTransactions = (String) endpointsMap.get("getTransactions");
            }

            if (endpointsMap.get("getAccountMetadata") == null) {
                accountMetaData = DapiEndpoints.ACCOUNTS_META_DATA_ENDPOINT;
            } else {
                accountMetaData = (String) endpointsMap.get("getAccountMetadata");
            }

            if (endpointsMap.get("delete") == null) {
                delete = DapiEndpoints.DELETE_CONNECTION_ENDPOINT;
            } else {
                delete = (String) endpointsMap.get("delete");
            }

            endpoints = new DapiEndpoints(
                    getIdentity,
                    getAccounts,
                    getTransactions,
                    accountMetaData,
                    delete
            );
        }

        HashMap<String, Object> extraBodyMapOfObjects =
                (extraBody instanceof HashMap)
                        ? (HashMap) extraBody
                        : new HashMap<String, Object>(extraBody);

        HashMap<String, Object> extraHeadersMapOfObjects =
                (extraHeaderFields instanceof HashMap)
                        ? (HashMap) extraHeaderFields
                        : new HashMap<String, Object>(extraHeaderFields);

        HashMap<String, Object> extraParamsMapOfObjects =
                (extraQueryParameters instanceof HashMap)
                        ? (HashMap) extraQueryParameters
                        : new HashMap<String, Object>(extraQueryParameters);

        HashMap<String, String> extraBodyMapOfStrings = new HashMap<>();
        for (Map.Entry<String, Object> entry : extraBodyMapOfObjects.entrySet()) {
            if (entry.getValue() instanceof String) {
                extraBodyMapOfStrings.put(entry.getKey(), (String) entry.getValue());
            }
        }

        HashMap<String, String> extraHeadersMapOfStrings = new HashMap<>();
        for (Map.Entry<String, Object> entry : extraHeadersMapOfObjects.entrySet()) {
            if (entry.getValue() instanceof String) {
                extraHeadersMapOfStrings.put(entry.getKey(), (String) entry.getValue());
            }
        }

        HashMap<String, String> extraParamsMapOfStrings = new HashMap<>();
        for (Map.Entry<String, Object> entry : extraParamsMapOfObjects.entrySet()) {
            if (entry.getValue() instanceof String) {
                extraParamsMapOfStrings.put(entry.getKey(), (String) entry.getValue());
            }
        }
        return new DapiConfigurations(
                endpoints,
                extraHeadersMapOfStrings,
                extraParamsMapOfStrings,
                extraBodyMapOfStrings
        );
    }

    private DapiBeneficiary getBeneficiary(ReadableMap beneficiaryMap) {
        ReadableMap linesMap =  beneficiaryMap.getMap("address");
        String line1 = linesMap.getString("line1");
        String line2 = linesMap.getString("line2");
        String line3 = linesMap.getString("line3");
        LinesAddress linesAddress = new LinesAddress(
                line1,
                line2,
                line3
        );
        String accountNumber = beneficiaryMap.getString("accountNumber");
        String name = beneficiaryMap.getString("name");
        String bankName = beneficiaryMap.getString("bankName");
        String swiftCode = beneficiaryMap.getString("swiftCode");
        String iban = beneficiaryMap.getString("iban");
        String phoneNumber = beneficiaryMap.getString("phoneNumber");
        String country = beneficiaryMap.getString("country");
        String branchAddress = beneficiaryMap.getString("branchAddress");
        String branchName = beneficiaryMap.getString("branchName");

        DapiBeneficiary beneficiary = new DapiBeneficiary(
                linesAddress,
                accountNumber,
                name,
                bankName,
                swiftCode,
                iban,
                country,
                branchAddress,
                branchName,
                phoneNumber
        );

        return beneficiary;
    }

    public Accounts.DapiAccount getDapiAccount(String accountID, DapiConnection connection) {
        for (Accounts.DapiAccount account : connection.getAccounts()){
            if (account.getId().equals(accountID)){
                return account;
            }
        }
        return null;
    }

    private void getOperatingConnection(String userID, Function1<? super DapiConnection, Unit> onSuccess, Function1<? super DapiError, Unit> onFailure) {
        Dapi.getConnections(connections -> {
            for (DapiConnection connection : connections) {
                if (connection.getUserID().equals(userID)) {
                    onSuccess.invoke(connection);
                    break;
                }
            }
            return null;
        }, error -> {
            onFailure.invoke(error);
            return null;
        });
    }

    private void setConnectListener() {
        Dapi.setConnectListener(new OnDapiConnectListener() {
            @Override
            public void onConnectionSuccessful(@NotNull DapiConnection connection) {
                WritableMap params = Arguments.createMap();
                params.putMap("connection", JsonConvert.jsonToReact(convertToJSONObject(connection)));
                sendEvent(getReactApplicationContext(), "EventConnectSuccessful", params);
            }

            @Override
            public void onConnectionFailure(@NotNull DapiError error, @NotNull String bankID) {
                WritableMap params = Arguments.createMap();
                params.putString("bankID", bankID);
                params.putString("error", error.getMsg());
                sendEvent(getReactApplicationContext(), "EventConnectFailure", params);
            }
        });

    }

    private void setTransferListener() {
        Dapi.setTransferListener((amount, account) -> {
            WritableMap params = Arguments.createMap();
            params.putInt("amount", amount);
            params.putMap("account", JsonConvert.jsonToReact(convertToJSONObject(account)));
            sendEvent(getReactApplicationContext(), "EventDapiUIWillTransfer", params);
        });
    }

    private JSONObject convertToJSONObject(Object object) {
        Gson gson = new Gson();
        String jsonString = gson.toJson(object);
        try {
            JSONObject jsonObject = new JSONObject(jsonString);
            return jsonObject;
        } catch (Exception e) {
            return new JSONObject();
        }
    }


}
