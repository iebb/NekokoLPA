import json, os

package_json = json.load(open("package.json"))

new_version = package_json["buildVersion"] + 1
version = package_json["version"]
version = ".".join(version.split(".")[:-1] + [str(new_version)])

package_json["buildVersion"] = new_version
package_json["version"] = version

json.dump(package_json, open("package.json", "w+"), indent=2)

os.system("bash sync_version_ios.sh")