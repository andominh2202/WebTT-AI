import { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useUI } from '../../context/UIContext';
import { CLASS_MAP } from '../../data/mockData';
import { Save, Receipt, Search, Loader2 } from 'lucide-react';

export default function TeacherFeesPage() {
  const { teacherFees, saveTeacherFees } = useSettings();
  const { showToast } = useUI();
  
  const [fees, setFees] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Add new teacher/subject form state
  const [newTeacher, setNewTeacher] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newFeeLesson, setNewFeeLesson] = useState(0);

  useEffect(() => {
    if (teacherFees && Object.keys(teacherFees).length > 0) {
      setFees(teacherFees);
    } else {
      // Initialize from CLASS_MAP if empty
      const initialMap = {};
      Object.entries(CLASS_MAP).forEach(([_grade, subjectsObj]) => {
        Object.entries(subjectsObj).forEach(([subject, teachersList]) => {
          teachersList.forEach(teacher => {
            if (!initialMap[teacher]) initialMap[teacher] = {};
            if (!initialMap[teacher][subject]) {
              initialMap[teacher][subject] = { feePerLesson: 0, feePerMonth: 0 };
            }
          });
        });
      });
      setFees(initialMap);
    }
  }, [teacherFees]);

  const handleFeeLessonChange = (teacher, subject, val) => {
    const feeLesson = parseFloat(val) || 0;
    const feeMonth = feeLesson * 8; // Auto-calculate estimate (2 lessons/week * 4 weeks)
    
    setFees(prev => ({
      ...prev,
      [teacher]: {
        ...(prev[teacher] || {}),
        [subject]: {
          feePerLesson: feeLesson,
          feePerMonth: feeMonth
        }
      }
    }));
  };

  const handleFeeMonthChange = (teacher, subject, val) => {
    const feeMonth = parseFloat(val) || 0;
    const feeLesson = feeMonth / 8; // Auto-calculate estimate
    
    setFees(prev => ({
      ...prev,
      [teacher]: {
        ...(prev[teacher] || {}),
        [subject]: {
          feePerLesson: feeLesson,
          feePerMonth: feeMonth
        }
      }
    }));
  };

  const handleRemoveTeacher = (teacher) => {
    if (!window.confirm(`Bạn có chắc muốn xóa giáo viên ${teacher}?`)) return;
    setFees(prev => {
      const clone = { ...prev };
      delete clone[teacher];
      return clone;
    });
  };

  const handleRemoveSubject = (teacher, subject) => {
    if (!window.confirm(`Bạn có chắc muốn xóa môn ${subject} của ${teacher}?`)) return;
    setFees(prev => {
      const clone = { ...prev };
      if (clone[teacher]) {
        delete clone[teacher][subject];
        if (Object.keys(clone[teacher]).length === 0) {
          delete clone[teacher];
        }
      }
      return clone;
    });
  };

  const handleAddNew = () => {
    if (!newTeacher.trim() || !newSubject.trim()) {
      showToast('Cảnh báo', 'Vui lòng nhập tên giáo viên và môn học', 'warning');
      return;
    }
    
    const feeLesson = parseFloat(newFeeLesson) || 0;
    setFees(prev => ({
      ...prev,
      [newTeacher.trim()]: {
        ...(prev[newTeacher.trim()] || {}),
        [newSubject.trim()]: {
          feePerLesson: feeLesson,
          feePerMonth: feeLesson * 8
        }
      }
    }));
    
    setNewSubject('');
    setNewFeeLesson(0);
    showToast('Thành công', 'Đã thêm môn học mới', 'success');
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await saveTeacherFees(fees);
    } catch {
      // Thông báo lỗi đã được xử lý bởi SettingsContext
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTeachers = Object.entries(fees)
    .filter(([teacher]) => teacher.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort(([t1], [t2]) => t1.localeCompare(t2));

  return (
    <section>
      <div className="card" style={{ maxWidth: 1000, margin: '0 auto 1.5rem' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="card-title"><Receipt size={18} /> Bảng Giá Học Phí Theo Giáo Viên & Môn Học</div>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
            {isSaving ? ' Đang lưu...' : ' Lưu bảng giá'}
          </button>
        </div>
        
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Thiết lập mức học phí chi tiết cho từng giáo viên dựa trên các môn mà thầy/cô đang phụ trách. 
          Khi xếp lớp cho học sinh, phần mềm sẽ tự động lấy mức giá này (không cho phép sửa tay).
        </p>
        
        <div style={{ marginBottom: '2rem', padding: '1.25rem', background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
          <strong style={{ display: 'block', marginBottom: '1rem', color: 'var(--text-primary)' }}>Thêm Giáo viên / Môn học mới</strong>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <input type="text" className="form-control" placeholder="Tên Giáo viên (VD: Thầy Tài)" value={newTeacher} onChange={e => setNewTeacher(e.target.value)} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <input type="text" className="form-control" placeholder="Tên Môn học (VD: Toán 12)" value={newSubject} onChange={e => setNewSubject(e.target.value)} />
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <input type="number" className="form-control" placeholder="Học phí/buổi" value={newFeeLesson || ''} onChange={e => setNewFeeLesson(e.target.value)} step="5000" />
            </div>
            <button className="btn btn-success" onClick={handleAddNew}>
              Thêm
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Tìm kiếm giáo viên..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem', maxWidth: 400 }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredTeachers.map(([teacher, subjectsObj]) => {
            const sortedSubjects = Object.keys(subjectsObj).sort((a, b) => {
              const gradeA = parseInt(a.match(/\d+/) || 0);
              const gradeB = parseInt(b.match(/\d+/) || 0);
              if (gradeA !== gradeB) return gradeB - gradeA; // Descending 12 -> 11 -> 10
              return a.localeCompare(b);
            });
            
            return (
            <div key={teacher} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <div style={{ padding: '0.75rem 1.25rem', background: 'var(--bg-hover)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: 'var(--primary)', fontSize: '1.05rem' }}>{teacher}</strong>
                <button className="btn btn-outline btn-sm" style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)', fontSize: '0.8rem' }} onClick={() => handleRemoveTeacher(teacher)}>
                  Xóa giáo viên
                </button>
              </div>
              <div style={{ padding: '1rem' }}>
                <div className="table-responsive">
                  <table className="custom-table nowrap-table">
                    <thead>
                      <tr>
                        <th style={{ width: '35%' }}>Môn học</th>
                        <th style={{ width: '30%' }}>Học phí/buổi (VNĐ)</th>
                        <th style={{ width: '30%' }}>Học phí/tháng (VNĐ)</th>
                        <th style={{ width: '5%', textAlign: 'center' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedSubjects.map(subject => {
                        const feeObj = subjectsObj[subject];
                        return (
                          <tr key={subject}>
                            <td>
                              <strong>{subject}</strong>
                            </td>
                            <td>
                              <input 
                                type="number" 
                                className="form-control" 
                                value={feeObj.feePerLesson || ''} 
                                onChange={(e) => handleFeeLessonChange(teacher, subject, e.target.value)} 
                                step="5000"
                                placeholder="0"
                                style={{ padding: '0.35rem 0.5rem' }}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                className="form-control" 
                                value={feeObj.feePerMonth || ''} 
                                onChange={(e) => handleFeeMonthChange(teacher, subject, e.target.value)} 
                                step="50000"
                                placeholder="0"
                                style={{ padding: '0.35rem 0.5rem' }}
                              />
                            </td>
                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                              <button type="button" onClick={() => handleRemoveSubject(teacher, subject)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }} title="Xóa môn này">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )})}

          {filteredTeachers.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Không tìm thấy giáo viên nào
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
