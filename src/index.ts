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

class DapiConnection {
  private _clientUserID: string;
  private _userID: string;
  private _bankID: string;
  private _swiftCode: string;
  private _country: string;
  private _bankShortName: string;
  private _bankFullName: string;
  private _accounts: Array<IAccount>;

  public get clientUserID(): string {
    return this._clientUserID;
  }
  private setClientUserID(value: string) {
    this._clientUserID = value;
  }
  public get userID(): string {
    return this._userID;
  }
  private setUserID(value: string) {
    this._userID = value;
  }
  public get bankID(): string {
    return this._bankID;
  }
  private setBankID(value: string) {
    this._bankID = value;
  }
  public get swiftCode(): string {
    return this._swiftCode;
  }
  private setSwiftCode(value: string) {
    this._swiftCode = value;
  }
  public get country(): string {
    return this._country;
  }
  private setCountry(value: string) {
    this._country = value;
  }
  public get bankShortName(): string {
    return this._bankShortName;
  }
  private setBankShortName(value: string) {
    this._bankShortName = value;
  }
  public get bankFullName(): string {
    return this._bankFullName;
  }
  private setBankFullName(value: string) {
    this._bankFullName = value;
  }
  public get accounts(): Array<IAccount> {
    return this._accounts;
  }
  private setAccounts(value: Array<IAccount>) {
    this._accounts = value;
  }
  constructor(
    clientUserID: string,
    userID: string,
    bankID: string,
    swiftCode: string,
    country: string,
    bankShortName: string,
    bankFullName: string,
    accounts: Array<IAccount>,
  ) {
    this._clientUserID = clientUserID;
    this._userID = userID;
    this._bankID = bankID;
    this._swiftCode = swiftCode;
    this._country = country;
    this._bankShortName = bankShortName;
    this._bankFullName = bankFullName;
    this._accounts = accounts;
  }

  getIdentity(): Promise<IIdentity> {
    return NativeInterface.getIdentity(this.userID);
  }

  getAccounts(): Promise<IAccount[]> {
    return NativeInterface.getAccounts(this.userID);
  }

  getTransactions(
    accountID: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ITransaction[]> {
    return NativeInterface.getTransactions(
      this.userID,
      accountID,
      startDate.getTime(),
      endDate.getTime()
    );
  }

  getAccountsMetadata(): Promise<IAccountsMetadata> {
    return NativeInterface.getAccountsMetadata(this.userID);
  }

  delink(): Promise<any> {
    return NativeInterface.delinkUser(this.userID);
  }

}


class Dapi {
  private static _instance = new Dapi()
  public static get instance() : Dapi{
    return this._instance
  }
  private constructor(){}

  start(appKey: string, clientUserID: string, configurations : IDapiConfigurations): void {
    NativeInterface.start(appKey, clientUserID, configurations);
  }

  presentConnect(): void {
    NativeInterface.presentConnect()
  }

  setClientUserID(clientUserID: string): void {
    NativeInterface.setClientUserID(clientUserID);
  }

  clientUserID(callback: any): void {
    NativeInterface.clientUserID(callback);
  }

  dismissConnect(): void {
    NativeInterface.dismissConnect()
  }

  getConnections(callback: any): void {
    NativeInterface.getConnections(callback)
  }

}

export * from './internal/types';
