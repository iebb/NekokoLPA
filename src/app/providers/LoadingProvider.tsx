import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import BlockingLoader from '@/shared/ui/BlockingLoader';

interface LoadingContextValue {
  /**
   * `true` shows a bare spinner, a string shows it with that message,
   * `false` or `''` hides it.
   */
  setLoading: (message: boolean | string) => void;
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextValue>({
  setLoading: () => {},
  isLoading: false,
});

export const LoadingProvider = ({children}: PropsWithChildren) => {
  const [config, setConfig] = useState({visible: false, message: ''});

  const setLoading = useCallback((message: boolean | string) => {
    const hidden = message === false || message === '';
    setConfig({
      visible: !hidden,
      message: typeof message === 'string' ? message : '',
    });
  }, []);

  const value = useMemo(
    () => ({setLoading, isLoading: config.visible}),
    [setLoading, config.visible],
  );

  return (
    <LoadingContext.Provider value={value}>
      {config.visible && <BlockingLoader message={config.message} />}
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
