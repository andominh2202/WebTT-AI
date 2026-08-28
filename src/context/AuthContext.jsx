import { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import * as S from '../utils/storage';
import { useUI } from './UIContext';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const { showToast } = useUI();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const usersSnap = await getDocs(collection(db, 'users'));
          const found = usersSnap.docs.find(d => d.data().email === firebaseUser.email);
          const userData = found ? found.data() : null;
          
          setCurrentUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            username: userData?.username || firebaseUser.email,
            role: userData?.role || 'user',
            displayName: userData?.displayName || firebaseUser.email.split('@')[0]
          });
        } catch(e) {
          console.error("Lỗi lấy thông tin user khi khôi phục phiên:", e);
          setCurrentUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            username: firebaseUser.email,
            role: 'user',
            displayName: firebaseUser.email.split('@')[0]
          });
        }
      } else {
        setCurrentUser(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
    <AuthContext.Provider value={{ currentUser, isAuthLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
