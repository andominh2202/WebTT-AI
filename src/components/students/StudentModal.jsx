import { useState, useEffect, useMemo } from 'react';
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import { useStudent } from "../../context/StudentContext";
import { useTuition } from "../../context/TuitionContext";
import { CLASS_MAP } from '../../data/mockData';
import { X, Save, Plus, Check } from 'lucide-react';

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

export default function StudentModal({ isOpen, onClose, editStudentId }) {
  const { students, addStudent, updateStudent } = useStudent();
  const { teacherFees } = useSettings();
  const { showToast } = useUI();
  const isEditing = !!editStudentId;

  const [form, setForm] = useState({
    fullName: '', parentPhone: '', dob: '', school: '', referrer: '',
    status: 'official', notes: '',
  });
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  
  const [selGrade, setSelGrade] = useState('');
  const [selSubject, setSelSubject] = useState('');
  const [selTeacher, setSelTeacher] = useState('');
  const [selFeePerLesson, setSelFeePerLesson] = useState(0);
  const [selMonthlyFee, setSelMonthlyFee] = useState(0);
  const [selScheduleDays, setSelScheduleDays] = useState([]);

  const grades = useMemo(() => Object.keys(CLASS_MAP).sort((a, b) => {
    const getGradeNum = (str) => {
      const match = str.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    };
    return getGradeNum(b) - getGradeNum(a);
  }), []);

  const filteredSubjects = useMemo(() => {
    if (!selGrade) return selSubject ? [selSubject] : [];
    const subjects = Object.keys(CLASS_MAP[selGrade] || {});
    if (selSubject && !subjects.includes(selSubject)) {
      return [...subjects, selSubject];
    }
    return subjects;
  }, [selGrade, selSubject]);

  const filteredTeachers = useMemo(() => {
    if (!selGrade || !selSubject || !CLASS_MAP[selGrade]) return selTeacher ? [selTeacher] : [];
    const teachers = CLASS_MAP[selGrade][selSubject] || [];
    if (selTeacher && !teachers.includes(selTeacher)) {
      return [...teachers, selTeacher];
    }
    return teachers;
  }, [selGrade, selSubject, selTeacher]);

  useEffect(() => {
    if (filteredTeachers.length === 1) {
      setSelTeacher(filteredTeachers[0]);
    } else {
      setSelTeacher('');
    }
  }, [filteredTeachers]);

  const handleGradeChange = (val) => {
    setSelGrade(val);
    setSelSubject('');
    setSelTeacher('');
  };

  useEffect(() => {
    if (selTeacher && selSubject && teacherFees && teacherFees[selTeacher]) {
      // Data structure is: { "Cô Mai": { "Toán 9A1": { feePerLesson: 150000, feePerMonth: 1200000 } } }
      const feeObj = teacherFees[selTeacher][selSubject] || teacherFees[selTeacher];
      const fee = typeof feeObj === 'object' ? (feeObj.feePerLesson || 0) : (feeObj || 0);
      setSelFeePerLesson(fee);
      setSelMonthlyFee(fee * ((selScheduleDays.length || 1) * 4));
    } else {
      setSelFeePerLesson(0);
      setSelMonthlyFee(0);
    }
  }, [selTeacher, selSubject, teacherFees, selScheduleDays.length]);

  useEffect(() => {
    if (editStudentId && isOpen) {
      const s = students.find(x => x.id === editStudentId);
      if (s) {
        setForm({
          fullName: s.fullName || '', parentPhone: s.parentPhone || '',
          dob: s.dob || '', school: s.school || '', referrer: s.referrer || '',
          status: s.status || 'official', notes: s.notes || '',
        });
        setSelectedSubjects([...(s.subjects || [])]);
      }
    } else if (isOpen) {
      setForm({ fullName: '', parentPhone: '', dob: '', school: '', referrer: '', status: 'official', notes: '' });
      setSelectedSubjects([]);
    }
    setSelGrade('');
    setSelSubject('');
    setSelTeacher('');
  }, [isOpen, editStudentId]);

  if (!isOpen) return null;

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSelMonthlyFeeChange = (val) => {
    const mFee = parseFloat(val) || 0;
    const pFee = mFee / ((selScheduleDays.length || 1) * 4);
    setSelMonthlyFee(mFee);
    setSelFeePerLesson(Math.round(pFee));
  };

  const handleSelFeePerLessonChange = (val) => {
    const pFee = parseFloat(val) || 0;
    const mFee = pFee * ((selScheduleDays.length || 1) * 4);
    setSelFeePerLesson(pFee);
    setSelMonthlyFee(mFee);
  };

  const handleAddToList = () => {
    if (!selSubject || !selTeacher) {
      showToast('Cảnh báo', 'Vui lòng chọn môn và giáo viên', 'warning');
      return;
    }
    if (selectedSubjects.some(s => s.subject === selSubject)) {
      showToast('Cảnh báo', 'Môn học này đã được thêm', 'warning');
      return;
    }
    setSelectedSubjects(prev => [...prev, { 
      subject: selSubject, 
      teacher: selTeacher,
      feePerLesson: selFeePerLesson,
      scheduleDays: selScheduleDays
    }]);
    setSelSubject('');
    setSelTeacher('');
    setSelFeePerLesson(0);
    setSelMonthlyFee(0);
    setSelScheduleDays([]);
  };

  const removeSubject = (subName) => {
    setSelectedSubjects(prev => prev.filter(s => s.subject !== subName));
  };

  const editSubject = (subjectObj) => {
    // Determine the grade based on the subject
    let foundGrade = '';
    for (const g of grades) {
      if (CLASS_MAP[g] && CLASS_MAP[g][subjectObj.subject]) {
        foundGrade = g;
        break;
      }
    }

    if (!foundGrade) {
      const match = subjectObj.subject.match(/\d+/);
      if (match && grades.includes(`Khối ${match[0]}`)) {
        foundGrade = `Khối ${match[0]}`;
      }
    }
    
    // Remove it from the list
    removeSubject(subjectObj.subject);
    
    // Populate the form
    setSelGrade(foundGrade);
    setSelSubject(subjectObj.subject);
    setSelTeacher(subjectObj.teacher);
    setSelFeePerLesson(subjectObj.feePerLesson || 0);
    setSelMonthlyFee((subjectObj.feePerLesson || 0) * ((subjectObj.scheduleDays?.length || 1) * 4));
    setSelScheduleDays(subjectObj.scheduleDays || []);
  };

  const toggleSelDay = (day) => {
    setSelScheduleDays(prev => {
      const newDays = prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day];
      if (selFeePerLesson > 0) {
        setSelMonthlyFee(selFeePerLesson * ((newDays.length || 1) * 4));
      } else if (selMonthlyFee > 0) {
        setSelFeePerLesson(Math.round(selMonthlyFee / ((newDays.length || 1) * 4)));
      }
      return newDays;
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) { showToast('Cảnh báo', 'Vui lòng nhập họ tên', 'warning'); return; }
    if (selectedSubjects.length === 0) { showToast('Cảnh báo', 'Vui lòng chọn ít nhất 1 môn', 'warning'); return; }

    for (const sub of selectedSubjects) {
      if (typeof sub.feePerLesson !== 'number' || sub.feePerLesson < 0 || isNaN(sub.feePerLesson)) {
        showToast('Lỗi', 'Học phí không hợp lệ', 'danger');
        return;
      }
    }

    const studentData = {
      ...form,
      subjects: selectedSubjects,
    };

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateStudent({ ...studentData, id: editStudentId });
        showToast('Thành công', 'Đã cập nhật thông tin học sinh', 'success');
      } else {
        await addStudent(studentData);
        showToast('Thành công', `Đã thêm ${form.fullName}`, 'success');
      }
      onClose();
    } catch (error) {
      console.error(error);
      showToast('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại', 'danger');
    } finally {
      setIsSubmitting(false);
    }
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
              <div className="form-group full-width">
                <label>Người giới thiệu</label>
                <input type="text" className="form-control" value={form.referrer} onChange={e => handleChange('referrer', e.target.value)} placeholder="VD: Cô Lan, Bạn Quân..." />
              </div>
              <div className="form-group">
                <label>Tổng Học phí/tháng (VNĐ)</label>
                <input type="text" className="form-control" value={selectedSubjects.reduce((sum, s) => sum + (s.feePerLesson * ((s.scheduleDays?.length || 1) * 4)), 0).toLocaleString('vi-VN')} disabled />
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
                <label>Môn học & Lịch học <span className="required">*</span></label>
                <div style={{ background: 'var(--bg-hover)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Khối</label>
                      <select className="form-control" value={selGrade} onChange={e => handleGradeChange(e.target.value)}>
                        <option value="">-- Chọn Khối --</option>
                        {grades.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Môn học</label>
                      <select className="form-control" value={selSubject} onChange={e => setSelSubject(e.target.value)} disabled={!selGrade}>
                        <option value="">-- Chọn Môn --</option>
                        {filteredSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Giáo viên</label>
                      <select value={selTeacher} onChange={e => setSelTeacher(e.target.value)} className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2 border border-gray-300 dark:border-gray-600 rounded-md">
                        <option value="">-- Chọn giáo viên --</option>
                        {filteredTeachers.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Học phí/tháng (VNĐ)</label>
                      <input type="number" className="form-control" value={selMonthlyFee} readOnly style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Học phí/buổi (VNĐ) <small style={{ color: 'var(--primary)', fontWeight: 'normal' }}>(Theo mức giá chung)</small></label>
                      <input type="number" className="form-control" value={selFeePerLesson} readOnly style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ngày học trong tuần</label>
                    <div className="day-picker">
                      {DAYS.map(day => (
                        <button key={day} type="button" className={`day-btn ${selScheduleDays.includes(day) ? 'selected' : ''}`} onClick={() => toggleSelDay(day)}>
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button type="button" className="btn btn-primary w-full" onClick={handleAddToList}>
                    <Plus size={16} /> Thêm Môn Này
                  </button>
                </div>

                <div className="selected-subjects-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedSubjects.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div>
                        <div>
                          <strong style={{ color: 'var(--primary)' }}>{item.subject}</strong>
                          <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>-</span>
                          <span>{item.teacher}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          <span style={{ color: 'var(--success)' }}>{Number(item.feePerLesson || 0).toLocaleString('vi-VN')}đ/buổi</span>
                          <span style={{ margin: '0 0.5rem' }}>|</span>
                          <span>Lịch: {(item.scheduleDays || []).join(', ') || 'Chưa xếp'}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <button type="button" onClick={() => editSubject(item)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.25rem' }} title="Sửa môn học">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        </button>
                        <button type="button" onClick={() => removeSubject(item.subject)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.25rem' }} title="Xóa môn học">
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {selectedSubjects.length === 0 && (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
                      Chưa có môn học nào được chọn
                    </div>
                  )}
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
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : <><Save size={18} /> Lưu học sinh</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
