import { useState, useMemo } from 'react';
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import { useStudent } from "../../context/StudentContext";
import { useTuition } from "../../context/TuitionContext";
import { formatCurrency, formatDate, calculateAge } from '../../utils/storage';
import { Search, Plus, Eye, Pencil, Trash2, Phone, CheckCircle, Clock, Users, Loader2 } from 'lucide-react';

export default function StudentList({ onAddStudent, onEditStudent, onViewStudent }) {
  const { students, deleteStudent, loadMore, hasMore, loading } = useStudent();
  const { subjects } = useSettings();
  const { currentUser } = useAuth();
  const { showToast } = useUI();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return students.filter(s => {
      const matchSearch = !q ||
        s.fullName.toLowerCase().includes(q) ||
        (s.parentPhone && s.parentPhone.includes(q)) ||
        (s.school && s.school.toLowerCase().includes(q)) ||
        (s.referrer && s.referrer.toLowerCase().includes(q)) ||
        (s.id && s.id.toLowerCase().includes(q));
      const matchStatus = !statusFilter || s.status === statusFilter;
      const matchSubject = !subjectFilter || (s.subjects && s.subjects.some(sub => sub.subject === subjectFilter));
      return matchSearch && matchStatus && matchSubject;
    });
  }, [students, search, statusFilter, subjectFilter]);

  const [studentToDelete, setStudentToDelete] = useState(null);

  const confirmDelete = (student) => {
    setStudentToDelete(student);
  };

  const handleConfirmDelete = async () => {
    if (studentToDelete) {
      await deleteStudent(studentToDelete.id);
      showToast('Đã xóa', `Đã xóa học sinh ${studentToDelete.fullName}`, 'danger');
      setStudentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setStudentToDelete(null);
  };

  const uniqueSubjects = useMemo(() => {
    const used = new Set();
    students.forEach(s => (s.subjects || []).forEach(sub => used.add(sub.subject)));
    const filtered = subjects.filter(sub => used.has(sub));
    return filtered.sort((a, b) => {
      const getGrade = (name) => {
        const match = name.match(/(12|11|10|9|8|7|6)/);
        return match ? parseInt(match[0], 10) : 0;
      };
      const gradeA = getGrade(a);
      const gradeB = getGrade(b);
      if (gradeA !== gradeB) return gradeB - gradeA;
      return a.localeCompare(b);
    });
  }, [students, subjects]);

  return (
    <section>
      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, SĐT, trường, người giới thiệu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="toolbar-filters">
          <select className="select-custom" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="official">Chính thức</option>
            <option value="trial">Học thử</option>
          </select>
          <select className="select-custom" value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}>
            <option value="">Tất cả môn học</option>
            {uniqueSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
          </select>
          {currentUser?.role === 'admin' && (
            <button className="btn btn-primary" onClick={onAddStudent}>
              <Plus size={18} /> Thêm học sinh
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: 50 }}>STT</th>
              <th>Họ và Tên</th>
              <th>SĐT Phụ Huynh</th>
              <th>Ngày Sinh</th>
              <th>Môn Học</th>
              <th>Trường</th>
              <th>Người Giới Thiệu</th>
              <th>Lịch Học</th>
              <th>Học Phí/Tháng</th>
              <th>Trạng Thái</th>
              <th style={{ textAlign: 'center', width: 110 }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, idx) => {
              const ageText = calculateAge(s.dob);
              const dobDisplay = s.dob ? `${formatDate(s.dob)} ${ageText ? `(${ageText})` : ''}` : '---';
              
              const allDays = new Set();
              let totalMonthlyFee = 0;
              (s.subjects || []).forEach(sub => {
                (sub.scheduleDays || []).forEach(d => allDays.add(d));
                totalMonthlyFee += (sub.feePerLesson || 0) * ((sub.scheduleDays?.length || 1) * 4);
              });
              const schedule = Array.from(allDays).join(', ') || '---';

              return (
                <tr key={s.id}>
                  <td><strong>{idx + 1}</strong></td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => onViewStudent(s.id)}>
                      {s.fullName}
                    </div>
                  </td>
                  <td>
                    <a href={`tel:${s.parentPhone}`} className="phone-copy" title="Gọi SĐT">
                      <Phone size={14} /> {s.parentPhone || '---'}
                    </a>
                  </td>
                  <td>{dobDisplay}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, maxWidth: 180 }}>
                      {(s.subjects || []).length > 0
                        ? s.subjects.map((sub, i) => (
                            <span key={i} className="tag-subject" title={`Giáo viên: ${sub.teacher} | ${formatCurrency(sub.feePerLesson || 0)}/buổi`}>
                              {sub.subject} - {sub.teacher}
                            </span>
                          ))
                        : <span style={{ color: 'var(--text-muted)' }}>Chưa chọn</span>
                      }
                    </div>
                  </td>
                  <td>{s.school || '---'}</td>
                  <td>{s.referrer || '---'}</td>
                  <td><span style={{ fontSize: '0.825rem', fontWeight: 500 }}>{schedule}</span></td>
                  <td><strong style={{ color: 'var(--primary)' }}>{formatCurrency(totalMonthlyFee)}</strong></td>
                  <td>
                    {s.status === 'official'
                      ? <span className="badge badge-official"><CheckCircle size={13} /> Chính thức</span>
                      : <span className="badge badge-trial"><Clock size={13} /> Học thử</span>
                    }
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="action-btn view" title="Xem hồ sơ" onClick={() => onViewStudent(s.id)}>
                        <Eye size={16} />
                      </button>
                      {currentUser?.role === 'admin' && (
                        <>
                          <button className="action-btn edit" title="Chỉnh sửa" onClick={() => onEditStudent(s.id)}>
                            <Pencil size={16} />
                          </button>
                          <button className="action-btn delete" title="Xóa" onClick={() => confirmDelete(s)}>
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {loading && Array.from({ length: 3 }).map((_, idx) => (
              <tr key={`skeleton-${idx}`}>
                <td><div className="skeleton-box" style={{ width: '20px', height: '20px', borderRadius: '4px' }}></div></td>
                <td>
                  <div className="skeleton-box" style={{ width: '120px', height: '20px', borderRadius: '4px', marginBottom: '4px' }}></div>
                  <div className="skeleton-box" style={{ width: '80px', height: '14px', borderRadius: '4px' }}></div>
                </td>
                <td><div className="skeleton-box" style={{ width: '100px', height: '20px', borderRadius: '4px' }}></div></td>
                <td><div className="skeleton-box" style={{ width: '80px', height: '20px', borderRadius: '4px' }}></div></td>
                <td><div className="skeleton-box" style={{ width: '150px', height: '20px', borderRadius: '4px' }}></div></td>
                <td><div className="skeleton-box" style={{ width: '100px', height: '20px', borderRadius: '4px' }}></div></td>
                <td><div className="skeleton-box" style={{ width: '100px', height: '20px', borderRadius: '4px' }}></div></td>
                <td><div className="skeleton-box" style={{ width: '80px', height: '20px', borderRadius: '4px' }}></div></td>
                <td><div className="skeleton-box" style={{ width: '100px', height: '20px', borderRadius: '4px' }}></div></td>
                <td><div className="skeleton-box" style={{ width: '60px', height: '20px', borderRadius: '4px' }}></div></td>
                <td><div className="skeleton-box" style={{ width: '80px', height: '20px', borderRadius: '4px' }}></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {hasMore && !loading && (
          <div style={{ textAlign: 'center', padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button className="btn btn-outline" onClick={loadMore}>
              <Loader2 size={16} style={{ marginRight: '6px' }} />
              Tải thêm học sinh...
            </button>
          </div>
        )}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <Users size={48} />
          <h4>Không tìm thấy học sinh nào</h4>
          <p>Thử tìm kiếm với từ khóa khác hoặc thêm học sinh mới.</p>
        </div>
      )}

      {/* Modal Xác nhận xóa */}
      {studentToDelete && (
        <div className="modal-overlay active">
          <div className="modal-container" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3>Xác nhận xóa</h3>
              <button className="modal-close" onClick={cancelDelete}>×</button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa học sinh <strong>{studentToDelete.fullName}</strong> ({studentToDelete.id})?</p>
              <p style={{ color: 'var(--danger)', marginTop: '0.75rem', fontSize: '0.85rem', padding: '0.5rem', background: 'var(--danger-light)', borderRadius: 'var(--radius-sm)' }}>
                <strong>Lưu ý:</strong> Mọi lịch sử đóng học phí liên quan đến học sinh này cũng sẽ bị xóa vĩnh viễn và không thể khôi phục!
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={cancelDelete}>Hủy bỏ</button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>Xác nhận xóa</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
