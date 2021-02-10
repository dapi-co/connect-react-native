package com.dapi;


import android.util.Log;
import android.webkit.WebView;

import androidx.annotation.Nullable;

import com.dapi.connect.core.base.DapiAuthClient;
import com.dapi.connect.core.base.DapiDataClient;
import com.dapi.connect.core.base.DapiMetaDataClient;
import com.dapi.connect.core.base.DapiPaymentClient;
import com.dapi.connect.core.callbacks.OnDapiConnectListener;
import com.dapi.connect.core.callbacks.OnDapiTransferListener;
import com.dapi.connect.core.base.DapiClient;
import com.dapi.connect.core.enums.DapiEnvironment;
import com.dapi.connect.core.enums.DapiTheme;
import com.dapi.connect.data.endpoint_models.AccountsItem;
import com.dapi.connect.data.models.DapiBeneficiaryInfo;
import com.dapi.connect.data.models.DapiConfigurations;
import com.dapi.connect.data.models.DapiConnection;
import com.dapi.connect.data.models.DapiEndpoints;
import com.dapi.connect.data.models.DapiError;
import com.dapi.connect.data.models.LinesAddress;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Dynamic;
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
import com.facebook.react.module.annotations.ReactModule;
import com.google.gson.Gson;

import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.Arguments;


import org.jetbrains.annotations.NotNull;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicReference;

import javax.annotation.Nonnull;

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
    public DapiClient newClientWithConfigurations(ReadableMap configurationsMap) {
        DapiConfigurations dapiConfigurations = createDapiConfigurations(configurationsMap);
        for (DapiClient client : DapiClient.Companion.getInstances()){
            if (client.getConfigurations().equals(dapiConfigurations)){
                return client;
            }
        }
        return new DapiClient(getCurrentActivity().getApplication(), dapiConfigurations);
    }

    @ReactMethod
    public void setUserID(String userID, ReadableMap configurationsMap) {
        DapiClient client = getOrCreateDapiClient(configurationsMap);
        client.setUserID(userID);
    }

    @ReactMethod
    public void userID(ReadableMap configurationsMap, Callback callback) {
        String userID = getOrCreateDapiClient(configurationsMap).getUserID();
        if (userID == null) {
            sendErrorCallback("UserID is not set", callback);
        } else {
            sendSuccessCallback(userID, callback);
        }
    }

    @ReactMethod
    public void setClientUserID(String clientUserID, ReadableMap configurationsMap) {
        DapiClient client = getOrCreateDapiClient(configurationsMap);
        client.setClientUserID(clientUserID);
    }

    @ReactMethod
    public void clientUserID(ReadableMap configurationsMap, Callback callback) {
        String clientUserID = getOrCreateDapiClient(configurationsMap).getClientUserID();
        if (clientUserID == null) {
            sendErrorCallback("ClientUserID is not set", callback);
        } else {
            sendSuccessCallback(clientUserID, callback);
        }
    }

    @ReactMethod
    public void presentConnect(String beneficiaryInfo, ReadableMap configurationsMap) {
        DapiClient client = getOrCreateDapiClient(configurationsMap);
        client.getConnect().present();
        addConnectListener(beneficiaryInfo, client);
    }

    @ReactMethod
    public void dismissConnect(ReadableMap configurationsMap) {
        DapiClient client = getOrCreateDapiClient(configurationsMap);
        client.getConnect().dismiss();
    }

    @ReactMethod
    public void getConnections(ReadableMap configurationsMap, final Callback callback) {
        DapiClient client = getOrCreateDapiClient(configurationsMap);
        client.getConnect().getConnections(connections -> {
            WritableArray writableArray = new WritableNativeArray();
            for (DapiConnection connection : connections) {
                try {
                    WritableArray resultAccountMapArray = new WritableNativeArray();
                    for (AccountsItem account : connection.getSubAccounts()){
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
                        accountMap.putBoolean("isFavourite", account.isFavourite());
                        resultAccountMapArray.pushMap(accountMap);
                    }

                    WritableMap writableMap = new WritableNativeMap();
                    writableMap.putString("userID", connection.getUserID());
                    writableMap.putString("clientUserID", connection.getClientUserID());
                    writableMap.putString("bankID", connection.getBankID());
                    writableMap.putString("bankName", connection.getShortBankName());
                    JSONObject coolDownPeriodJsonObject = convertToJSONObject(connection.getCoolDownPeriod());
                    writableMap.putMap("beneficiaryCoolDownPeriod", JsonConvert.jsonToReact(coolDownPeriodJsonObject));
                    writableMap.putString("countryName", connection.getCountry());
                    writableMap.putBoolean("isCreateBeneficiaryEndpointRequired", connection.isCreateBeneficiaryRequired());
                    writableMap.putArray("accounts", resultAccountMapArray);
                    writableArray.pushMap(writableMap);
                } catch (Exception e) {
                    sendErrorCallback(e.getMessage(), callback);
                }

            }
            sendSuccessCallback(writableArray, callback);
            return null;
        }, error -> {
            JSONObject jsonObject = convertToJSONObject(error);
            try {
                sendErrorCallback(JsonConvert.jsonToReact(jsonObject), callback);
            } catch (Exception e) {
                e.printStackTrace();
            }
            return null;
        });
    }

    @ReactMethod
    public void presentAutoFlow(String beneficiaryInfo, ReadableMap configurationsMap) {
        DapiClient client = getOrCreateDapiClient(configurationsMap);
        client.getAutoFlow().present(null, 0);
        addAutoFlowListener(beneficiaryInfo, client);
    }

    @ReactMethod
    public void dismissAutoFlow(ReadableMap configurationsMap) {
        DapiClient dapiClient = DapiClient.Companion.getInstance();
        dapiClient.getAutoFlow().dismiss();
    }

    @ReactMethod
    public void getIdentity(ReadableMap configurationsMap,
                            Promise promise) {
        DapiDataClient data = getOrCreateDapiClient(configurationsMap).getData();
        data.getIdentity(identity -> {
            resolve(identity, promise);
            return null;
        }, error -> {
            reject(error, promise);
            return null;
        });
    }

    @ReactMethod
    public void getAccounts(ReadableMap configurationsMap,
                            Promise promise) {
        DapiDataClient data = getOrCreateDapiClient(configurationsMap).getData();
        data.getAccounts(accounts -> {
            resolve(accounts, promise);
            return null;
        }, error -> {
            reject(error, promise);
            return null;
        });
    }

    @ReactMethod
    public void getBalance(String accountID, ReadableMap configurationsMap,
                           Promise promise) {
        DapiDataClient data = getOrCreateDapiClient(configurationsMap).getData();
        data.getBalance(accountID, balance -> {
            resolve(balance, promise);
            return null;
        }, error -> {
            reject(error, promise);
            return null;
        });
    }

    @ReactMethod
    public void getTransactions(String accountID,
                                Dynamic startDate,
                                Dynamic endDate,
                                ReadableMap configurationsMap,
                                Promise promise) {
        DapiDataClient data = getOrCreateDapiClient(configurationsMap).getData();

        long startDateAsLong = (long) startDate.asDouble();
        long endDateAsLong = (long) endDate.asDouble();

        Date startDateObject = new Date(startDateAsLong);
        Date endDateObject = new Date(endDateAsLong);

        data.getTransactions(accountID, startDateObject, endDateObject, transactions -> {
            resolve(transactions, promise);
            return null;
        }, error -> {
            reject(error, promise);
            return null;
        });
    }

    @ReactMethod
    public void getAccountsMetadata(ReadableMap configurationsMap,
                                    Promise promise) {
        DapiMetaDataClient metadata = getOrCreateDapiClient(configurationsMap).getMetadata();
        metadata.getAccountMetaData(accountMetaData -> {
            resolve(accountMetaData, promise);
            return null;
        }, error -> {
            reject(error, promise);
            return null;
        });
    }

    @ReactMethod
    public void delinkUser(ReadableMap configurationsMap,
                           Promise promise) {
        DapiAuthClient auth = getOrCreateDapiClient(configurationsMap).getAuth();
        auth.delink(delinkUser -> {
            resolve(delinkUser, promise);
            return null;
        }, error -> {
            reject(error, promise);
            return null;
        });
    }

    @ReactMethod
    public void getBeneficiaries(ReadableMap configurationsMap,
                                 Promise promise) {
        DapiPaymentClient payment = getOrCreateDapiClient(configurationsMap).getPayment();
        payment.getBeneficiaries(beneficiaries -> {
            resolve(beneficiaries, promise);
            return null;
        }, error -> {
            reject(error, promise);
            return null;
        });
    }

    @ReactMethod
    public void createTransferToIban(
            String iban,
            String name,
            String senderID,
            Double amount,
            String remark,
            ReadableMap configurationsMap,
            Promise promise
    ) {
        DapiPaymentClient payment = getOrCreateDapiClient(configurationsMap).getPayment();
        payment.createTransfer(iban, name, senderID, amount, remark, transfer -> {
            resolve(transfer, promise);
            return null;
        }, error -> {
            reject(error, promise);
            return null;
        });
    }

    @ReactMethod
    public void createTransferToReceiverID(
            String receiverID,
            String senderID,
            Double amount,
            String remark,
            ReadableMap configurationsMap,
            Promise promise
    ) {
        DapiPaymentClient payment = getOrCreateDapiClient(configurationsMap).getPayment();
        payment.createTransfer(receiverID, senderID, amount, remark, transfer -> {
            resolve(transfer, promise);
            return null;
        }, error -> {
            reject(error, promise);
            return null;
        });
    }

    @ReactMethod
    public void createTransferToAccountNumber(
            String accountNumber,
            String name,
            String senderID,
            Double amount,
            String remark,
            ReadableMap configurationsMap,
            Promise promise
    ) {
        DapiPaymentClient payment = getOrCreateDapiClient(configurationsMap).getPayment();
        payment.createTransfer(accountNumber, name, amount, senderID, remark, transfer -> {
            resolve(transfer, promise);
            return null;
        }, error -> {
            reject(error, promise);
            return null;
        });
    }

    @ReactMethod
    private void createBeneficiary(
            ReadableMap beneficiaryInfoMap,
            ReadableMap configurationsMap,
            Promise promise
    ) {

        DapiPaymentClient payment = getOrCreateDapiClient(configurationsMap).getPayment();

        DapiBeneficiaryInfo dapiBeneficiaryInfo = createDapiBeneficiaryInfo(beneficiaryInfoMap.toHashMap());
        payment.createBeneficiary(dapiBeneficiaryInfo, beneficiary -> {
            resolve(beneficiary, promise);
            return null;
        }, error -> {
            reject(error, promise);
            return null;
        });
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

    private DapiClient getOrCreateDapiClient(ReadableMap configurationsMap) {
        DapiConfigurations dapiConfigurations = createDapiConfigurations(configurationsMap);
        DapiClient client = null;
        for (DapiClient dapiClient : DapiClient.Companion.getInstances()) {
            if (dapiClient.getConfigurations().equals(dapiConfigurations)) {
                client = dapiClient;
                break;
            }
        }

        if (client == null) {
            client = newClientWithConfigurations(configurationsMap);
        }

        return client;
    }

    private DapiBeneficiaryInfo createDapiBeneficiaryInfo(Map<String, Object> dapiBeneficiaryInfo) {
        Map<String, String> linesMap = (Map<String, String>) dapiBeneficiaryInfo.get("address");
        String line1 = linesMap.get("line1");
        String line2 = linesMap.get("line2");
        String line3 = linesMap.get("line3");
        LinesAddress linesAddress = new LinesAddress(
                line1,
                line2,
                line3
        );
        String accountNumber = (String) dapiBeneficiaryInfo.get("accountNumber");
        String name = (String) dapiBeneficiaryInfo.get("name");
        String bankName = (String) dapiBeneficiaryInfo.get("bankName");
        String swiftCode = (String) dapiBeneficiaryInfo.get("swiftCode");
        String iban = (String) dapiBeneficiaryInfo.get("iban");
        String phoneNumber = (String) dapiBeneficiaryInfo.get("phoneNumber");
        String country = (String) dapiBeneficiaryInfo.get("country");
        String branchAddress = (String) dapiBeneficiaryInfo.get("branchAddress");
        String branchName = (String) dapiBeneficiaryInfo.get("branchName");

        DapiBeneficiaryInfo info = new DapiBeneficiaryInfo(
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

        return info;
    }

    private DapiConfigurations createDapiConfigurations(ReadableMap configurations) {
        String appKey = null;
        String clientUserID = null;
        String colorScheme = null;
        String environment = null;
        boolean isExperimental = false;
        String baseUrl = null;
        ArrayList<Object> countries = null;
        Map<String, Object> extraParams = null;
        Map<String, Object> extraHeaders = null;
        Map<String, Object> extraBody = null;
        DapiEndpoints endpoints = null;


        if (!configurations.hasKey("appKey")) {
            Log.e("DapiError", "Invalid appKey argument");
        } else {
            appKey = (String) configurations.getString("appKey");
        }

        if (!configurations.hasKey("clientUserID")) {
            Log.e("DapiError", "Invalid clientUserID argument");
        } else {
            clientUserID = (String) configurations.getString("clientUserID");
        }

        if (!configurations.hasKey("colorScheme")) {
            colorScheme = "GENERAL";
        } else {
            colorScheme = (String) configurations.getString("colorScheme");
        }

        if (!configurations.hasKey("environment")) {
            Log.e("DapiError", "Invalid environment argument");
        } else {
            environment = (String) configurations.getString("environment");
        }

        if (!configurations.hasKey("countries")) {
            Log.e("DapiError", "Invalid countries argument");
        } else {
            countries = configurations.getArray("countries").toArrayList();
        }

        if (!configurations.hasKey("isExperimental")) {
            isExperimental = false;
        } else {
            isExperimental = (boolean) configurations.getBoolean("isExperimental");
        }

        if (!configurations.hasKey("baseURL")) {
            Log.e("DapiError", "Invalid baseURL argument");
        } else {
            baseUrl = (String) configurations.getString("baseURL");
        }

        if (!configurations.hasKey("endpointExtraQueryItems")) {
            extraParams = new HashMap<String, Object>();
        } else {
            extraParams = configurations.getMap("endpointExtraQueryItems").toHashMap();
        }

        if (!configurations.hasKey("endpointExtraHeaderFields")) {
            extraHeaders = new HashMap<String, Object>();
        } else {
            extraHeaders = configurations.getMap("endpointExtraHeaderFields").toHashMap();
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
            String getBalance;
            String getTransactions;
            String accountMetaData;
            String createTransfer;
            String createBeneficiary;
            String getBeneficiaries;
            String delinkUser;

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

            if (endpointsMap.get("getBalance") == null) {
                getBalance = DapiEndpoints.GET_BALANCE_ENDPOINT;
            } else {
                getBalance = (String) endpointsMap.get("getBalance");
            }

            if (endpointsMap.get("getTransactions") == null) {
                getTransactions = DapiEndpoints.GET_TRANSACTIONS_ENDPOINT;
            } else {
                getTransactions = (String) endpointsMap.get("getTransactions");
            }

            if (endpointsMap.get("getAccountMetadata") == null) {
                accountMetaData = DapiEndpoints.ACCOUNT_META_DATA_ENDPOINT;
            } else {
                accountMetaData = (String) endpointsMap.get("getAccountMetadata");
            }

            if (endpointsMap.get("createTransfer") == null) {
                createTransfer = DapiEndpoints.CREATE_TRANSFER_ENDPOINT;
            } else {
                createTransfer = (String) endpointsMap.get("createTransfer");
            }

            if (endpointsMap.get("createBeneficiary") == null) {
                createBeneficiary = DapiEndpoints.CREATE_BENEFICIARY_ENDPOINT;
            } else {
                createBeneficiary = (String) endpointsMap.get("createBeneficiary");
            }

            if (endpointsMap.get("getBeneficiaries") == null) {
                getBeneficiaries = DapiEndpoints.GET_BENEFICIARIES_ENDPOINT;
            } else {
                getBeneficiaries = (String) endpointsMap.get("getBeneficiaries");
            }

            if (endpointsMap.get("delinkUser") == null) {
                delinkUser = DapiEndpoints.DELINK_USER_ENDPOINT;
            } else {
                delinkUser = (String) endpointsMap.get("delinkUser");
            }

            endpoints = new DapiEndpoints(
                    getIdentity,
                    getAccounts,
                    getBalance,
                    getTransactions,
                    accountMetaData,
                    createTransfer,
                    createBeneficiary,
                    getBeneficiaries,
                    delinkUser
            );
        }


        DapiEnvironment dapiEnvironment;
        if (environment.toLowerCase().equals("production")) {
            dapiEnvironment = DapiEnvironment.PRODUCTION;
        } else {
            dapiEnvironment = DapiEnvironment.SANDBOX;
        }

        DapiTheme theme;
        if (colorScheme.toLowerCase().equals("neon")) {
            theme = DapiTheme.ELECTRIC;
        } else if (colorScheme.toLowerCase().equals("blackandwhite")) {
            theme = DapiTheme.ELEGANT;
        } else {
            theme = DapiTheme.GENERAL;
        }

        HashMap<String, Object> extraBodyMapOfObjects =
                (extraBody instanceof HashMap)
                        ? (HashMap) extraBody
                        : new HashMap<String, Object>(extraBody);

        HashMap<String, Object> extraHeadersMapOfObjects =
                (extraHeaders instanceof HashMap)
                        ? (HashMap) extraHeaders
                        : new HashMap<String, Object>(extraHeaders);

        HashMap<String, Object> extraParamsMapOfObjects =
                (extraParams instanceof HashMap)
                        ? (HashMap) extraParams
                        : new HashMap<String, Object>(extraParams);

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

        ArrayList<String> finalCountries = new ArrayList<String>(countries.size());
        for (Object object : countries) {
            finalCountries.add(object != null ? object.toString() : null);
        }

        return new DapiConfigurations(
                appKey,
                baseUrl,
                dapiEnvironment,
                finalCountries,
                clientUserID,
                isExperimental,
                theme,
                extraHeadersMapOfStrings,
                extraParamsMapOfStrings,
                extraBodyMapOfStrings,
                endpoints
        );
    }

    private void addConnectListener(String beneficiaryInfo, DapiClient client) {
        AtomicReference<String> stringBeneficiaryInfo = new AtomicReference<>();
        client.getConnect().setOnConnectListener(new OnDapiConnectListener() {
            @Override
            public void onConnectionSuccessful(@NotNull String userID, @NotNull String bankID) {
                WritableMap params = Arguments.createMap();
                params.putString("bankID", bankID);
                params.putString("userID", userID);
                sendEvent(getReactApplicationContext(), "EventConnectSuccessful", params);
            }

            @Override
            public void onConnectionFailure(@NotNull DapiError error, @NotNull String bankID) {
                WritableMap params = Arguments.createMap();
                params.putString("bankID", bankID);
                try {
                    params.putMap("error", JsonConvert.jsonToReact(convertToJSONObject(error)));
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                sendEvent(getReactApplicationContext(), "EventConnectFailure", params);

            }

            @Override
            public void onProceed(@NotNull String userID, @NotNull String bankID) {
                String fullFunction = String.format(beneficiaryInfo + "(`%s`)", bankID);
                ExecutorService executor = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors());
                executor.execute(() -> getCurrentActivity().runOnUiThread(() -> {
                    WebView webView = new WebView(getReactApplicationContext());
                    webView.getSettings().setJavaScriptEnabled(true);

                    webView.evaluateJavascript(fullFunction, stringBeneficiaryInfo::set);
                }));

                executor.shutdown();
            }

            @Nullable
            @Override
            public DapiBeneficiaryInfo setBeneficiaryInfoOnConnect(@NotNull String bankID) {
                Gson gson = new Gson();
                Map<String, Object> beneficiaryInfoMap =
                        gson.fromJson(stringBeneficiaryInfo.get(), Map.class);
                return createDapiBeneficiaryInfo(beneficiaryInfoMap);
            }
        });

    }

    private void addAutoFlowListener(String beneficiaryInfo, DapiClient client) {
        AtomicReference<String> stringBeneficiaryInfo = new AtomicReference<>();
        client.getAutoFlow().setOnTransferListener(new OnDapiTransferListener() {
            @Override
            public void preAutoFlowTransfer(double amount, @NotNull AccountsItem accountsItem) {

            }

            @Override
            public void onAutoFlowFailure(@NotNull DapiError dapiError, @NotNull AccountsItem accountsItem, @org.jetbrains.annotations.Nullable String s) {

            }

            @Override
            public void onAutoFlowSuccessful(double v, @NotNull AccountsItem accountsItem, @org.jetbrains.annotations.Nullable String s, @NotNull String s1) {

            }


            @NotNull
            @Override
            public DapiBeneficiaryInfo setBeneficiaryInfoOnAutoFlow(@NotNull String bankID) {
                String fullFunction = String.format(beneficiaryInfo + "(`%s`)", bankID);
                ExecutorService executor = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors());
                executor.execute(() -> getCurrentActivity().runOnUiThread(() -> {
                    WebView webView = new WebView(getReactApplicationContext());
                    webView.getSettings().setJavaScriptEnabled(true);

                    webView.evaluateJavascript(fullFunction, stringBeneficiaryInfo::set);
                }));

                executor.shutdown();

                Gson gson = new Gson();
                Map<String, Object> beneficiaryInfoMap =
                        gson.fromJson(stringBeneficiaryInfo.get(), Map.class);
                return createDapiBeneficiaryInfo(beneficiaryInfoMap);
            }
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
