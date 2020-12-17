/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import NativeInterface from './internal/nativeInterface';
import {
  IDapiConfigurations,
  BeneficiaryInfoCallback,
  IIdentity,
  IAccount,
  IBalance,
  ITransaction,
  IAccountsMetadata,
  IBeneficiary,
  ICreateBeneficiaryRequestData,
} from './internal/types';

class DapiConnect {
  private _client : DapiClient;

  constructor(client : DapiClient){
    this._client = client;
  }
  present(beneficiaryInfo: BeneficiaryInfoCallback): void {
    const isFunction = typeof beneficiaryInfo === 'function';
    if (beneficiaryInfo && isFunction) {
      NativeInterface.presentConnect(`(${beneficiaryInfo.toString()})`, this._client.configurations);
    } else if (!beneficiaryInfo) {
      throw Error('Missing required param: beneficiaryInfo');
    } else if (!isFunction) {
      throw Error(
        'Passing incorrect type: beneficiaryInfo must be a function that returns BeneficiaryInfo object or null',
      );
    } else {
      throw Error('Unknown Error');
    }
  }

  dismiss(): void {
    NativeInterface.dismissConnect(this._client.configurations);
  }

  getConnections(callback: any): void {
    NativeInterface.getConnections(this._client.configurations, callback);
  }
}

class DapiAutoFlow {
  private _client : DapiClient;

  constructor(client : DapiClient){
    this._client = client;
  }
  present(beneficiaryInfo: BeneficiaryInfoCallback): void {
    const isFunction = typeof beneficiaryInfo === 'function';
    if (beneficiaryInfo && isFunction) {
      NativeInterface.presentAutoFlow(`(${beneficiaryInfo.toString()})`, this._client.configurations);
    } else if (!beneficiaryInfo) {
      throw Error('Missing required param: beneficiaryInfo');
    } else if (!isFunction) {
      throw Error(
        'Passing incorrect type: beneficiaryInfo must be a function that returns BeneficiaryInfo object or null',
      );
    } else {
      throw Error('Unknown Error');
    }
  }

  dismiss(): void {
    NativeInterface.dismissAutoFlow(this._client.configurations);
  }
}

class DapiData {
  private _client : DapiClient;

  constructor(client : DapiClient){
    this._client = client;
  }
  getIdentity(): Promise<IIdentity> {
    return NativeInterface.getIdentity(this._client.configurations);
  }

  getAccounts(): Promise<IAccount[]> {
    return NativeInterface.getAccounts(this._client.configurations);
  }

  getBalance(accountID: string): Promise<IBalance> {
    return NativeInterface.getBalance(accountID, this._client.configurations);
  }

  getTransactions(
    accountID: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ITransaction[]> {
    return NativeInterface.getTransactions(
      accountID,
      startDate.getTime(),
      endDate.getTime(),
      this._client.configurations
    );
  }
}

class DapiAuth {
  private _client : DapiClient;

  constructor(client : DapiClient){
    this._client = client;
  }
  delinkUser(): Promise<any> {
    return NativeInterface.delinkUser(this._client.configurations);
  }
}

class DapiMetadata {
  private _client : DapiClient;

  constructor(client : DapiClient){
    this._client = client;
  }
  getAccountsMetadata(): Promise<IAccountsMetadata> {
    return NativeInterface.getAccountsMetadata(this._client.configurations);
  }
}

class DapiPayment {
  private _client : DapiClient;

  constructor(client : DapiClient){
    this._client = client;
  }
  getBeneficiaries(): Promise<IBeneficiary[]> {
    return NativeInterface.getBeneficiaries(this._client.configurations);
  }

  createBeneficiary(
    beneficiaryRequestData: ICreateBeneficiaryRequestData,
  ): Promise<IBeneficiary> {
    return NativeInterface.createBeneficiary(beneficiaryRequestData, this._client.configurations);
  }

  createTransferToIban(
    iban: string,
    name: string,
    senderID: string,
    amount: number,
    remark: string,
  ): Promise<any> {
    return NativeInterface.createTransferToIban(
      iban,
      name,
      senderID,
      amount,
      remark,
      this._client.configurations
    );
  }
  createTransferToReceiverID(
    receiverID: string,
    senderID: string,
    amount: number,
    remark: string,
  ): Promise<any> {
    return NativeInterface.createTransferToReceiverID(
      receiverID,
      senderID,
      amount,
      remark,
      this._client.configurations
    );
  }

  createTransferToAccountNumber(
    accountNumber: string,
    name: string,
    senderID: string,
    amount: number,
    remark: string,
  ): Promise<any> {
    return NativeInterface.createTransferToAccountNumber(
      accountNumber,
      name,
      senderID,
      amount,
      remark,
      this._client.configurations
    );
  }
}

class DapiClient {
  private _connect = new DapiConnect(this);
  private _autoFlow = new DapiAutoFlow(this);
  private _data = new DapiData(this);
  private _auth = new DapiAuth(this);
  private _metadata = new DapiMetadata(this);
  private _payment = new DapiPayment(this);
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
  }

  _validateConfigurations(configurations: IDapiConfigurations): boolean {
    const isRootObject = typeof configurations === 'object';
    const hasStringAppKey = typeof configurations.appKey === 'string';
    const hasStringBaseURL = typeof configurations.baseURL === 'string';
    const hasStringClientUserID =
      typeof configurations.clientUserID === 'string';
    const hasArrayCountries = Array.isArray(configurations.countries);
    let countriesAreString = false;
    if (hasArrayCountries) {
      countriesAreString = configurations.countries.every(
        value => typeof value === 'string',
      );
    }

    return (
      isRootObject &&
      hasStringAppKey &&
      hasStringBaseURL &&
      hasStringClientUserID &&
      hasArrayCountries &&
      countriesAreString
    );
  }

  setUserID(userID: string): void {
    NativeInterface.setUserID(userID, this._configurations);
  }

  userID(callback: any): void {
    NativeInterface.userID(this._configurations, callback);
  }

  setClientUserID(clientUserID: string): void {
    NativeInterface.setClientUserID(clientUserID, this._configurations);
  }

  clientUserID(callback: any): void {
    NativeInterface.clientUserID(this._configurations, callback);
  }
}

export default DapiClient;
export * from './internal/types';
