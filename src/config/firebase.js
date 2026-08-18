import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Added for Authentication

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app;
let db;
let auth;

function showErrorPage(errorMsg) {
  const show = () => {
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div style="padding: 30px; font-family: system-ui, -apple-system, sans-serif; color: #e53e3e; background-color: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; max-width: 600px; margin: 40px auto; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h3 style="margin-top: 0; font-size: 1.25rem; font-weight: 600;">Lỗi cấu hình Firebase (Firebase Configuration Error)</h3>
          <p style="color: #4a5568; font-size: 0.95rem;">Ứng dụng không thể kết nối tới cơ sở dữ liệu Firebase do thiếu thông tin cấu hình.</p>
          <p style="color: #2d3748; font-size: 0.9rem; background: #fff; padding: 10px; border-radius: 6px; border: 1px solid #feb2b2; font-family: monospace;"><strong>Chi tiết:</strong> ${errorMsg}</p>
          <hr style="border: 0; border-top: 1px solid #fed7d7; margin: 20px 0;"/>
          <p style="font-weight: 600; color: #2d3748; margin-bottom: 8px;">Cách khắc phục:</p>
          <ul style="padding-left: 20px; line-height: 1.6; color: #4a5568; font-size: 0.9rem;">
            <li><strong>Chạy local (Máy cá nhân):</strong> Hãy đảm bảo bạn đã tạo file <code>.env</code> ở thư mục gốc của dự án và khai báo đầy đủ các biến <code>VITE_FIREBASE_...</code>.</li>
            <li><strong>Chạy trên GitHub Pages:</strong> Bạn cần cấu hình các biến này trên GitHub bằng cách vào kho lưu trữ GitHub của bạn, đi đến <strong>Settings > Secrets and variables > Actions > Repository secrets</strong>, nhấn <strong>New repository secret</strong> và thêm lần lượt các biến sau với giá trị từ file <code>.env</code> của bạn:
              <ul style="margin-top: 8px; font-family: monospace; list-style-type: square; color: #718096; font-size: 0.85rem;">
                <li>VITE_FIREBASE_API_KEY</li>
                <li>VITE_FIREBASE_AUTH_DOMAIN</li>
                <li>VITE_FIREBASE_PROJECT_ID</li>
                <li>VITE_FIREBASE_STORAGE_BUCKET</li>
                <li>VITE_FIREBASE_MESSAGING_SENDER_ID</li>
                <li>VITE_FIREBASE_APP_ID</li>
                <li>VITE_FIREBASE_MEASUREMENT_ID</li>
              </ul>
            </li>
          </ul>
        </div>
      `;
    }
  };
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', show);
  } else {
    show();
  }
}

try {
  if (!firebaseConfig.apiKey) {
    throw new Error('Thiếu VITE_FIREBASE_API_KEY. Hãy kiểm tra các biến môi trường cấu hình Firebase.');
  }
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error('Lỗi khởi tạo Firebase:', error);
  showErrorPage(error.message);
}

export { db, auth };
