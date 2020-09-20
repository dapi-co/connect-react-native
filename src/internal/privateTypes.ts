/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import { DapiConfigurations } from './types';

export interface DapiConnectNativeModule {
  show(text: string): void;
  newClientWithConfigurations(configs: DapiConfigurations): void;
}
