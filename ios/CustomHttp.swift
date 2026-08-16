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
    // Certificate verification is disabled deliberately.
    //
    // SM-DP+ servers present certificates chained to GSMA CI roots, and some
    // cards are provisioned against non-GSMA CIs. None of those roots ship in
    // the iOS trust store, so .fullVerification rejects every SM-DP+ host and
    // no profile can be downloaded.
    //
    // This is not as exposed as it looks: SGP.22 mutual authentication runs
    // underneath, so the Bound Profile Package is signed and encrypted end to
    // end and cannot be forged or read by an intermediary. What TLS is left
    // protecting here is the surrounding metadata — activation codes, matching
    // IDs, confirmation codes, ICCIDs and EIDs — plus resistance to a peer
    // redirecting or stalling the session.
    //
    // The correct fix is pinning rather than system trust: set
    // `trustRoots = .certificates([...])` with the CI roots we support and turn
    // certificateVerification back to .fullVerification, so an unknown CI still
    // fails closed. Hostname verification may need to stay relaxed if SM-DP+
    // certificates lack matching SANs. Mirrors the same decision in
    // android/.../NekokoLPA.kt.
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
