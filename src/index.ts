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
  IBankBeneficiaryResponse,
  IDapiResult,
  DapiEndpoint,
  IDapiQueryParameter,
  ITransferResponse,
} from './internal/types';

export class DapiConfigurations implements IDapiConfigurations {
  environment?: DapiEnvironment
  countries?: string[];
  endpoints?: Map<DapiEndpoint, string> | undefined;
  endPointExtraQueryItems?: Map<DapiEndpoint, IDapiQueryParameter[]> | undefined;
  endPointExtraHeaderFields?: Map<DapiEndpoint, Map<string, string>> | undefined;
  endPointExtraBody?: Map<DapiEndpoint, Map<string, any>> | undefined;
  showLogos?: boolean | undefined;
  showCloseButton?: boolean | undefined;
  showAddButton?: boolean | undefined;
  showExperimentalBanks?: boolean;

  constructor(countries: string[], environment: DapiEnvironment = DapiEnvironment.production) {
    this.environment = environment;
    this.countries = countries;
  }
}

class TransferResponse implements ITransferResponse {
  account?: IAccount;
  amount: number;

  constructor(amount: number, account?: IAccount) {
    this.account = account;
    this.amount = amount;
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
  private _fullLogo: string;
  private _halfLogo: string;
  private _miniLogo: string;

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
  public get fullLogo(): string {
    return this._fullLogo;
  }
  public get halfLogo(): string {
    return this._halfLogo;
  }
  public get miniLogo(): string {
    return this._miniLogo;
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
    fullLogo: string,
    halfLogo: string,
    miniLogo: string,

  ) {
    this._clientUserID = clientUserID;
    this._userID = userID;
    this._bankID = bankID;
    this._swiftCode = swiftCode;
    this._country = country;
    this._bankShortName = bankShortName;
    this._bankFullName = bankFullName;
    this._accounts = accounts;
    this._fullLogo = fullLogo;
    this._halfLogo = halfLogo;
    this._miniLogo = miniLogo;

  }
  createBeneficiary(beneficiary: IBeneficiary): Promise<IDapiResult> {
    return NativeInterface.createBeneficiary(this.userID, beneficiary);
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

  getBeneficiaries(): Promise<IBankBeneficiaryResponse> {
    return NativeInterface.getBeneficiaries(this.userID);
  }

  async createTransfer(
    fromAccount: IAccount | null,
    toBeneficiary: IBeneficiary | null,
    amount: number,
    remark: string | null,
  ): Promise<ITransferResponse> {
    let transferResponse = await NativeInterface.createTransfer(
      this.userID,
      fromAccount ? fromAccount.id : null,
      toBeneficiary,
      amount,
      remark,
    );
    let accountID = transferResponse.account;
    let amnt = transferResponse.amount;
    let sendingAccount = this.getAccount(accountID);
    return new TransferResponse(amnt, sendingAccount);
  }

  async createTransferToExistingBeneficiary(
    fromAccount: IAccount,
    toBeneficiaryID: string,
    amount: number,
    remark: string | null,
  ): Promise<ITransferResponse> {
    let transferResponse = await NativeInterface.createTransferToExistingBeneficiary(
      this.userID,
      fromAccount.id,
      toBeneficiaryID,
      amount,
      remark,
    );
    let accountID = transferResponse.account;
    let amnt = transferResponse.amount;
    let sendingAccount = this.getAccount(accountID);
    return new TransferResponse(amnt, sendingAccount);
  }

  private getAccount(accountID: string): IAccount | undefined {
    var account : IAccount | undefined = undefined;
    this._accounts.find((acc, i, accs) => {
      if (acc.id == accountID) {
        account = acc;
      }
    });
    return account;
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
  private constructor() { }

  start(
    appKey: string,
    clientUserID: string,
    configurations: IDapiConfigurations,
  ): Promise<void> {
    return NativeInterface.start(appKey, clientUserID, configurations);
  }

  isStarted(): Promise<boolean> {
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

  setConfigurations(configurations: IDapiConfigurations): void {
    NativeInterface.setConfigurations(configurations);
  }

  configurations(): Promise<IDapiConfigurations> {
    return NativeInterface.configurations();
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
        currentConnection.fullLogo,
        currentConnection.halfLogo,
        currentConnection.miniLogo
      );
      connections.push(connection);
    }
    return connections;
  }
}

export * from './internal/types';
