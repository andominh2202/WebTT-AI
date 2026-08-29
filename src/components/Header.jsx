import { useLocation } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { Menu, Plus } from 'lucide-react';

const titleMap = {
  dashboard: { title: 'Tổng quan hệ thống', sub: 'Thống kê hoạt động, số lượng học sinh và doanh thu nhanh' },
  students: { title: 'Quản lý Học sinh', sub: 'Danh sách, tìm kiếm, thêm mới và theo dõi học sinh' },
  tuition: { title: 'Quản lý Học phí theo tháng', sub: 'Theo dõi tình trạng nộp tiền, công nợ và in phiếu thu' },
  reports: { title: 'Báo cáo & Thống kê doanh thu', sub: 'Biểu đồ doanh thu, cơ cấu học sinh và hiệu quả theo môn' },
  teacherFees: { title: 'Bảng giá học phí', sub: 'Cài đặt học phí theo buổi và theo tháng cho từng giáo viên' },
  settings: { title: 'Cài đặt & Dữ liệu', sub: 'Sao lưu, phục hồi dữ liệu và khôi phục cài đặt gốc' }
};

export default function Header({ onToggleSidebar, onAddStudent }) {
  const { currentUser } = useAuth();
  const location = useLocation();
  const path = location.pathname.replace('/', '') || 'dashboard';
  const tabId = path === 'teacher-fees' ? 'teacherFees' : path;
  const info = titleMap[tabId] || titleMap.dashboard;

  return (
    <header className="top-header">
      <div className="header-left">
        <button className="mobile-menu-toggle" onClick={onToggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="page-title-box">
          <h2>{info.title}</h2>
          <p>{info.sub}</p>
        </div>
      </div>
      <div className="header-actions">
        {currentUser?.role === 'admin' && (
          <button className="btn btn-primary" onClick={onAddStudent}>
            <Plus size={18} /> <span className="hide-mobile">Thêm học sinh</span>
          </button>
        )}
      </div>
    </header>
  );
}
