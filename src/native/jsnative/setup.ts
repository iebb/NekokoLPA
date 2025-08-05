import {NativeModules, Platform} from "react-native";
import {Adapter, Device} from "@/native/adapters/adapter";
import {Adapters} from "@/native/adapters/registry";
const { CustomHttp } = NativeModules;

export async function setupDevice(a: Adapter): Promise<(s: string, args: any[]) => Promise<(fn: string, args: any[]) => Promise<any>>> {
  const module = await (require("./web.out"))();

  if (a.device.type == "ble_9el") {
    const resultPtr = await module.ccall('set_apdu_mtu', 'number', ['number'], [63]);
    module._free(resultPtr);
  }


  module.jsSendApdu = async (x: string) => {
    console.log(`${a.device.deviceName}`, "TX >> ", x);
    try {
      const result = await a.device.transmit(`8${a.device.channel ?? "1"}${x.substring(2)}`);
      console.log(`${a.device.deviceName}`, "RX >> ", result);
      return result;
    } catch (error) {
      console.error(`${a.device.deviceName}`, error);
      return "6000";
    }
  }

  module.jsFetch = async (urlString: string, body: string) => {
    console.log("URL: ", urlString);
    console.log("Request:", body);
    urlString = urlString.replaceAll(/\s/g, ''); // TODO: temporary fix of Orange PL profiles
    try {
      const response = await CustomHttp.sendHttpRequest(urlString, body);
      console.log("Response:", response);
      return [true, 200, response];
    } catch (error) {
      console.error(error);
      return [false, 500, ""];
    }
  };


  module.jsCallback = async (message: string, progress: number, total: number) => {
    console.log("jsCallback", message, progress, total);
    Adapters[a.device.deviceId].callback({message, progress, total});
  };




  a._execute = async (fn: string, args: any[]) => {

    const argTypes = [];
    const argPtrs = [];
    for (var i = 0; i < args.length; i++) {
      if (typeof args[i] === "string") {
        argPtrs.push(module.allocateUTF8(args[i]));
      } else if (typeof args[i] === "number") {
        argPtrs.push(args[i]);
      }
      argTypes.push("number");
    }

    const resultPtr = await module.ccall(fn, 'number', argTypes, argPtrs, {async: true});

    for (var i = 0; i < args.length; i++) {
      if (typeof args[i] === "string") {
        module._free(args[i]);
      } else if (typeof args[i] === "number") {
      }
    }
    if (resultPtr) {
      let result = module.UTF8ToString(resultPtr);
      module._free(resultPtr);
      return JSON.parse(result);
    }
  }

  return a._execute;
}
