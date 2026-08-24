import { useState } from 'react';
import { useUI } from "../context/UIContext";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { useStudent } from "../context/StudentContext";
import { useTuition } from "../context/TuitionContext";
import { GraduationCap, Lock, User, LogIn } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-decorator-1"></div>
      <div className="login-decorator-2"></div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <div className="icon">
              <GraduationCap size={28} />
            </div>
          </div>
          <h2>Hệ thống Quản lý</h2>
          <p>Đăng nhập để quản lý học sinh & học phí</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email hoặc Tên đăng nhập</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '40px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email hoặc tên đăng nhập..."
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: '40px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu..."
                required
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-login" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }} disabled={loading}>
            <LogIn size={18} />
            <span>{loading ? 'Đang xác thực...' : 'Đăng nhập'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
