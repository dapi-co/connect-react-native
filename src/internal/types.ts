/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

export interface DapiConfigurations {
  appKey: string;
  baseURL: string;
  countries: string[];
  clientUserID: string;
  environment: 'sandbox' | 'production';
  colorScheme?: 'general' | 'bw' | 'neon';
  isExperimental?: boolean;
  endpoints?: Map<DapiEndpoint, string>;
  endPointExtraQueryItems?: Map<DapiEndpoint, DapiQueryParameter[]>;
  endPointExtraHeaderFields?: Map<DapiEndpoint, Map<string, string>>;
  endPointExtraBody?: Map<DapiEndpoint, Map<string, any>>;
}

export enum DapiEndpoint {
  exchangeToken,
  getIdentity,
  getAccounts,
  getAccountMetadata,
  getBalance,
  getTransactions,
  getBeneficiaries,
  createBeneficiary,
  createTransfer,
  resumeJob,
  delinkUser,
}

export interface DapiQueryParameter {
  name: string;
  value: string;
}

export interface LineAddress {
  line1: string;
  line2: string;
  line3: string;
}

export interface BeneficiaryInfo {
  lineAddress: LineAddress;
  accountNumber: string;
  name: string;
  bankName: string;
  swiftCode: string;
  iban: string;
  phoneNumber: string;
  country: string;
  branchAddress: string;
  branchName: string;
}

export type BeneficiaryInfoCallback = (bankID: string) => BeneficiaryInfo;
