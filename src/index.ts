/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import NativeInterface from './internal/nativeInterface';
import { IDapiConfigurations, BeneficiaryInfoCallback, IIdentity, IAccount, IBalance, ITransaction, IAccountsMetadata, IBeneficiary, ICreateBeneficiaryRequestData } from './internal/types';

class DapiConnect {
  present(beneficiaryInfo: BeneficiaryInfoCallback): void {
    const isFunction = typeof (beneficiaryInfo) === "function"
    if (beneficiaryInfo && isFunction) {
      NativeInterface.presentConnect(`(${beneficiaryInfo.toString()})`);
    } else if (!beneficiaryInfo) {
      throw Error('Missing required param: beneficiaryInfo');
    } else if (!isFunction) {
      throw Error('Passing incorrect type: beneficiaryInfo must be a function that returns BeneficiaryInfo object or null');
    } else {
      throw Error('Unknown Error');
    }
  }

  dismiss(): void {
    NativeInterface.dismissConnect();
  }

  getConnections(callback: any): void {
    NativeInterface.getConnections(callback)
  }
}

class DapiAutoFlow {
  present(beneficiaryInfo: BeneficiaryInfoCallback): void {
    const isFunction = typeof (beneficiaryInfo) === "function"
    if (beneficiaryInfo && isFunction) {
      NativeInterface.presentAutoFlow(`(${beneficiaryInfo.toString()})`);
    } else if (!beneficiaryInfo) {
      throw Error('Missing required param: beneficiaryInfo');
    } else if (!isFunction) {
      throw Error('Passing incorrect type: beneficiaryInfo must be a function that returns BeneficiaryInfo object or null');
    } else {
      throw Error('Unknown Error');
    }
  }

  dismiss(): void {
    NativeInterface.dismissAutoFlow();
  }
}

class DapiData {
  getIdentity(): Promise<IIdentity> {
    return NativeInterface.getIdentity();
  }

  getAccounts(): Promise<Array<IAccount>> {
    return NativeInterface.getAccounts();
  }

  getBalance(accountID: string): Promise<IBalance> {
    return NativeInterface.getBalance(accountID);
  }

  getTransactions(accountID: string, startDate: Date, endDate: Date): Promise<Array<ITransaction>> {
    return NativeInterface.getTransactions(accountID, startDate.getTime(), endDate.getTime());
  }
}

class DapiAuth {
  delinkUser(): Promise<any> {
    return NativeInterface.delinkUser();
  }
}

class DapiMetadata {
  getAccountsMetadata(): Promise<IAccountsMetadata> {
    return NativeInterface.getAccountsMetadata();
  }
}

class DapiPayment {
  getBeneficiaries(): Promise<Array<IBeneficiary>> {
    return NativeInterface.getBeneficiaries();
  }

  createBeneficiary(beneficiaryRequestData: ICreateBeneficiaryRequestData): Promise<IBeneficiary> {
    return NativeInterface.createBeneficiary(beneficiaryRequestData);
  }

  createTransferToExistingBeneficiary(senderID: string, amount: number, iban: string, name: string): Promise<any> {
    return NativeInterface.createTransferToExistingBeneficiary(senderID, amount, iban, name);
  }

  createTransferToNonExistenceBeneficiary(senderID: string, receiverID: string, amount: number): Promise<any> {
    return NativeInterface.createTransferToNonExistenceBeneficiary(senderID, receiverID, amount);
  }
}

class DapiClient {

  private static _allConfigurations: IDapiConfigurations[] = [];

  static get allConfigurations() {
    return DapiClient._allConfigurations;
  }

  private _connect = new DapiConnect();
  private _autoFlow = new DapiAutoFlow();
  private _data = new DapiData();
  private _auth = new DapiAuth();
  private _metadata = new DapiMetadata();
  private _payment = new DapiPayment();
  private _configurations: IDapiConfigurations;

  get connect() {
    return this._connect;
  }
  get autoFlow() {
    return this._autoFlow;
  }
  get data() {
    return this._data;
  }
  get auth() {
    return this._auth;
  }
  get metadata() {
    return this._metadata;
  }
  get payment() {
    return this._payment;
  }
  get configurations() {
    return this._configurations;
  }

  constructor(configurations: IDapiConfigurations) {
    const isValidConfigs = this._validateConfigurations(configurations);
    if (!isValidConfigs) {
      throw Error('Invalid DapiConfigurations object');
    }
    this._configurations = configurations;
    NativeInterface.newClientWithConfigurations(configurations);
    DapiClient._allConfigurations.push(configurations);
  }

  _validateConfigurations(configurations: IDapiConfigurations): boolean {
    const isRootObject = typeof(configurations) === 'object';
    const hasStringAppKey = typeof(configurations.appKey) === 'string';
    const hasStringBaseURL = typeof(configurations.baseURL) === 'string';
    const hasStringClientUserID = typeof(configurations.clientUserID) === 'string';
    const hasArrayCountries = Array.isArray(configurations.countries);
    let countriesAreString = false;
    if (hasArrayCountries) {
      countriesAreString = configurations.countries.every((value) => typeof(value) === 'string');
    }

    return isRootObject && hasStringAppKey && hasStringBaseURL && hasStringClientUserID && hasArrayCountries && countriesAreString;
  }

}

export default DapiClient;

// export * from './internal/types';
