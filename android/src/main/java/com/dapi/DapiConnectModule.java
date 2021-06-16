package com.dapi;

import android.util.Log;

import androidx.annotation.Nullable;

import co.dapi.connect.core.base.Dapi;
import co.dapi.connect.core.callbacks.OnDapiConnectListener;
import co.dapi.connect.core.callbacks.OnDapiTransferListener;
import co.dapi.connect.data.endpoint_models.DapiAccountsResponse;
import co.dapi.connect.data.endpoint_models.DapiCardsResponse;
import co.dapi.connect.data.models.DapiBeneficiary;
import co.dapi.connect.data.models.DapiConfigurations;
import co.dapi.connect.data.models.DapiConnection;
import co.dapi.connect.data.models.DapiEndpoints;
import co.dapi.connect.data.models.DapiEnvironment;
import co.dapi.connect.data.models.DapiError;
import co.dapi.connect.data.models.LinesAddress;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Dynamic;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.gson.Gson;

import org.jetbrains.annotations.NotNull;
import org.json.JSONException;
import org.json.JSONObject;

import java.lang.reflect.Array;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

import javax.annotation.Nonnull;

import kotlin.Unit;
import kotlin.jvm.functions.Function1;

@ReactModule(name = DapiConnectModule.NAME)
public class DapiConnectModule extends ReactContextBaseJavaModule {

    public static final String NAME = "DapiConnectManager";
    public static final String ERROR_CODE = "1015";

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
                Objects.requireNonNull(getCurrentActivity()).getApplication(),
                appKey,
                clientUserID,
                getConfigurations(configurationMap), () -> {
                    Log.i("DapiSDK", "Started");
                    resolve(null, promise);
                    return null;
                }, error -> {
                    reject(error, promise);
                    return null;
                }

        );
    }

    @ReactMethod
    public void isStarted(Promise promise) {
        resolve(Dapi.isStarted(), promise);
    }

    @ReactMethod
    public void presentConnect() {
        Dapi.presentConnect();
        setConnectListener();
        Log.i("DapiSDK", "Connect is presented");
    }

    @ReactMethod
    public void dismissConnect() {
        Dapi.dismissConnect();
        Log.i("DapiSDK", "Connect is dismissed");
    }


    @ReactMethod
    public void setClientUserID(String clientUserID) {
        Dapi.setClientUserID(clientUserID);
        Log.i("DapiSDK", "ClientUserID is set");
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
    public void setConfigurations(ReadableMap configurationMap) {
        Dapi.setConfigurations(getConfigurations(configurationMap));
        Log.i("DapiSDK", "New configurations set");
    }

    @ReactMethod
    public void configurations(Promise promise) {
        resolve(Dapi.getConfigurations(), promise);
    }

    @SuppressWarnings("ConstantConditions")
    @ReactMethod
    public void getConnections(Promise promise) {
        Dapi.getConnections(connections -> {
            WritableArray connectionsArray = new WritableNativeArray();
            for (DapiConnection connection : connections) {
                try {
                    WritableArray resultAccountMapArray = new WritableNativeArray();
                    for (DapiAccountsResponse.DapiAccount account : connection.getAccounts()) {
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
                    connectionMap.putString("bankID", connection.getBankId());
                    connectionMap.putString("swiftCode", connection.getSwiftCode());
                    connectionMap.putString("bankShortName", connection.getName());
                    connectionMap.putString("bankFullName", connection.getFullName());
                    connectionMap.putString("country", connection.getCountry());
                    connectionMap.putString("fullLogo", connection.getFullLogoPng());
                    connectionMap.putString("halfLogo", connection.getHalfLogoPng());
                    connectionMap.putString("miniLogo", connection.getMiniLogoPng());
                    connectionMap.putArray("accounts", resultAccountMapArray);
                    connectionsArray.pushMap(connectionMap);
                } catch (Exception e) {
                    Log.e("DapiSDK", e.toString());
                    reject(e.getMessage(), promise);
                }

            }
            Log.i("DapiSDK", "Connections: " + connectionsArray.size());
            resolve(connectionsArray, promise);
            return null;
        }, error -> {
            reject(error, promise);
            return null;
        });
    }


    @ReactMethod
    public void getIdentity(String userID, Promise promise) {
        getOperatingConnection(userID, connection -> {
            connection.getIdentity(identity -> {
                Log.i("DapiSDK", "getIdentity call success");
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
            connection.getAccounts(accounts -> {
                Log.i("DapiSDK", "getAccounts call success");
                resolve(accounts, promise);
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
    public void getCards(String userID, Promise promise) {
        getOperatingConnection(userID, connection -> {
            connection.getCards(cards -> {
                Log.i("DapiSDK", "getCards call success");
                resolve(cards, promise);
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
    public void getTransactionsForAccount(
            String userID,
            String accountID,
            Dynamic startDate,
            Dynamic endDate,
            Promise promise
    ) {
        long startDateAsLong = (long) startDate.asDouble();
        long endDateAsLong = (long) endDate.asDouble();

        Date startDateObject = new Date(startDateAsLong);
        Date endDateObject = new Date(endDateAsLong);

        getOperatingConnection(userID, connection -> {
            DapiAccountsResponse.DapiAccount account = getDapiAccount(accountID, connection);
            connection.getTransactions(account, startDateObject, endDateObject, transactions -> {
                Log.i("DapiSDK", "getTransactionsForAccount call success");
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
    public void getTransactionsForCard(
            String userID,
            String cardID,
            Dynamic startDate,
            Dynamic endDate,
            Promise promise
    ) {
        long startDateAsLong = (long) startDate.asDouble();
        long endDateAsLong = (long) endDate.asDouble();

        Date startDateObject = new Date(startDateAsLong);
        Date endDateObject = new Date(endDateAsLong);

        getOperatingConnection(userID, connection -> {
            DapiCardsResponse.DapiCard card = getDapiCard(cardID, connection);
            connection.getTransactions(card, startDateObject, endDateObject, transactions -> {
                Log.i("DapiSDK", "getTransactionsForCard call success");
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
                Log.i("DapiSDK", "getAccountsMetadata call success");
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
                Log.i("DapiSDK", "delete call success");
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
            double amount,
            String remark,
            Promise promise
    ) {
        setTransferListener(promise);
        getOperatingConnection(userID, connection -> {
            DapiAccountsResponse.DapiAccount account = getDapiAccount(accountID, connection);
            DapiBeneficiary beneficiary = getBeneficiary(beneficiaryMap);
            connection.createTransfer(account, beneficiary, amount, remark);
            return null;
        }, error -> {
            reject(error, promise);
            return null;
        });
    }

    @ReactMethod
    public void createTransferToExistingBeneficiary(
            String userID,
            String accountID,
            String receiverID,
            double amount,
            String remark,
            Promise promise
    ) {
        setTransferListener(promise);
        getOperatingConnection(userID, connection -> {
            DapiAccountsResponse.DapiAccount account = getDapiAccount(accountID, connection);
            connection.createTransferToExistingBeneficiary(account, receiverID, amount, remark);
            return null;
        }, error -> {
            reject(error, promise);
            return null;
        });
    }

    @ReactMethod
    public void getBeneficiaries(String userID, Promise promise) {
        getOperatingConnection(userID, connection -> {
            connection.getBeneficiaries(beneficiaries -> {
                Log.i("DapiSDK", "getBeneficiaries call success");
                resolve(beneficiaries, promise);
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
    public void createBeneficiary(String userID, ReadableMap beneficiaryMap, Promise promise) {
        getOperatingConnection(userID, connection -> {
            connection.createBeneficiary(getBeneficiary(beneficiaryMap), createBeneficiary -> {
                Log.i("DapiSDK", "createBeneficiary call success");
                resolve(createBeneficiary, promise);
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
    public void createConnection(String jsonConnectionParameters, Promise promise) {
        DapiConnection.Companion.create(jsonConnectionParameters, connection -> {
            WritableMap connectionMap = new WritableNativeMap();
            connectionMap.putString("userID", connection.getUserID());
            connectionMap.putString("clientUserID", connection.getClientUserID());
            connectionMap.putString("bankID", connection.getBankId());
            connectionMap.putString("swiftCode", connection.getSwiftCode());
            connectionMap.putString("bankShortName", connection.getName());
            connectionMap.putString("bankFullName", connection.getFullName());
            connectionMap.putString("country", connection.getCountry());
            connectionMap.putString("fullLogo", connection.getFullLogoPng());
            connectionMap.putString("halfLogo", connection.getHalfLogoPng());
            connectionMap.putString("miniLogo", connection.getMiniLogoPng());
            resolve(connectionMap, promise);
            return null;
        }, error -> {
            reject(error, promise);
            return null;
        });
    }

    @ReactMethod
    public void getConnectionParameters(String userID, Promise promise) {
        getOperatingConnection(userID, connection -> {
            resolve(connection.getParameters(), promise);
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
            if (data instanceof WritableArray || data instanceof WritableMap || data instanceof Boolean || data instanceof String) {
                promise.resolve(data);
            } else {
                promise.resolve(JsonConvert.jsonToReact(convertToJSONObject(data)));
            }

        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private <T> void reject(T error, Promise promise) {
        Log.e("DapiSDK", error.toString());
        try {
            if (error instanceof DapiError) {
                Throwable throwable = new Throwable(((DapiError) error).getMessage());
                promise.reject(ERROR_CODE, throwable);
            } else {
                promise.reject(ERROR_CODE, error.toString());
            }

        } catch (Exception e) {
            promise.reject(ERROR_CODE, e);
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

    @SuppressWarnings({"ConstantConditions"})
    private DapiConfigurations getConfigurations(ReadableMap configurations) {
        if (configurations == null) {
            return null;
        }
        HashMap<String, Object> extraQueryParameters;
        HashMap<String, Object> extraHeaderFields;
        HashMap<String, Object> extraBody;
        DapiEndpoints endpoints;
        DapiEnvironment environment;
        ReadableArray countries = null;
        boolean showLogos = true;
        boolean showExperimentalBanks = false;
        boolean showCloseButton = true;
        boolean showAddButton = true;

        if (configurations.hasKey("countries")) {
            countries = configurations.getArray("countries");
        }

        if (configurations.hasKey("showLogos")) {
            showLogos = configurations.getBoolean("showLogos");
        }

        if (configurations.hasKey("showExperimentalBanks")) {
            showExperimentalBanks = configurations.getBoolean("showExperimentalBanks");
        }

        if (configurations.hasKey("showCloseButton")) {
            showCloseButton = configurations.getBoolean("showCloseButton");
        }

        if (configurations.hasKey("showAddButton")) {
            showAddButton = configurations.getBoolean("showAddButton");
        }

        if (!configurations.hasKey("endPointExtraQueryItems")) {
            extraQueryParameters = new HashMap<>();
        } else {
            extraQueryParameters = configurations.getMap("endPointExtraQueryItems").toHashMap();
        }

        if (!configurations.hasKey("endPointExtraHeaderFields")) {
            extraHeaderFields = new HashMap<>();
        } else {
            extraHeaderFields = configurations.getMap("endPointExtraHeaderFields").toHashMap();
        }

        if (!configurations.hasKey("endPointExtraBody")) {
            extraBody = new HashMap<>();
        } else {
            extraBody = configurations.getMap("endPointExtraBody").toHashMap();
        }

        if (!configurations.hasKey("environment")) {
            environment = DapiEnvironment.PRODUCTION;
        } else {
            String environmentString = configurations.getString("environment");
            if (environmentString.equals("sandbox")) {
                environment = DapiEnvironment.SANDBOX;
            } else {
                environment = DapiEnvironment.PRODUCTION;
            }
        }

        if (!configurations.hasKey("endpoints")) {
            endpoints = new DapiEndpoints();
        } else {
            endpoints = getDapiEndpoints(configurations);
        }

        String[] countriesArray;
        if (countries != null) {
            countriesArray = toArray(countries.toArrayList(), String.class);
        } else {
            countriesArray = new String[]{};
        }

        return new DapiConfigurations(
                endpoints,
                extraBody,
                extraQueryParameters,
                extraHeaderFields,
                environment,
                countriesArray,
                showLogos,
                showExperimentalBanks,
                showCloseButton,
                showAddButton
        );
    }

    @SuppressWarnings("ConstantConditions")
    private DapiEndpoints getDapiEndpoints(ReadableMap configurations) {
        Map<String, Object> endpointsMap = configurations.getMap("endpoints").toHashMap();
        String getIdentity;
        String getAccounts;
        String getTransactions;
        String accountMetaData;
        String createTransfer;
        String createTransferToExistingBeneficiary;
        String createBeneficiary;
        String getBeneficiaries;
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

        if (endpointsMap.get("createTransfer") == null) {
            createTransfer = DapiEndpoints.CREATE_TRANSFER_AUTOFLOW_ENDPOINT;
        } else {
            createTransfer = (String) endpointsMap.get("createTransfer");
        }

        if (endpointsMap.get("createTransferToExistingBeneficiary") == null) {
            createTransferToExistingBeneficiary = DapiEndpoints.CREATE_TRANSFER_TO_EXISTING_BENEFICIARY_ENDPOINT;
        } else {
            createTransferToExistingBeneficiary = (String) endpointsMap.get("createTransferToExistingBeneficiary");
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

        if (endpointsMap.get("delete") == null) {
            delete = DapiEndpoints.DELETE_CONNECTION_ENDPOINT;
        } else {
            delete = (String) endpointsMap.get("delete");
        }

        return new DapiEndpoints(
                getIdentity,
                getAccounts,
                getTransactions,
                accountMetaData,
                createTransfer,
                createTransferToExistingBeneficiary,
                createBeneficiary,
                getBeneficiaries,
                delete
        );
    }

    @SuppressWarnings({"rawtypes", "unchecked", "SameParameterValue"})
    private <T> T[] toArray(Collection collection, Class<T> clazz) {
        T[] array = (T[]) Array.newInstance(clazz, collection.size());
        return ((Collection<T>) collection).toArray(array);
    }

    private DapiBeneficiary getBeneficiary(ReadableMap beneficiaryMap) {
        ReadableMap linesMap = beneficiaryMap.getMap("address");
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

    private DapiAccountsResponse.DapiAccount getDapiAccount(String accountID, DapiConnection connection) {
        for (DapiAccountsResponse.DapiAccount account : connection.getAccounts()) {
            if (account.getId().equals(accountID)) {
                return account;
            }
        }
        return null;
    }

    private DapiCardsResponse.DapiCard getDapiCard(String cardID, DapiConnection connection) {
        for (DapiCardsResponse.DapiCard card : connection.getCards()) {
            if (card.getId().equals(cardID)) {
                return card;
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
            public void onBankRequest(@NotNull String bankName, @NotNull String iban) {
                WritableMap params = Arguments.createMap();
                params.putString("bankName", bankName);
                params.putString("iban", iban);
                sendEvent(getReactApplicationContext(), "EventConnectBankRequest", params);
            }

            @Override
            public void onDismissed() {
                sendEvent(getReactApplicationContext(), "EventConnectDismissed", null);
            }

            @Override
            public void onConnectionSuccessful(@NotNull DapiConnection connection) {
                WritableMap params = Arguments.createMap();
                try {
                    params.putMap("connection", JsonConvert.jsonToReact(convertToJSONObject(connection)));
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                sendEvent(getReactApplicationContext(), "EventConnectSuccessful", params);
            }

            @Override
            public void onConnectionFailure(@NotNull DapiError error, @NotNull String bankID) {
                WritableMap params = Arguments.createMap();
                params.putString("bankID", bankID);
                params.putString("error", error.getMessage());
                sendEvent(getReactApplicationContext(), "EventConnectFailure", params);
            }
        });

    }

    private void setTransferListener(Promise promise) {
        Dapi.setTransferListener(new OnDapiTransferListener() {
            @Override
            public void willTransferAmount(double sentAmount, @NotNull DapiAccountsResponse.DapiAccount senderAccount) {
                WritableMap params = Arguments.createMap();
                params.putDouble("amount", sentAmount);
                try {
                    params.putMap("account", JsonConvert.jsonToReact(convertToJSONObject(senderAccount)));
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                sendEvent(getReactApplicationContext(), "EventDapiUIWillTransfer", params);
            }

            @Override
            public void onTransferSuccess(@NotNull DapiAccountsResponse.DapiAccount senderAccount, double sentAmount, @org.jetbrains.annotations.Nullable String reference) {
                HashMap<String, Object> successfulTransferMap = new HashMap<>();
                successfulTransferMap.put("account", senderAccount.getId());
                successfulTransferMap.put("amount", sentAmount);
                Log.i("DapiSDK", "createTransfer call success");
                resolve(successfulTransferMap, promise);
            }

            @Override
            public void onTransferFailure(@org.jetbrains.annotations.Nullable DapiAccountsResponse.DapiAccount account, @NotNull DapiError error) {
                JSONObject errorObject = new JSONObject();
                try {
                    errorObject.put("error", error.getMessage());
                    errorObject.put("account", account);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                reject(errorObject, promise);
            }

            @Override
            public void onUiDismissed() {
                sendEvent(getReactApplicationContext(), "EventDapiTransferUIDismissed", null);
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
