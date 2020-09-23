/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import NativeInterface from './internal/nativeInterface';
import { DapiConfigurations, BeneficiaryInfoCallback } from './internal/types';

class DapiConnect {
  present(beneficiaryInfo: BeneficiaryInfoCallback): void {
    const isFunction = typeof (beneficiaryInfo) === "function"
    if (beneficiaryInfo && isFunction) {
      NativeInterface.presentConnect(`(${beneficiaryInfo.toString()})`);
    } else if (!beneficiaryInfo) {
      throw Error('Missing required param: beneficiaryInfo');
    } else if (!isFunction) {
      throw Error('Passing incorrect type: beneficiaryInfo must be a function that returns BeneficiaryInfo object or null');
    } else {
      throw Error('Unknown Error');
    }
  }

  dismiss(): void {
    NativeInterface.dismissConnect();
  }
}

class DapiClient {

  private static _allConfigurations: DapiConfigurations[] = [];

  static get allConfigurations() {
    return DapiClient._allConfigurations;
  }

  private _connect = new DapiConnect();
  private _configurations: DapiConfigurations;

  get connect() {
  //   console.log('test')
    return this._connect;
  }

  get configurations() {
    return this._configurations;
  }

  constructor(configurations: DapiConfigurations) {
    const isValidConfigs = this._validateConfigurations(configurations);
    if (!isValidConfigs) {
      throw Error('Invalid DapiConfigurations object');
    }
    this._configurations = configurations;
    NativeInterface.newClientWithConfigurations(configurations);
    DapiClient._allConfigurations.push(configurations);
  }

  _validateConfigurations(configurations: DapiConfigurations): boolean {
    const isRootObject = typeof(configurations) === 'object';
    const hasStringAppKey = typeof(configurations.appKey) === 'string';
    const hasStringBaseURL = typeof(configurations.baseURL) === 'string';
    const hasStringClientUserID = typeof(configurations.clientUserID) === 'string';
    const hasArrayCountries = Array.isArray(configurations.countries);
    let countriesAreString = false;
    if (hasArrayCountries) {
      countriesAreString = configurations.countries.every((value) => typeof(value) === 'string');
    }

    return isRootObject && hasStringAppKey && hasStringBaseURL && hasStringClientUserID && hasArrayCountries && countriesAreString;
  }

}

export default DapiClient;

// export * from './internal/types';
