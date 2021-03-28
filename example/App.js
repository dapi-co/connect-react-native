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

import Dapi from 'connect-react-native';

import {Header, Colors} from 'react-native/Libraries/NewAppScreen';

const {DapiConnectManager} = NativeModules;
const dapiConnectManagerEmitter = new NativeEventEmitter(DapiConnectManager);

async function startDapi() {
  await Dapi.instance.start(
    '1d4592c4a8dd6ff75261e57eb3f80c518d7857d6617769af3f8f04b0590baceb',
    'JohnDoe',
    null,
  );
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

    console.log(metadata.accountsMetadata.swiftCode);
  }
}

async function transfer() {
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
    var accountsResponse = await connections[0].getAccounts();
    await connections[0]
      .createTransfer(accountsResponse.accounts[0], beneficiary, 1, 'test')
      .then(accountsResponse => console.log(accountsResponse))
      .catch(error => {
        console.log(error);
        if (error.message.includes('Beneficiary will be activated')) {
          console.log('This is a coolDownPeriod error');
        }
      });
  }
}

async function isStarted() {
  var isStarted = await Dapi.instance.isStarted();
  console.log(isStarted);
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
            <Text style={styles.sectionTitle}>Start Dapi</Text>
            <Button title="Start Dapi" onPress={() => startDapi()} />
          </View>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Start Dapi</Text>
            <Button title="Is started" onPress={() => isStarted()} />
          </View>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Connect</Text>
            <Button title="Present Connect" onPress={() => presentConnect()} />
            <Button title="Get Connections" onPress={() => getConnections()} />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Data</Text>
            <Button title="Identity" onPress={() => getIdentity()} />
            <Button title="Accounts" onPress={() => getAccounts()} />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Metadata</Text>
            <Button title="Accounts Metadata" onPress={() => getMetadata()} />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Payment</Text>
            <Button title="Create Transfer" onPress={() => transfer()} />
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
