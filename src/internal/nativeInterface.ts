/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import {NativeModules} from 'react-native';
import { DapiConnectNativeModule } from './privateTypes';

const DapiConnectManager: DapiConnectNativeModule | undefined =
  NativeModules.ImagePickerManager;

// Produce an error if we don't have the native module
if (!DapiConnectManager) {
  throw new Error(`DapiConnect-ReactNative: NativeModule.DapiConnectManager is null. To fix this issue try these steps:
• Run \`react-native link DapiConnect-ReactNative\` in the project root.
• Rebuild and re-run the app.
• If you are using CocoaPods on iOS, run \`pod install\` in the \`ios\` directory and then rebuild and re-run the app. You may also need to re-open Xcode to get the new pods.
• Check that the library was linked correctly when you used the link command by running through the manual installation instructions in the README.
* If you are getting this error while unit testing you need to mock the native module. Follow the guide in the README.
If none of these fix the issue, please open an issue on the Github repository: https://github.com/dapi-co/DapiConnect-ReactNative`);
}

/**
 * We export the native interface in this way to give easy shared access to it between the
 * JavaScript code and the tests
 */
export default DapiConnectManager as DapiConnectNativeModule;
