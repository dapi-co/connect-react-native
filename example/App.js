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

const { DapiConnectManager } = NativeModules;
const dapiConnectManagerEmitter = new NativeEventEmitter(DapiConnectManager);

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import DapiClient from 'dapiconnect-reactnative';

function startConnect() {
  const configs = {
    appKey: '8900eff4837592670c08558c7a6467337b5155145856d693f1e8275455889f7f',
    baseURL: 'http://localhost:4561',
    countries: ['AE'],
    clientUserID: 'MEnnabah',
    environment: 'sandbox',
  }
  const client = new DapiClient(configs);

  const lineAddress = {
    line1: "1",
    line2: "2",
    line3: "3",
  }
  
  const info = {
    lineAddress: lineAddress,
    accountNumber: "1234",
    name: "Ennabah",
    bankName: "ADCB",
    swiftCode: "ADCBXXX",
    iban: "ACB000001234",
    phoneNumber: "0581243",
    country: "United Arab Emirates",
    branchAddress: "FUTI",
    branchName: "ITUF",
  }
  
  client.connect.present();
  
  dapiConnectManagerEmitter.addListener('EventConnectSuccessful', (connectResult) => console.dir(connectResult) );
  dapiConnectManagerEmitter.addListener('EventConnectFailure', (connectResult) => console.dir(connectResult) );
  
}

const App: () => React$Node = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <Header />
          {global.HermesInternal == null ? null : (
            <View style={styles.engine}>
              <Text style={styles.footer}>Engine: Hermes</Text>
            </View>
          )}
          <Button
            title="Click me"
            onPress={() => {
              startConnect();
            }}
          />
          <View style={styles.body}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Step One</Text>
              <Text style={styles.sectionDescription}>
                Edit <Text style={styles.highlight}>App.js</Text> to change this
                screen and then come back to see your edits.
              </Text>
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>See Your Changes</Text>
              <Text style={styles.sectionDescription}>
                <ReloadInstructions />
              </Text>
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Debug</Text>
              <Text style={styles.sectionDescription}>
                <DebugInstructions />
              </Text>
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Learn More</Text>
              <Text style={styles.sectionDescription}>
                Read the docs to discover what to do next:
              </Text>
            </View>
            <LearnMoreLinks />
          </View>
        </ScrollView>
      </SafeAreaView>
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
