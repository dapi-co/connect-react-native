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
    (connectResult) => console.dir(connectResult),
  );
  dapiConnectManagerEmitter.addListener(
    'EventConnectFailure',
    (connectResult) => console.dir(connectResult),
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
    (connectResult) => console.dir(connectResult),
  );
  dapiConnectManagerEmitter.addListener(
    'EventConnectFailure',
    (connectResult) => console.dir(connectResult),
  );
  dapiConnectManagerEmitter.addListener(
    'EventAutoFlowSuccessful',
    (connectResult) => console.dir(connectResult),
  );
  dapiConnectManagerEmitter.addListener(
    'EventAutoFlowFailure',
    (connectResult) => console.dir(connectResult),
  );
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
            <Text style={styles.sectionTitle}>Start Connect</Text>
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
