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
  IIdentity,
  IAccount,
  ITransaction,
  IAccountsMetadata,
  IBeneficiary,
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
  public get userID(): string {
    return this._userID;
  }
  public get bankID(): string {
    return this._bankID;
  }
  public get swiftCode(): string {
    return this._swiftCode;
  }
  public get country(): string {
    return this._country;
  }
  public get bankShortName(): string {
    return this._bankShortName;
  }
  public get bankFullName(): string {
    return this._bankFullName;
  }
  public get accounts(): Array<IAccount> {
    return this._accounts;
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

  delete(): Promise<any> {
    return NativeInterface.delete(this.userID);
  }

  createTransfer(fromAccount : IAccount, toBeneficiary : IBeneficiary, amount : number, remark : string): Promise<any> {
    return NativeInterface.createTransfer(this.userID, fromAccount, toBeneficiary, amount, remark)
  }

}


class Dapi {
  private static _instance = new Dapi()
  public static get instance() : Dapi{
    return this._instance
  }
  private constructor(){}

  start(appKey: string, clientUserID: string, configurations : IDapiConfigurations, callback : any): void {
    NativeInterface.start(appKey, clientUserID, configurations, callback);
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
