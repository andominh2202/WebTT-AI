import { useState, useMemo, useCallback } from 'react';
import { useStudent } from '../../context/StudentContext';
import { useTuition } from '../../context/TuitionContext';
import { useUI } from '../../context/UIContext';
import { formatCurrency, formatDate } from '../../utils/storage';
import PaymentModal from './PaymentModal';
import ReceiptModal from './ReceiptModal';
import { Search, Download, Calculator, CheckCircle2, AlertCircle, PieChart, CreditCard, Printer, CheckCircle, XCircle } from 'lucide-react';

function getMonthOptions() {
  const date = new Date();
  const months = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push({ value: val, label: `Tháng ${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}` });
  }
  return months;
}

export default function TuitionPage() {
  const { students } = useStudent();
  const { tuition, syncMonth } = useTuition();
  const { showToast } = useUI();

  const today = new Date();
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const [currentMonth, setCurrentMonth] = useState(defaultMonth);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStudentId, setPaymentStudentId] = useState(null);
  const [receiptStudentId, setReceiptStudentId] = useState(null);

  const monthOptions = useMemo(() => getMonthOptions(), []);

  // Sync tuition records when month changes
  useMemo(() => {
    syncMonth(currentMonth);
  }, [currentMonth, students.length, syncMonth]);

  const records = useMemo(() => tuition.filter(t => t.month === currentMonth), [currentMonth, tuition]);

  const joinedItems = useMemo(() => {
    return records.map(r => {
      const s = students.find(st => st.id === r.studentId) || { fullName: 'Đã xóa', parentPhone: '', subjects: [] };
      return { ...r, student: s };
    });
  }, [records, students]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return joinedItems.filter(item => {
      const matchSearch = !q || item.student.fullName.toLowerCase().includes(q) || (item.student.parentPhone && item.student.parentPhone.includes(q)) || (item.studentId && item.studentId.toLowerCase().includes(q));
      const matchStatus = !statusFilter || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [joinedItems, search, statusFilter]);

  const summary = useMemo(() => {
    let expected = 0, collected = 0, paidCount = 0;
    records.forEach(r => {
      expected += (r.feeAmount || 0);
      collected += (r.paidAmount || 0);
      if (r.status === 'paid') paidCount++;
    });
    return { expected, collected, debt: Math.max(0, expected - collected), paidCount, total: records.length };
  }, [records]);

  const exportCSV = useCallback(() => {
    let csv = '\uFEFF' + 'STT,Mã HS,Họ và tên,SĐT,Môn học,Học phí,Đã nộp,Còn nợ,Trạng thái,Ngày nộp,Hình thức,Ghi chú\n';
    records.forEach((r, idx) => {
      const s = students.find(st => st.id === r.studentId) || { fullName: 'Đã xóa', parentPhone: '', subjects: [] };
      const debt = Math.max(0, r.feeAmount - r.paidAmount);
      const st = r.status === 'paid' ? 'Đã nộp đủ' : r.status === 'partial' ? 'Nộp 1 phần' : 'Chưa nộp';
      csv += [idx + 1, `"${r.studentId}"`, `"${s.fullName}"`, `"${s.parentPhone || ''}"`, `"${(s.subjects || []).map(sub => sub.subject).join(' - ')}"`, r.feeAmount, r.paidAmount, debt, `"${st}"`, `"${r.paymentDate || ''}"`, `"${r.paymentMethod || ''}"`, `"${(r.notes || '').replace(/"/g, '""')}"`].join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Danh_sach_hoc_phi_${currentMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('Thành công', `Đã xuất file CSV`, 'success');
  }, [records, students, currentMonth, showToast]);

  return (
    <section>
      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info"><span className="stat-label">Học phí dự kiến</span><span className="stat-value">{formatCurrency(summary.expected)}</span><span className="stat-sub">Tổng số tiền cần thu</span></div>
          <div className="stat-icon-wrapper icon-blue"><Calculator size={22} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-info"><span className="stat-label">Đã thực thu</span><span className="stat-value" style={{ color: 'var(--success-text)' }}>{formatCurrency(summary.collected)}</span><span className="stat-sub positive">Tiền đã nộp</span></div>
          <div className="stat-icon-wrapper icon-green"><CheckCircle2 size={22} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-info"><span className="stat-label">Công nợ</span><span className="stat-value" style={{ color: 'var(--danger-text)' }}>{formatCurrency(summary.debt)}</span><span className="stat-sub warning">Chưa đóng</span></div>
          <div className="stat-icon-wrapper icon-red"><AlertCircle size={22} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-info"><span className="stat-label">Hoàn thành</span><span className="stat-value">{summary.paidCount} / {summary.total}</span><span className="stat-sub">Đã nộp đủ</span></div>
          <div className="stat-icon-wrapper icon-purple"><PieChart size={22} /></div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tháng:</label>
          <select className="select-custom" style={{ minWidth: 170, fontWeight: 700 }} value={currentMonth} onChange={e => setCurrentMonth(e.target.value)}>
            {monthOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div className="toolbar-search">
          <Search size={18} />
          <input type="text" placeholder="Tìm học sinh..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="toolbar-filters">
          <select className="select-custom" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="paid">Đã nộp đủ</option>
            <option value="partial">Nộp 1 phần</option>
            <option value="unpaid">Chưa nộp</option>
          </select>
          <button className="btn btn-outline" onClick={exportCSV}><Download size={18} /> Xuất CSV</button>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: 50 }}>STT</th><th>Học sinh</th><th>SĐT</th><th>Môn học</th><th>Học phí</th><th>Đã nộp</th><th>Còn nợ</th><th>Trạng thái</th><th>Ngày nộp</th><th>Hình thức</th><th style={{ textAlign: 'center', width: 100 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => {
              const debt = Math.max(0, item.feeAmount - item.paidAmount);
              return (
                <tr key={item.id || `${item.studentId}-${item.month}`}>
                  <td><strong>{idx + 1}</strong></td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{item.student.fullName}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.studentId}</span>
                  </td>
                  <td><a href={`tel:${item.student.parentPhone}`} className="phone-copy">{item.student.parentPhone || '---'}</a></td>
                  <td style={{ fontSize: '0.825rem' }}>{(item.student.subjects || []).map(sub => sub.subject).join(', ') || '---'}</td>
                  <td><strong>{formatCurrency(item.feeAmount)}</strong></td>
                  <td style={{ color: 'var(--success-text)', fontWeight: 700 }}>{formatCurrency(item.paidAmount)}</td>
                  <td style={{ color: debt > 0 ? 'var(--danger-text)' : 'var(--text-muted)', fontWeight: debt > 0 ? 700 : 'normal' }}>{formatCurrency(debt)}</td>
                  <td>
                    {item.status === 'paid' && <span className="badge badge-paid"><CheckCircle size={13} /> Đã nộp đủ</span>}
                    {item.status === 'partial' && <span className="badge badge-partial"><AlertCircle size={13} /> Nộp 1 phần</span>}
                    {item.status === 'unpaid' && <span className="badge badge-unpaid"><XCircle size={13} /> Chưa nộp</span>}
                  </td>
                  <td>{item.paymentDate ? formatDate(item.paymentDate) : '---'}</td>
                  <td>{item.paymentMethod || '---'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="action-btn pay" title="Ghi nhận" onClick={() => setPaymentStudentId(item.studentId)}><CreditCard size={16} /></button>
                      {item.paidAmount > 0 && (
                        <button className="action-btn view" title="In phiếu" onClick={() => setReceiptStudentId(item.studentId)}><Printer size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state"><CreditCard size={48} /><h4>Không có bản ghi</h4><p>Chưa có thông tin học phí phù hợp.</p></div>
      )}

      <PaymentModal isOpen={!!paymentStudentId} onClose={() => setPaymentStudentId(null)} studentId={paymentStudentId} currentMonth={currentMonth} />
      <ReceiptModal isOpen={!!receiptStudentId} onClose={() => setReceiptStudentId(null)} studentId={receiptStudentId} currentMonth={currentMonth} />
    </section>
  );
}
