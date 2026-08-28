import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import * as S from '../utils/storage';

const StudentContext = createContext(null);

export function useStudent() {
  return useContext(StudentContext);
}

export function StudentProvider({ children }) {
  const [students, setStudents] = useState([]);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    S.getStudentsCount().then(setTotalCount);
  }, []); // Only fetch count initially

  useEffect(() => {
    setLoading(true);
    const unsub = S.subscribeToStudentsPaginated(limit, (data) => {
      setStudents(data);
      setLoading(false);
    });
    return () => unsub && unsub();
  }, [limit]);

  const loadMore = useCallback(() => {
    setLimit(prev => prev + 10);
  }, []);

  const hasMore = students.length < totalCount;

  const addStudent = useCallback(async (data) => {
    await S.addStudent(data);
    setTotalCount(prev => prev + 1);
  }, []);

  const updateStudent = useCallback(async (data) => {
    await S.updateStudent(data);
  }, []);

  const deleteStudent = useCallback(async (id) => {
    await S.deleteStudent(id);
    setTotalCount(prev => Math.max(0, prev - 1));
  }, []);

  return (
    <StudentContext.Provider value={{ students, addStudent, updateStudent, deleteStudent, loadMore, hasMore, loading, totalCount }}>
      {children}
    </StudentContext.Provider>
  );
}
