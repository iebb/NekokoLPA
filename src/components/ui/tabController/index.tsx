// @ts-nocheck
import _ from 'lodash';
import React, {PropsWithChildren, useCallback, useEffect, useMemo, useState} from 'react';
import {runOnJS, useAnimatedReaction, useSharedValue, withTiming} from 'react-native-reanimated';
import {useOrientation, useThemeProps} from 'react-native-ui-lib/src/components/../hooks';
import {Constants} from 'react-native-ui-lib/src/components/../commons/new';
import TabBarContext from './TabBarContext';
import TabBar, {TabControllerBarProps} from './TabBar';
import TabBarItem, {TabControllerItemProps} from './TabBarItem';
import useImperativeTabControllerHandle, {TabControllerImperativeMethods} from './useImperativeTabControllerHandle';

export {TabControllerBarProps, TabControllerItemProps, TabControllerImperativeMethods};

interface TabControllerStatics {
  TabBar: typeof TabBar;
  TabBarItem: typeof TabBarItem;
}

export interface TabControllerProps {
  /**
   * The list of tab bar items
   */
  items: TabControllerItemProps[];
  /**
   * Initial selected index
   */
  initialIndex?: number;
  /**
   * callback for when index has change (will not be called on ignored items)
   */
  onChangeIndex?: (index: number, prevIndex: number | null) => void;
  /**
   * When using TabController.PageCarousel this should be turned on
   */
  asCarousel?: boolean;
  /**
   * Pass when TabController is render inside a ScrollView (with a header)
   */
  nestedInScrollView?: boolean;
  /**
   * Pass for custom carousel page width
   */
  carouselPageWidth?: number;
  /**
   * Send if a SafeView is used in the context of the TabController.
   */
  useSafeArea?: boolean;
  children?: React.ReactNode;
}

const getScreenWidth = (useSafeArea: boolean) => {
  const {left, right} = Constants.getSafeAreaInsets();
  return Constants.windowWidth - (useSafeArea && Constants.isIphoneX ? left + right : 0);
};

/**
 * @description: A performant solution for a tab controller with lazy load mechanism
 * @example: https://github.com/wix/react-native-ui-lib/blob/master/demo/src/screens/componentScreens/TabControllerScreen/index.tsx
 * @notes: This component is based on react-native-gesture-handler
 * @importantLink: https://kmagiera.github.io/react-native-gesture-handler/docs/getting-started.html#with-wix-react-native-navigation-https-githubcom-wix-react-native-navigation
 */
const TabController = React.forwardRef((props: PropsWithChildren<TabControllerProps>, ref: React.Ref<any>) => {
  const themeProps = useThemeProps(props, 'TabController');
  const {
    initialIndex = 0,
    asCarousel = false,
    nestedInScrollView = false,
    items,
    onChangeIndex = _.noop,
    carouselPageWidth,
    useSafeArea = false,
    children
  } = themeProps;
  const [screenWidth, setScreenWidth] = useState<number>(getScreenWidth(useSafeArea));

  useOrientation({
    onOrientationChange: () => {
      setScreenWidth(getScreenWidth(useSafeArea));
    }
  });

  const pageWidth = useMemo(() => {
    return carouselPageWidth || screenWidth;
  }, [carouselPageWidth, screenWidth]);

  const ignoredItems = useMemo(() => {
    return _.filter<TabControllerItemProps[]>(items, (item: TabControllerItemProps) => item.ignore);
  }, [items]);

  /* currentPage - static page index */
  const currentPage = useSharedValue(initialIndex);
  /* targetPage - transitioned page index (can be a fraction when transitioning between pages) */
  const targetPage = useSharedValue(initialIndex);

  const setCurrentIndex = useCallback((index: number) => {
    'worklet';
    currentPage.value = index;
  }, []);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useAnimatedReaction(() => {
    return currentPage.value;
  },
  (value, prevValue) => {
    if (value !== prevValue) {
      targetPage.value = withTiming(value);
      prevValue !== null && runOnJS(onChangeIndex)(value, prevValue);
    }
  });

  useImperativeTabControllerHandle(ref, setCurrentIndex);

  const context = useMemo(() => {
    return {
      /* Pass Props */
      initialIndex,
      asCarousel,
      pageWidth,
      nestedInScrollView,
      /* Items */
      items,
      ignoredItems,
      itemsCount: items.length - ignoredItems.length,
      /* Animated Values */
      targetPage,
      currentPage,
      containerWidth: screenWidth,
      /* Callbacks */
      onChangeIndex,
      setCurrentIndex
    };
  }, [initialIndex, asCarousel, items, onChangeIndex, screenWidth, nestedInScrollView]);

  return <TabBarContext.Provider value={context}>{children}</TabBarContext.Provider>;
});

// @ts-expect-error
TabController.TabBar = TabBar;
// @ts-expect-error
TabController.TabBarItem = TabBarItem;

export default TabController as typeof TabController & TabControllerStatics;
