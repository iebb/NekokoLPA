import { YStack, YStackProps } from 'tamagui';

/**
 * Container component using Tamagui
 * Drop-in replacement for the react-native-ui-lib version
 * Provides consistent padding and gap spacing
 */
export function Container(props: YStackProps): JSX.Element {
  return (
    <YStack
      paddingHorizontal={20}
      paddingVertical={10}
      gap={10}
      {...props}
    />
  );
}

export default Container;

