import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Save, Plus, X, Coins, Loader2 } from 'lucide-react';

export default function TuitionSettings() {
  const { teacherFees, saveTeacherFees, teachers, showToast } = useApp();
  
  // Local state to manage edits before saving
  const [fees, setFees] = useState({});
  const [newTeacher, setNewTeacher] = useState('');
  const [newFee, setNewFee] = useState(150000);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFees(teacherFees || {});
  }, [teacherFees]);

  const handleFeeChange = (teacher, value) => {
    setFees(prev => ({
      ...prev,
      [teacher]: parseInt(value) || 0
    }));
  };

  const handleRemove = (teacher) => {
    const updated = { ...fees };
    delete updated[teacher];
    setFees(updated);
  };

  const handleAdd = () => {
    if (!newTeacher.trim()) {
      showToast('Cảnh báo', 'Vui lòng nhập tên giáo viên', 'warning');
      return;
    }
    if (fees[newTeacher.trim()]) {
      showToast('Cảnh báo', 'Giáo viên này đã có trong bảng giá', 'warning');
      return;
    }
    
    setFees(prev => ({
      ...prev,
      [newTeacher.trim()]: parseInt(newFee) || 0
    }));
    setNewTeacher('');
    setNewFee(150000);
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await saveTeacherFees(fees);
    } catch {
      // Handled by context
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 800, margin: '0 auto 1.5rem' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="card-title"><Coins size={18} /> Cài đặt Học phí theo Giáo viên</div>
        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
          {isSaving ? ' Đang lưu...' : ' Lưu bảng giá'}
        </button>
      </div>
      
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Thiết lập mức học phí/buổi mặc định cho từng giáo viên. Khi thêm học sinh vào lớp của giáo viên tương ứng, phần mềm sẽ tự động lấy mức giá này (không cho phép sửa tay).
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {Object.entries(fees).map(([teacher, fee]) => (
          <div key={teacher} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ flex: 1 }}>
              <strong style={{ color: 'var(--primary)' }}>{teacher}</strong>
            </div>
            <div style={{ width: 180, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="number" 
                className="form-control" 
                value={fee} 
                onChange={(e) => handleFeeChange(teacher, e.target.value)} 
                step="5000" 
                style={{ padding: '0.4rem 0.5rem', fontSize: '0.9rem' }}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>VNĐ</span>
            </div>
            <button className="btn btn-outline btn-sm" style={{ padding: '0.4rem', color: 'var(--danger)' }} onClick={() => handleRemove(teacher)} title="Xóa">
              <X size={16} />
            </button>
          </div>
        ))}

        {Object.keys(fees).length === 0 && (
          <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
            Chưa có giáo viên nào trong bảng giá
          </div>
        )}
      </div>

      <div style={{ padding: '1rem', background: 'var(--bg-card)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
        <strong style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Thêm giáo viên vào bảng giá</strong>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Tên giáo viên (VD: Cô Lan, Anh Quân...)" 
              value={newTeacher}
              onChange={(e) => setNewTeacher(e.target.value)}
              list="teacher-list"
            />
            <datalist id="teacher-list">
              {teachers.map(t => <option key={t.id || t} value={t.name || t} />)}
            </datalist>
          </div>
          <div style={{ width: 180, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="number" 
              className="form-control" 
              value={newFee}
              onChange={(e) => setNewFee(e.target.value)}
              step="5000"
            />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>VNĐ</span>
          </div>
          <button className="btn btn-outline" onClick={handleAdd}>
            <Plus size={16} /> Thêm
          </button>
        </div>
      </div>
    </div>
  );
}
