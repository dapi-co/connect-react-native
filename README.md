# DapiConnect-ReactNative

[![npm version](https://badge.fury.io/js/dapiconnect-reactnative.svg)](https://badge.fury.io/js/dapiconnect-reactnative)
[![npm](https://img.shields.io/npm/dt/dapiconnect-reactnative.svg)](https://npmcharts.com/compare/dapiconnect-reactnative?minimal=true)
![MIT](https://img.shields.io/dub/l/vibe-d.svg)
![Platform - Android and iOS](https://img.shields.io/badge/platform-Android%20%7C%20iOS-yellow.svg)
[![Gitter chat](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/dapiconnect-reactnative/Lobby)

Financial APIs to connect users' bank accounts

## Setup your own App

1. Install the SDK

    ```bash
    yarn install connect-react-native
    ```

2. Install all the dependencies for the project

    ```bash
    yarn install
    ```

3. Open ios/Podfile in a text editor: vim ios/Podfile, update the platform to iOS 10.3

```
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

- platform :ios, '10.0'
+ platform :ios, '10.3'

target 'example' do
  config = use_native_modules!

  use_react_native!(:path => config["reactNativePath"])

  target 'exampleTests' do
    inherit! :complete
    # Pods for testing
  end

  # Enables Flipper.
  #
  # Note that if you have use_frameworks! enabled, Flipper will not work and
  # you should disable these next few lines.
  use_flipper!
  post_install do |installer|
    flipper_post_install(installer)
  end
end
```

4. `npx pod-install` or `cd ios` and then `pod install`.

## Initiate SDK

1. Import Dapi.

    ```tsx
    import Dapi from 'connect-react-native';
    ```

2. Start the SDK

    ```tsx
        const configurations = {
        environment: 'production',
        countries: ['AE'],
        showAddButton: false,
        showLogos : true,
        showExperimentalBanks: false,
        showCloseButton : true,
        endPointExtraHeaderFields: {
          'data/identity/get': {authKey: authKey},
          'data/accounts/get': {authKey: authKey},
          'metadata/accounts/get': {authKey: authKey},
          'data/transactions/get': {authKey: authKey},
          'payment/transfer/autoflow': {authKey: authKey},
        },
        endPointExtraQueryItems : {
        'data/identity/get': {key: value},
        'data/accounts/get': {key: value},
        },
        endPointExtraBody : { 
        'metadata/accounts/get': {key: value},
        'data/transactions/get': {key: value},
        },
      };

        await Dapi.instance.start(
        'ae473ebe572718081692256b62589c29d83ad6d1167dadaa7822482da965723d',
        'JohnDoe',
        configurations, //optional
      );
    ```

    You can get the `appKey` from the dashboard.

    The `clientUserID` is for your own reference. The best practice is to use the userID you would refer to in your system.

3. Let's now create a connection object. As previously mentioned, a connection represents a user's connection to a bank. So if they authenticate and login, through Dapi, to 2 banks there will be 2 connections. 
Since you don't know yet which bank the user will choose, you will just display the connect page. The user has to then pick the bank and enter their credentials. 

    ```tsx
    Dapi.instance.presentConnect();
    ```

    Add listeners to handle a successful or a failed connection attempt.

    ```tsx
    const {DapiConnectManager} = NativeModules;
    const dapiConnectManagerEmitter = new NativeEventEmitter(DapiConnectManager);
    .
    .
    .

    dapiConnectManagerEmitter.addListener(
        'EventConnectSuccessful',
        successConnectResult => console.log(successConnectResult),
    );

    dapiConnectManagerEmitter.addListener(
        'EventConnectFailure',
        failureConnectResult => console.log(failureConnectResult),
    );

    dapiConnectManagerEmitter.addListener(
        'EventConnectDismissed', _ => {
        console.log('Connect is dismissed');
    });

    dapiConnectManagerEmitter.addListener(
        'EventConnectBankRequest',
        bankRequestResult => console.log(bankRequestResult),
    );
    ```

That's it. You can now try to run your app on the simulator and call the `presentConnect` function and see Dapi in action!

Now lets add some functionality to your integration.

## Dapi's Functions

There are 4 main functions that you will use to interact with the SDK.

### **Create Transfer**

Let's create a transfer from an account to another account. 

This could be from the user's account to your own account as a payment.
Or from the user's account to another external account. You can do both.

So in a nutshell, you can send money `from` an account `to` an account with a specific `amount`.

**All 3 variables are optional.**
The behaviour of the SDK will differ if you decide to set or omit these varialbles.

`to`

If you are accepting a transfer into your own company's account, you don't need to set a `to`. You can simply add one in your [dashboard](https://dashboard.dapi.co/) under your app. The `to` will automatically be set to that account.

If you didn't set a beneficiary on the dashboard AND you didn't add a `to` object in the `createTransfer` function, an error will be thrown.

`from`

If you don't set a `from` account, we will simply display a popup screen for your user to pick the account from our UI. 
If you do provide a `from` object, this screen won't be displayed. 
You can create your own accounts list page from the `getAccounts` function.

`amount`

If you don't set an `amount` we will display a screen with a numpad screen for your user to enter the amount in. 

```tsx
await connection.createTransfer(
      null,
      null,
      0,
      null,
);
```

Now let's say you want a little more control, and would like to set the `amount` and the `from`  account yourself.

Here we will pick the first account in the connection object. Remember, a bank connection might have several accounts, so the accounts object is a list. You will need to pick which account you're sending from.

```tsx
await connection.createTransfer(
      connection.accounts[0],
      null,
      100,
      null,
);
```

Now let's try sending money `to` an external account.

We first need to create a new Object called `Beneficiary`. We will then need to set a few details about the bank account we're sending the money to.

```tsx
var beneficiary = {
    address: {
      line1: 'baniyas road',
      line2: 'baniyas road',
      line3: 'baniyas road',
    },
    accountNumber: '123456789',
    bankName: 'Emirates NBD Bank PJSC',
    swiftCode: 'EBILAEAD',
    iban: 'AE123456789',
    country: 'AE',
    branchAddress: 'Baniyas Road Deira PO Box 777 Dubai UAE',
    branchName: 'Emirates NBD Bank PJSC',
    phoneNumber: '0123456789',
    name: 'John Doe',
};

await connection.createTransfer(
      connection.accounts[0],
      beneficiary,
      100,
      null,
);
```

Also, you may send money to an existing beneficiary using `createTransferToExistingBeneficiary` function, but you'll need to pass `beneficiaryID` to send the money to.

```tsx
    var beneficiariesResponse = await connection.getBeneficiaries();
    await connections.createTransferToExistingBeneficiary(
        connection.accounts[0],
        beneficiariesResponse.beneficiaries[7].id,
        10.43,
    )
```

You may add these listeners to know when the transfer UI is dismissed `EventDapiTransferUIDismissed`, or when the user is about to make a transfer using Dapi UI `EventDapiUIWillTransfer`.

```tsx
dapiConnectManagerEmitter.addListener('EventDapiTransferUIDismissed', _ => {
    console.log('Transfer UI is dismissed');
});

dapiConnectManagerEmitter.addListener('EventDapiUIWillTransfer',
    uiWillTransferResult => console.log(uiWillTransferResult),
);
```

### Get Accounts

Each bank `connection` will have a list of `accounts`.

```tsx
await connection.getAccounts();
```

### Get Identity

Get the identity information that has been confirmed by the bank.

These are the identity details that you will get. Not all banks provide all this data. So we will provide as much of it as possible.

`nationality
dateOfBirth
identification (passport or national ID)
numbers
emailAddress
name
address`

```tsx
await connection.getIdentity();
```

### Get Transactions

We can get the list of transactions for each account.

You first have to pick an account for which you would like to access the data. You then need to provide a `from` and `to` fields for the dates. These are optional and if they aren't provided we will just fetch the transactions as far back as the bank will allow us to.

```tsx
await connection.getTransactions(account, fromDate, toDate);
```

### Get Beneficiaries

Returns the account's registered beneficiaries list.

```tsx
await connection.getBeneficiaries();
```

### Create Beneficiary

Adds a new beneficiary

```tsx
var beneficiary = {
    address: {
      line1: 'baniyas road',
      line2: 'baniyas road',
      line3: 'baniyas road',
    },
    accountNumber: '123456789',
    bankName: 'Emirates NBD Bank PJSC',
    swiftCode: 'EBILAEAD',
    iban: 'AE123456789',
    country: 'AE',
    branchAddress: 'Baniyas Road Deira PO Box 777 Dubai UAE',
    branchName: 'Emirates NBD Bank PJSC',
    phoneNumber: '0123456789',
    name: 'John Doe',
};

await connection.createBeneficiary(beneficiary)
```
