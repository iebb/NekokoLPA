import {Adapter, LpaArg} from '@/lpa/adapters/Adapter';
import {Adapters} from '@/lpa/adapters/registry';
import {CustomHttp} from '@/lpa/bridge/nativeModules';

/** Status word returned to the card when an APDU transmit fails locally. */
const SW_TRANSMIT_FAILED = '6000';

/** MTU the 9eSIM Bluetooth writer needs for chunked APDUs. */
const NINE_ESIM_APDU_MTU = 63;

/** Minimal surface of the emscripten module we rely on. */
interface LpaWasmModule {
  ccall(
    name: string,
    returnType: string,
    argTypes: string[],
    args: unknown[],
    opts?: {async?: boolean},
  ): Promise<number> | number;
  allocateUTF8(value: string): number;
  UTF8ToString(ptr: number): string;
  _free(ptr: number): void;
  jsSendApdu?: (apdu: string) => Promise<string>;
  jsFetch?: (url: string, body: string) => Promise<[boolean, number, string]>;
  jsCallback?: (message: string, progress: number, total: number) => Promise<void>;
}

export type LpaExecutor = (command: string, args: LpaArg[]) => Promise<any>;

/**
 * Boots the wasm LPA runtime and wires its host callbacks to `adapter`'s
 * device, then installs the resulting executor on the adapter.
 *
 * The runtime is a singleton inside `web.out.js`, so calling this again
 * re-points the callbacks at whichever adapter asked last. That is intentional:
 * `Adapter.execute` serialises commands, so only one adapter is ever active.
 */
export async function setupDevice(adapter: Adapter): Promise<LpaExecutor> {
  const module: LpaWasmModule = await require('./web.out')();

  if (adapter.device.type === 'ble_9el') {
    const resultPtr = await module.ccall(
      'set_apdu_mtu',
      'number',
      ['number'],
      [NINE_ESIM_APDU_MTU],
    );
    module._free(resultPtr);
  }

  module.jsSendApdu = async (apdu: string) => {
    try {
      // Rewrite the class byte to target this device's logical channel.
      return await adapter.device.transmit(`8${adapter.device.channel ?? '1'}${apdu.substring(2)}`);
    } catch (error) {
      console.error(`[${adapter.device.deviceName}] APDU transmit failed`, error);
      return SW_TRANSMIT_FAILED;
    }
  };

  module.jsFetch = async (urlString: string, body: string) => {
    // Some operator profiles (e.g. Orange PL) embed stray whitespace in the URL.
    const url = urlString.replace(/\s/g, '');
    try {
      const response = await CustomHttp.sendHttpRequest(url, body);
      return [true, 200, response];
    } catch (error) {
      console.error('[LPA] SM-DP+ request failed', error);
      return [false, 500, ''];
    }
  };

  module.jsCallback = async (message: string, progress: number, total: number) => {
    Adapters[adapter.device.deviceId]?.callback({message, progress, total});
  };

  const execute: LpaExecutor = async (command, args) => {
    const argTypes: string[] = [];
    const argPtrs: number[] = [];
    // Tracks which entries of argPtrs are heap allocations we must free.
    const ownedPtrs: number[] = [];

    for (const arg of args) {
      if (typeof arg === 'string') {
        const ptr = module.allocateUTF8(arg);
        argPtrs.push(ptr);
        ownedPtrs.push(ptr);
      } else {
        argPtrs.push(arg);
      }
      argTypes.push('number');
    }

    try {
      const resultPtr = await module.ccall(command, 'number', argTypes, argPtrs, {async: true});
      if (!resultPtr) {
        return undefined;
      }
      try {
        return JSON.parse(module.UTF8ToString(resultPtr));
      } finally {
        module._free(resultPtr);
      }
    } finally {
      // The original code passed the *argument value* to _free instead of the
      // pointer, which leaked every string argument and freed a bogus address.
      for (const ptr of ownedPtrs) {
        module._free(ptr);
      }
    }
  };

  adapter._execute = execute;
  return execute;
}
