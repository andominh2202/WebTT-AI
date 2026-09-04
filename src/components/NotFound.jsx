import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        backgroundColor: 'var(--bg-surface, #ffffff)',
        borderRadius: 'var(--radius-lg, 16px)',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: 'var(--shadow-lg, 0 10px 15px -3px rgba(15, 23, 42, 0.05))',
        padding: '3rem 2rem'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light, #eef2ff)',
          color: 'var(--primary, #4f46e5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <FileQuestion size={38} />
        </div>

        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 800,
          color: 'var(--primary, #4f46e5)',
          lineHeight: 1,
          marginBottom: '0.5rem',
          letterSpacing: '-0.03em'
        }}>
          404
        </h1>

        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'var(--text-primary, #0f172a)',
          marginBottom: '0.75rem'
        }}>
          Trang không tồn tại
        </h2>

        <p style={{
          fontSize: '0.95rem',
          color: 'var(--text-secondary, #475569)',
          lineHeight: 1.6,
          marginBottom: '2rem'
        }}>
          Trang bạn đang tìm không tồn tại hoặc đã được di chuyển sang địa chỉ khác.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ArrowLeft size={16} />
            Quay lại
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Home size={16} />
            Quay về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
