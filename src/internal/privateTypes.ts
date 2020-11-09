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
  newClientWithConfigurations(configs: IDapiConfigurations): void;
  setUserID(userID: string): void;
  userID(callback: any): void;
  setClientUserID(clientUserID: string): void;
  clientUserID(callback: any): void;
  // connect
  presentConnect(beneficiaryInfo: string): void; // caller needs to convert the callback function to string, so we can pass it to native components
  dismissConnect(): void;
  getConnections(callback: any): void;
  // autoflow
  presentAutoFlow(beneficiaryInfo: string): void; // caller needs to convert the callback function to string, so we can pass it to native components
  dismissAutoFlow(): void;
  // data
  getIdentity(): Promise<IIdentity>;
  getAccounts(): Promise<IAccount[]>;
  getBalance(accountID: string): Promise<IBalance>;
  getTransactions(
    accountID: string,
    startDateMilliseconds: number,
    endDateMilliseconds: number,
  ): Promise<ITransaction[]>;
  // auth
  delinkUser(): Promise<any>;
  // metadata
  getAccountsMetadata(): Promise<IAccountsMetadata>;
  // payment
  getBeneficiaries(): Promise<IBeneficiary[]>;
  createBeneficiary(
    beneficiaryRequestData: ICreateBeneficiaryRequestData,
  ): Promise<IBeneficiary>;
  createTransferToIban(
    iban: string,
    name: string,
    senderID: string,
    amount: number,
    remark: string,
  ): Promise<any>;
  createTransferToReceiverID(
    receiverID: string,
    senderID: string,
    amount: number,
    remark: string,
  ): Promise<any>;

  createTransferToAccountNumber(
    accountNumber: string,
    name: string,
    senderID: string,
    amount: number,
    remark: string,
  ): Promise<any>;
}
