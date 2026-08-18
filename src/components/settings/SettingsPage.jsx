import { useApp } from '../../context/AppContext';
import { Database, DownloadCloud, UploadCloud, Download, Upload, RotateCcw } from 'lucide-react';

export default function SettingsPage() {
  const { exportBackup, importBackup, resetData } = useApp();

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => importBackup(ev.target.result);
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại dữ liệu mẫu mặc định? Tất cả thay đổi hiện tại sẽ bị thay thế.')) {
      resetData();
    }
  };

  return (
    <section>
      <div className="card" style={{ maxWidth: 800, margin: '0 auto 1.5rem' }}>
        <div className="card-header">
          <div className="card-title"><Database size={18} /> Sao lưu & Phục hồi dữ liệu</div>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Toàn bộ dữ liệu được lưu trữ an toàn trong trình duyệt (LocalStorage). Tải file sao lưu để chuyển máy hoặc lưu trữ định kỳ.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', textAlign: 'center' }}>
            <DownloadCloud size={32} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
            <h4 style={{ marginBottom: '0.25rem' }}>Sao lưu dữ liệu</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Tải xuống file JSON chứa toàn bộ dữ liệu</p>
            <button className="btn btn-primary btn-sm" onClick={exportBackup}>
              <Download size={16} /> Tải file sao lưu
            </button>
          </div>

          <div style={{ border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', textAlign: 'center' }}>
            <UploadCloud size={32} style={{ color: 'var(--success)', marginBottom: '0.5rem' }} />
            <h4 style={{ marginBottom: '0.25rem' }}>Khôi phục dữ liệu</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Nạp dữ liệu từ file sao lưu JSON</p>
            <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
              <Upload size={16} /> Chọn file để nạp
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong style={{ color: 'var(--danger-text)' }}>Đặt lại dữ liệu mẫu</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Khôi phục danh sách học sinh và học phí ban đầu</p>
          </div>
          <button className="btn btn-danger btn-sm" onClick={handleReset}>
            <RotateCcw size={16} /> Khôi phục dữ liệu mẫu
          </button>
        </div>
      </div>
    </section>
  );
}
