//
//  CustomHttp.swift
//  NekokoLPA
//
//  Created by ieb on 2024/11/07.
//

import Foundation

@objc(CustomHttp) class CustomHttp: NSObject {
  
  @objc static func requiresMainQueueSetup() -> Bool { return true }
  
  @objc public func sendHttpRequest(
    _ requestUrl: String,
    post postData: String,
    resolvePromise resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let request = ASIHTTPRequest(url: URL(string: requestUrl))!
    request.requestMethod = "POST"
    request.addHeader("Content-Type", value: "application/json")
    request.validatesSecureCertificate = false
  
    request.postBody = NSMutableData(data: postData.data(using: .utf8)!)
    
    // Set completion and failure blocks
    request.completionBlock = {
      let responseString = request.responseString()
      resolve(responseString)
    }
    
    request.setFailedBlock {
      let error = request.error
      reject("0", error?.localizedDescription, nil)
    }
    
    // Start the request asynchronously
    request.startAsynchronous()
    
  }
}

