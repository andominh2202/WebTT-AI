import { useMemo } from 'react';
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import { useStudent } from "../../context/StudentContext";
import { useTuition } from "../../context/TuitionContext";
import { formatCurrency, formatDate } from '../../utils/storage';
import { X, Printer } from 'lucide-react';

export default function ReceiptModal({ isOpen, onClose, studentId, currentMonth }) {
  const { students } = useStudent();
  const { tuition } = useTuition();

  const data = useMemo(() => {
    if (!studentId || !currentMonth) return null;
    const student = students.find(s => s.id === studentId);
    const record = tuition.find(t => t.studentId === studentId && t.month === currentMonth);
    if (!student || !record) return null;
    const [year, month] = currentMonth.split('-');
    return {
      code: `PT-${year}${month}-${student.id}`,
      dateNow: formatDate(record.paymentDate || new Date().toISOString().split('T')[0]),
      studentName: student.fullName,
      studentId: student.id,
      parentPhone: student.parentPhone || '---',
      school: student.school || '---',
      subjects: (student.subjects || []).map(s => s.subject).join(', ') || '---',
      month: `Tháng ${month}/${year}`,
      method: record.paymentMethod || 'Chuyển khoản',
      amount: formatCurrency(record.paidAmount),
      notes: record.notes || 'Không có ghi chú',
    };
  }, [studentId, currentMonth]);

  if (!isOpen || !data) return null;

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-container" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h3>Phiếu thu học phí</h3>
          <button className="modal-close" onClick={onClose}><X size={22} /></button>
        </div>
        <div className="modal-body">
          <div className="receipt-box" id="printable-receipt">
            <div className="receipt-header">
              <h2>PHIẾU THU HỌC PHÍ</h2>
              <p>Mã phiếu: <strong>{data.code}</strong> | Ngày lập: {data.dateNow}</p>
            </div>
            <div className="receipt-details">
              <div className="item"><span>Họ và tên:</span> <strong>{data.studentName}</strong></div>
              <div className="item"><span>SĐT Phụ huynh:</span> <strong>{data.parentPhone}</strong></div>
              <div className="item"><span>Trường học:</span> <strong>{data.school}</strong></div>
              <div className="item" style={{ gridColumn: '1 / -1' }}><span>Môn học:</span> <strong>{data.subjects}</strong></div>
              <div className="item"><span>Thu học phí kỳ:</span> <strong>{data.month}</strong></div>
              <div className="item"><span>Hình thức:</span> <strong>{data.method}</strong></div>
              <div className="item" style={{ gridColumn: '1 / -1' }}><span>Ghi chú:</span> <strong>{data.notes}</strong></div>
            </div>
            <div className="receipt-total">
              <span>TỔNG TIỀN ĐÃ THU:</span>
              <span style={{ fontSize: '1.3rem' }}>{data.amount}</span>
            </div>
            <div className="receipt-footer">
              <div className="receipt-sign"><strong>Người nộp tiền</strong><span>(Ký, ghi rõ họ tên)</span></div>
              <div className="receipt-sign"><strong>Người thu tiền</strong><span>(Ký, ghi rõ họ tên)</span></div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>Đóng</button>
          <button type="button" className="btn btn-primary" onClick={() => window.print()}>
            <Printer size={18} /> In phiếu thu
          </button>
        </div>
      </div>
    </div>
  );
}
