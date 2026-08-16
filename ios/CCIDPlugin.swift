//
//  CCIDPlugin.swift
//  NekokoLPA
//
//  Created by ieb on 2024/11/07.
//

import Foundation
import CryptoTokenKit

extension String {
  /// Parses a hex string into bytes, ignoring non-hex characters and returning
  /// nil if none were found. A trailing lone nibble becomes its own byte, which
  /// matches the previous regex-based implementation.
  var hexadecimal: Data? {
    var data = Data(capacity: count / 2)
    var highNibble: UInt8?

    for character in self {
      guard let value = character.hexDigitValue, (0..<16).contains(value) else {
        continue
      }
      if let high = highNibble {
        data.append(high << 4 | UInt8(value))
        highNibble = nil
      } else {
        highNibble = UInt8(value)
      }
    }
    if let trailing = highNibble {
      data.append(trailing)
    }

    guard !data.isEmpty else { return nil }
    return data
  }
}

extension Data {
  var hexadecimal: String {
    return map { String(format: "%02x", $0) }.joined()
  }
}

@objc(CCIDPlugin) class CCIDPlugin: NSObject {
  private var cards: [String: TKSmartCard] = [:]

  @objc static func requiresMainQueueSetup() -> Bool { return true }

  @objc public func listReaders(
    _ resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    resolve(TKSmartCardSlotManager.default?.slotNames ?? [])
  }

  @objc public func connect(
    _ reader: String,
    resolvePromise resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    guard let slot = TKSmartCardSlotManager.default?.slotNamed(reader) else {
      reject("0", "INVALID_READER", nil)
      return
    }
    guard let card = slot.makeSmartCard() else {
      reject("0", "NO_CARD", nil)
      return
    }
    cards[reader] = card
    resolve(nil)
  }

  @objc public func transceive(
    _ reader: String,
    capdu apdu: String,
    resolvePromise resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    // Both guards previously fell through silently: a malformed APDU crashed on
    // a force-unwrap, and an unknown reader left the JS promise unsettled.
    guard let capduData = apdu.hexadecimal else {
      reject("0", "INVALID_APDU", nil)
      return
    }
    guard let card = cards[reader] else {
      reject("0", "NOT_CONNECTED", nil)
      return
    }

    card.beginSession { success, error in
      guard success else {
        reject("0", "BEGIN_SESSION_ERROR", error)
        return
      }
      card.transmit(capduData) { rapdu, transmitError in
        defer { card.endSession() }
        if let rapdu = rapdu {
          resolve(rapdu.hexadecimal)
        } else {
          reject("0", "TRANSMIT_ERROR", transmitError)
        }
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
