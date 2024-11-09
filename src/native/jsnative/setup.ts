import {NativeModules} from "react-native";
const { CustomHttp } = NativeModules;

export async function setupDevice(d: Device): Promise<(s: string, args: any[]) => Promise<any>> {
  const module = await (require("../../lpaj/web.out"))();
  module.jsSendApdu = async (x: string) => {
    console.log("TX >> ", x);
    const result = await d.transmit(`81${x.substring(2)}`);
    console.log("RX >> ", result);
    return result;
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

  d.execute = async (fn: string, args: any[]) => {
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
      return result;
    }
    return "";
  }

  return d.execute;
}
