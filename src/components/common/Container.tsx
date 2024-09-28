import {View} from "react-native-ui-lib";
import {ViewProps} from "react-native";

export default function Container(props: ViewProps): JSX.Element {
  return (
    <View
      paddingH-25
      paddingT-20
      gap-10
      flex
      {...props}
    />
  )
}