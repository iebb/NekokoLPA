//
//  CustomHttp.m
//  NekokoLPA
//
//  Created by ieb on 2024/11/07.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(CustomHttp, NSObject)
  RCT_EXTERN_METHOD(sendHttpRequest:
    (NSString *) requestUrl
    post: (NSString *) postData
    resolvePromise: (RCTPromiseResolveBlock) resolve
    rejecter: (RCTPromiseRejectBlock) reject
  )
@end
