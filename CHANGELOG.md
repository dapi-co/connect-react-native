## 2.11.0
### Changed
- Create connection method now returns `IDapiConnection` instead of `DapiConnection`
- `IAccount` balance property is now an object of type `IAccountBalance`.
- `createTransfer` now accepts a nullable account, beneficiary, and remark in the interface.
### Fix
- [iOS] Crash caused by running CoreData on a background thread.

## 2.10.1
### Fix
- [iOS] Crash caused by running CoreData on a background thread.

## 2.10.0
### Fix
- `DapiConnection.create()` returns `IDapiConnection` instead of JSON object.

## 2.9.0
### Added
- Get Cards API `connection.getCards()`.
- Get Card Transactions API `connection.getTransactionsForCard(card: ICard, startDate: Date, endDate: Date))`.
- Get Cards API from cache `connection.cards`.
### Changed
- `getTransactions()` is now renamed to `getTransactionsForAccount()`. Reason: This change is to accomodate for a `getTransactionsForCard()`.

## v2.8.0
### Added
- `DapiConnection` now implements an instance method `getParameters()` that returns a JSON representation of the connection.
- `DapiConnection` now implements a static method `create(jsonConnectionDetails: string)` to support creating a connection with JSON object from the connection.
### Fixed
- Accounts UI is now filtered for the passed connection.

Note: Avoid creating a connection that already exists for a `clientUserID`.

## v2.7.2
### Fixed
- [iOS] Caching accounts from the same bank account for different `clientUserID`.
- [iOS] Crash caused by calling `getBeneficiaries` with an MFA. 

## v2.7.1
### Fixed
 - [iOS] Handle multiple MFA inputs.

## v2.7.0
### Added 
- `DapiBankConnection` has 3 new properties for bank logos: `fullLogo`, `halfLogo` and `miniLogo`.
- createTransfer rejected promise returns error and sender account.
### Fixed
 - [iOS] A crash occuring when opening transfer UI with bank connection has no accounts.
 - [iOS] `createTransfer` callback is fired with error when user taps on back button of transfer UI.

## v2.6.0
### Added 
- Mutable configuration on Dapi object.
- A new event 'EventDapiTransferUIDismissed' is added for exiting createTransfer flow. 
- A new event  'EventConnectBankRequest' is added for requesting a bank. 
- A new configuration option 'showAddButton' is added to control whether add bank account button is showing on Accounts screen 
### Changed
-  Allow decimal point amount for transfer. 
### Fixed
- Create transfer response returns the sender account object (balance, account number, etc) and amount. 
