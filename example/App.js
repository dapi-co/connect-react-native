/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';

import DapiClient, {
  DapiConnectNativeModule,
  IDapiConfigurations,
} from 'connect-react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

const {DapiConnectManager} = NativeModules;
const dapiConnectManagerEmitter = new NativeEventEmitter(DapiConnectManager);

let globalClient;
let firstAccountID;

function intiClient() {
  const configs = {
    appKey: '8900eff4837592670c08558c7a6467337b5155145856d693f1e8275455889f7f',
    baseURL: 'http://10.0.2.2:4561',
    countries: ['AE'],
    clientUserID: 'yourUserID',
    environment: 'sandbox',
  };
  const client = new DapiClient(configs);
  globalClient = client;
}

function presentConnect() {
  globalClient.connect.present(bankID => {
    const lineAddress = {
      line1: '1',
      line2: '2',
      line3: '3',
    };

    const info = {
      address: lineAddress,
      accountNumber: '1234',
      name: 'Ennabah',
      bankName: 'ADCB',
      swiftCode: 'ADCBXXX',
      iban: 'ACB000001234',
      phoneNumber: '0581243',
      country: 'United Arab Emirates',
      branchAddress: 'FUTI',
      branchName: 'ITUF',
    };

    return info;
  });

  dapiConnectManagerEmitter.addListener(
    'EventConnectSuccessful',
    connectResult => console.log(connectResult),
  );
  dapiConnectManagerEmitter.addListener('EventConnectFailure', connectResult =>
    console.log(connectResult),
  );
}

function getConnections() {
  globalClient.connect.getConnections((error, connections) => {
    if (error) {
      console.error(error);
    } else {
      console.log(connections);
      globalClient.setUserID(connections[0].userID);
      globalClient.setClientUserID(connections[0].userID);
      globalClient.userID((error, userID) => {
        if (error) {
          console.error(error);
        } else {
          console.log(userID);
        }
      });

      globalClient.clientUserID((error, clientUserID) => {
        if (error) {
          console.error(error);
        } else {
          console.log(clientUserID);
        }
      });
    }
  });
}

function presentAutoFlow() {
  globalClient.autoFlow.present(bankID => {
    const lineAddress = {
      line1: '1',
      line2: '2',
      line3: '3',
    };

    const info = {
      address: lineAddress,
      accountNumber: '1234',
      name: 'Ennabah',
      bankName: 'ADCB',
      swiftCode: 'ADCBXXX',
      iban: 'ACB000001234',
      phoneNumber: '0581243',
      country: 'United Arab Emirates',
      branchAddress: 'FUTI',
      branchName: 'ITUF',
    };

    return info;
  });

  dapiConnectManagerEmitter.addListener(
    'EventConnectSuccessful',
    connectResult => console.log(connectResult),
  );
  dapiConnectManagerEmitter.addListener('EventConnectFailure', connectResult =>
    console.log(connectResult),
  );
  dapiConnectManagerEmitter.addListener(
    'EventAutoFlowSuccessful',
    connectResult => console.log(connectResult),
  );
  dapiConnectManagerEmitter.addListener('EventAutoFlowFailure', connectResult =>
    console.log(connectResult),
  );
}

async function getIdentity() {
  try {
    const id = await globalClient.data.getIdentity();
    console.log(id);
  } catch (e) {
    console.log(e);
  }
}

async function getAccounts() {
  try {
    const response = await globalClient.data.getAccounts();
    console.log(response);
    firstAccountID = response.accounts[0].id;
    console.log(firstAccountID);
  } catch (e) {
    console.log(e);
  }
}

async function getBalance() {
  try {
    const balance = await globalClient.data.getBalance(firstAccountID);
    console.log(balance);
  } catch (e) {
    console.log(e);
  }
}

async function getTransactions() {
  try {
    const transactions = await globalClient.data.getTransactions(
      firstAccountID,
      new Date(2020, 7, 1),
      new Date(),
    );
    console.log(transactions);
  } catch (e) {
    console.log(e);
  }
}

async function delinkUser() {
  try {
    const transactions = await globalClient.auth.delinkUser();
    console.log(transactions);
  } catch (e) {
    console.log(e);
  }
}

async function getAccountsMetadata() {
  try {
    const metadata = await globalClient.metadata.getAccountsMetadata();
    console.log(metadata);
  } catch (e) {
    console.log(e);
  }
}

async function getBeneficiaries() {
  try {
    const beneficiaries = await globalClient.payment.getBeneficiaries();
    console.log(beneficiaries);
  } catch (e) {
    console.log(e);
  }
}

async function createBeneficiary() {
  const beneficiaryRequestData = {
    address: {
      line1: 'line1',
      line2: 'line2',
      line3: 'line3',
    },
    country: 'United Arab Emirates',
    branchAddress: 'United Arab Emirates',
    branchName: 'Dubai Branch',
    phoneNumber: '0123456789',
    iban: 'AE654400000122845198002',
    swiftCode: 'DBXXXX',
    bankName: 'Dubai Bank',
    name: 'John Doe',
    accountNumber: '122845198002',
  };

  try {
    const beneficiary = await globalClient.payment.createBeneficiary(
      beneficiaryRequestData,
    );
    console.log(beneficiary);
  } catch (e) {
    console.log(e);
  }
}

async function createTransferToExistingBeneficiary() {
  try {
    const transfer = await globalClient.payment.createTransferToExistingBeneficiary(
      firstAccountID,
      5,
      'FTQ72AEDB20201555555893',
      'Aziz Ahmad',
    );
    console.log(transfer);
  } catch (e) {
    console.log(e);
  }
}

async function createTransferToNonExistenceBeneficiary() {
  try {
    const transfer = await globalClient.payment.createTransferToNonExistenceBeneficiary(
      firstAccountID,
      'FTQ72AEDB20201555555893',
      5,
    );
    console.log(transfer);
  } catch (e) {
    console.log(e);
  }
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
            <Text style={styles.sectionTitle}>Start Client</Text>
            <Button
              title="Init Client"
              onPress={() => intiClient()}
              disabled={this.globalClient === null}
            />
          </View>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Connect</Text>
            <Button title="Present Connect" onPress={() => presentConnect()} />
            <Button title="Get Connections" onPress={() => getConnections()} />
          </View>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>AutoFlow</Text>
            <Button title="Present" onPress={() => presentAutoFlow()} />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Auth</Text>
            <Button title="Delink User" onPress={() => delinkUser()} />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Data</Text>
            <Button title="Identity" onPress={() => getIdentity()} />
            <Button title="Accounts" onPress={() => getAccounts()} />
            <Button
              title="Balance (first account)"
              onPress={() => getBalance()}
            />
            <Button
              title="Transactions (first account)"
              onPress={() => getTransactions()}
            />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Metadata</Text>
            <Button
              title="Accounts Metadata"
              onPress={() => getAccountsMetadata()}
            />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Payment</Text>
            <Button
              title="Get Beneficiaries"
              onPress={() => getBeneficiaries()}
            />
            <Button
              title="Create Beneficiary"
              onPress={() => createBeneficiary()}
            />
            <Button
              title="Create Transfer To Existing Beneficiary"
              onPress={() => createTransferToExistingBeneficiary()}
            />
            <Button
              title="Create To Non Existence Beneficiary"
              onPress={() => createTransferToNonExistenceBeneficiary()}
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
