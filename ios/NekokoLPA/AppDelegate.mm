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

#if TARGET_OS_MACCATALYST
/**
 * Let the Catalyst window get narrow.
 *
 * Catalyst defaults a scene's minimum width to iPad-ish proportions, so the
 * window could not be resized down to anything phone-shaped even though the
 * layout handles it. 320pt is the narrowest phone the UI targets; the maximum
 * is left unrestricted.
 */
- (void)applicationDidBecomeActive:(UIApplication *)application
{
  for (UIScene *scene in application.connectedScenes) {
    if ([scene isKindOfClass:[UIWindowScene class]]) {
      UISceneSizeRestrictions *restrictions = ((UIWindowScene *)scene).sizeRestrictions;
      restrictions.minimumSize = CGSizeMake(320, 480);
      restrictions.maximumSize = CGSizeMake(CGFLOAT_MAX, CGFLOAT_MAX);
    }
  }
}
#endif

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
