//
//  CCIDPlugin.swift
//  NekokoLPA
//
//  Created by ieb on 2024/11/07.
//

import Foundation
import CryptoTokenKit

extension String {
    var hexadecimal: Data? {
        var data = Data(capacity: count / 2)

        let regex = try! NSRegularExpression(pattern: "[0-9a-f]{1,2}", options: .caseInsensitive)
        regex.enumerateMatches(in: self, range: NSRange(startIndex..., in: self)) { match, _, _ in
            let byteString = (self as NSString).substring(with: match!.range)
            let num = UInt8(byteString, radix: 16)!
            data.append(num)
        }

        guard data.count > 0 else { return nil }

        return data
    }
}

extension Data {
    var hexadecimal: String {
        return map { String(format: "%02x", $0) }.joined()
    }
}

@objc(CCIDPlugin) class CCIDPlugin: NSObject {
  var cards: [String: TKSmartCard] = [:]
  
  @objc static func requiresMainQueueSetup() -> Bool { return true }
  
  @objc public func listReaders(
    _ resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    let manager = TKSmartCardSlotManager.default
    resolve(manager?.slotNames ?? [])
  }
  
  @objc public func connect(
    _ reader: String,
    resolvePromise resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    let manager = TKSmartCardSlotManager.default
    if let slot = manager?.slotNamed(reader) {
        if let card = slot.makeSmartCard() {
          cards[reader] = card
          resolve(nil)
        } else {
          reject("0", "NO_CARD", nil)
        }
    } else {
      reject("0", "INVALID_READER", nil)
    }
  }
  
  @objc public func transceive(
    _ reader: String,
    capdu apdu: String,
    resolvePromise resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let capduData = apdu.hexadecimal!
    let card = cards[reader]
    card?.beginSession { (success, error) in
        if !success {
            reject("0", "BEGIN_SESSION_ERROR", nil)
        }
        card?.transmit(capduData) { (rapdu, error) in
            if let rapdu = rapdu {
                resolve(rapdu.hexadecimal)
            } else {
                reject("0", "TRANSMIT_ERROR", nil)
            }
            card?.endSession()
        }
    }
  }
  
  @objc public func disconnect(
    _ reader: String,
    resolvePromise resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    cards.removeValue(forKey: reader)
    resolve(nil)
  }
}
