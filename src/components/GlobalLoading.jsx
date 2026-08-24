import React from 'react';
import { Loader2 } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', color: 'var(--text-muted)' }}>
      <Loader2 size={40} className="spin" style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
      <p>Đang tải dữ liệu, vui lòng đợi...</p>
    </div>
  );
}
