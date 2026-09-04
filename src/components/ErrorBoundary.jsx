import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught a rendering error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          backgroundColor: 'var(--bg-primary, #f8fafc)',
          color: 'var(--text-primary, #0f172a)',
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: 'var(--bg-surface, #ffffff)',
            borderRadius: 'var(--radius-lg, 16px)',
            border: '1px solid var(--border-color, #e2e8f0)',
            boxShadow: 'var(--shadow-xl, 0 20px 25px -5px rgba(15, 23, 42, 0.08))',
            padding: '2.5rem 2rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--danger-light, #fef2f2)',
              color: 'var(--danger, #ef4444)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <AlertTriangle size={32} />
            </div>

            <h2 style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
              color: 'var(--text-primary, #0f172a)'
            }}>
              Đã xảy ra lỗi không mong muốn.
            </h2>

            <p style={{
              fontSize: '0.925rem',
              color: 'var(--text-secondary, #475569)',
              lineHeight: 1.6,
              marginBottom: '1.75rem'
            }}>
              Ứng dụng gặp sự cố trong quá trình hiển thị giao diện. Bạn có thể thử lại hoặc quay về trang chủ.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={this.handleReset}
                className="btn btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <RotateCcw size={16} />
                Thử lại
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Home size={16} />
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
