import json, os

package_json = json.load(open("package.json"))

new_version = package_json["buildVersion"] + 1
version = package_json["version"]
ios_version = package_json["iOSVersion"]
version = ".".join(version.split(".")[:-1] + [str(new_version)])
ios_version = ".".join(ios_version.split(".")[:-1] + [str(new_version)])

package_json["buildVersion"] = new_version
package_json["version"] = version
package_json["iOSVersion"] = ios_version

json.dump(package_json, open("package.json", "w+"), indent=2)

