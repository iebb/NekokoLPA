//
//  CCIDPlugin.m
//  NekokoLPA
//
//  Created by ieb on 2024/11/07.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(CCIDPlugin, NSObject)
  RCT_EXTERN_METHOD(listReaders:
    (RCTPromiseResolveBlock) resolve
    rejecter: (RCTPromiseRejectBlock) reject
  )
  RCT_EXTERN_METHOD(transceive:
    (NSString *) reader
    capdu: (NSString *) apdu
    resolvePromise: (RCTPromiseResolveBlock) resolve
    rejecter: (RCTPromiseRejectBlock) reject
  )
  RCT_EXTERN_METHOD(connect:
    (NSString *) reader
    resolvePromise: (RCTPromiseResolveBlock) resolve
    rejecter: (RCTPromiseRejectBlock) reject
  )
  RCT_EXTERN_METHOD(disconnect:
    (NSString *) reader
    resolvePromise: (RCTPromiseResolveBlock) resolve
    rejecter: (RCTPromiseRejectBlock) reject
  )

@end
