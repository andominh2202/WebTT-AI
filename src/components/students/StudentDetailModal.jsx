import { useMemo } from 'react';
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import { useStudent } from "../../context/StudentContext";
import { useTuition } from "../../context/TuitionContext";
import { formatCurrency, formatDate, calculateAge } from '../../utils/storage';
import { X } from 'lucide-react';

export default function StudentDetailModal({ isOpen, onClose, studentId }) {
  const { tuition } = useTuition();
  const { students } = useStudent();

  const student = useMemo(() => studentId ? students.find(s => s.id === studentId) : null, [studentId, students]);

  const studentTuition = useMemo(() => {
    if (!studentId) return [];
    return tuition.filter(t => t.studentId === studentId).sort((a, b) => b.month.localeCompare(a.month));
  }, [studentId, tuition]);

  if (!isOpen || !student) return null;

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-container modal-lg">
        <div className="modal-header">
          <h3>Hồ sơ & Lịch sử học sinh</h3>
          <button className="modal-close" onClick={onClose}><X size={22} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="detail-item-group">
              <div style={{ padding: '0.75rem 1.25rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', background: 'var(--bg-hover)', fontSize: '0.825rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.025em' }}>
                Thông tin cá nhân & liên hệ
              </div>
              <div className="detail-item"><span className="label">Họ và tên</span><span className="val">{student.fullName}</span></div>
              <div className="detail-item"><span className="label">Mã học sinh</span><span className="val">{student.id}</span></div>
              <div className="detail-item"><span className="label">SĐT phụ huynh</span><span className="val">{student.parentPhone || '---'}</span></div>
              <div className="detail-item"><span className="label">Ngày sinh (Tuổi)</span><span className="val">{student.dob ? `${formatDate(student.dob)} (${calculateAge(student.dob)})` : '---'}</span></div>
              <div className="detail-item"><span className="label">Trường học</span><span className="val">{student.school || '---'}</span></div>
              <div className="detail-item"><span className="label">Người giới thiệu</span><span className="val">{student.referrer || '---'}</span></div>
              <div className="detail-item"><span className="label">Ngày đăng ký</span><span className="val">{student.createdAt ? formatDate(student.createdAt) : '---'}</span></div>
            </div>

            <div className="detail-item-group" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '0.75rem 1.25rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', background: 'var(--bg-hover)', fontSize: '0.825rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.025em' }}>
                Lịch học & học phí
              </div>
              <div className="detail-item">
                <span className="label">Trạng thái</span>
                <span className="val">
                  {student.status === 'official' ? <span className="badge badge-official">Chính thức</span> : <span className="badge badge-trial">Học thử</span>}
                </span>
              </div>
              <div className="detail-item"><span className="label">Tổng học phí/tháng</span><span className="val" style={{ color: 'var(--primary)', fontWeight: 800 }}>{formatCurrency((student.subjects || []).reduce((sum, s) => sum + ((s.feePerLesson || 0) * ((s.scheduleDays?.length || 1) * 4)), 0))}</span></div>
              <div className="detail-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem' }}>
                <span className="label">Môn học & Lịch học</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', marginTop: '0.5rem' }}>
                  {(student.subjects || []).length > 0 ? (
                    student.subjects.map((s, i) => (
                      <div key={i} style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                        <div><strong style={{ color: 'var(--primary)' }}>{s.subject}</strong> - {s.teacher}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          <span>{(s.scheduleDays || []).join(', ') || 'Chưa xếp lịch'}</span>
                          <span style={{ color: 'var(--success)', fontWeight: 600 }}>{formatCurrency(s.feePerLesson || 0)}/buổi</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Chưa chọn</span>
                  )}
                </div>
              </div>
              <div className="detail-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem', flex: 1, borderBottom: 'none' }}>
                <span className="label">Ghi chú</span>
                <span className="val" style={{ fontWeight: 'normal', textAlign: 'left', fontSize: '0.85rem', wordBreak: 'break-word', color: 'var(--text-secondary)' }}>
                  {student.notes || 'Không có ghi chú'}
                </span>
              </div>
            </div>
          </div>

          <h4 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Lịch sử nộp học phí qua các tháng</h4>
          <div className="table-responsive">
            <table className="custom-table nowrap-table">
              <thead><tr><th>Tháng</th><th>Học phí</th><th>Đã nộp</th><th>Trạng thái</th><th>Ngày nộp</th><th>Hình thức</th></tr></thead>
              <tbody>
                {studentTuition.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có lịch sử</td></tr>
                ) : studentTuition.map(t => (
                  <tr key={t.id || t.month}>
                    <td><strong>{t.month}</strong></td>
                    <td>{formatCurrency(t.feeAmount)}</td>
                    <td style={{ color: 'var(--success-text)', fontWeight: 700 }}>{formatCurrency(t.paidAmount)}</td>
                    <td>
                      {t.status === 'paid' && <span className="badge badge-paid">Đã nộp đủ</span>}
                      {t.status === 'partial' && <span className="badge badge-partial">Nộp 1 phần</span>}
                      {t.status === 'unpaid' && <span className="badge badge-unpaid">Chưa nộp</span>}
                    </td>
                    <td>{t.paymentDate ? formatDate(t.paymentDate) : '---'}</td>
                    <td>{t.paymentMethod || '---'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}
