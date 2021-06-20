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
let params = `{
  "halfLogoPng": "https://cdn-dapi.azureedge.net/banks-horizontal-logo/Emirates%20NBD.png",
  "userID": "4wE5O2iwOygS+nQAiFPp9bbWVk2XpaYAebU8JfAFjQrgsuPx9Dr1vsBY6g2Hxrx9ZkLI5APD1TB1KZKZzSa64A==",
  "accessCode": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBLZXkiOiI3OTQ5MjMzZGQ5ZmU3YWJhNTU4YWYwZWJhZDdlNjc4MjlhNjY0NGM4N2E1NjkzNjg4YzFlZmZjNTVkYjNjMWUzIiwiZXhwIjoxNjI0MTc5NjYxLCJpYXQiOjE2MjQxNzkzNjEsImp0aSI6IjEzNDVlNTM4LTIzYzEtNGUxOS1hMjhkLWJlYzk2MzhkM2M1NyIsIm90cCI6Ii9WZUZsOFdCRzRCdmM5S0VyL0twZEF6RUsvZVd3Q2xyK2hIUEVmQWR4MUE9IiwidXVpZCI6ImVjOTQ0ODg1LTY0MDUtNGMyZi1iMWYzLTQ2ZGEzNTMxMDUxZiJ9.6k3-1BWap9nU8MMI2uJU05k4UXjMu-Lm5CBnJ2AH5kg",
  "tokenID": "1345e538-23c1-4e19-a28d-bec9638d3c57",
  "connectionID": "7d7f9892-6fef-4d70-9464-f2abe88f723c",
  "clientUserID": "JohnDoe",
  "fullLogoPng": "https://cdn-dapi.azureedge.net/banks-full-logo/Emirates%20NBD.png",
  "miniLogoPng": "https://cdn-dapi.azureedge.net/banks-mini-logo/Emirates%20NBD.png",
  "color": {
    "primaryColor": "#0A0F4E",
    "secondaryColor": "#FFC227"
  },
  "fullName": "ENBD",
  "userSecret": "iXiU+PnGGG/QyE/YnTW9TGFErluH89FZWeJXQy5jXTyt7anloq7OhcvbIy7IyT0mmDM4Q9sVoyLz2iDWbZmtVBZZA4tD8b1Oet44dsbX9kd1Y4f9QOtndPgT4LvIpYZVi4DXHUaxl5Z+3k1DZprxJVlWnrBgDblk1QKRIrryTwGWKkMsRBzjS9TTMT78Nj3t1S2163K0VbGN8OknoSIsJOjCvIt/IXgjchtZVAYyb54D7bZKzIU37o8/8ytdsqlJIIVerWeFT0atTusqTrZTKw4NfyEfn+ughfGRYnhZCZ15UwPkFFc9lBsMgmONxm0OHIgZFhUDseNmv1FBafERdXzLnD5nDSnVozVK6d24ovcb5aNHVQMgjbeaO+yUpAK8q3krs8HJhBvhMvTifGGvHZVDSOx1UVqgkmW4RqWHarNbTQH7tBpxa+KZE0C3+/2ke6qqaCUYO/T3Y3HPSmMzOvZS1HIBTkqk+Z0lkAeGhI3Uizvu1tItdnHmxvrCe7o6mHX+vPbHZpVQQJbP32vIyv0yMuzd9PmP5K3c4FCbqaeP2O+r2C3IT4y9J/0UD2ByMyDcKYfZxaUnDqebeHkp1v+pH9ALFpkliHmoLmepTP0fIHB18J20PrDUoJZ1r6oPdZ+IWegsBE5bfsFtV6BKvmApC4Zz6U6RLc9h9RAeKz8=",
  "bankId": "DAPIBANK_AE_ENBD",
  "name": "ENBD"
}`;

async function startDapi() {
  let configs = generateConfigs('ABC');

  await Dapi.instance.start(
    '7949233dd9fe7aba558af0ebad7e67829a6644c87a5693688c1effc55db3c1e3',
    'JohnDoe',
    configs,
  );
}

function generateConfigs(authKey) {
  const configurations = {
    environment: 'sandbox',
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

async function getCards() {
  var connections = await Dapi.instance.getConnections();
  if (connections.length > 0) {
    var cardsResponse = await connections[0].getCards();
    console.log(cardsResponse);
  }
}

async function getCachedCards() {
  var connections = await Dapi.instance.getConnections();
  if (connections.length > 0) {
    var cards = await connections[0].cards;
    console.log(cards);
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
    accountNumber: '1623404370879825504324',
    bankName: 'STANDARD CHARTERED BANK',
    swiftCode: 'SCBLAEAD',
    iban: 'DAPIBANKAEENBD1623404370879825504324',
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
  if (params == null) {
    console.log('params field is null');
    return;
  }
  DapiConnection.create(params)
    .then(async newConnection => {
      var accounts = await newConnection.getAccounts();
      console.log('=====\nCreated:');
      console.log(newConnection);
      console.log('=====');
    })
    .catch(err => {
      console.log('=====\nError:');
      console.log(err);
      console.log('=====');
    });
}

async function deleteConnections() {
  var connections = await Dapi.instance.getConnections();
  connections.forEach(c => {
    c.delete();
  });
}

async function getTransactionsForAccount() {
  var connections = await Dapi.instance.getConnections();
  var transactions = await connections[0].getTransactionsForAccount(
    connections[0].accounts[0],
    new Date(1621235963109),
    new Date(1623865763109),
  );
  console.log(transactions);
}

async function getTransactionsForCard() {
  var connections = await Dapi.instance.getConnections();
  var cardsResponse = await connections[0].cards;
  var transactions = await connections[0].getTransactionsForCard(
    cardsResponse.cards[0],
    new Date(1621235963109),
    new Date(1623865763109),
  );
  console.log(transactions[0].amount);
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
            <Button
              title="Delete Connections"
              onPress={() => deleteConnections()}
            />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Data</Text>
            <Button title="Identity" onPress={() => getIdentity()} />
            <Button title="Accounts" onPress={() => getAccounts()} />
            <Button title="Get Cards" onPress={() => getCards()} />
            <Button title="Get Cached Cards" onPress={() => getCachedCards()} />
            <Button
              title="Get Transactions For Account"
              onPress={() => getTransactionsForAccount()}
            />
            <Button
              title="Get Transactions For Card"
              onPress={() => getTransactionsForCard()}
            />
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
