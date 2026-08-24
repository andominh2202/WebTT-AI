import { createContext, useState, useContext, useCallback } from 'react';
import * as S from '../utils/storage';
import { useUI } from './UIContext';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const { showToast } = useUI();
  
  const [currentUser, setCurrentUser] = useState(() => {
    localStorage.removeItem('qlhs_current_user');
    return null;
  });

  const login = useCallback(async (email, password) => {
    try {
      const userObj = await S.authenticateUser(email, password);
      if (userObj) {
        setCurrentUser(userObj);
        showToast('Thành công', `Đăng nhập với vai trò ${userObj.displayName}`, 'success');
        return true;
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
    }
    showToast('Thất bại', 'Sai tên tài khoản hoặc mật khẩu', 'danger');
    return false;
  }, [showToast]);

  const logout = useCallback(async () => {
    await S.logoutUser();
    setCurrentUser(null);
    showToast('Thông báo', 'Đã đăng xuất tài khoản', 'info');
  }, [showToast]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
