import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, calculateAge } from '../../utils/storage';
import { Search, Plus, Eye, Pencil, Trash2, Phone, CheckCircle, Clock, Users } from 'lucide-react';

export default function StudentList({ onAddStudent, onEditStudent, onViewStudent }) {
  const { students, subjects, deleteStudent, showToast } = useApp();
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

  const confirmDelete = (student) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa học sinh "${student.fullName}" (${student.id})?\nMọi lịch sử học phí liên quan cũng sẽ bị xóa!`)) {
      deleteStudent(student.id);
      showToast('Đã xóa', `Đã xóa học sinh ${student.fullName}`, 'danger');
    }
  };

  const uniqueSubjects = useMemo(() => {
    const used = new Set();
    students.forEach(s => (s.subjects || []).forEach(sub => used.add(sub.subject)));
    return subjects.filter(sub => used.has(sub));
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
          <button className="btn btn-primary" onClick={onAddStudent}>
            <Plus size={18} /> Thêm học sinh
          </button>
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
              const schedule = (s.scheduleDays || []).join(', ') || '---';

              return (
                <tr key={s.id}>
                  <td><strong>{idx + 1}</strong></td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => onViewStudent(s.id)}>
                      {s.fullName}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.id}</span>
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
                        ? s.subjects.map((sub, i) => <span key={i} className="tag-subject" title={`Giáo viên: ${sub.teacher}`}>{sub.subject}</span>)
                        : <span style={{ color: 'var(--text-muted)' }}>Chưa chọn</span>
                      }
                    </div>
                  </td>
                  <td>{s.school || '---'}</td>
                  <td>{s.referrer || '---'}</td>
                  <td><span style={{ fontSize: '0.825rem', fontWeight: 500 }}>{schedule}</span></td>
                  <td>{formatCurrency(s.monthlyFee || 0)}</td>
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
                      <button className="action-btn edit" title="Chỉnh sửa" onClick={() => onEditStudent(s.id)}>
                        <Pencil size={16} />
                      </button>
                      <button className="action-btn delete" title="Xóa" onClick={() => confirmDelete(s)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <Users size={48} />
          <h4>Không tìm thấy học sinh nào</h4>
          <p>Thử tìm kiếm với từ khóa khác hoặc thêm học sinh mới.</p>
        </div>
      )}
    </section>
  );
}
