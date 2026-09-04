import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "./context/AuthContext";
import { useUI } from "./context/UIContext";
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';
import Login from './components/Login';
import GlobalLoading from './components/GlobalLoading';
import { WifiOff } from 'lucide-react';
import './styles/style.css';

const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const StudentList = lazy(() => import('./components/students/StudentList'));
const TuitionPage = lazy(() => import('./components/tuition/TuitionPage'));
const ReportsPage = lazy(() => import('./components/reports/ReportsPage'));
const SettingsPage = lazy(() => import('./components/settings/SettingsPage'));
const TeacherFeesPage = lazy(() => import('./components/tuition/TeacherFeesPage'));
const StudentModal = lazy(() => import('./components/students/StudentModal'));
const StudentDetailModal = lazy(() => import('./components/students/StudentDetailModal'));
const NotFound = lazy(() => import('./components/NotFound'));

export default function App() {
  const { currentUser, isAuthLoading } = useAuth();
  const { isOnline } = useUI();
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);
  const navigate = useNavigate();
  const location = useLocation();

  // Student Modal state
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [editStudentId, setEditStudentId] = useState(null);

  // Student Detail Modal state
  const [detailStudentId, setDetailStudentId] = useState(null);

  // Handle responsive sidebar on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 900) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Redirect user role if they somehow enter restricted settings tab
  useEffect(() => {
    if (currentUser && currentUser.role === 'user' && location.pathname === '/settings') {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, location, navigate]);

  const handleAddStudent = useCallback(() => {
    setEditStudentId(null);
    setStudentModalOpen(true);
  }, []);

  const handleEditStudent = useCallback((id) => {
    setEditStudentId(id);
    setStudentModalOpen(true);
  }, []);

  const handleViewStudent = useCallback((id) => {
    setDetailStudentId(id);
  }, []);

  const handleExportCSV = useCallback(() => {
    navigate('/tuition');
  }, [navigate]);

  if (isAuthLoading) {
    return <GlobalLoading />;
  }

  if (!currentUser) {
    return (
      <>
        {!isOnline && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            backgroundColor: 'var(--warning-light, #fffbeb)',
            color: 'var(--warning-text, #b45309)',
            borderBottom: '1px solid var(--warning, #f59e0b)',
            padding: '0.5rem 1rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <WifiOff size={16} />
            <span>Bạn đang ngoại tuyến. Vui lòng kết nối mạng để đăng nhập.</span>
          </div>
        )}
        <Login />
        <Toast />
      </>
    );
  }

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => { if (window.innerWidth <= 900) setSidebarOpen(false); }} />

      <div className={`main-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {!isOnline && (
          <div style={{
            backgroundColor: 'var(--warning-light, #fffbeb)',
            color: 'var(--warning-text, #b45309)',
            borderBottom: '1px solid var(--warning, #f59e0b)',
            padding: '0.5rem 1rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <WifiOff size={16} />
            <span>Bạn đang ngoại tuyến. Một số tính năng và đồng bộ có thể bị gián đoạn.</span>
          </div>
        )}

        <Header
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          onAddStudent={handleAddStudent}
        />
        <main className="content-body">
          <Suspense fallback={<GlobalLoading />}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard onAddStudent={handleAddStudent} onExportCSV={handleExportCSV} />} />
              <Route path="/students" element={<StudentList onAddStudent={handleAddStudent} onEditStudent={handleEditStudent} onViewStudent={handleViewStudent} />} />
              <Route path="/tuition" element={<TuitionPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/teacher-fees" element={<TeacherFeesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
      </div>

      <Suspense fallback={null}>
        <StudentModal
          isOpen={studentModalOpen}
          onClose={() => { setStudentModalOpen(false); setEditStudentId(null); }}
          editStudentId={editStudentId}
        />

        <StudentDetailModal
          isOpen={!!detailStudentId}
          onClose={() => setDetailStudentId(null)}
          studentId={detailStudentId}
        />
      </Suspense>

      {/* Toast Notifications */}
      <Toast />
    </div>
  );
}
