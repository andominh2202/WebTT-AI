import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import { useStudent } from "../../context/StudentContext";
import { useTuition } from "../../context/TuitionContext";
import { formatCurrency } from '../../utils/storage';
import { Users, Award, UserPlus, DollarSign, UserCheck, Zap, CreditCard, BarChart2, FileSpreadsheet, CheckCircle, Clock, Receipt, BarChart3, Plus } from 'lucide-react';

export default function Dashboard({ onAddStudent, onExportCSV }) {
  const { currentUser } = useAuth();
  const { students, totalCount, loading: studentsLoading } = useStudent();
  const { tuition, loading: tuitionLoading } = useTuition();
  const navigate = useNavigate();
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(true);

  const loading = studentsLoading || tuitionLoading;


  const stats = useMemo(() => {
    const total = totalCount || students.length;
    const official = students.filter(s => s.status === 'official').length;
    const trial = students.filter(s => s.status === 'trial').length;

    const today = new Date();
    const curMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const curTuition = tuition.filter(t => t.month === curMonth);

    let revenue = 0, expected = 0;
    curTuition.forEach(t => {
      revenue += (t.paidAmount || 0);
      expected += (t.feeAmount || 0);
    });

    return { total, official, trial, revenue, debt: Math.max(0, expected - revenue) };
  }, [students, tuition]);

  const recentStudents = useMemo(() => students.slice(0, 5), [students]);

  return (
    <section>
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Tổng học sinh</span>
            <span className="stat-value">{stats.total}</span>
            <span className="stat-sub positive"><UserCheck size={14} /> Đang hoạt động</span>
          </div>
          <div className="stat-icon-wrapper icon-blue"><Users size={22} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Chính thức</span>
            <span className="stat-value" style={{ color: 'var(--success-text)' }}>{stats.official}</span>
            <span className="stat-sub positive"><CheckCircle size={14} /> Đã đăng ký</span>
          </div>
          <div className="stat-icon-wrapper icon-green"><Award size={22} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Học thử</span>
            <span className="stat-value" style={{ color: 'var(--warning-text)' }}>{stats.trial}</span>
            <span className="stat-sub warning"><Clock size={14} /> Đang trải nghiệm</span>
          </div>
          <div className="stat-icon-wrapper icon-amber"><UserPlus size={22} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Doanh thu tháng này</span>
            <span className="stat-value" style={{ color: 'var(--primary)' }}>{formatCurrency(stats.revenue)}</span>
            <span className="stat-sub">Công nợ: <strong style={{ marginLeft: 4, color: 'var(--danger-text)' }}>{formatCurrency(stats.debt)}</strong></span>
          </div>
          <div className="stat-icon-wrapper icon-purple"><DollarSign size={22} /></div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className={`dashboard-grid ${!isQuickActionsOpen ? 'hide-right' : ''}`}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title"><UserCheck size={18} /> Học sinh mới đăng ký gần đây</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}>
                {isQuickActionsOpen ? 'Ẩn tab thao tác' : 'Hiện tab thao tác'}
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/students')}>Xem tất cả</button>
            </div>
          </div>
          <div className="table-responsive">
            <table className="custom-table">
              <thead><tr><th>STT</th><th>Học sinh</th><th>SĐT Phụ huynh</th><th>Môn học</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <tr key={`skeleton-${idx}`}>
                      <td><div className="skeleton-box" style={{ width: '20px', height: '20px', borderRadius: '4px' }}></div></td>
                      <td>
                        <div className="skeleton-box" style={{ width: '120px', height: '20px', borderRadius: '4px' }}></div>
                      </td>
                      <td><div className="skeleton-box" style={{ width: '100px', height: '20px', borderRadius: '4px' }}></div></td>
                      <td><div className="skeleton-box" style={{ width: '150px', height: '20px', borderRadius: '4px' }}></div></td>
                      <td><div className="skeleton-box" style={{ width: '60px', height: '20px', borderRadius: '4px' }}></div></td>
                    </tr>
                  ))
                ) : recentStudents.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center' }}>Chưa có học sinh</td></tr>
                ) : recentStudents.map((s, i) => (
                  <tr key={s.id}>
                    <td><strong>{i + 1}</strong></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.fullName}</div>
                    </td>
                    <td>{s.parentPhone || '---'}</td>
                    <td>{(s.subjects || []).slice(0, 2).map((sub, i) => <span key={i} className="tag-subject" title={sub.teacher}>{sub.subject}</span>)}</td>
                    <td>
                      {s.status === 'official'
                        ? <span className="badge badge-official">Chính thức</span>
                        : <span className="badge badge-trial">Học thử</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isQuickActionsOpen && (
          <div className="card quick-actions-col" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <div className="card-title"><Zap size={18} /> Thao tác nhanh</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {currentUser?.role === 'admin' && (
                <button className="btn btn-primary" style={{ justifyContent: 'flex-start' }} onClick={onAddStudent}>
                  <Plus size={18} /> Thêm học sinh
                </button>
              )}

              <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/tuition')}>
                <Receipt size={16} /> Phiếu thu & Công nợ
              </button>
              <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/reports')}>
                <BarChart3 size={16} /> Báo cáo thống kê
              </button>
              <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }} onClick={onExportCSV}>
                <FileSpreadsheet size={18} /> Xuất danh sách học phí ra CSV
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
