/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import NativeInterface from './internal/nativeInterface';
import { DapiConfigurations } from './internal/types';

class DapiClient {

  private static _configurations: DapiConfigurations[] = [];

  static get configurations() {
    return DapiClient._configurations;
  }

  private _currentConfigurations: DapiConfigurations;

  constructor(configurations: DapiConfigurations) {
    this._currentConfigurations = configurations;
    NativeInterface.newClientWithConfigurations(configurations);
    DapiClient._configurations.push(configurations);
  }

  show(text: string): void {
    return NativeInterface.show(text);
  }
}

export default DapiClient;

// export * from './internal/types';
