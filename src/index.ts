import NativeInterface from './internal/nativeInterface';
import {
  IDapiConfigurations,
  IAccount,
  IBeneficiary,
  IDapiConnection,
  IPair,
  IAccountResponse,
  IIdentityResponse,
  ITransactionResponse,
  IAccountsMetadataResponse,
  DapiEnvironment,
} from './internal/types';

export class DapiConfigurations implements IDapiConfigurations {
  environment?: DapiEnvironment
  countries?: string[];

  constructor(countries: string[], environment: DapiEnvironment = DapiEnvironment.production) {
    this.environment = environment;
    this.countries = countries;
  }
}

export class DapiConnection implements IDapiConnection {
  private _clientUserID: string;
  private _userID: string;
  private _bankID: string;
  private _swiftCode: string;
  private _country: string;
  private _bankShortName: string;
  private _bankFullName: string;
  private _accounts: IAccount[];

  public get clientUserID(): string {
    return this._clientUserID;
  }
  public get userID(): string {
    return this._userID;
  }
  public get bankID(): string {
    return this._bankID;
  }
  public get swiftCode(): string {
    return this._swiftCode;
  }
  public get country(): string {
    return this._country;
  }
  public get bankShortName(): string {
    return this._bankShortName;
  }
  public get bankFullName(): string {
    return this._bankFullName;
  }
  public get accounts(): IAccount[] {
    return this._accounts;
  }
  constructor(
    clientUserID: string,
    userID: string,
    bankID: string,
    swiftCode: string,
    country: string,
    bankShortName: string,
    bankFullName: string,
    accounts: IAccount[],
  ) {
    this._clientUserID = clientUserID;
    this._userID = userID;
    this._bankID = bankID;
    this._swiftCode = swiftCode;
    this._country = country;
    this._bankShortName = bankShortName;
    this._bankFullName = bankFullName;
    this._accounts = accounts;
  }

  getIdentity(): Promise<IIdentityResponse> {
    return NativeInterface.getIdentity(this.userID);
  }

  getAccounts(): Promise<IAccountResponse> {
    return NativeInterface.getAccounts(this.userID);
  }

  getTransactions(
    account: IAccount,
    startDate: Date,
    endDate: Date,
  ): Promise<ITransactionResponse> {
    return NativeInterface.getTransactions(
      this.userID,
      account.id,
      startDate.getTime(),
      endDate.getTime(),
    );
  }

  getAccountsMetadata(): Promise<IAccountsMetadataResponse> {
    return NativeInterface.getAccountsMetadata(this.userID);
  }

  delete(): Promise<void> {
    return NativeInterface.delete(this.userID);
  }

  createTransfer(
    fromAccount: IAccount | null,
    toBeneficiary: IBeneficiary | null,
    amount: number,
    remark: string | null,
  ): Promise<IAccount> {
    return NativeInterface.createTransfer(
      this.userID,
      fromAccount ? fromAccount.id : null,
      toBeneficiary,
      amount,
      remark,
    );
  }
}

export class DapiPair implements IPair {
  code: string;
  name: string;

  constructor(code: string, name: string) {
    this.code = code;
    this.name = name;
  }
}

export class DapiAccount implements IAccount {
  balance: number;
  iban: string | null;
  number: string | null;
  currency: IPair;
  type: string;
  id: string;
  name: string;

  constructor(
    balance: number,
    iban: string | null,
    number: string | null,
    currency: IPair,
    type: string,
    id: string,
    name: string,
  ) {
    this.balance = balance;
    this.iban = iban;
    this.number = number;
    this.currency = currency;
    this.type = type;
    this.id = id;
    this.name = name;
  }
}

export default class Dapi {
  private static _instance = new Dapi();
  public static get instance(): Dapi {
    return this._instance;
  }
  private constructor() {}

  start(
    appKey: string,
    clientUserID: string,
    configurations: IDapiConfigurations,
  ): Promise<void> {
    return NativeInterface.start(appKey, clientUserID, configurations);
  }

  isStarted() : Promise<boolean> {
    return NativeInterface.isStarted();
  }

  presentConnect(): void {
    NativeInterface.presentConnect();
  }

  setClientUserID(clientUserID: string): void {
    NativeInterface.setClientUserID(clientUserID);
  }

  clientUserID(): Promise<string> {
    return NativeInterface.clientUserID();
  }

  dismissConnect(): void {
    NativeInterface.dismissConnect();
  }

  async getConnections(): Promise<IDapiConnection[]> {
    let jsonConnections = await NativeInterface.getConnections();
    let connections: IDapiConnection[] = [];
    for (let i = 0; i < jsonConnections.length; i++) {
      let currentConnection = jsonConnections[i];
      let accounts: IAccount[] = [];
      for (let j = 0; j < currentConnection.accounts.length; j++) {
        let currentAccount = currentConnection.accounts[j];
        let account = new DapiAccount(
          currentAccount.balance,
          currentAccount.iban,
          currentAccount.number,
          new DapiPair(
            currentAccount.currency.code,
            currentAccount.currency.name,
          ),
          currentAccount.type,
          currentAccount.id,
          currentAccount.name,
        );
        accounts.push(account);
      }
      let connection = new DapiConnection(
        currentConnection.clientUserID,
        currentConnection.userID,
        currentConnection.bankID,
        currentConnection.swiftCode,
        currentConnection.country,
        currentConnection.bankShortName,
        currentConnection.bankFullName,
        accounts,
      );
      connections.push(connection);
    }
    return connections;
  }
}

export * from './internal/types';
