/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

export interface IDapiConfigurations {
  appKey: string;
  baseURL: string;
  countries: string[];
  clientUserID: string;
  environment: 'sandbox' | 'production';
  colorScheme?: 'general' | 'bw' | 'neon';
  isExperimental?: boolean;
  endpoints?: Map<DapiEndpoint, string>;
  endPointExtraQueryItems?: Map<DapiEndpoint, IDapiQueryParameter[]>;
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

interface IDapiQueryParameter {
  name: string;
  value: string;
}

interface ILineAddress {
  line1: string;
  line2: string;
  line3: string;
}

export interface IBeneficiaryInfo {
  lineAddress: ILineAddress;
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

enum AccountType {
  CURRENT = 'current',
  CHECKING = 'checking',
  SAVINGS = 'savings',
  LOAN = 'loan',
  CREDIT = 'credit',
  DEPOSIT = 'deposit',
  OTHER = 'other',
}

interface ICurrency {
  code: string
  name: string
}

export interface IAccount {
  iban: string | null
  number: string | null
  currency: ICurrency
  type: AccountType
  id: string
  isFavourite: boolean | null
  name: string
}

enum IDType {
  PASSPORT = 'passport',
  NATIONALID = 'national_id',
  VISANUMBER = 'visa_number',
}

interface IIdentification {
  type: IDType
  value: string
}

enum PhoneNumberType {
  MOBILE = 'mobile',
  HOME = 'home',
  OFFICE = 'office',
  FAX = 'fax'
}


interface IPhoneNumber {
  type: PhoneNumberType
  value: string //Change to Mobile Value string ie IPhoneNumberValue
}

interface IAddressGeneral {
  flat: string
  building: string
  full: string
  area: string
  poBox: string
  city: string
  state: string
  country: string
}

export interface IIdentity {
  nationality: string
  dateOfBirth: Date
  numbers: Array<IPhoneNumber>
  emailAddress: string
  name: string
  address: IAddress
  identification: Array<IIdentification>
}

export type IAddress = IAddressGeneral

export type BeneficiaryInfoCallback = (bankID: string) => IBeneficiaryInfo;
