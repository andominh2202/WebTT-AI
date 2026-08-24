import { useState, useMemo, useCallback, useEffect } from 'react';
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import { useStudent } from "../../context/StudentContext";
import { useTuition } from "../../context/TuitionContext";
import { formatCurrency, formatDate } from '../../utils/storage';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend
} from 'chart.js';
import { TrendingUp, AlertTriangle, Users, Percent, Calendar, Filter, BarChart, PieChart, Layers, UserCheck } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const PALETTE = ['#4f46e5','#10b981','#f59e0b','#0ea5e9','#8b5cf6','#ec4899','#14b8a6','#f97316','#6366f1','#84cc16'];

export default function ReportsPage() {
  const { students } = useStudent();
  const { tuition } = useTuition();
  const { subjects } = useSettings();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Set default search from start of current month to today
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const startOfMonthStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }, []);

  const [fromDate, setFromDate] = useState(startOfMonthStr);
  const [toDate, setToDate] = useState(todayStr);
  const [rangeResult, setRangeResult] = useState(null);

  // KPIs
  const kpis = useMemo(() => {
    const total = students.length;
    const official = students.filter(s => s.status === 'official').length;
    const trial = total - official;
    const today = new Date();
    const curMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const curTuition = tuition.filter(t => t.month === curMonth);
    let revenue = 0, expected = 0, paidCount = 0;
    let cashRevenue = 0, transferRevenue = 0;

    curTuition.forEach(t => {
      revenue += (t.paidAmount || 0);
      expected += (t.feeAmount || 0);
      if (t.status === 'paid') paidCount++;
      if (t.paidAmount > 0) {
        if (t.paymentMethod === 'Tiền mặt') {
          cashRevenue += (t.paidAmount || 0);
        } else {
          transferRevenue += (t.paidAmount || 0);
        }
      }
    });
    const rate = curTuition.length > 0 ? Math.round((paidCount / curTuition.length) * 100) : 0;
    return { revenue, cashRevenue, transferRevenue, debt: Math.max(0, expected - revenue), total, official, trial, rate, paidCount, totalRecords: curTuition.length };
  }, [students, tuition]);

  // Revenue History Bar Chart Data
  const revenueChartData = useMemo(() => {
    const months = [], revenueData = [], expectedData = [];
    for (let m = 1; m <= 12; m++) {
      const mStr = `${selectedYear}-${String(m).padStart(2, '0')}`;
      months.push(`Tháng ${m}`);
      const recs = tuition.filter(t => t.month === mStr);
      let paid = 0, exp = 0;
      recs.forEach(r => { paid += (r.paidAmount || 0); exp += (r.feeAmount || 0); });
      revenueData.push(paid);
      expectedData.push(exp);
    }
    return {
      labels: months,
      datasets: [
        { label: 'Doanh thu thực thu', data: revenueData, backgroundColor: '#4f46e5', borderRadius: 6, barPercentage: 0.6 },
        { label: 'Học phí dự thu', data: expectedData, backgroundColor: '#cbd5e1', borderRadius: 6, barPercentage: 0.6 },
      ]
    };
  }, [selectedYear, tuition]);

  // Subject Revenue Doughnut
  const subjectChartData = useMemo(() => {
    const map = {};
    subjects.forEach(s => map[s] = 0);
    tuition.forEach(t => {
      if (t.paidAmount > 0) {
        const st = students.find(s => s.id === t.studentId);
        if (st?.subjects?.length > 0) {
          const split = t.paidAmount / st.subjects.length;
          st.subjects.forEach(sub => { map[sub.subject] = (map[sub.subject] || 0) + split; });
        }
      }
    });
    const active = Object.keys(map).filter(k => map[k] > 0);
    const vals = active.map(k => map[k]);
    return {
      labels: active.length > 0 ? active : ['Chưa có dữ liệu'],
      datasets: [{ data: active.length > 0 ? vals : [1], backgroundColor: active.length > 0 ? PALETTE.slice(0, active.length) : ['#e2e8f0'], borderWidth: 2, borderColor: '#fff' }]
    };
  }, [students, tuition, subjects]);

  // Payment Method Breakdown for Selected Year
  const paymentMethodChartData = useMemo(() => {
    let cash = 0, transfer = 0;
    tuition.forEach(t => {
      if (t.month.startsWith(String(selectedYear)) && t.paidAmount > 0) {
        if (t.paymentMethod === 'Tiền mặt') {
          cash += t.paidAmount;
        } else {
          transfer += t.paidAmount;
        }
      }
    });
    const hasData = (cash + transfer) > 0;
    return {
      labels: hasData ? ['Chuyển khoản', 'Tiền mặt'] : ['Chưa có giao dịch'],
      datasets: [{
        data: hasData ? [transfer, cash] : [1],
        backgroundColor: hasData ? ['#4f46e5', '#10b981'] : ['#e2e8f0'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  }, [selectedYear, tuition]);

  // Student Status Pie
  const statusChartData = useMemo(() => ({
    labels: ['Chính thức', 'Học thử'],
    datasets: [{ data: [kpis.official, kpis.trial], backgroundColor: ['#10b981', '#f59e0b'], borderWidth: 2, borderColor: '#fff' }]
  }), [kpis]);

  // Subject Breakdown Table
  const subjectStats = useMemo(() => {
    return subjects.map(sub => {
      const enrolled = students.filter(s => s.subjects?.some(x => x.subject === sub));
      let rev = 0;
      enrolled.forEach(st => {
        tuition.filter(t => t.studentId === st.id).forEach(t => {
          if (t.paidAmount > 0 && st.subjects.length > 0) rev += t.paidAmount / st.subjects.length;
        });
      });
      return { name: sub, count: enrolled.length, revenue: rev };
    }).filter(s => s.count > 0);
  }, [students, tuition, subjects]);

  const handleRangeFilter = useCallback(() => {
    if (!fromDate || !toDate) return;
    const filtered = tuition.filter(t => t.paymentDate && t.paymentDate >= fromDate && t.paymentDate <= toDate);
    
    let total = 0;
    let cashTotal = 0;
    let transferTotal = 0;
    
    const list = filtered.map(t => {
      const student = students.find(s => s.id === t.studentId) || { fullName: 'Đã xóa', parentPhone: '' };
      const paid = t.paidAmount || 0;
      total += paid;
      if (t.paymentMethod === 'Tiền mặt') {
        cashTotal += paid;
      } else {
        transferTotal += paid;
      }
      return {
        ...t,
        studentName: student.fullName,
        parentPhone: student.parentPhone
      };
    });

    list.sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));

    setRangeResult({
      total,
      cashTotal,
      transferTotal,
      count: filtered.length,
      from: fromDate,
      to: toDate,
      payments: list
    });
  }, [fromDate, toDate, tuition, students]);

  useEffect(() => {
    handleRangeFilter();
  }, [handleRangeFilter]);

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12, font: { family: 'Inter', size: 12 } } },
      tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` } }
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: v => `${(v / 1000000).toFixed(1)} tr` }, grid: { color: 'rgba(148,163,184,0.1)' } },
      x: { grid: { display: false } }
    }
  };

  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false, cutout: '65%',
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: 'Inter', size: 11 } } },
      tooltip: { callbacks: { label: ctx => `${ctx.label}: ${formatCurrency(ctx.raw)}` } }
    }
  };

  const pieOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: 'Inter', size: 12 } } },
      tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.raw} HS` } }
    }
  };

  return (
    <section>
      {/* KPIs */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Doanh thu tháng này</span>
            <span className="stat-value" style={{ color: 'var(--primary)' }}>{formatCurrency(kpis.revenue)}</span>
            <span className="stat-sub">
              Tiền mặt: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(kpis.cashRevenue)}</strong>
              <span style={{ margin: '0 4px', color: 'var(--text-muted)' }}>|</span>
              CK: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(kpis.transferRevenue)}</strong>
            </span>
          </div>
          <div className="stat-icon-wrapper icon-purple"><TrendingUp size={22} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-info"><span className="stat-label">Công nợ tháng này</span><span className="stat-value" style={{ color: 'var(--danger-text)' }}>{formatCurrency(kpis.debt)}</span><span className="stat-sub warning">Cần thu</span></div>
          <div className="stat-icon-wrapper icon-amber"><AlertTriangle size={22} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-info"><span className="stat-label">Quy mô học sinh</span><span className="stat-value" style={{ fontSize: '1.3rem' }}>{kpis.total} (CT: {kpis.official}, Thử: {kpis.trial})</span></div>
          <div className="stat-icon-wrapper icon-blue"><Users size={22} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-info"><span className="stat-label">Tỉ lệ hoàn thành HP</span><span className="stat-value" style={{ color: 'var(--success-text)', fontSize: '1.35rem' }}>{kpis.rate}% ({kpis.paidCount}/{kpis.totalRecords})</span></div>
          <div className="stat-icon-wrapper icon-green"><Percent size={22} /></div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: '0.75rem', paddingBottom: '0.5rem' }}>
          <div className="card-title"><Calendar size={18} /> Tra cứu doanh thu chi tiết theo ngày</div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group"><label>Từ ngày:</label><input type="date" className="form-control" value={fromDate} onChange={e => setFromDate(e.target.value)} /></div>
          <div className="form-group"><label>Đến ngày:</label><input type="date" className="form-control" value={toDate} onChange={e => setToDate(e.target.value)} /></div>
          <button className="btn btn-primary" onClick={handleRangeFilter}><Filter size={18} /> Xem báo cáo</button>
        </div>

        {rangeResult && (
          <div style={{ marginTop: '1.25rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ background: 'var(--primary-light)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Tổng doanh thu thực thu
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {formatCurrency(rangeResult.total)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {rangeResult.count} lượt giao dịch
                </div>
              </div>

              <div style={{ background: 'var(--success-light)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--success)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success-text)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Doanh thu chuyển khoản
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success-text)' }}>
                  {formatCurrency(rangeResult.transferTotal)}
                </div>
              </div>

              <div style={{ background: 'var(--warning-light)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--warning-text)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--warning-text)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Doanh thu tiền mặt
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--warning-text)' }}>
                  {formatCurrency(rangeResult.cashTotal)}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Danh sách chi tiết giao dịch phát sinh ({rangeResult.payments.length})
              </div>
              
              {rangeResult.payments.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
                  Không có giao dịch nào trong khoảng thời gian này
                </div>
              ) : (
                <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  <table className="custom-table">
                    <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                      <tr>
                        <th style={{ width: 50 }}>STT</th>
                        <th>Học sinh</th>
                        <th>Ngày nộp</th>
                        <th>Hình thức</th>
                        <th>Số tiền nộp</th>
                        <th>Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rangeResult.payments.map((p, idx) => (
                        <tr key={p.id}>
                          <td><strong>{idx + 1}</strong></td>
                          <td>
                            <div style={{ fontWeight: 700 }}>{p.studentName}</div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.studentId}</span>
                          </td>
                          <td>{formatDate(p.paymentDate)}</td>
                          <td>
                            <span className={`badge ${p.paymentMethod === 'Tiền mặt' ? 'badge-trial' : 'badge-paid'}`}>
                              {p.paymentMethod}
                            </span>
                          </td>
                          <td><strong style={{ color: 'var(--primary)' }}>{formatCurrency(p.paidAmount)}</strong></td>
                          <td style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{p.notes || '---'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="dashboard-grid">
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title"><BarChart size={18} /> Doanh thu các tháng</div>
            <select className="select-custom" style={{ padding: '0.35rem 1.75rem 0.35rem 0.65rem', fontSize: '0.85rem' }} value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
              <option value={2026}>Năm 2026</option>
              <option value={2025}>Năm 2025</option>
            </select>
          </div>
          <div className="chart-container" style={{ height: 320 }}><Bar data={revenueChartData} options={chartOptions} /></div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header"><div className="card-title"><PieChart size={18} /> Cơ cấu doanh thu theo Môn</div></div>
          <div className="chart-container" style={{ height: 320 }}><Doughnut data={subjectChartData} options={doughnutOptions} /></div>
        </div>
      </div>

      <div className="dashboard-grid-three" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header"><div className="card-title"><Layers size={18} /> Thống kê theo môn</div></div>
          <div className="table-responsive" style={{ maxHeight: '280px', overflowY: 'auto' }}>
            <table className="custom-table">
              <thead><tr><th>STT</th><th>Môn</th><th>Số HS</th><th>Tổng doanh thu</th></tr></thead>
              <tbody>
                {subjectStats.map((s, i) => (
                  <tr key={s.name}><td><strong>{i + 1}</strong></td><td><strong>{s.name}</strong></td><td>{s.count} HS</td><td><strong style={{ color: 'var(--primary)' }}>{formatCurrency(s.revenue)}</strong></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header"><div className="card-title"><PieChart size={18} /> Cơ cấu hình thức thanh toán ({selectedYear})</div></div>
          <div className="chart-container" style={{ height: 220 }}><Doughnut data={paymentMethodChartData} options={doughnutOptions} /></div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header"><div className="card-title"><UserCheck size={18} /> Tỷ lệ Chính thức vs Học thử</div></div>
          <div className="chart-container" style={{ height: 220 }}><Pie data={statusChartData} options={pieOptions} /></div>
        </div>
      </div>
    </section>
  );
}
