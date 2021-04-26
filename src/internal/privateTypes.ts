import {
  IDapiConfigurations,
  IAccount,
  IBeneficiary,
  IDapiConnection,
  IAccountResponse,
  IIdentityResponse,
  IAccountsMetadataResponse,
  ITransactionResponse,
  IBankBeneficiaryResponse,
  IDapiResult,
} from './types';

export interface DapiConnectNativeModule {
  start(
    appKey: string,
    clientUserID: string,
    configurations: IDapiConfigurations,
  ): Promise<void>;
  presentConnect(): void;
  setClientUserID(clientUserID: string): void;
  clientUserID(): Promise<string>;
  dismissConnect(): void;
  getConnections(): Promise<IDapiConnection[]>;
  getIdentity(userID: string): Promise<IIdentityResponse>;
  getAccounts(userID: string): Promise<IAccountResponse>;
  getTransactions(
    userID: string,
    accountID: string,
    startDateMilliseconds: number,
    endDateMilliseconds: number,
  ): Promise<ITransactionResponse>;
  delete(userID: string): Promise<any>;
  getAccountsMetadata(userID: string): Promise<IAccountsMetadataResponse>;
  createTransfer(
    userID: string,
    accountID: string | null,
    toBeneficiary: IBeneficiary | null,
    amount: number,
    remark: string | null,
  ): Promise<IAccount>;

  createTransferToExistingBeneficiary(
    userID: string,
    accountID: string,
    toBeneficiaryID: string,
    amount: number,
    remark: string | null,
  ): Promise<IAccount>;

  getBeneficiaries(userID: string): Promise<IBankBeneficiaryResponse>;
  createBeneficiary(userID: string, beneficiary: IBeneficiary): Promise<IDapiResult>;

  isStarted() : Promise<boolean>
}
