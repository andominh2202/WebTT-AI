import { NavLink } from 'react-router-dom';
import { useUI } from "../context/UIContext";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { useStudent } from "../context/StudentContext";
import { useTuition } from "../context/TuitionContext";
import { LayoutDashboard, Users, Receipt, BarChart3, Settings, Sun, Moon, GraduationCap, LogOut } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'students', label: 'Danh sách học sinh', icon: Users },
  { id: 'tuition', label: 'Học phí theo tháng', icon: Receipt },
  { id: 'reports', label: 'Báo cáo doanh thu', icon: BarChart3 },
  { id: 'teacherFees', label: 'Bảng giá học phí', icon: Receipt },
  { id: 'settings', label: 'Cài đặt & Dữ liệu', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const { theme, toggleTheme } = useUI();
  const { currentUser, logout } = useAuth();

  const mainNavItems = navItems.slice(0, 4);
  const systemNavItems = currentUser?.role === 'admin' ? navItems.slice(4) : [];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-icon"><GraduationCap size={22} /></div>
        <div className="brand-info">
          <h1>Tên Trung Tâm</h1>
          <span>Quản lý Học sinh & Thu chi</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Chức năng chính</div>
        {mainNavItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={`/${item.id === 'teacherFees' ? 'teacher-fees' : item.id}`}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onClose && onClose()}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {systemNavItems.length > 0 && (
          <>
            <div className="nav-section-title" style={{ marginTop: '1rem' }}>Hệ thống</div>
            {systemNavItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={`/${item.id === 'teacherFees' ? 'teacher-fees' : item.id}`}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => onClose && onClose()}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        {currentUser && (
          <div className="user-profile-section" style={{
            padding: '0.75rem 0.5rem',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser.displayName}
              </span>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {currentUser.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
              </span>
            </div>
            <button
              onClick={logout}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--danger)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.4rem',
                borderRadius: 'var(--radius-sm)',
                transition: 'background var(--transition-fast)'
              }}
              title="Đăng xuất"
              className="action-btn logout-btn"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          <span>{theme === 'dark' ? 'Giao diện Tối' : 'Giao diện Sáng'}</span>
          {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>
    </aside>
  );
}
