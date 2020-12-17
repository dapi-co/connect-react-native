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
  setUserID(userID: string, configs: IDapiConfigurations): void;
  userID(configs: IDapiConfigurations, callback: any): void;
  setClientUserID(clientUserID: string, configs: IDapiConfigurations): void;
  clientUserID(configs: IDapiConfigurations, callback: any): void;
  // connect
  presentConnect(beneficiaryInfo: string, configs: IDapiConfigurations): void; // caller needs to convert the callback function to string, so we can pass it to native components
  dismissConnect(configs: IDapiConfigurations): void;
  getConnections(configs: IDapiConfigurations, callback: any): void;
  // autoflow
  presentAutoFlow(beneficiaryInfo: string, configs: IDapiConfigurations): void; // caller needs to convert the callback function to string, so we can pass it to native components
  dismissAutoFlow(configs: IDapiConfigurations): void;
  // data
  getIdentity(configs: IDapiConfigurations): Promise<IIdentity>;
  getAccounts(configs: IDapiConfigurations): Promise<IAccount[]>;
  getBalance(accountID: string, configs: IDapiConfigurations): Promise<IBalance>;
  getTransactions(
    accountID: string,
    startDateMilliseconds: number,
    endDateMilliseconds: number,
    configs: IDapiConfigurations
  ): Promise<ITransaction[]>;
  // auth
  delinkUser(configs: IDapiConfigurations): Promise<any>;
  // metadata
  getAccountsMetadata(configs: IDapiConfigurations): Promise<IAccountsMetadata>;
  // payment
  getBeneficiaries(configs: IDapiConfigurations): Promise<IBeneficiary[]>;
  createBeneficiary(
    beneficiaryRequestData: ICreateBeneficiaryRequestData,
    configs: IDapiConfigurations
  ): Promise<IBeneficiary>;
  createTransferToIban(
    iban: string,
    name: string,
    senderID: string,
    amount: number,
    remark: string,
    configs: IDapiConfigurations
  ): Promise<any>;
  createTransferToReceiverID(
    receiverID: string,
    senderID: string,
    amount: number,
    remark: string,
    configs: IDapiConfigurations
  ): Promise<any>;

  createTransferToAccountNumber(
    accountNumber: string,
    name: string,
    senderID: string,
    amount: number,
    remark: string,
    configs: IDapiConfigurations
  ): Promise<any>;
}
