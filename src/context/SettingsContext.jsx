import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import * as S from '../utils/storage';
import { useUI } from './UIContext';
import { normalizeError } from '../utils/errorHandler';

const SettingsContext = createContext(null);

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
  const { showToast } = useUI();
  const [teacherFees, setTeacherFees] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const unsubs = [
      S.subscribeToSettings('teacherFees', setTeacherFees),
      S.subscribeToCollection('subjects', setSubjects),
      S.subscribeToCollection('teachers', setTeachers)
    ];
    return () => unsubs.forEach(unsub => unsub && unsub());
  }, []);

  const saveTeacherFees = useCallback(async (newFees) => {
    try {
      await S.saveSettings('teacherFees', newFees);
      showToast('Thành công', 'Đã lưu cài đặt học phí giáo viên', 'success');
    } catch (e) {
      const norm = normalizeError(e);
      showToast('Lỗi', norm.message, 'danger');
      throw e;
    }
  }, [showToast]);

  const exportBackup = async () => {
    try {
      await S.exportDatabase();
      showToast('Thành công', 'Đã tải xuống file sao lưu', 'success');
    } catch (err) {
      const norm = normalizeError(err);
      showToast('Lỗi', norm.message, 'danger');
    }
  };

  const importBackup = async (jsonData) => {
    try {
      await S.importDatabase(jsonData);
      showToast('Thành công', 'Đã khôi phục dữ liệu từ file', 'success');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      const norm = normalizeError(err);
      showToast('Lỗi', norm.message, 'danger');
    }
  };

  return (
    <SettingsContext.Provider value={{ teacherFees, saveTeacherFees, subjects, teachers, exportBackup, importBackup }}>
      {children}
    </SettingsContext.Provider>
  );
}
