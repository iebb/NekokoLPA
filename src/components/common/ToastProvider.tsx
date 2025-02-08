import React, {createContext, useContext, useState} from 'react';
import {Colors, Toast} from 'react-native-ui-lib';

const ToastContext = createContext({ showToast: (message: string, type = 'error') => {} });

export const ToastProvider = ({ children }: { children: React.ReactNode}) => {
  const [toastConfig, setToastConfig] = useState({
    visible: false,
    message: '',
    type: 'error', // Default type
  });

  const showToast = (message: string, type = 'error') => {
    setToastConfig({ visible: true, message, type });

    setTimeout(() => {
      setToastConfig({ visible: false, message: '', type });
    }, 3000); // Auto-hide after 3 seconds
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast UI */}
      <Toast
        visible={toastConfig.visible}
        position={'bottom'}
        backgroundColor={toastConfig.type === 'error' ? Colors.$backgroundDangerHeavy : 'green'}
        message={toastConfig.message}
      />
    </ToastContext.Provider>
  );
};

// Custom Hook for using toast
export const useToast = () => useContext(ToastContext);