/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';

import Dapi, {
  DapiConfigurations,
  DapiConnection,
  DapiEndpoint,
  DapiEnvironment,
} from 'connect-react-native';

import {Header, Colors} from 'react-native/Libraries/NewAppScreen';

const {DapiConnectManager} = NativeModules;
const dapiConnectManagerEmitter = new NativeEventEmitter(DapiConnectManager);
let params = null;

async function startDapi() {
  let configs = generateConfigs('ABC');

  await Dapi.instance.start(
    '1d4592c4a8dd6ff75261e57eb3f80c518d7857d6617769af3f8f04b0590baceb',
    'JohnDoe',
    configs,
  );
}

function generateConfigs(authKey) {
  const configurations = {
    environment: 'production',
    countries: ['AE'],
    showAddButton: false,
    showLogos: true,
    showExperimentalBanks: false,
    showCloseButton: true,
    // endPointExtraHeaderFields: {
    //   'data/identity/get': {authKey: authKey},
    //   'data/accounts/get': {authKey: authKey},
    //   'metadata/accounts/get': {authKey: authKey},
    //   'data/transactions/get': {authKey: authKey},
    //   'payment/transfer/autoflow': {authKey: authKey},
    // },
    // endPointExtraQueryItems: {
    //   'data/identity/get': {authKey: authKey},
    //   'data/accounts/get': {authKey: authKey},
    // },
    // endPointExtraBody: {
    //   'metadata/accounts/get': {authKey: authKey},
    //   'data/transactions/get': {authKey: authKey},
    // },
  };

  console.log(configurations);

  return configurations;
}

function resetConfigs() {
  var d = new Date();
  var n = d.toLocaleTimeString();

  let configs = generateConfigs(n);
  Dapi.instance.setConfigurations(configs);
}

async function getConfigurations() {
  var retrievedConfigurations = await Dapi.instance.configurations();
  console.log(retrievedConfigurations);
}

function presentConnect() {
  Dapi.instance.presentConnect();
  dapiConnectManagerEmitter.addListener(
    'EventConnectSuccessful',
    successConnectResult => console.log(successConnectResult),
  );
  dapiConnectManagerEmitter.addListener(
    'EventConnectFailure',
    failureConnectResult => console.log(failureConnectResult),
  );
  dapiConnectManagerEmitter.addListener('EventConnectDismissed', _ => {
    console.log('Connect is dismissed');
  });

  dapiConnectManagerEmitter.addListener(
    'EventConnectBankRequest',
    bankRequestResult => console.log(bankRequestResult),
  );
}

async function getConnections() {
  var connections = await Dapi.instance.getConnections();
  console.log(connections);
}

async function getIdentity() {
  var connections = await Dapi.instance.getConnections();
  if (connections.length > 0) {
    var identity = await connections[0].getIdentity();

    console.log(identity.identity.emailAddress);
  }
}

async function getAccounts() {
  var connections = await Dapi.instance.getConnections();
  if (connections.length > 0) {
    var accountsResponse = await connections[0].getAccounts();

    console.log(accountsResponse.accounts);
  }
}

async function getMetadata() {
  var connections = await Dapi.instance.getConnections();
  if (connections.length > 0) {
    var metadata = await connections[0].getAccountsMetadata();
    console.log(metadata.accountsMetadata.beneficiaryCoolDownPeriod);
  }
}

async function transfer() {
  dapiConnectManagerEmitter.addListener('EventDapiTransferUIDismissed', _ => {
    console.log('Transfer UI is dismissed');
  });

  dapiConnectManagerEmitter.addListener(
    'EventDapiUIWillTransfer',
    uiWillTransferResult => console.log(uiWillTransferResult),
  );

  var beneficiary = {
    address: {
      line1: 'baniyas road',
      line2: 'dubai',
      line3: 'united arab emirates',
    },
    accountNumber: '18243421401',
    bankName: 'STANDARD CHARTERED BANK',
    swiftCode: 'SCBLAEAD',
    iban: 'AE220440000010243421401',
    country: 'AE',
    branchAddress: 'Dubai Mall',
    branchName: 'Dubai Mall',
    phoneNumber: '+971585859206',
    name: 'Mohammed Ennabah SC',
  };

  var connections = await Dapi.instance.getConnections();
  if (connections.length > 0) {
    await connections[0]
      .createTransfer(null, beneficiary, 1.42, 'test')
      .then(accountsResponse => {
        console.log('accountsResponse');
        console.log(accountsResponse.account.currency);
        console.log(accountsResponse.amount);
      })
      .catch(error => {
        let json = JSON.parse(error.message);
        console.log(json);
        let errorMessage = json.error;
        let account = json.account;
        console.log(json);
        console.log(errorMessage);
        console.log(account);
        if (errorMessage.includes('Beneficiary will be activated')) {
          console.log('This is a coolDownPeriod error');
        }
      });
  }
}

async function transferToExistingBeneficiary() {
  var connections = await Dapi.instance.getConnections();
  if (connections.length > 0) {
    var beneficiariesResponse = await connections[0].getBeneficiaries();
    await connections[0]
      .createTransferToExistingBeneficiary(
        connections[0].accounts[0],
        beneficiariesResponse.beneficiaries[7].id,
        1.43,
      )
      .then(transfer => console.log(transfer))
      .catch(error => {
        let json = JSON.parse(error.message);
        console.log(json);
        let errorMessage = json.error;
        let account = json.account;
        if (errorMessage.includes('Beneficiary will be activated')) {
          console.log('This is a coolDownPeriod error');
        }
      });
  }
}

async function getBeneficiaries() {
  var connections = await Dapi.instance.getConnections();
  if (connections.length > 0) {
    await connections[0]
      .getBeneficiaries()
      .then(beneficiaries => console.log(beneficiaries))
      .catch(error => {
        console.log(error);
      });
  }
}

async function createBeneficiary() {
  var beneficiary = {
    address: {
      line1: 'baniyas road',
      line2: 'dubai',
      line3: 'united arab emirates',
    },
    accountNumber: '11352348001',
    bankName: 'Sharjah Islamic Bank',
    swiftCode: 'NBSHAEAS',
    iban: 'AE270410000011352348001',
    country: 'AE',
    branchAddress: 'Sheikh Zayed Road',
    branchName: 'Sheikh Zayed Road Branch',
    phoneNumber: '+971501977498',
    name: 'Kamil Abid Kamili',
  };

  var connections = await Dapi.instance.getConnections();
  if (connections.length > 0) {
    await connections[0]
      .createBeneficiary(beneficiary)
      .then(beneficiary => console.log(beneficiary))
      .catch(error => {
        console.log(error);
      });
  }
}

async function isStarted() {
  var isStarted = await Dapi.instance.isStarted();
  console.log(isStarted);
}

async function clientUserID() {
  var clientUserID = await Dapi.instance.clientUserID();
  console.log(clientUserID);
}

async function getParameters() {
  var connections = await Dapi.instance.getConnections();
  if (connections.length > 0) {
    params = await connections[0].getParameters();
    const jsonParams = JSON.parse(params);
    var prettyParams = JSON.stringify(jsonParams, null, 2);
    console.log('connection params:\n', prettyParams);
  }
}

async function create() {
  var jsonConnection =
    '{"accessCode":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBLZXkiOiIxZDQ1OTJjNGE4ZGQ2ZmY3NTI2MWU1N2ViM2Y4MGM1MThkNzg1N2Q2NjE3NzY5YWYzZjhmMDRiMDU5MGJhY2ViIiwiZXhwIjoxNjIyOTY1NzgwLCJpYXQiOjE2MjI5NjU0ODAsImp0aSI6Ijc0YjQzOWIyLWM4YzYtNDlmNS1hYTY3LTM3NDM0YTY3MGU0MSIsIm90cCI6IkUxMWdEWWRJRTB0TlpMd29ITmk5OHdHMG81TUl6ZCtiMzdTRkJ0emJ5WXM9IiwidXVpZCI6IjhhYzZmZTJlLTEwMmMtNDlkMi04NmFiLTViM2MyNjc1YmJkMiJ9.frybeE66acfhXdGH0EU8fIWSvpFURcJ3djuJ4gX4Xts","bankID":"CITIAEAD","clientUserID":"JohnDoe","color":{"primaryColor":"#092769","secondaryColor":"#FE000C"},"connectionID":"154f5c9d-9613-456e-8f5c-0e734273e050","fullLogoPng":"https://cdn-dapi.azureedge.net/banks-full-logo/Citibank.png","fullName":"CitiBank","halfLogoPng":"https://cdn-dapi.azureedge.net/banks-horizontal-logo/Citibank.png","miniLogoPng":"https://cdn-dapi.azureedge.net/banks-mini-logo/Citibank.png","name":"Citi","tokenID":"74b439b2-c8c6-49f5-aa67-37434a670e41","userID":"b45ASC4/WZZmE8LFrOUzp4KWUy6H94C/x2AV4KGfd3w+78ntR5js8CHICQIKXZCCGKlDR27Z+apWb8P+SigkDw==","userSecret":"m+VSB+bCJr8BBGbFSPGaOq1YUzydX1jiSrU7LH5DTgTiJy0Btur3G22sA47EPZ+g4nFBEKDjTBRzHsvcQa1IPOn1OY6aN7G6APhjn/RohHzG8aDWKiAlVA2uyAYqSmWVfjqctzeFMYjBPos9qQLedW0N469KJCD6aNKCsGMnknEOdjWnNztTSVZPCkyp/SRW8ny88LpRx52/zs6v7BA65X6TPGVPhU7ThdukJ3kZVdBx9ozT2HQcBnP+QT5kbjqc2ZPZDUlb2FRy3RLb7djidKPzziwYFhLWrRL4dMEs/fWSqI184nWe4m31zNX6WVz2gFyAl+xaNApf3wHhbRGAdj8IMPQAAnvLpQTM1xk5UlNWFOqG4+gWPWB2wiRld+4Z8WXFUxMjU1iWHNFUUkYNjSkrMjuzO6czPwndgVEcULy/9Jd6l7N97znJYfH3hHgqRA9CplhmFdqTPg34OdmDix/vCo4DjJQyeesKveu4d5456y3w0ZemY2A7qoOpQXzkJdXcRaPoBrw11rMSgrXfGBQEnSiqAeJX3p3kir/n2XkDLrIOY+S2ykgTz/2/ew5y17OGA56kU6Isqi2vl0EGwD1yteFUsw29FSgkgYaQ6Gr71CeZnNpqQqV8WxgF1NduPVrHEZufLO1FM6zqmuMQj1WEvzkpgRnFFnB+FoEazsY="}';
  var connection = await DapiConnection.create(JSON.parse(jsonConnection));
  console.log(connection);
}

const App: () => React$Node = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}>
        <Header />
        {global.HermesInternal == null ? null : (
          <View style={styles.engine}>
            <Text style={styles.footer}>Engine: Hermes</Text>
          </View>
        )}
        <View style={styles.body}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Dapi</Text>
            <Button title="Start Dapi" onPress={() => startDapi()} />
            <Button
              title="Is started"
              onPress={() => {
                isStarted();
              }}
            />
            <Button title="Client User ID" onPress={() => clientUserID()} />
            <Button title="Get Configs" onPress={() => getConfigurations()} />
            <Button title="Reset Configs" onPress={() => resetConfigs()} />
          </View>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Connect</Text>
            <Button title="Present Connect" onPress={() => presentConnect()} />
            <Button title="Get Connections" onPress={() => getConnections()} />
            <Button
              title="Connection Parameters"
              onPress={() => getParameters()}
            />
            <Button title="Create Connection" onPress={() => create()} />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Data</Text>
            <Button title="Identity" onPress={() => getIdentity()} />
            <Button title="Accounts" onPress={() => getAccounts()} />
            <Button
              title="Create Beneficiary"
              onPress={() => createBeneficiary()}
            />
            <Button title="Beneficiaries" onPress={() => getBeneficiaries()} />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Metadata</Text>
            <Button title="Accounts Metadata" onPress={() => getMetadata()} />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Payment</Text>
            <Button
              title="Get Beneficiaries"
              onPress={() => getBeneficiaries()}
            />
            <Button title="Create Transfer" onPress={() => transfer()} />
            <Button
              title="Create Transfer To Existing Beneficiary"
              onPress={() => transferToExistingBeneficiary()}
            />
            <Button
              title="Create Beneficiary"
              onPress={() => createBeneficiary()}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
