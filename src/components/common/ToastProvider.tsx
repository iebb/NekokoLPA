import React, {createContext, useContext, useState} from 'react';
import { YStack, Text, useTheme } from 'tamagui';

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
    }, 5000); // Auto-hide after 3 seconds
  };


  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast UI */}
      {
        toastConfig.visible && (
          <YStack
            position="absolute"
            bottom={20}
            left={0}
            right={0}
            alignItems="center"
          >
            <YStack
              paddingHorizontal={14}
              paddingVertical={10}
              borderRadius={8}
              backgroundColor={toastConfig.type === 'error' ? '$backgroundDanger' : '$accentColor'}
              maxWidth={360}
            >
              <Text color="$background" fontSize={14} textAlign="center">
                {toastConfig.message}
              </Text>
            </YStack>
          </YStack>
        )
      }
    </ToastContext.Provider>
  );
};

// Custom Hook for using toast
export const useToast = () => useContext(ToastContext);
