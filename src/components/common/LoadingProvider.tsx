import React, {createContext, useContext, useState} from 'react';
import BlockingLoader from "@/components/common/BlockingLoader";

const LoadingContext = createContext({ setLoading: (message: boolean | string) => {}, isLoading: false });

export const LoadingProvider = ({ children }: { children: React.ReactNode}) => {
  const [LoadingConfig, setLoadingConfig] = useState({
    visible: false,
    message: '',
  });

  const setLoading = (message: boolean | string) => {
    setLoadingConfig({ visible: !(message === false || message === "") , message: (message === false || message === true) ? "" : message  });
  };

  return (
    <LoadingContext.Provider value={{ setLoading, isLoading: LoadingConfig.visible }}>
      {
        LoadingConfig.visible && (
          <BlockingLoader
            message={LoadingConfig.message}
          />
        )
      }
      {children}
    </LoadingContext.Provider>
  );
};

// Custom Hook for using Loading
export const useLoading = () => useContext(LoadingContext);