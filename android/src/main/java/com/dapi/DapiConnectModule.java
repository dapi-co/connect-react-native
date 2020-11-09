package com.dapi;


import android.app.Application;
import android.util.Log;
import android.webkit.WebView;
import android.widget.Toast;

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
import com.dapi.connect.data.models.DapiBeneficiaryInfo;
import com.dapi.connect.data.models.DapiConfigurations;
import com.dapi.connect.data.models.DapiConnection;
import com.dapi.connect.data.models.DapiEndpoints;
import com.dapi.connect.data.models.DapiError;
import com.dapi.connect.data.models.LinesAddress;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Dynamic;
import com.facebook.react.bridge.NativeModule;
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
import com.facebook.react.bridge.WritableMap;
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
    public void newClientWithConfigurations(ReadableMap configurations) {
        DapiConfigurations dapiConfigurations = extractConfigurations(configurations);
        new DapiClient(getCurrentActivity().getApplication(), dapiConfigurations);
    }

    @ReactMethod
    public void setUserID(String userID){
        DapiClient.Companion.getInstance().setUserID(userID);
    }

    @ReactMethod
    public void userID(Callback callback) {
        String userID = DapiClient.Companion.getInstance().getUserID();
        if (userID == null){
            callback.invoke("UserID is not set", null);
        }else {
            callback.invoke(null, userID);
        }
    }

    @ReactMethod
    public void setClientUserID(String clientUserID){
        DapiClient.Companion.getInstance().setClientUserID(clientUserID);
    }

    @ReactMethod
    public void clientUserID(Callback callback){
        String clientUserID = DapiClient.Companion.getInstance().getClientUserID();
        if (clientUserID == null){
            callback.invoke("ClientUserID is not set", null);
        }else {
            callback.invoke(null, clientUserID);
        }
    }

    @ReactMethod
    public void presentConnect(String beneficiaryInfo) {
        DapiClient dapiClient = DapiClient.Companion.getInstance();
        dapiClient.getConnect().present();
        addConnectListener(beneficiaryInfo);
    }

    @ReactMethod
    public void dismissConnect() {
        DapiClient dapiClient = DapiClient.Companion.getInstance();
        dapiClient.getConnect().dismiss();
    }

    @ReactMethod
    public void getConnections(final Callback callback) {
        DapiClient dapiClient = DapiClient.Companion.getInstance();
        dapiClient.getConnect().getConnections(dapiConnections -> {
            WritableArray writableArray = new WritableNativeArray();
            for (DapiConnection connection : dapiConnections) {
                try {
                    WritableMap writableMap = new WritableNativeMap();
                    writableMap.putString("userID", connection.getUserID());
                    writableMap.putString("clientUserID", connection.getClientUserID());
                    writableMap.putString("bankID", connection.getBankID());
                    writableMap.putString("bankName", connection.getShortBankName());
                    JSONObject jsonObject = convertToJSONObject(connection.getCoolDownPeriod());
                    writableMap.putMap("beneficiaryCoolDownPeriod", JsonConvert.jsonToReact(jsonObject));
                    writableMap.putString("countryName", connection.getCountry());
                    writableMap.putBoolean("isCreateBeneficiaryEndpointRequired", connection.isCreateBeneficiaryRequired());
                    writableArray.pushMap(writableMap);
                } catch (Exception e) {
                    callback.invoke(e.getMessage(), null);
                }

            }
            callback.invoke(null, writableArray);
            return null;
        }, error -> {
            JSONObject jsonObject = convertToJSONObject(error);
            try {
                callback.invoke(JsonConvert.jsonToReact(jsonObject), null);
            } catch (Exception e) {

            }
            return null;
        });
    }

    @ReactMethod
    public void presentAutoFlow(String beneficiaryInfo) {
        DapiClient dapiClient = DapiClient.Companion.getInstance();
        dapiClient.getAutoFlow().present(null, 0);
        addAutoFlowListener(beneficiaryInfo);
    }

    @ReactMethod
    public void dismissAutoFlow() {
        DapiClient dapiClient = DapiClient.Companion.getInstance();
        dapiClient.getAutoFlow().dismiss();
    }

    @ReactMethod
    public void getIdentity(Promise promise) {
        DapiDataClient data = DapiClient.Companion.getInstance().getData();
        data.getIdentity(identity -> {
            try {
                promise.resolve(JsonConvert.jsonToReact(convertToJSONObject(identity)));
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        }, error -> {
            JSONObject jsonObject = convertToJSONObject(error);
            try {
                promise.reject("1015", JsonConvert.jsonToReact(jsonObject));
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        });
    }

    @ReactMethod
    public void getAccounts(Promise promise) {
        DapiDataClient data = DapiClient.Companion.getInstance().getData();
        data.getAccounts(accounts -> {
            try {
                promise.resolve(JsonConvert.jsonToReact(convertToJSONObject(accounts)));
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        }, error -> {
            JSONObject jsonObject = convertToJSONObject(error);
            try {
                promise.reject("1015", JsonConvert.jsonToReact(jsonObject));
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        });
    }

    @ReactMethod
    public void getBalance(String accountID, Promise promise) {
        DapiDataClient data = DapiClient.Companion.getInstance().getData();
        data.getBalance(accountID, balance -> {
            try {
                promise.resolve(JsonConvert.jsonToReact(convertToJSONObject(balance)));
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        }, error -> {
            JSONObject jsonObject = convertToJSONObject(error);
            try {
                promise.reject("1015", JsonConvert.jsonToReact(jsonObject));
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        });
    }

    @ReactMethod
    public void getTransactions(String accountID,
                                Dynamic startDate,
                                Dynamic endDate,
                                Promise promise) {
        DapiDataClient data = DapiClient.Companion.getInstance().getData();

        long startDateAsLong = (long) startDate.asDouble();
        long endDateAsLong = (long) endDate.asDouble();

        Date startDateObject = new Date(startDateAsLong);
        Date endDateObject = new Date(endDateAsLong);

        data.getTransactions(accountID, startDateObject, endDateObject, transactions -> {
            try {
                promise.resolve(JsonConvert.jsonToReact(convertToJSONObject(transactions)));
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        }, error -> {
            JSONObject jsonObject = convertToJSONObject(error);
            try {
                promise.reject("1015", JsonConvert.jsonToReact(jsonObject));
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        });
    }

    @ReactMethod
    public void getAccountsMetadata(Promise promise) {
        DapiMetaDataClient metadata = DapiClient.Companion.getInstance().getMetadata();
        metadata.getAccountMetaData(accountMetaData -> {
            try {
                promise.resolve(JsonConvert.jsonToReact(convertToJSONObject(accountMetaData)));
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        }, error -> {
            JSONObject jsonObject = convertToJSONObject(error);
            try {
                promise.reject("1015", JsonConvert.jsonToReact(jsonObject));
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        });
    }

    @ReactMethod
    public void delinkUser(Promise promise) {
        DapiAuthClient auth = DapiClient.Companion.getInstance().getAuth();
        auth.delink(delinkUser -> {
            try {
                promise.resolve(JsonConvert.jsonToReact(convertToJSONObject(delinkUser)));
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        }, error -> {
            JSONObject jsonObject = convertToJSONObject(error);
            try {
                promise.reject("1015", JsonConvert.jsonToReact(jsonObject));
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        });
    }

    @ReactMethod
    public void getBeneficiaries(Promise promise) {
        DapiPaymentClient payment = DapiClient.Companion.getInstance().getPayment();
        payment.getBeneficiaries(beneficiaries -> {
            try {
                promise.resolve(JsonConvert.jsonToReact(convertToJSONObject(beneficiaries)));
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        }, error -> {
            JSONObject jsonObject = convertToJSONObject(error);
            try {
                promise.reject("1015", JsonConvert.jsonToReact(jsonObject));
            } catch (JSONException e) {
                e.printStackTrace();
            }
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
            Promise promise
    ) {
        DapiPaymentClient payment = DapiClient.Companion.getInstance().getPayment();
        payment.createTransfer(iban, name, senderID, amount, remark, transfer -> {
            try {
                promise.resolve(JsonConvert.jsonToReact(convertToJSONObject(transfer)));
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        }, error -> {
            JSONObject jsonObject = convertToJSONObject(error);
            try {
                promise.reject("1015", JsonConvert.jsonToReact(jsonObject));
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        });
    }

    @ReactMethod
    public void createTransferToReceiverID(
            String receiverID,
            String senderID,
            Double amount,
            String remark,
            Promise promise
    ) {
        DapiPaymentClient payment = DapiClient.Companion.getInstance().getPayment();
        payment.createTransfer(receiverID, senderID, amount, remark, transfer -> {
            try {
                promise.resolve(JsonConvert.jsonToReact(convertToJSONObject(transfer)));
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        }, error -> {
            JSONObject jsonObject = convertToJSONObject(error);
            try {
                promise.reject("1015", JsonConvert.jsonToReact(jsonObject));
            } catch (JSONException e) {
                e.printStackTrace();
            }
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
            Promise promise
    ) {
        DapiPaymentClient payment = DapiClient.Companion.getInstance().getPayment();
        payment.createTransfer(accountNumber, name, amount, senderID, remark, transfer -> {
            try {
                promise.resolve(JsonConvert.jsonToReact(convertToJSONObject(transfer)));
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        }, error -> {
            JSONObject jsonObject = convertToJSONObject(error);
            try {
                promise.reject("1015", JsonConvert.jsonToReact(jsonObject));
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        });
    }

    @ReactMethod
    private void createBeneficiary(
            ReadableMap dapiBeneficiaryInfo,
            Promise promise
    ) {

        DapiPaymentClient payment = DapiClient.Companion.getInstance().getPayment();

        DapiBeneficiaryInfo info = extractBeneficiaryInfo(dapiBeneficiaryInfo.toHashMap());
        payment.createBeneficiary(info, beneficiary -> {
            try {
                promise.resolve(JsonConvert.jsonToReact(convertToJSONObject(beneficiary)));
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        }, error -> {
            JSONObject jsonObject = convertToJSONObject(error);
            try {
                promise.reject("1015", JsonConvert.jsonToReact(jsonObject));
            } catch (JSONException e) {
                e.printStackTrace();
            }
            return null;
        });
    }

    private DapiBeneficiaryInfo extractBeneficiaryInfo(String beneficiaryInfo) {
        Gson gson = new Gson();
        Map<String, Object> dapiBeneficiaryInfo =
                gson.fromJson(beneficiaryInfo, Map.class);

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

    private DapiBeneficiaryInfo extractBeneficiaryInfo(Map<String, Object> dapiBeneficiaryInfo) {
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

    private void sendEvent(ReactContext reactContext,
                           String eventName,
                           @Nullable WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    private DapiConfigurations extractConfigurations(ReadableMap configurations) {
        String appKey = null;
        String clientUserID = null;
        String userID = null;
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

        if (!configurations.hasKey("userID")) {
            userID = null;
        } else {
            userID = (String) configurations.getString("userID");
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
            String resumeJob;

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

            if (endpointsMap.get("resumeJob") == null) {
                resumeJob = DapiEndpoints.RESUME_JOB_ENDPOINT;
            } else {
                resumeJob = (String) endpointsMap.get("resumeJob");
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
                    delinkUser,
                    getIdentity
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

        HashMap<String, Object> extraBodyMap =
                (extraBody instanceof HashMap)
                        ? (HashMap) extraBody
                        : new HashMap<String, Object>(extraBody);

        HashMap<String, Object> extraHeadersMap =
                (extraHeaders instanceof HashMap)
                        ? (HashMap) extraHeaders
                        : new HashMap<String, Object>(extraHeaders);

        HashMap<String, Object> extraParamsMap =
                (extraParams instanceof HashMap)
                        ? (HashMap) extraParams
                        : new HashMap<String, Object>(extraParams);

        HashMap<String, String> finalExtraBodyMap = new HashMap<>();
        for (Map.Entry<String, Object> entry : extraBodyMap.entrySet()) {
            if (entry.getValue() instanceof String) {
                finalExtraBodyMap.put(entry.getKey(), (String) entry.getValue());
            }
        }

        HashMap<String, String> finalExtraHeadersMap = new HashMap<>();
        for (Map.Entry<String, Object> entry : extraBodyMap.entrySet()) {
            if (entry.getValue() instanceof String) {
                finalExtraHeadersMap.put(entry.getKey(), (String) entry.getValue());
            }
        }

        HashMap<String, String> finalExtraParamsMap = new HashMap<>();
        for (Map.Entry<String, Object> entry : extraBodyMap.entrySet()) {
            if (entry.getValue() instanceof String) {
                finalExtraParamsMap.put(entry.getKey(), (String) entry.getValue());
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
                userID,
                isExperimental,
                theme,
                finalExtraHeadersMap,
                finalExtraParamsMap,
                finalExtraBodyMap,
                endpoints
        );
    }

    private void addConnectListener(String beneficiaryInfo) {
        DapiClient dapiClient = DapiClient.Companion.getInstance();
        AtomicReference<String> stringBeneficiaryInfo = new AtomicReference<>();
        dapiClient.getConnect().setOnConnectListener(new OnDapiConnectListener() {
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
                executor.execute(() -> {
                    getCurrentActivity().runOnUiThread(new Runnable() {
                        public void run() {
                            WebView webView = new WebView(getReactApplicationContext());
                            webView.getSettings().setJavaScriptEnabled(true);

                            webView.evaluateJavascript(fullFunction, response -> {
                                stringBeneficiaryInfo.set(response);
                            });
                        }
                    });
                });

                executor.shutdown();
            }

            @Nullable
            @Override
            public DapiBeneficiaryInfo setBeneficiaryInfoOnConnect(@NotNull String bankID) {
                return extractBeneficiaryInfo(stringBeneficiaryInfo.get());
            }
        });

    }

    private void addAutoFlowListener(String beneficiaryInfo) {
        DapiClient dapiClient = DapiClient.Companion.getInstance();
        AtomicReference<String> stringBeneficiaryInfo = new AtomicReference<>();
        dapiClient.getAutoFlow().setOnTransferListener(new OnDapiTransferListener() {
            @Override
            public void onAutoFlowSuccessful(double amount, @Nullable String senderAccountID, @Nullable String recipientAccountID, @NotNull String jobID) {
                WritableMap params = Arguments.createMap();
                params.putDouble("amount", amount);
                params.putString("senderID", senderAccountID);
                params.putString("receiverID", recipientAccountID);
                params.putString("jobID", jobID);
                sendEvent(getReactApplicationContext(), "EventAutoFlowSuccessful", params);

            }

            @Override
            public void onAutoFlowFailure(@NotNull DapiError error, @Nullable String senderAccountID, @Nullable String recipientAccountID) {
                WritableMap params = Arguments.createMap();
                try {
                    params.putMap("error", JsonConvert.jsonToReact(convertToJSONObject(error)));
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                params.putString("senderID", senderAccountID);
                params.putString("receiverID", recipientAccountID);
                sendEvent(getReactApplicationContext(), "EventAutoFlowFailure", params);

            }

            @Override
            public void onPaymentStarted(@NotNull String bankID) {
                String fullFunction = String.format(beneficiaryInfo + "(`%s`)", bankID);
                ExecutorService executor = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors());
                executor.execute(() -> {
                    getCurrentActivity().runOnUiThread(new Runnable() {
                        public void run() {
                            WebView webView = new WebView(getReactApplicationContext());
                            webView.getSettings().setJavaScriptEnabled(true);

                            webView.evaluateJavascript(fullFunction, response -> {
                                stringBeneficiaryInfo.set(response);
                            });
                        }
                    });
                });

                executor.shutdown();
            }

            @NotNull
            @Override
            public DapiBeneficiaryInfo setBeneficiaryInfoOnAutoFlow(@NotNull String bankID) {
                return extractBeneficiaryInfo(stringBeneficiaryInfo.get());
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
