# Phần Mềm Quản Lý Trung Tâm Gia Sư / Dạy Thêm

Dự án phần mềm quản lý học sinh và học phí dành cho các trung tâm dạy thêm, gia sư. Được xây dựng với React (Vite) và Firebase, giúp tối ưu hóa quy trình quản lý thông tin học sinh, theo dõi học phí, và báo cáo doanh thu.

## 🌟 Tính Năng Chính

*   **Quản Lý Học Sinh:** Thêm mới, chỉnh sửa, xóa, và tìm kiếm thông tin học sinh. Theo dõi trạng thái (học thử/chính thức), các môn học, giáo viên, và lịch học.
*   **Quản Lý Học Phí:** Tính toán tự động học phí dựa trên số buổi học và mức giá. Ghi nhận thanh toán, theo dõi nợ đọng, và xuất biên lai thanh toán.
*   **Bảng Điều Khiển (Dashboard):** Tổng quan nhanh về số lượng học sinh, doanh thu trong tháng, và các thống kê quan trọng.
*   **Báo Cáo & Thống Kê:** Biểu đồ doanh thu theo tháng, báo cáo chi tiết học phí chưa đóng, xuất dữ liệu ra file CSV.
*   **Cài Đặt Hệ Thống:** Quản lý danh sách môn học, khối lớp, giáo viên, và thiết lập mức giá chung. Hỗ trợ Backup và Restore dữ liệu (JSON).
*   **Tối ưu Hiệu Suất:** Tích hợp Code Splitting (React.lazy, Suspense), phân trang Firestore để xử lý mượt mà khi dữ liệu lên tới hàng ngàn học sinh.

## 🛠 Công Nghệ Sử Dụng

*   **Frontend:** React 19, Vite, React Router DOM v7
*   **UI/UX:** CSS thuần (Custom Properties), Lucide React (Icons), CSS Skeleton Loading
*   **Backend & Database:** Firebase (Authentication, Firestore Database)
*   **Charts:** Chart.js, React-Chartjs-2

## 🚀 Cài Đặt & Chạy Dự Án

### 1. Yêu cầu hệ thống
*   Node.js (phiên bản 18+ trở lên)
*   Tài khoản Firebase để cấu hình Database và Authentication

### 2. Cài đặt thư viện
Clone dự án về máy và chạy lệnh sau để cài đặt các gói phụ thuộc:
```bash
npm install
```

### 3. Cấu hình biến môi trường
Vui lòng tạo file `.env` ở thư mục gốc của dự án và điền các thông tin cấu hình (Liên hệ quản trị viên để lấy file cấu hình chuẩn).

### 4. Chạy dự án (Development)
```bash
npm run dev
```
Truy cập `http://localhost:5173` trên trình duyệt.

### 5. Build dự án (Production)
```bash
npm run build
```
Thư mục `dist/` sẽ chứa các file tĩnh đã được tối ưu hóa để triển khai.



## 📦 Sao lưu & Khôi phục (Backup/Restore)
Toàn bộ dữ liệu (Học sinh, học phí, cài đặt, giáo viên) có thể được xuất ra dưới dạng file `.json` và nhập lại thông qua giao diện **Cài Đặt** trong ứng dụng.

## 🤖 AI Powered
Dự án này sử dụng 100% AI để dựng và phát triển code
