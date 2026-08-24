import { UIProvider } from './UIContext';
import { AuthProvider } from './AuthContext';
import { SettingsProvider } from './SettingsContext';
import { StudentProvider } from './StudentContext';
import { TuitionProvider } from './TuitionContext';
import { useEffect } from 'react';
import * as S from '../utils/storage';

export function AppProviders({ children }) {
  useEffect(() => {
    const init = async () => {
      await S.migrateSubjectData();
      await S.initStorage();
    };
    init();
  }, []);

  return (
    <UIProvider>
      <AuthProvider>
        <SettingsProvider>
          <StudentProvider>
            <TuitionProvider>
              {children}
            </TuitionProvider>
          </StudentProvider>
        </SettingsProvider>
      </AuthProvider>
    </UIProvider>
  );
}
