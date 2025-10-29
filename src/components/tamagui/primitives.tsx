/**
 * Tamagui primitive wrapper components
 * These can be gradually adopted to replace react-native-ui-lib components
 * 
 * Usage: Import from here instead of directly from 'tamagui' to ensure
 * consistent styling and theme integration
 */

import {
  YStack,
  XStack,
  Stack,
  Text as TamaguiText,
  Button as TamaguiButton,
  Input as TamaguiInput,
  TextArea as TamaguiTextArea,
  Card as TamaguiCard,
  type YStackProps,
  type XStackProps,
  type StackProps,
  type TextProps,
  type ButtonProps,
  type InputProps,
} from 'tamagui';

// Re-export primitives with consistent naming
export const Stack = Stack;
export const YStack = YStack;
export const XStack = XStack;

/**
 * Text component - maps to Tamagui Text with theme integration
 * Can gradually replace react-native-ui-lib Text
 */
export const Text = TamaguiText;

/**
 * Button component - maps to Tamagui Button with theme integration
 * Can gradually replace react-native-ui-lib Button
 */
export const Button = TamaguiButton;

/**
 * Input component - maps to Tamagui Input with theme integration
 * Can gradually replace react-native-ui-lib TextField
 */
export const Input = TamaguiInput;

/**
 * TextArea component - maps to Tamagui TextArea with theme integration
 */
export const TextArea = TamaguiTextArea;

/**
 * Card component - maps to Tamagui Card with theme integration
 * Can gradually replace react-native-ui-lib Card
 */
export const Card = TamaguiCard;

// Export types for TypeScript
export type {
  YStackProps,
  XStackProps,
  StackProps,
  TextProps,
  ButtonProps,
  InputProps,
};

