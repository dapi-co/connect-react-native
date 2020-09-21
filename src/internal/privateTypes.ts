/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import { DapiConfigurations, BeneficiaryInfoCallback, ConnectSuccessCallback, ConnectFailureCallback } from './types';

export interface DapiConnectNativeModule {
  presentConnect(beneficiaryInfo: BeneficiaryInfoCallback): void;
  newClientWithConfigurations(configs: DapiConfigurations): void;
}
