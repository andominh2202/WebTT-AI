import { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import * as S from '../utils/storage';

const AppContext = createContext(null);

export function useApp() {
  return useContext(AppContext);
}

export function AppProvider({ children }) {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [theme, setTheme] = useState('light');
  const [students, setStudents] = useState([]);
  const [tuition, setTuition] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [teacherFees, setTeacherFees] = useState({});
  const [toasts, setToasts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Authentication State (không lưu localStorage nữa để bảo mật)
  const [currentUser, setCurrentUser] = useState(() => {
    // Xóa tk/mk cũ nếu còn lưu trong trình duyệt
    localStorage.removeItem('qlhs_current_user');
    return null;
  });

  // Khởi tạo và Lắng nghe Firebase
  useEffect(() => {
    let unsubs = [];
    const init = async () => {
      await S.migrateSubjectData();
      await S.initStorage();
      
      unsubs.push(S.subscribeToCollection('students', setStudents));
      unsubs.push(S.subscribeToCollection('tuition', setTuition));
      unsubs.push(S.subscribeToSettings('teacherFees', setTeacherFees));
      unsubs.push(S.subscribeToCollection('subjects', setSubjects));
      unsubs.push(S.subscribeToCollection('teachers', setTeachers));
    };
    init();

    const savedTheme = S.getSavedTheme();
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    return () => {
      unsubs.forEach(unsub => unsub && unsub());
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      S.saveTheme(next);
      return next;
    });
  }, []);

  const switchTab = useCallback((tab) => setCurrentTab(tab), []);

  // Toast
  const toastIdRef = useRef(0);
  const showToast = useCallback((title, message, type = 'info') => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  // Login/Logout Actions
  const login = useCallback(async (email, password) => {
    try {
      const userObj = await S.authenticateUser(email, password);
      if (userObj) {
        setCurrentUser(userObj);
        showToast('Thành công', `Đăng nhập với vai trò ${userObj.displayName}`, 'success');
        setCurrentTab('dashboard');
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
    setCurrentTab('dashboard');
    showToast('Thông báo', 'Đã đăng xuất tài khoản', 'info');
  }, [showToast]);

  // Student CRUD (Firebase)
  const handleAddStudent = useCallback(async (data) => {
    await S.addStudent(data);
  }, []);

  const handleUpdateStudent = useCallback(async (data) => {
    await S.updateStudent(data);
  }, []);

  const handleDeleteStudent = useCallback(async (id) => {
    await S.deleteStudent(id);
  }, []);

  const handleAddSubject = useCallback((name) => {
    // Left empty/unimplemented for simplicity if not needed
  }, []);

  const handleSaveTuition = useCallback(async (record) => {
    await S.saveTuitionRecord(record);
  }, []);

  const handleSyncMonth = useCallback(async (month) => {
    await S.syncMonthlyTuition(month, students, tuition);
  }, [students, tuition]);

  const saveTeacherFees = useCallback(async (newFees) => {
    try {
      await S.saveSettings('teacherFees', newFees);
      showToast('Thành công', 'Đã lưu cài đặt học phí giáo viên', 'success');
    } catch (e) {
      showToast('Lỗi', 'Không thể lưu cài đặt', 'error');
    }
  }, [showToast]);

  const value = {
    currentTab, switchTab,
    theme, toggleTheme,
    students, tuition, subjects, teachers, refreshKey,
    teacherFees, saveTeacherFees,
    toasts, showToast,
    addStudent: handleAddStudent,
    updateStudent: handleUpdateStudent,
    deleteStudent: handleDeleteStudent,
    addSubject: handleAddSubject,
    saveTuition: handleSaveTuition,
    syncMonth: handleSyncMonth,
    exportBackup: async () => {
      try {
        await S.exportDatabase();
        showToast('Thành công', 'Đã tải xuống file sao lưu', 'success');
      } catch (err) {
        showToast('Lỗi', 'Không thể sao lưu dữ liệu', 'danger');
      }
    },
    importBackup: async (jsonData) => {
      try {
        await S.importDatabase(jsonData);
        showToast('Thành công', 'Đã khôi phục dữ liệu từ file', 'success');
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        showToast('Lỗi', 'File sao lưu không hợp lệ hoặc lỗi kết nối', 'danger');
      }
    },
    resetData: () => {}, // disabled
    reload: () => {},
    currentUser, login, logout
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
