import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import * as S from '../utils/storage';
import { useStudent } from './StudentContext';

const TuitionContext = createContext(null);

export function useTuition() {
  return useContext(TuitionContext);
}

export function TuitionProvider({ children }) {
  const [tuition, setTuition] = useState([]);
  const { students } = useStudent();

  useEffect(() => {
    const unsub = S.subscribeToCollection('tuition', setTuition);
    return () => unsub && unsub();
  }, []);

  const saveTuition = useCallback(async (record) => {
    await S.saveTuitionRecord(record);
  }, []);

  const syncMonth = useCallback(async (month) => {
    await S.syncMonthlyTuition(month, students, tuition);
  }, [students, tuition]);

  return (
    <TuitionContext.Provider value={{ tuition, saveTuition, syncMonth }}>
      {children}
    </TuitionContext.Provider>
  );
}
