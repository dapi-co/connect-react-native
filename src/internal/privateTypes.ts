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
  ITransaction,
  IAccountsMetadata,
  IBeneficiary,
  IDapiConnection
} from './types';

export interface DapiConnectNativeModule {
  start(appKey: string, clientUserID: string, configurations: IDapiConfigurations): Promise<void>;
  presentConnect(): void;
  setClientUserID(clientUserID: string): void;
  clientUserID(): Promise<string>;
  dismissConnect(): void;
  getConnections(): Promise<IDapiConnection[]>;

  getIdentity(userID: string): Promise<IIdentity>;
  getAccounts(userID: string): Promise<IAccount[]>;
  getTransactions(userID: string, accountID: string, startDateMilliseconds: number, endDateMilliseconds: number): Promise<ITransaction[]>;
  delete(userID: string): Promise<any>;
  getAccountsMetadata(userID: string): Promise<IAccountsMetadata>;
  createTransfer(userID: string, accountID: string, toBeneficiary: IBeneficiary, amount: number, remark: string): Promise<IAccount>
}
