/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import { IDapiConfigurations, IIdentity, IAccount, IBalance } from './types';

export interface DapiConnectNativeModule {
  newClientWithConfigurations(configs: IDapiConfigurations): void;
  // connect
  presentConnect(beneficiaryInfo: string): void; // caller needs to convert the callback function to string, so we can pass it to native components
  dismissConnect(): void;
  getConnections(callback: any): void;
  // autoflow
  presentAutoFlow(beneficiaryInfo: string): void; // caller needs to convert the callback function to string, so we can pass it to native components
  dismissAutoFlow(): void;
  // data
  getIdentity(): Promise<IIdentity>;
  getAccounts(): Promise<IAccount>;
  getBalance(accountID: string): Promise<IBalance>;
  // getTransactions(accountID: string, startDateMilliseconds: number, endDateMilliseconds: number): void;
}