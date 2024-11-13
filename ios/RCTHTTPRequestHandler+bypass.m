//
//  RCTHTTPRequestHandler+bypass.m
//  NekokoLPA
//
//  Created by ieb on 2024/11/07.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"
#import "React/RCTHTTPRequestHandler.h"

@implementation RCTHTTPRequestHandler(bypass)

- (void)URLSession:(NSURLSession *)session
        didReceiveChallenge:(NSURLAuthenticationChallenge *)challenge
        completionHandler:(void (^)(NSURLSessionAuthChallengeDisposition disposition, NSURLCredential *credential))completionHandler {

    if ([challenge.protectionSpace.authenticationMethod isEqualToString:NSURLAuthenticationMethodServerTrust]) {
        SecTrustRef serverTrust = challenge.protectionSpace.serverTrust;
        NSString *certPath = [[NSBundle mainBundle] pathForResource:@"RootCA" ofType:@"cer"];
        NSData *certData = [NSData dataWithContentsOfFile:certPath];
        SecCertificateRef customCACertificate = SecCertificateCreateWithData(NULL, (__bridge CFDataRef)certData);

        if (serverTrust && customCACertificate) {
            // Add the custom Root CA to the trust object
            NSArray *certs = @[(__bridge id)customCACertificate];
            SecTrustSetAnchorCertificates(serverTrust, (__bridge CFArrayRef)certs);
            SecTrustSetAnchorCertificatesOnly(serverTrust, NO);  // Set to YES if only trusting the custom CA

            // Evaluate the server's certificate chain
            SecTrustResultType trustResult;
            OSStatus status = SecTrustEvaluate(serverTrust, &trustResult);

            if (status == errSecSuccess && (trustResult == kSecTrustResultProceed || trustResult == kSecTrustResultUnspecified)) {
                // If the evaluation succeeds, create and return the credential
                NSURLCredential *credential = [NSURLCredential credentialForTrust:serverTrust];
                completionHandler(NSURLSessionAuthChallengeUseCredential, credential);
                return;
            }
        }
    }

    // Default handling if the custom CA validation fails
    completionHandler(NSURLSessionAuthChallengePerformDefaultHandling, nil);
}
@end
