#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <ReactAppDependencyProvider/RCTAppDependencyProvider.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"NekokoLPA";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  // Required since React Native 0.77. RCTAppDependencyProvider is what exposes
  // the generated RCTThirdPartyComponentsProvider, i.e. the registry mapping
  // component names ("RNCSafeAreaProvider", "RNSScreen", ...) to their Fabric
  // component view classes.
  //
  // Without it that registry is never consulted, so *every* third-party Fabric
  // component silently falls back to the legacy paper interop. Those views then
  // dispatch paper events, and since bridgeless registers no paper renderer the
  // app dies at startup with "Failed to call into JavaScript module method
  // RCTEventEmitter.receiveEvent(). Module has not been registered as callable."
  //
  // Must be assigned before super, which builds the RCTReactNativeFactory and
  // reads this property.
  self.dependencyProvider = [RCTAppDependencyProvider new];

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
