import { useApp } from '../context/AppContext';
import { LayoutDashboard, Users, Receipt, BarChart3, Settings, Sun, Moon, GraduationCap } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'students', label: 'Danh sách học sinh', icon: Users },
  { id: 'tuition', label: 'Học phí theo tháng', icon: Receipt },
  { id: 'reports', label: 'Báo cáo doanh thu', icon: BarChart3 },
  { id: 'settings', label: 'Cài đặt & Dữ liệu', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const { currentTab, switchTab, theme, toggleTheme } = useApp();

  const handleNav = (tabId) => {
    switchTab(tabId);
    if (onClose) onClose();
  };

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
        {navItems.slice(0, 4).map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${currentTab === item.id ? 'active' : ''}`}
              onClick={() => handleNav(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="nav-section-title" style={{ marginTop: '1rem' }}>Hệ thống</div>
        {navItems.slice(4).map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${currentTab === item.id ? 'active' : ''}`}
              onClick={() => handleNav(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          <span>{theme === 'dark' ? 'Giao diện Tối' : 'Giao diện Sáng'}</span>
          {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>
    </aside>
  );
}
