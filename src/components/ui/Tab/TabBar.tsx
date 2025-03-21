// @ts-nocheck
import _ from 'lodash';
import React, {useMemo, useContext, useState, useRef, ReactNode} from 'react';
import {StyleSheet, Platform, StyleProp, ViewStyle} from 'react-native';
import Reanimated, {runOnJS, useAnimatedReaction, useAnimatedStyle, interpolate} from 'react-native-reanimated';
import TabBarContext from './TabBarContext';
import TabBarItem, {TabControllerItemProps} from './TabBarItem';
import {
  Constants,
  asBaseComponent,
  forwardRef,
  BaseComponentInjectedProps,
  ForwardRefInjectedProps
} from 'react-native-ui-lib/src/components/../commons/new';
import View from 'react-native-ui-lib/src/components/view';
import {Colors, Spacings, Typography} from 'react-native-ui-lib/src/components/../style';
import FadedScrollView, {FadedScrollViewRef} from 'react-native-ui-lib/src/components/fadedScrollView';
import {FaderProps} from 'react-native-ui-lib/src/components/fader';
import useScrollToItem from './useScrollToItem';
import {useDidUpdate} from "react-native-ui-lib/src/hooks";

const FIX_RTL = Constants.isRTL && Constants.isAndroid;
const DEFAULT_HEIGHT = 40;

const DEFAULT_LABEL_STYLE = {
  ...Typography.text80M,
  letterSpacing: 0
};

const DEFAULT_SELECTED_LABEL_STYLE = {
  ...Typography.text80M,
  letterSpacing: 0
};

const DEFAULT_FADER_PROPS = {size: 76, tintColor: Colors.$backgroundElevated};

export interface TabControllerBarProps {
  /**
   * The list of tab bar items
   */
  items?: TabControllerItemProps[];
  /**
   * Tab Bar height
   */
  height?: number;
  /**
   * Show Tab Bar bottom shadow
   */
  enableShadow?: boolean;
  /**
   * custom shadow style
   */
  shadowStyle?: StyleProp<ViewStyle>;
  /**
   * custom style for the selected indicator
   */
  indicatorStyle?: StyleProp<ViewStyle>;
  /**
   * custom label style
   */
  labelStyle?: TabControllerItemProps['labelStyle'];
  /**
   * custom selected label style
   */
  selectedLabelStyle?: TabControllerItemProps['selectedLabelStyle'];
  /**
   * the default label color
   */
  labelColor?: string;
  /**
   * the selected label color
   */
  selectedLabelColor?: string;
  /**
   * whether to change the text to uppercase
   */
  uppercase?: boolean;
  /**
   * icon tint color
   */
  iconColor?: string;
  /**
   * icon selected tint color
   */
  selectedIconColor?: string;
  /**
   * TODO: rename to feedbackColor
   * Apply background color on press for TouchableOpacity
   */
  activeBackgroundColor?: string;
  /**
   * The TabBar background Color
   */
  backgroundColor?: string;
  /**
   * Props for the start \ end faders
   */
  faderProps?: Pick<FaderProps, 'size' | 'tintColor'>;
  /**
   * The TabBar container width
   */
  containerWidth?: number;
  /**
   * Pass to center selected item
   */
  centerSelected?: boolean;
  /**
   * Whether the tabBar should be spread (default: true)
   */
  spreadItems?: boolean;
  /**
   * The indicator insets (default: Spacings.s4, set to 0 to make it wide as the item)
   */
  indicatorInsets?: number;
  /**
   * Send to get a constant width of the indicator (overrides indicatorInsets)
   */
  indicatorWidth?: number;
  /**
   * Additional styles for the container
   */
  containerStyle?: StyleProp<ViewStyle>;
  /**
   * Used as a testing identifier
   */
  testID?: string;
}

type ChildProps = React.ReactElement<TabControllerItemProps>;

interface Props extends TabControllerBarProps, BaseComponentInjectedProps, ForwardRefInjectedProps {
  children?: ChildProps[] | ChildProps;
}

/**
 * @description: TabController's TabBar component
 * @example: https://github.com/wix/react-native-ui-lib/blob/master/demo/src/screens/componentScreens/TabControllerScreen/index.tsx
 */
const TabBar = (props: Props) => {
  const {
    items: propsItems,
    height,
    enableShadow,
    shadowStyle: propsShadowStyle,
    indicatorStyle,
    labelStyle = DEFAULT_LABEL_STYLE,
    selectedLabelStyle = DEFAULT_SELECTED_LABEL_STYLE,
    labelColor,
    selectedLabelColor,
    uppercase,
    iconColor,
    selectedIconColor,
    activeBackgroundColor,
    backgroundColor = Colors.$backgroundElevated,
    faderProps = DEFAULT_FADER_PROPS,
    containerWidth: propsContainerWidth,
    centerSelected,
    spreadItems = true,
    indicatorInsets = Spacings.s4,
    indicatorWidth,
    containerStyle,
    testID
  } = props;

  const tabBar = useRef<FadedScrollViewRef>(null);
  const [key, setKey] = useState<string>(generateKey(Constants.orientation, labelColor, selectedLabelColor));
  const context = useContext(TabBarContext);
  const {items: contextItems, currentPage, targetPage, containerWidth: contextContainerWidth} = context;
  const containerWidth: number = useMemo(() => {
    return propsContainerWidth || contextContainerWidth;
  }, [propsContainerWidth, contextContainerWidth]);
  const items = useMemo(() => {
    return contextItems || propsItems;
  }, [contextItems, propsItems]);
  const itemsCount = items?.length || 0;

  const {
    onItemLayout,
    itemsWidthsAnimated,
    itemsOffsetsAnimated,
    // itemsWidths,
    // itemsOffsets,
    focusIndex,
    reset,
    onContentSizeChange,
    onLayout
  } = useScrollToItem({
    // @ts-expect-error TODO: typing bug
    scrollViewRef: tabBar,
    itemsCount,
    selectedIndex: FIX_RTL ? itemsCount - currentPage.value - 1 : currentPage.value,
    containerWidth,
    offsetType: centerSelected ? useScrollToItem.offsetType.CENTER : useScrollToItem.offsetType.DYNAMIC
  });

  useAnimatedReaction(() => {
    return Math.round(currentPage.value);
  },
  (currIndex, prevIndex) => {
    if (prevIndex !== null && currIndex !== prevIndex) {
      runOnJS(focusIndex)(currIndex);
    }
  });

  const tabBarItems = useMemo((): ReactNode => {
    return _.map(items, (item, index) => {
      return (
        <TabBarItem
          labelColor={labelColor}
          selectedLabelColor={selectedLabelColor}
          labelStyle={labelStyle}
          selectedLabelStyle={selectedLabelStyle}
          uppercase={uppercase}
          iconColor={iconColor}
          selectedIconColor={selectedIconColor}
          backgroundColor={backgroundColor}
          activeBackgroundColor={activeBackgroundColor}
          {...item}
          {...context}
          key={`${index}_${item.label}`}
          index={index}
          onLayout={onItemLayout}
          spreadItems={spreadItems}
        />
      );
    });
  }, [
    items,
    labelColor,
    selectedLabelColor,
    labelStyle,
    selectedLabelStyle,
    uppercase,
    iconColor,
    selectedIconColor,
    backgroundColor,
    activeBackgroundColor,
    centerSelected,
    onItemLayout,
    spreadItems
  ]);

  const _indicatorTransitionStyle = useAnimatedStyle(() => {
    const value = targetPage.value;
    let width, marginHorizontal;
    if (indicatorWidth) {
      width = indicatorWidth;
      marginHorizontal = itemsWidthsAnimated.value.length > 1 ? interpolate(value,
        itemsWidthsAnimated.value.map((_v: number, i: number) => i),
        itemsWidthsAnimated.value.map((v: number) => (v - indicatorWidth) / 2)) : (0 - indicatorWidth) / 2;
    } else {
      marginHorizontal = indicatorInsets;
      width = itemsWidthsAnimated.value.length > 1 ? interpolate(value,
        itemsWidthsAnimated.value.map((_v: number, i: number) => i),
        itemsWidthsAnimated.value.map((v: number) => v - 2 * indicatorInsets)): itemsWidthsAnimated.value[0];
    }

    const left = itemsWidthsAnimated.value.length > 1 ? interpolate(value,
      itemsOffsetsAnimated.value.map((_v: any, i: number) => i),
      itemsOffsetsAnimated.value) : itemsOffsetsAnimated.value[0];

    return {
      marginHorizontal,
      width,
      left
    };
  });

  const shadowStyle = useMemo(() => {
    return enableShadow ? propsShadowStyle || styles.containerShadow : undefined;
  }, [enableShadow, propsShadowStyle]);

  const _containerStyle = useMemo(() => {
    return [styles.container, shadowStyle, {width: containerWidth}, containerStyle];
  }, [shadowStyle, containerWidth, containerStyle]);

  const tabBarContainerStyle = useMemo(() => {
    return [styles.tabBar, spreadItems && styles.spreadItems, !_.isUndefined(height) && {height}, {backgroundColor}];
  }, [height, backgroundColor]);

  const scrollViewContainerStyle = useMemo(() => {
    return {minWidth: containerWidth};
  }, [containerWidth]);

  useDidUpdate(() => {
    if (tabBar.current?.isScrollEnabled()) {
      focusIndex(currentPage.value);
    } else {
      reset();
      setKey(generateKey(Constants.orientation, labelColor, selectedLabelColor));
    }
  }, [containerWidth]);

  useDidUpdate(() => {
    setKey(generateKey(Constants.orientation, labelColor, selectedLabelColor));
  }, [labelColor, selectedLabelColor]);

  return (
    <View style={_containerStyle} key={key} bg-$backgroundElevated>
      <FadedScrollView
        ref={tabBar}
        horizontal
        showsHorizontalScrollIndicator={false}
        showStartFader
        startFaderProps={faderProps}
        showEndFader
        endFaderProps={faderProps}
        contentContainerStyle={scrollViewContainerStyle}
        testID={testID}
        onContentSizeChange={onContentSizeChange}
        onLayout={onLayout}
      >
        <View style={tabBarContainerStyle}>{tabBarItems}</View>
        {itemsCount >= 1 && (
          <Reanimated.View style={[styles.selectedIndicator, indicatorStyle, _indicatorTransitionStyle]}/>
        )}
      </FadedScrollView>
    </View>
  );
};

TabBar.displayName = 'TabController.TabBar';

const styles = StyleSheet.create({
  container: {
    zIndex: 100
  },
  tabBar: {
    height: DEFAULT_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 70,
    height: 2,
    backgroundColor: Colors.$backgroundPrimaryHeavy
  },
  containerShadow: {
    ...Platform.select({
      ios: {
        shadowColor: Colors.black,
        shadowOpacity: 0.05,
        shadowRadius: 2,
        shadowOffset: {height: 6, width: 0}
      },
      android: {
        elevation: 5,
        backgroundColor: Colors.$backgroundElevated
      }
    })
  },
  spreadItems: {
    flex: 1
  }
});

const generateKey = (orientation: string, labelColor = '', selectedLabelColor = '') =>
  `${orientation}_${labelColor}_${selectedLabelColor}`;

export default asBaseComponent<TabControllerBarProps>(forwardRef<Props>(TabBar));
