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

  /// Largest SM-DP+ response body we will buffer (30 MB).
  private static let maxResponseBytes = 1024 * 1024 * 30

  private static let requestTimeout: TimeAmount = .seconds(30)

  @objc static func requiresMainQueueSetup() -> Bool { return true }

  @objc public func sendHttpRequest(
    _ requestUrl: String,
    post postData: String,
    resolvePromise resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    // WARNING: certificate verification is disabled. See CustomHttp.swift /
    // NekokoLPA.kt — this makes SM-DP+ traffic interceptable and should be
    // replaced with proper trust evaluation.
    var tlsConfiguration = TLSConfiguration.makeClientConfiguration()
    tlsConfiguration.certificateVerification = .none

    Task {
      do {
        var request = HTTPClientRequest(url: requestUrl)
        request.tlsConfiguration = tlsConfiguration
        request.method = .POST
        request.headers.add(name: "User-Agent", value: "gsma-rsp-lpad")
        request.headers.add(name: "Content-Type", value: "application/json")
        request.headers.add(name: "X-Admin-Protocol", value: "gsma/rsp/v2.2.0")
        request.headers.add(name: "Accept", value: "application/json")
        request.body = .bytes(ByteBuffer(string: postData))

        let response = try await HTTPClient.shared.execute(
          request,
          timeout: Self.requestTimeout
        )

        guard response.status.code < 400 else {
          reject(String(response.status.code), response.status.reasonPhrase, nil)
          return
        }

        var collected = try await response.body.collect(upTo: Self.maxResponseBytes)
        guard let responseString = collected.readString(length: collected.readableBytes) else {
          reject("0", "RESPONSE_NOT_UTF8", nil)
          return
        }
        resolve(responseString)
      } catch {
        // Previously any thrown error was swallowed by the detached Task, so the
        // JS promise never settled and the download hung indefinitely.
        reject("0", error.localizedDescription, error)
      }
    }
  }
}
