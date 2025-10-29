import { useCallback, useMemo, useRef, useEffect } from 'react';
import { InteractionManager } from 'react-native';

/**
 * Custom hook for debouncing function calls
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    }) as T,
    [callback, delay]
  );
};

/**
 * Custom hook for throttling function calls
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCallRef = useRef(0);
  const lastCallTimerRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        callback(...args);
        lastCallRef.current = now;
      } else {
        if (lastCallTimerRef.current) {
          clearTimeout(lastCallTimerRef.current);
        }
        lastCallTimerRef.current = setTimeout(() => {
          callback(...args);
          lastCallRef.current = Date.now();
        }, delay - (now - lastCallRef.current));
      }
    }) as T,
    [callback, delay]
  );
};

/**
 * Custom hook for memoizing expensive calculations with cache
 */
export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  dependencies: any[]
): T => {
  const cacheRef = useRef(new Map<string, any>());
  
  return useCallback(
    ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      if (cacheRef.current.has(key)) {
        return cacheRef.current.get(key);
      }
      const result = callback(...args);
      cacheRef.current.set(key, result);
      return result;
    }) as T,
    dependencies
  );
};

/**
 * Custom hook for running effects after interactions
 */
export const useAfterInteraction = (effect: () => void, deps: any[] = []) => {
  useEffect(() => {
    const interactionPromise = InteractionManager.runAfterInteractions(() => {
      effect();
    });
    
    return () => {
      interactionPromise.cancel();
    };
  }, deps);
};

/**
 * Custom hook for optimizing list rendering
 */
export const useOptimizedList = <T>(
  items: T[],
  keyExtractor: (item: T, index: number) => string,
  getItemLayout?: (data: T[] | null, index: number) => {
    length: number;
    offset: number;
    index: number;
  }
) => {
  const memoizedItems = useMemo(() => items, [items]);
  
  const getItemLayoutOptimized = useMemo(() => {
    if (!getItemLayout) return undefined;
    return (data: T[] | null, index: number) => getItemLayout(data, index);
  }, [getItemLayout]);

  return {
    data: memoizedItems,
    keyExtractor,
    getItemLayout: getItemLayoutOptimized,
    removeClippedSubviews: true,
    maxToRenderPerBatch: 10,
    windowSize: 10,
    initialNumToRender: 10,
    updateCellsBatchingPeriod: 50,
  };
};

/**
 * Utility for deep comparison of objects
 */
export const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  
  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    
    return true;
  }
  
  return false;
};

/**
 * Utility for memoizing objects with deep comparison
 */
export const useDeepMemo = <T>(value: T, deps: any[]): T => {
  const ref = useRef<{ value: T; deps: any[] }>();
  
  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = { value, deps };
  }
  
  return ref.current.value;
};

/**
 * Performance monitoring utility
 */
export const withPerformanceMonitoring = <T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T => {
  return ((...args: Parameters<T>) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    if (__DEV__) {
      console.log(`${name} took ${end - start}ms`);
    }
    
    return result;
  }) as T;
};

/**
 * Memory usage monitoring utility
 */
export const logMemoryUsage = (label: string = 'Memory Usage') => {
  if (__DEV__) {
    const used = process.memoryUsage();
    console.log(`${label}:`, {
      rss: `${Math.round(used.rss / 1024 / 1024 * 100) / 100} MB`,
      heapTotal: `${Math.round(used.heapTotal / 1024 / 1024 * 100) / 100} MB`,
      heapUsed: `${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB`,
      external: `${Math.round(used.external / 1024 / 1024 * 100) / 100} MB`,
    });
  }
}; 