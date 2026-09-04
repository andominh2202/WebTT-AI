import { createContext, useState, useContext, useCallback, useRef, useEffect } from 'react';
import * as S from '../utils/storage';

const UIContext = createContext(null);

export function useUI() {
  return useContext(UIContext);
}

export function UIProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [toasts, setToasts] = useState([]);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  useEffect(() => {
    const savedTheme = S.getSavedTheme();
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      S.saveTheme(next);
      return next;
    });
  }, []);

  const toastIdRef = useRef(0);
  const showToast = useCallback((title, message, type = 'info') => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Đã kết nối', 'Kết nối Internet đã được khôi phục.', 'success');
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast('Ngoại tuyến', 'Bạn đang ngoại tuyến. Một số tính năng có thể bị gián đoạn.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  return (
    <UIContext.Provider value={{ theme, toggleTheme, toasts, showToast, isOnline }}>
      {children}
    </UIContext.Provider>
  );
}
