import {View, ViewProps} from "react-native";

export default function Container(props: ViewProps): JSX.Element {
  return (
    <View
      style={{ paddingHorizontal: 20, paddingVertical: 10, gap: 10 }}
      {...props}
    />
  )
}