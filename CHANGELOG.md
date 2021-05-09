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
