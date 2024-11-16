import {View} from "react-native-ui-lib";
import {ViewProps} from "react-native";

export default function Container(props: ViewProps): JSX.Element {
  return (
    <View
      paddingH-20
      paddingV-10
      gap-10
      {...props}
    />
  )
}