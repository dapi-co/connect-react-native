/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import {
  IDapiConfigurations,
  IIdentity,
  IAccount,
  IBalance,
  ITransaction,
  IAccountsMetadata,
  IBeneficiary,
  ICreateBeneficiaryRequestData,
} from './types';

export interface DapiConnectNativeModule {
  start(appKey : string, clientUserID : string, configurations : IDapiConfigurations, callback : any) : void;
  presentConnect(): void; // caller needs to convert the callback function to string, so we can pass it to native components
  setClientUserID(clientUserID: string): void;
  clientUserID(callback: any): void;
  dismissConnect(): void;
  getConnections(callback: any): void;
  
  getIdentity(userID : string): Promise<IIdentity>;
  getAccounts(userID : string): Promise<IAccount[]>;
  getTransactions(
    userID : string,
    accountID: string,
    startDateMilliseconds: number,
    endDateMilliseconds: number
  ): Promise<ITransaction[]>;
  delete(userID : string): Promise<any>;
  getAccountsMetadata(userID : string): Promise<IAccountsMetadata>;
  createTransfer(userID : string, fromAccount : IAccount, toBeneficiary : IBeneficiary, amount : number, remark : string): Promise<any>
}
