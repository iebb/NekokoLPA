//
//  CustomHttp.swift
//  NekokoLPA
//
//  Created by ieb on 2024/11/07.
//

import Foundation
import AsyncHTTPClient
import NIO
import NIOSSL


@objc(CustomHttp) class CustomHttp: NSObject {
  
  @objc static func requiresMainQueueSetup() -> Bool { return true }
  
  @objc public func sendHttpRequest(
    _ requestUrl: String,
    post postData: String,
    resolvePromise resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    
    
    
    var tlsConfiguration = TLSConfiguration.makeClientConfiguration()
    tlsConfiguration.certificateVerification = .none
    
    Task {
      var request = HTTPClientRequest(url: requestUrl)
      request.tlsConfiguration = tlsConfiguration
      request.method = .POST
      request.headers.add(name: "User-Agent", value: "Swift HTTPClient")
      request.headers.add(name: "Content-Type", value: "application/json")
      request.body = .bytes(ByteBuffer(string: postData))
      let response = try await HTTPClient.shared.execute(request, timeout: .seconds(30))
      if response.status == .ok {
        let body = response.body
        let collectedBytes = try await body.collect(upTo: 1024 * 1024 * 30)
        let responseString = collectedBytes.getString(at: 0, length: collectedBytes.readableBytes)!
        print("Response String: \(responseString)")
        resolve(responseString)
      } else {
        reject("0", response.status.reasonPhrase, nil)
      }
    }
    
  }
}


