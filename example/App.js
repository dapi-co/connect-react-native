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

const {DapiConnectManager} = NativeModules;
const dapiConnectManagerEmitter = new NativeEventEmitter(DapiConnectManager);

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import DapiClient from 'dapiconnect-reactnative';

let globalClient;
let firstAccountID;

function intiClient() {
  const configs = {
    appKey: '8900eff4837592670c08558c7a6467337b5155145856d693f1e8275455889f7f',
    baseURL: 'http://localhost:4561',
    countries: ['AE'],
    clientUserID: 'MEnnabah',
    environment: 'sandbox',
  };
  const client = new DapiClient(configs);
  globalClient = client;
}

function presentConnect() {
  globalClient.connect.present((bankID) => {
    const lineAddress = {
      line1: '1',
      line2: '2',
      line3: '3',
    };

    const info = {
      lineAddress: lineAddress,
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
    (connectResult) => console.log(connectResult),
  );
  dapiConnectManagerEmitter.addListener(
    'EventConnectFailure',
    (connectResult) => console.log(connectResult),
  );
}

function getConnections() {
  globalClient.connect.getConnections((error, connections) => {
    if (error) {
      console.error(error);
    } else {
      console.log(connections);
    }
  });
}

function presentAutoFlow() {
  globalClient.autoFlow.present((bankID) => {
    const lineAddress = {
      line1: '1',
      line2: '2',
      line3: '3',
    };

    const info = {
      lineAddress: lineAddress,
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
    (connectResult) => console.log(connectResult),
  );
  dapiConnectManagerEmitter.addListener(
    'EventConnectFailure',
    (connectResult) => console.log(connectResult),
  );
  dapiConnectManagerEmitter.addListener(
    'EventAutoFlowSuccessful',
    (connectResult) => console.log(connectResult),
  );
  dapiConnectManagerEmitter.addListener(
    'EventAutoFlowFailure',
    (connectResult) => console.log(connectResult),
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
    const accounts = await globalClient.data.getAccounts();
    firstAccountID = accounts[0].id
    console.log(accounts)
  } catch (e) {
    console.log(e)
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
    const transactions = await globalClient.data.getTransactions(firstAccountID, new Date(2020, 7, 1), new Date())
    console.log(transactions)
  } catch (e) {
    console.log(e);
  }
}

async function delinkUser() {
  try {
    const transactions = await globalClient.auth.delinkUser()
    console.log(transactions)
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
            <Button title="Init Client" onPress={() => intiClient()} disabled={this.globalClient === null}/>
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
            <Button title="Balance (first account)" onPress={() => getBalance()} />
            <Button title="Transactions (first account)" onPress={() => getTransactions()} />
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
