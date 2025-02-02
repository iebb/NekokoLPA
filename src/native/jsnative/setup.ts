import {NativeModules, Platform} from "react-native";
import {Adapter, Device} from "@/native/adapters/adapter";
const { CustomHttp } = NativeModules;

export async function setupDevice(a: Adapter): Promise<(s: string, args: any[]) => Promise<(fn: string, args: any[]) => Promise<any>>> {
  const module = await (require("./web.out"))();
  module.jsSendApdu = async (x: string) => {
    // console.log("TX >> ", x);
    try {
      const result = await a.device.transmit(`8${a.device.channel ?? "1"}${x.substring(2)}`);
      // console.log("RX >> ", result);
      return result;
    } catch (error) {
      console.error("err:", error);
      return "6000";
    }
  }

  module.jsFetch = async (urlString: string, body: string) => {
    console.log("URL: ", urlString);
    console.log("Request:", body);
    try {
      const response = await CustomHttp.sendHttpRequest(urlString, body);
      console.log("Response:", response);
      return [true, 200, response];
    } catch (error) {
      return [false, 500, ""];
    }
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
    return {};
  }

  return a._execute;
}
