import { DapiConnection } from '..';
import {
  IDapiConfigurations,
  ICardResponse,
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
  setConfigurations(configurations: IDapiConfigurations): void;
  configurations(): Promise<IDapiConfigurations>;
  dismissConnect(): void;
  getConnections(): Promise<IDapiConnection[]>;
  getIdentity(userID: string): Promise<IIdentityResponse>;
  getAccounts(userID: string): Promise<IAccountResponse>;
  getTransactionsForAccount(
    userID: string,
    accountID: string,
    startDateMilliseconds: number,
    endDateMilliseconds: number,
  ): Promise<ITransactionResponse>;
  getTransactionsForCard(
    userID: string,
    cardID: string,
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
  ): Promise<any>;

  createTransferToExistingBeneficiary(
    userID: string,
    accountID: string,
    toBeneficiaryID: string,
    amount: number,
    remark: string | null,
  ): Promise<any>;

  getBeneficiaries(userID: string): Promise<IBankBeneficiaryResponse>;
  createBeneficiary(userID: string, beneficiary: IBeneficiary): Promise<IDapiResult>;

  isStarted() : Promise<boolean>;

  createConnection(jsonConnectionDetails : string) : Promise<DapiConnection>;
  getConnectionParameters(userID : string) : Promise<string>

  getCards(userID: string): Promise<ICardResponse>;

}
