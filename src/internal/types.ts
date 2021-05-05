export interface IDapiConfigurations {
  endpoints?: Map<DapiEndpoint, string>;
  endPointExtraQueryItems?: Map<DapiEndpoint, IDapiQueryParameter[]>;
  endPointExtraHeaderFields?: Map<DapiEndpoint, Map<string, string>>;

  /**
  * Let's you append extra json object to the root of the body.
  * The appended dictionary will be under the key "UserExtraBody" at the root JSON body.
  */
  endPointExtraBody?: Map<DapiEndpoint, Map<string, any>>;

  /**
   * Environment of the banks (either production or sandbox).
   */
  environment?: DapiEnvironment;

  /**
   * Country codes of supported countries. (ISO 3166-2 format)
   */
  countries?: string[];

  /**
   * Controls whether bank account connect UI shows the bank logos.
   * The value is true by default.
   */
  showLogos: boolean;

  /**
   * Controls whether bank account connect UI shows a close button.
   * The value is true by default.
   */
   showCloseButton: boolean;

  /**
   * Controls whether account selection UI shows a add account button.
   * The value is true by default.
   */
   showAddAccountButton: boolean;
}

export enum DapiEnvironment {
  sandbox = "sandbox",
  production = "production",
}

export enum DapiEndpoint {
  exchangeToken = "auth/ExchangeToken",
  getIdentity = "data/identity/get",
  getAccounts = "data/accounts/get",
  getAccountMetadata = "metadata/accounts/get",
  getTransactions = "data/transactions/get",
  getBeneficiaries = "payment/beneficiaries/get",
  createBeneficiary = "payment/beneficiaries/create",
  createTransfer = "payment/transfer/create",
  createTransferToExistingBeneficiary = "payment/transfer/autoflow",
  delete = "users/DelinkUser",
}

export interface IDapiQueryParameter {
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

export interface IAccountResponse {
  readonly operationID: string;
  readonly success: boolean;
  readonly accounts: IAccount[];
}

export interface IBankBeneficiary {
  readonly name: string;
  readonly iban: string | null;
  readonly accountNumber: string | null;
  readonly status: string | null;
  readonly type: string;
  readonly id: string;
}

export interface IBankBeneficiaryResponse {
  readonly operationID: string;
  readonly success: boolean;
  readonly beneficiaries: IBankBeneficiary[];
}

export interface IAccount {
  readonly balance: number;
  readonly iban: string | null;
  readonly number: string | null;
  readonly currency: IPair;
  readonly type: string;
  readonly id: string;
  readonly name: string;
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

export interface IIdentityResponse {
  readonly operationID: string;
  readonly success: boolean;
  readonly identity: IIdentity;
}

export interface IIdentity {
  readonly nationality: string;
  readonly dateOfBirth: Date;
  readonly numbers: IPhoneNumber[];
  readonly emailAddress: string;
  readonly name: string;
  readonly address: IAddress;
  readonly identification: IIdentification[];
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

export interface ITransactionResponse {
  readonly operationID: string;
  readonly success: boolean;
  readonly transactions: ITransaction[];
}

export interface ITransaction {
  readonly amount: number;
  readonly date: Date;
  readonly type: TransactionType;
  readonly description: string | null;
  readonly details: string | null;
  readonly currency: IPair;
  readonly beforeAmount: number | null;
  readonly afterAmount: number | null;
  readonly reference?: string | null;
}

export interface IDapiResult {
  readonly operationID: string;
  readonly status: string;
  readonly success: boolean;
  readonly message: string;
}

export enum BeneficiaryType {
  SAME = 'same',
  LOCAL = 'local',
  INTERNATIONAL = 'intl',
  OWN = 'own',
}

export interface ITransferBounds {
  minimum: number;
  currency: IPair;
  type: BeneficiaryType;
}

export interface IAccountsMetadataResponse {
  readonly operationID: string;
  readonly success: boolean;
  readonly accountsMetadata: IAccountsMetadata;
}

export interface IAccountsMetadata {
  readonly swiftCode: string;
  readonly sortCode: string | null;
  readonly bankName: string;
  readonly branchName: string;
  readonly branchAddress: string;
  readonly address: ILineAddress;
  readonly transferBounds: ITransferBounds[];
  readonly beneficiaryCoolDownPeriod: {
    readonly value: number;
    readonly unit: 'hrs';
  };
  readonly transactionRange: {
    readonly unit: 'days';
    readonly value: number;
  };
  readonly country: IPair;
  readonly isCreateBeneficiaryEndpointRequired: boolean;
  readonly willNewlyAddedBeneficiaryExistBeforeCoolDownPeriod: boolean;
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

  getIdentity(): Promise<IIdentityResponse>;
  getAccounts(): Promise<IAccountResponse>;
  getTransactions(
    account: IAccount,
    startDate: Date,
    endDate: Date,
  ): Promise<ITransactionResponse>;
  getAccountsMetadata(): Promise<IAccountsMetadataResponse>;
  delete(): Promise<void>;
  getBeneficiaries(): Promise<IBankBeneficiaryResponse>;
  createBeneficiary(beneficiary: IBeneficiary): Promise<IDapiResult>;
  createTransfer(
    fromAccount: IAccount,
    toBeneficiary: IBeneficiary,
    amount: number,
    remark: string,
  ): Promise<IAccount>;
}

export type IAddress = IAddressGeneral;
