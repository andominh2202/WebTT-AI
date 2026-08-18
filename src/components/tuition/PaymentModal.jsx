import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateTuitionForMonth } from '../../utils/tuitionCalculator';
import { X, Check } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, studentId, currentMonth }) {
  const { students, tuition, saveTuition, showToast } = useApp();

  const data = useMemo(() => {
    if (!studentId || !currentMonth) return null;
    const student = students.find(s => s.id === studentId);
    const existing = tuition.find(t => t.studentId === studentId && t.month === currentMonth);
    return { student, existing };
  }, [studentId, currentMonth, students, tuition]);

  const [feeAmount, setFeeAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Chuyển khoản');
  const [notes, setNotes] = useState('');
  const [studentName, setStudentName] = useState('');

  useEffect(() => {
    if (!isOpen || !data?.student) return;
    const { student, existing } = data;
    setStudentName(student.fullName);

    if (existing) {
      setFeeAmount(existing.feeAmount);
      setPaidAmount(existing.paidAmount);
      setPaymentDate(existing.paymentDate || new Date().toISOString().split('T')[0]);
      setPaymentMethod(existing.paymentMethod || 'Chuyển khoản');
      setNotes(existing.notes || '');
    } else {
      const calcResult = calculateTuitionForMonth(student, currentMonth);
      setFeeAmount(calcResult.feeAmount);
      setPaidAmount(calcResult.feeAmount);
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('Chuyển khoản');
      setNotes(calcResult.notes || '');
    }
  }, [isOpen, data, currentMonth]);

  if (!isOpen) return null;

  const [year, month] = currentMonth.split('-');

  const handleSubmit = (e) => {
    e.preventDefault();
    const fee = parseFloat(feeAmount) || 0;
    const paid = parseFloat(paidAmount) || 0;

    let status = 'unpaid';
    if (paid >= fee && fee > 0) status = 'paid';
    else if (paid > 0) status = 'partial';

    saveTuition({
      studentId,
      month: currentMonth,
      feeAmount: fee,
      paidAmount: paid,
      status,
      paymentDate: paid > 0 ? paymentDate : '',
      paymentMethod: paid > 0 ? paymentMethod : '',
      notes,
    });

    showToast('Thành công', 'Đã ghi nhận thông tin đóng học phí!', 'success');
    onClose();
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <div className="modal-header">
          <h3>Ghi nhận nộp học phí</h3>
          <button className="modal-close" onClick={onClose}><X size={22} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ background: 'var(--bg-hover)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Học sinh:</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{studentName}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>Tháng {month}/{year}</div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Học phí quy định (VNĐ)</label>
                <input type="number" className="form-control" value={feeAmount} readOnly style={{ opacity: 0.8 }} />
              </div>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>Số tiền thực đóng (VNĐ) <span className="required">*</span></label>
                  <button type="button" className="btn btn-outline btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                    onClick={() => setPaidAmount(feeAmount)}>Đóng đủ</button>
                </div>
                <input type="number" className="form-control" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} step="50000" min="0" required />
              </div>
              <div className="form-group">
                <label>Ngày nộp</label>
                <input type="date" className="form-control" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Hình thức</label>
                <select className="form-control" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="Chuyển khoản">Chuyển khoản (Ngân hàng / Ví điện tử)</option>
                  <option value="Tiền mặt">Tiền mặt</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label>Ghi chú</label>
                <input type="text" className="form-control" value={notes} onChange={e => setNotes(e.target.value)} placeholder="VD: Mẹ CK qua VCB..." />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-success"><Check size={18} /> Xác nhận nộp tiền</button>
          </div>
        </form>
      </div>
    </div>
  );
}
