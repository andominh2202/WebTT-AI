import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CLASS_MAP } from '../../data/mockData';
import { X, Save, Plus, Check } from 'lucide-react';

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

export default function StudentModal({ isOpen, onClose, editStudentId }) {
  const { students, addStudent, updateStudent, showToast } = useApp();
  const isEditing = !!editStudentId;

  const [form, setForm] = useState({
    fullName: '', parentPhone: '', dob: '', school: '', referrer: '',
    monthlyFee: 1500000, status: 'official', notes: '',
  });
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  
  const [selGrade, setSelGrade] = useState('');
  const [selSubject, setSelSubject] = useState('');
  const [selTeacher, setSelTeacher] = useState('');

  const grades = useMemo(() => Object.keys(CLASS_MAP), []);

  const filteredSubjects = useMemo(() => {
    if (!selGrade || !CLASS_MAP[selGrade]) return [];
    return Object.keys(CLASS_MAP[selGrade]);
  }, [selGrade]);

  const filteredTeachers = useMemo(() => {
    if (!selGrade || !selSubject || !CLASS_MAP[selGrade]) return [];
    return CLASS_MAP[selGrade][selSubject] || [];
  }, [selGrade, selSubject]);

  useEffect(() => {
    if (filteredTeachers.length === 1) {
      setSelTeacher(filteredTeachers[0]);
    } else {
      setSelTeacher('');
    }
  }, [filteredTeachers]);

  useEffect(() => {
    setSelSubject('');
  }, [selGrade]);

  useEffect(() => {
    if (editStudentId && isOpen) {
      const s = students.find(x => x.id === editStudentId);
      if (s) {
        setForm({
          fullName: s.fullName || '', parentPhone: s.parentPhone || '',
          dob: s.dob || '', school: s.school || '', referrer: s.referrer || '',
          monthlyFee: s.monthlyFee || 0, status: s.status || 'official', notes: s.notes || '',
        });
        setSelectedSubjects([...(s.subjects || [])]);
        setSelectedDays([...(s.scheduleDays || [])]);
      }
    } else if (isOpen) {
      setForm({ fullName: '', parentPhone: '', dob: '', school: '', referrer: '', monthlyFee: 1500000, status: 'official', notes: '' });
      setSelectedSubjects([]);
      setSelectedDays([]);
    }
    setSelGrade('');
    setSelSubject('');
    setSelTeacher('');
  }, [isOpen, editStudentId]);

  if (!isOpen) return null;

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleAddToList = () => {
    if (!selSubject || !selTeacher) {
      showToast('Cảnh báo', 'Vui lòng chọn môn và giáo viên', 'warning');
      return;
    }
    if (selectedSubjects.some(s => s.subject === selSubject)) {
      showToast('Cảnh báo', 'Môn học này đã được thêm', 'warning');
      return;
    }
    setSelectedSubjects(prev => [...prev, { subject: selSubject, teacher: selTeacher }]);
    setSelSubject('');
    setSelTeacher('');
  };

  const removeSubject = (subName) => {
    setSelectedSubjects(prev => prev.filter(s => s.subject !== subName));
  };

  const toggleDay = (day) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) { showToast('Cảnh báo', 'Vui lòng nhập họ tên', 'warning'); return; }
    if (selectedSubjects.length === 0) { showToast('Cảnh báo', 'Vui lòng chọn ít nhất 1 môn', 'warning'); return; }

    const feePerLesson = form.monthlyFee / ((selectedDays.length || 1) * 4);

    const studentData = {
      ...form,
      monthlyFee: parseFloat(form.monthlyFee) || 0,
      subjects: selectedSubjects,
      scheduleDays: selectedDays,
      feePerLesson: Math.round(feePerLesson)
    };

    if (isEditing) {
      updateStudent({ ...studentData, id: editStudentId });
      showToast('Thành công', 'Đã cập nhật thông tin học sinh', 'success');
    } else {
      addStudent(studentData);
      showToast('Thành công', `Đã thêm ${form.fullName}`, 'success');
    }
    onClose();
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <div className="modal-header">
          <h3>{isEditing ? 'Chỉnh sửa thông tin học sinh' : 'Thêm học sinh mới'}</h3>
          <button className="modal-close" onClick={onClose}><X size={22} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Họ và tên <span className="required">*</span></label>
                <input type="text" className="form-control" value={form.fullName} onChange={e => handleChange('fullName', e.target.value)} placeholder="VD: Nguyễn Văn An" required />
              </div>
              <div className="form-group">
                <label>SĐT phụ huynh <span className="required">*</span></label>
                <input type="tel" className="form-control" value={form.parentPhone} onChange={e => handleChange('parentPhone', e.target.value)} placeholder="0912345678" required />
              </div>
              <div className="form-group">
                <label>Ngày sinh</label>
                <input type="date" className="form-control" value={form.dob} onChange={e => handleChange('dob', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Trường đang học</label>
                <input type="text" className="form-control" value={form.school} onChange={e => handleChange('school', e.target.value)} placeholder="VD: THCS Giảng Võ" />
              </div>
              <div className="form-group">
                <label>Người giới thiệu</label>
                <input type="text" className="form-control" value={form.referrer} onChange={e => handleChange('referrer', e.target.value)} placeholder="VD: Cô Lan, Bạn Quân..." />
              </div>
              <div className="form-group">
                <label>Học phí/tháng (VNĐ) <span className="required">*</span></label>
                <input type="number" className="form-control" value={form.monthlyFee} onChange={e => handleChange('monthlyFee', e.target.value)} step="50000" min="0" required />
              </div>
              <div className="form-group">
                <label>Trạng thái <span className="required">*</span></label>
                <select className="form-control" value={form.status} onChange={e => handleChange('status', e.target.value)}>
                  <option value="official">Chính thức</option>
                  <option value="trial">Học thử</option>
                </select>
              </div>

              {/* Subject Selector */}
              <div className="form-group full-width">
                <label>Môn học <span className="required">*</span></label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <select className="form-control" value={selGrade} onChange={e => setSelGrade(e.target.value)}>
                    <option value="">-- Chọn Khối --</option>
                    {grades.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  
                  <select className="form-control" value={selSubject} onChange={e => setSelSubject(e.target.value)} disabled={!selGrade}>
                    <option value="">-- Chọn Môn --</option>
                    {filteredSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

                  <select value={selTeacher} onChange={e => setSelTeacher(e.target.value)} className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2 border border-gray-300 dark:border-gray-600 rounded-md">
                    <option value="">-- Chọn giáo viên --</option>
                    {filteredTeachers.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>

                  <button type="button" className="btn btn-primary" onClick={handleAddToList} style={{ whiteSpace: 'nowrap' }}>
                    <Plus size={16} /> Thêm
                  </button>
                </div>

                <div className="selected-subjects-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedSubjects.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div>
                        <strong style={{ color: 'var(--primary)' }}>{item.subject}</strong>
                        <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>-</span>
                        <span>{item.teacher}</span>
                      </div>
                      <button type="button" onClick={() => removeSubject(item.subject)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  {selectedSubjects.length === 0 && (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
                      Chưa có môn học nào được chọn
                    </div>
                  )}
                </div>
              </div>

              {/* Day Picker */}
              <div className="form-group full-width">
                <label>Ngày học trong tuần</label>
                <div className="day-picker">
                  {DAYS.map(day => (
                    <button key={day} type="button" className={`day-btn ${selectedDays.includes(day) ? 'selected' : ''}`} onClick={() => toggleDay(day)}>
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group full-width">
                <label>Ghi chú</label>
                <textarea className="form-control" value={form.notes} onChange={e => handleChange('notes', e.target.value)} placeholder="Mục tiêu, năng lực, lưu ý..." />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary"><Save size={18} /> Lưu học sinh</button>
          </div>
        </form>
      </div>
    </div>
  );
}
