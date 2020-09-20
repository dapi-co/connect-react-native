# DapiConnect-ReactNative

[![npm version](https://badge.fury.io/js/dapiconnect-reactnative.svg)](https://badge.fury.io/js/dapiconnect-reactnative)
[![npm](https://img.shields.io/npm/dt/dapiconnect-reactnative.svg)](https://npmcharts.com/compare/dapiconnect-reactnative?minimal=true)
![MIT](https://img.shields.io/dub/l/vibe-d.svg)
![Platform - Android and iOS](https://img.shields.io/badge/platform-Android%20%7C%20iOS-yellow.svg)
[![Gitter chat](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/dapiconnect-reactnative/Lobby)

Financial APIs to connect users' bank accounts

## Getting Started

### iOS

#### Requirements

- Xcode 10.3
- react-native >= 0.60.0
- CocoaPods >= 1.9.3

#### Getting Started

Let's create a simple app that integrates DapiConnect and uses the `dapiconnect-reactnative` module.

1. Make sure `react-native-cli` is installed: `yarn global add react-native-cli`
2. Create the app with `react-native init YourApp`
3. Step into your newly created app folder: `cd YourApp`
4. Install `dapiconnect-reactnative` from GitHub: `yarn add github:dapi-co/DapiConnect-ReactNative`
5. Install all the dependencies for the project: `yarn install`. (Because of a [bug](https://github.com/yarnpkg/yarn/issues/2165) you may need to clean `yarn`'s cache with `yarn cache clean` before.)
6. Open `ios/Podile` in a text editor: `vim ios/Podfile`, update the platform to iOS 10.3:

```diff
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

- platform :ios, '10.0'
+ platform :ios, '10.3'

target 'example' do
  config = use_native_modules!

  use_react_native!(:path => config["reactNativePath"])

  target 'exampleTests' do
    inherit! :complete
    # Pods for testing
  end

  # Enables Flipper.
  #
  # Note that if you have use_frameworks! enabled, Flipper will not work and
  # you should disable these next few lines.
  use_flipper!
  post_install do |installer|
    flipper_post_install(installer)
  end
end
```

7. `npx pod-install` or `cd ios` and then `pod install`.