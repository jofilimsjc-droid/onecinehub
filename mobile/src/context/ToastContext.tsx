import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, setToastRef } from '../utils/Toast';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');

  const showToast = useCallback((msg: string, toastType: ToastType = 'info') => {
    setMessage(msg);
    setType(toastType);
    setVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setVisible(false);
  }, []);

  // Set ref for global access
  React.useEffect(() => {
    setToastRef({ show: showToast });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast visible={visible} message={message} type={type} onHide={hideToast} />
    </ToastContext.Provider>
  );
}

