require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = package['name']
  s.version      = package['version']
  s.summary      = package['description']
  s.license      = package['license']

  s.authors      = package['author']
  s.homepage     = package['homepage']
  s.platform     = :ios, "7.0"

  s.source       = { :git => "https://github.com/react-native-community/dapiconnect-reactnative.git", :tag => "v#{s.version}" }
  s.source_files  = "ios/*.{h,m}"

  s.dependency 'React'
  s.dependency 'DapiSDK', '2.16.1'
end
