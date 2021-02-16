/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

export interface IDapiConfigurations {
  endpoints?: Map<DapiEndpoint, string>;
  endPointExtraQueryItems?: Map<DapiEndpoint, IDapiQueryParameter[]>;
  endPointExtraHeaderFields?: Map<DapiEndpoint, Map<string, string>>;
  endPointExtraBody?: Map<DapiEndpoint, Map<string, any>>;
}

export enum DapiEndpoint {
  getIdentity,
  getAccounts,
  getAccountMetadata,
  getTransactions,
  createTransfer,
  delete,
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

export interface IBeneficiary {
  linesAddress: ILineAddress;
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

export interface IPair {
  code: string;
  name: string;
}

export interface IAccount {
  balance: number;
  iban: string | null;
  number: string | null;
  currency: IPair;
  type: string;
  id: string;
  name: string;
}

interface IIdentification {
  type: string;
  value: string;
}

interface IPhoneNumber {
  type: string;
  value: string;
}

interface IAddressGeneral {
  flat: string;
  building: string;
  full: string;
  area: string;
  poBox: string;
  city: string;
  state: string;
  country: string;
}

export interface IIdentity {
  nationality: string;
  dateOfBirth: Date;
  numbers: IPhoneNumber[];
  emailAddress: string;
  name: string;
  address: IAddress;
  identification: IIdentification[];
}

export interface IBalance {
  amount: number;
  currency: IPair;
  accountNumber: string;
}

enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export interface ITransaction {
  amount: number;
  date: Date;
  type: TransactionType;
  description: string | null;
  details: string | null;
  currency: IPair;
  beforeAmount: number | null;
  afterAmount: number | null;
  reference?: string | null;
}

export enum BeneficiaryType {
  SAME = 'same',
  LOCAL = 'local',
  INTERNATIONAL = 'intl',
  OWN = 'own',
}

interface ITransferBounds {
  minimum: number;
  currency: IPair;
  type: BeneficiaryType;
}

export interface IAccountsMetadata {
  swiftCode: string;
  sortCode: string | null;
  bankName: string;
  branchName: string;
  branchAddress: string;
  address: ILineAddress;
  transferBounds: ITransferBounds[];
  beneficiaryCoolDownPeriod: {
    value: number;
    unit: 'hrs';
  };
  transactionRange: {
    unit: 'days';
    value: number;
  };
  country: IPair;
  isCreateBeneficiaryEndpointRequired: boolean;
  willNewlyAddedBeneficiaryExistBeforeCoolDownPeriod: boolean;
}

export interface IDapiConnection {
  readonly clientUserID: string;
  readonly userID: string;
  readonly bankID: string;
  readonly swiftCode: string;
  readonly country: string;
  readonly bankShortName: string;
  readonly bankFullName: string;
  readonly accounts: IAccount[];

  getIdentity(): Promise<IIdentity>;
  getAccounts(): Promise<IAccount[]>;
  getTransactions(
    account: IAccount,
    startDate: Date,
    endDate: Date,
  ): Promise<ITransaction[]>;
  getAccountsMetadata(): Promise<IAccountsMetadata>;
  delete(): Promise<void>;
  createTransfer(
    fromAccount: IAccount,
    toBeneficiary: IBeneficiary,
    amount: number,
    remark: string,
  ): Promise<IAccount>;
}

export type IAddress = IAddressGeneral;
