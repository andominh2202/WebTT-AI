import { createContext, useState, useContext, useCallback, useRef, useEffect } from 'react';
import * as S from '../utils/storage';

const UIContext = createContext(null);

export function useUI() {
  return useContext(UIContext);
}

export function UIProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [toasts, setToasts] = useState([]);

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

  return (
    <UIContext.Provider value={{ theme, toggleTheme, toasts, showToast }}>
      {children}
    </UIContext.Provider>
  );
}
