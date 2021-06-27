/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';

const {DapiConnectManager} = NativeModules;
const dapiConnectManagerEmitter = new NativeEventEmitter(DapiConnectManager);

import Dapi, {
  DapiConfigurations,
  DapiConnection,
  DapiEnvironment,
  IDapiConnection,
  IBankBeneficiary,
  DapiLineAddress,
  DapiBeneficiary,
} from 'connect-react-native';

var connection: IDapiConnection | null = null;
var firstBeneficiary: IBankBeneficiary | null = null;
var params: string | undefined = undefined;

let address = new DapiLineAddress('baniyas ', 'dubai', 'united arab emirates');
let beneficiary = new DapiBeneficiary(
  address,
  '1623404370879825504324',
  'Mohammed Ennabah SC',
  'STANDARD CHARTERED BANK',
  'SCBLAEAD',
  'DAPIBANKAEENBD1623404370879825504324',
  '+971585859206',
  'AE',
  'Dubai Mall',
  'Sheikh Zayed Road Branch',
);

async function startDapi() {
  let countries = ['AE', 'EG'];
  await Dapi.instance
    .start(
      '1d4592c4a8dd6ff75261e57eb3f80c518d7857d6617769af3f8f04b0590baceb',
      'JohnDoe',
      new DapiConfigurations(countries, DapiEnvironment.sandbox),
    )
    .then(_ => {
      console.log('Dapi started successfully');
    })
    .catch(error => {
      console.log('Dapi failed to start with error: ', error);
    });
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
  await Dapi.instance
    .getConnections()
    .then(connections => {
      console.log('Connections: ', connections);
      if (connections.length > 0) {
        connection = connections[0];
      }
    })
    .catch(error => {
      console.log('Dapi#getConnections() failed with error: ', error);
    });
}

async function getIdentity() {
  await getConnections();
  await connection
    ?.getIdentity()
    .then(identity => {
      console.log('Identity: ', identity);
    })
    .catch(error => {
      console.log('Dapi#getIdentity() failed with error: ', error);
    });
}

async function getAccounts() {
  await getConnections();
  await connection
    ?.getAccounts()
    .then(accounts => {
      console.log('Accounts: ', accounts);
    })
    .catch(error => {
      console.log('Dapi#getAccounts() failed with error: ', error);
    });
}

async function getCards() {
  await getConnections();
  await connection
    ?.getCards()
    .then(cards => {
      console.log('Cards: ', cards);
    })
    .catch(error => {
      console.log('Dapi#getCards() failed with error: ', error);
    });
}

async function getTransactionsForAccount() {
  await getConnections();
  var transactions = await connection?.getTransactionsForAccount(
    connection.accounts[0],
    new Date(1621235963109),
    new Date(1623865763109),
  );
  console.log(transactions);
}

async function getTransactionsForCard() {
  await getConnections();
  var transactions = await connection?.getTransactionsForCard(
    connection.cards[0]!,
    new Date(1621235963109),
    new Date(1623865763109),
  );
  console.log(transactions);
}

async function getCachedCards() {
  await getConnections();
  console.log('cachedCards: ', connection?.cards);
}

async function getAccountsMetadata() {
  await getConnections();
  await connection
    ?.getAccountsMetadata()
    .then(metadata => {
      console.log('Metadata: ', metadata);
    })
    .catch(error => {
      console.log('Dapi#getAccountsMetadata() failed with error: ', error);
    });
}

async function getBeneficiaries() {
  await getConnections();
  await connection
    ?.getBeneficiaries()
    .then(beneficiaries => {
      console.log('Beneficiaries: ', beneficiaries);
      firstBeneficiary = beneficiaries.beneficiaries[0];
    })
    .catch(error => {
      console.log('Dapi#getBeneficiaries() failed with error: ', error);
    });
}

async function transfer() {
  dapiConnectManagerEmitter.addListener('EventDapiTransferUIDismissed', _ => {
    console.log('Transfer UI is dismissed');
  });

  dapiConnectManagerEmitter.addListener(
    'EventDapiUIWillTransfer',
    uiWillTransferResult => console.log(uiWillTransferResult),
  );

  await connection
    ?.createTransfer(null!, beneficiary, 1.42, 'test')
    .then(accountsResponse => {
      console.log(
        'CreateTransfer:',
        'senderAccount: ',
        accountsResponse.account,
        'amount: ',
        accountsResponse.amount,
      );
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

async function transferToExistingBeneficiary() {
  await getBeneficiaries();
  await getConnections();
  await connection
    ?.createTransferToExistingBeneficiary(
      connection?.accounts[0]!,
      firstBeneficiary!.id,
      1.43,
      'testRemark',
    )
    .then(transfer =>
      console.log('CreateTransferToExistingBeneficiary: ', transfer),
    )
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

async function createBeneficiary() {
  await getConnections();
  await connection
    ?.createBeneficiary(beneficiary)
    .then(beneficiary => console.log(beneficiary))
    .catch(error => {
      console.log(error);
    });
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
  await getConnections();
  params = await connection?.getParameters();
  const jsonParams = JSON.parse(params!);
  var prettyParams = JSON.stringify(jsonParams, null, 2);
  console.log('connection params:\n', prettyParams);
}

async function create() {
  if (params == null) {
    console.log('params field is null');
    return;
  }
  var connection = await DapiConnection.create(params);
  console.log(connection);
}

import {Colors, Header} from 'react-native/Libraries/NewAppScreen';
import {Alert} from 'react-native';

const Section: React.FC<{
  title: string;
}> = ({children, title}) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
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
            {/* <Button title="Get Configs" onPress={() => getConfigurations()} />
             <Button title="Reset Configs" onPress={() => resetConfigs()} /> */}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
