import { useState, useCallback, useRef } from 'react';
import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';
import Dashboard from './components/dashboard/Dashboard';
import StudentList from './components/students/StudentList';
import StudentModal from './components/students/StudentModal';
import StudentDetailModal from './components/students/StudentDetailModal';
import TuitionPage from './components/tuition/TuitionPage';
import ReportsPage from './components/reports/ReportsPage';
import SettingsPage from './components/settings/SettingsPage';
import './styles/style.css';

export default function App() {
  const { currentTab } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Student Modal state
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [editStudentId, setEditStudentId] = useState(null);

  // Student Detail Modal state
  const [detailStudentId, setDetailStudentId] = useState(null);

  // CSV export ref (to call from Dashboard)
  const tuitionRef = useRef(null);

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

  const { switchTab } = useApp();

  const handleExportCSV = useCallback(() => {
    switchTab('tuition');
  }, [switchTab]);

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard onAddStudent={handleAddStudent} onExportCSV={handleExportCSV} />;
      case 'students':
        return <StudentList onAddStudent={handleAddStudent} onEditStudent={handleEditStudent} onViewStudent={handleViewStudent} />;
      case 'tuition':
        return <TuitionPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard onAddStudent={handleAddStudent} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-wrapper">
        <Header
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          onAddStudent={handleAddStudent}
        />
        <main className="content-body">
          {renderContent()}
        </main>
      </div>

      {/* Modals */}
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

      {/* Toast Notifications */}
      <Toast />
    </div>
  );
}
