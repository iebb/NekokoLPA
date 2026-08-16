import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Text, YStack} from 'tamagui';

export type ToastType = 'error' | 'success';

const TOAST_DURATION_MS = 5000;

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({showToast: () => {}});

export const ToastProvider = ({children}: PropsWithChildren) => {
  const [toast, setToast] = useState<{message: string; type: ToastType} | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'error') => {
    setToast({message, type});
    // Restart the timer so a second toast gets its full duration.
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  // Avoid setting state after unmount if a toast is still on screen.
  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    [],
  );

  const value = useMemo(() => ({showToast}), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <YStack position="absolute" bottom={20} left={0} right={0} alignItems="center">
          <YStack
            paddingHorizontal={14}
            paddingVertical={10}
            borderRadius={8}
            backgroundColor={toast.type === 'error' ? '$backgroundDanger' : '$primaryColor'}
            maxWidth={360}>
            <Text color="$background" fontSize={14} textAlign="center">
              {toast.message}
            </Text>
          </YStack>
        </YStack>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
