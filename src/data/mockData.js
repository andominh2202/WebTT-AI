/**
 * Mock Data - Dữ liệu mẫu chuẩn tiếng Việt
 * Môn học: Toán, Văn, Anh, Lý, Hóa × Lớp 6-12
 */

export const CLASS_MAP = {
  "Khối 6": {
    "Toán 6": ["Chị Dung", "Anh Trọng"],
    "Văn 6": ["Chị Thư"],
    "Tiếng Anh 6": ["Chị Ngân"]
  },
  "Khối 7": {
    "Toán 7A1": ["Anh Trọng"],
    "Toán 7A2": ["Quyền"],
    "Toán 7B": ["Chị Dung"],
    "Văn 7": ["Chị Nhung"],
    "Tiếng Anh 7": ["Chị Ngân"]
  },
  "Khối 8": {
    "Toán 8A1": ["Chị Dung"],
    "Toán 8A2": ["Anh Trọng"],
    "Toán 8B": ["Anh Hiếu"],
    "Văn 8": ["Chị Thư"],
    "Anh 8A": ["Chị Ngân"],
    "Anh 8B": ["Chị Ngân"]
  },
  "Khối 9": {
    "Toán 9A1": ["Cô Yến"],
    "Toán 9A2": ["Cô Hường"],
    "Toán 9A3": ["Chị Huyền"],
    "Toán 9A4": ["Anh Hiếu"],
    "Toán 9B": ["Chị Huyền"],
    "Toán 9 (Khác)": ["Anh Đoàn", "Cô Hiền", "Cô Hường", "Chị Huyền", "Cô Yến", "Anh Hiếu"],
    "Văn 9": ["Cô Lan"],
    "Tiếng Anh 9": ["Chị Ngân", "Thầy Mạnh", "Anh Bảo"],
    "Tiếng Anh 9A1": ["Chị Ngân"],
    "Tiếng Anh 9A2": ["Anh Bảo"],
    "Tiếng Anh 9B": ["Chị Ngân"],
    "Hóa 9": ["Thầy Duy"],
    "Vật lí 9": ["Cô Thơ"]
  },
  "Khối 10": {
    "Toán 10": ["Anh Hiếu", "Anh Quân", "Thầy Tài", "Cô Thủy"],
    "Lý 10": ["Anh Phúc", "Thầy Tiến"],
    "Hóa 10": ["Thầy Duy"],
    "Tiếng Anh 10": ["Chị Trang", "Thầy Mạnh", "Anh Phúc"]
  },
  "Khối 11": {
    "Toán 11": ["Anh Quân", "Thầy Tài", "Cô Thủy"],
    "Văn 11": ["Cô Lan"],
    "Lý 11": ["Thầy Tiến"],
    "Hóa 11": ["Thầy Duy"],
    "Tiếng Anh 11": ["Anh Bảo", "Thầy Mạnh"]
  },
  "Khối 12": {
    "Toán 12": ["Thầy Tài", "Anh Quân", "Cô Thủy"],
    "Văn 12": ["Cô Lan"],
    "Lý 12": ["Thầy Tiến", "Anh Phúc"],
    "Hóa 12": ["Thầy Duy"],
    "Sinh 12": ["Cô Ninh"],
    "Tiếng Anh 12": ["Thầy Mạnh"],
    "Sử 12": ["Cô Sen"]
  },
  "Khác": {
    "TOEIC B16": ["Thầy Thịnh"],
    "TOEIC": ["Thầy Thịnh"],
    "IELTS A": ["Thầy Thắng"],
    "IELTS A1": ["Cô Dung"],
    "IELTS A2": ["Cô Trang"]
  }
};

export const INITIAL_SUBJECTS = Object.values(CLASS_MAP).flatMap(grade => Object.keys(grade));
export const INITIAL_TEACHERS = Array.from(new Set(Object.values(CLASS_MAP).flatMap(grade => Object.values(grade).flat())));

export const INITIAL_STUDENTS = [
  {
    id: 'STU-001',
    fullName: 'Nguyễn Minh Quân',
    parentPhone: '0912345678',
    dob: '2010-05-14',
    school: 'THCS Lê Quý Đôn',
    referrer: 'Cô Lan (GV Toán)',
    subjects: [
      { subject: 'Toán 9A1', teacher: 'Cô Yến' },
      { subject: 'Tiếng Anh 9', teacher: 'Chị Ngân' }
    ],
    scheduleDays: ['Thứ 2', 'Thứ 4', 'Thứ 6'],
    monthlyFee: 1600000,
    status: 'official',
    notes: 'Học lực tốt, mục tiêu thi Chuyên Toán',
    createdAt: '2026-01-10'
  },
  {
    id: 'STU-002',
    fullName: 'Trần Thảo Linh',
    parentPhone: '0987654321',
    dob: '2011-09-20',
    school: 'THCS Giảng Võ',
    referrer: 'Phụ huynh bạn Quân',
    subjects: [
      { subject: 'Anh 8A', teacher: 'Chị Ngân' },
      { subject: 'Văn 8', teacher: 'Chị Thư' }
    ],
    scheduleDays: ['Thứ 3', 'Thứ 5', 'Chủ Nhật'],
    monthlyFee: 1800000,
    status: 'official',
    notes: 'Chuẩn bị thi chuyển cấp',
    createdAt: '2026-02-15'
  },
  {
    id: 'STU-003',
    fullName: 'Lê Gia Huy',
    parentPhone: '0903112233',
    dob: '2012-11-03',
    school: 'THCS Cầu Giấy',
    referrer: 'Tìm trên Facebook',
    subjects: [
      { subject: 'Toán 7A1', teacher: 'Anh Trọng' },
      { subject: 'Văn 7', teacher: 'Chị Nhung' }
    ],
    scheduleDays: ['Thứ 7', 'Chủ Nhật'],
    monthlyFee: 1500000,
    status: 'trial',
    notes: 'Đang học thử 2 buổi đầu',
    createdAt: '2026-08-01'
  },
  {
    id: 'STU-004',
    fullName: 'Phạm Ngọc Ánh',
    parentPhone: '0934567890',
    dob: '2009-03-25',
    school: 'THPT Kim Liên',
    referrer: 'Thầy Hưng',
    subjects: [
      { subject: 'Lý 10', teacher: 'Thầy Tiến' },
      { subject: 'Hóa 10', teacher: 'Thầy Duy' },
      { subject: 'Toán 10', teacher: 'Thầy Tài' }
    ],
    scheduleDays: ['Thứ 2', 'Thứ 4', 'Thứ 6'],
    monthlyFee: 2400000,
    status: 'official',
    notes: 'Khối A00',
    createdAt: '2026-03-05'
  },
  {
    id: 'STU-005',
    fullName: 'Vũ Hoàng Long',
    parentPhone: '0978999888',
    dob: '2013-08-12',
    school: 'THCS Dịch Vọng',
    referrer: 'Mẹ bạn Ánh giới thiệu',
    subjects: [
      { subject: 'Toán 6', teacher: 'Chị Dung' },
      { subject: 'Tiếng Anh 6', teacher: 'Chị Ngân' }
    ],
    scheduleDays: ['Thứ 3', 'Thứ 5'],
    monthlyFee: 1400000,
    status: 'official',
    notes: 'Mới lên lớp 6, cần ổn định kiến thức nền',
    createdAt: '2026-04-12'
  },
  {
    id: 'STU-006',
    fullName: 'Đỗ Hải Đăng',
    parentPhone: '0945671234',
    dob: '2011-01-18',
    school: 'THCS Trưng Vương',
    referrer: 'Biển quảng cáo',
    subjects: [
      { subject: 'Văn 8', teacher: 'Chị Thư' },
      { subject: 'Anh 8B', teacher: 'Chị Ngân' }
    ],
    scheduleDays: ['Thứ 2', 'Thứ 6'],
    monthlyFee: 1200000,
    status: 'trial',
    notes: 'Cần nâng cao kỹ năng viết văn nghị luận',
    createdAt: '2026-08-05'
  },
  {
    id: 'STU-007',
    fullName: 'Bùi Bảo Châu',
    parentPhone: '0918776655',
    dob: '2010-12-08',
    school: 'THCS Ngô Sĩ Liên',
    referrer: 'Bác Mai',
    subjects: [
      { subject: 'Toán 9A2', teacher: 'Cô Hường' },
      { subject: 'Văn 9', teacher: 'Cô Lan' }
    ],
    scheduleDays: ['Thứ 3', 'Thứ 5', 'Thứ 7'],
    monthlyFee: 1700000,
    status: 'official',
    notes: 'Lớp 9, mục tiêu thi vào 10 đạt 9đ Toán',
    createdAt: '2026-02-20'
  },
  {
    id: 'STU-008',
    fullName: 'Hoàng Quốc Việt',
    parentPhone: '0962345678',
    dob: '2008-07-30',
    school: 'THPT Chu Văn An',
    referrer: 'Anh Hoàng (Cựu học sinh)',
    subjects: [
      { subject: 'Lý 11', teacher: 'Thầy Tiến' },
      { subject: 'Toán 11', teacher: 'Anh Quân' }
    ],
    scheduleDays: ['Thứ 4', 'Chủ Nhật'],
    monthlyFee: 1600000,
    status: 'official',
    notes: 'Ôn thi ĐGNL và Tốt nghiệp THPT',
    createdAt: '2026-01-15'
  },
  {
    id: 'STU-009',
    fullName: 'Ngô Khánh Linh',
    parentPhone: '0935111222',
    dob: '2007-04-22',
    school: 'THPT Phan Đình Phùng',
    referrer: 'Cô Hoa (GV Hóa)',
    subjects: [
      { subject: 'Hóa 12', teacher: 'Thầy Duy' },
      { subject: 'Toán 12', teacher: 'Thầy Tài' },
      { subject: 'Lý 12', teacher: 'Thầy Tiến' }
    ],
    scheduleDays: ['Thứ 2', 'Thứ 4', 'Thứ 6'],
    monthlyFee: 2700000,
    status: 'official',
    notes: 'Ôn thi đại học khối A, mục tiêu 27+',
    createdAt: '2026-01-08'
  }
];

export const INITIAL_TUITION_RECORDS = [
  // Tháng 08/2026
  { id: 'TUI-202608-001', studentId: 'STU-001', month: '2026-08', feeAmount: 1600000, paidAmount: 1600000, status: 'paid', paymentDate: '2026-08-05', paymentMethod: 'Chuyển khoản', notes: 'Đã nộp đầu tháng qua Vietcombank' },
  { id: 'TUI-202608-002', studentId: 'STU-002', month: '2026-08', feeAmount: 1800000, paidAmount: 1800000, status: 'paid', paymentDate: '2026-08-03', paymentMethod: 'Chuyển khoản', notes: 'Mẹ CK 1.8tr' },
  { id: 'TUI-202608-003', studentId: 'STU-003', month: '2026-08', feeAmount: 1500000, paidAmount: 0, status: 'unpaid', paymentDate: '', paymentMethod: '', notes: 'Đang học thử, chưa thu học phí' },
  { id: 'TUI-202608-004', studentId: 'STU-004', month: '2026-08', feeAmount: 2400000, paidAmount: 1200000, status: 'partial', paymentDate: '2026-08-06', paymentMethod: 'Tiền mặt', notes: 'Đã đóng trước 1 nửa, hẹn 15/8 đóng nốt' },
  { id: 'TUI-202608-005', studentId: 'STU-005', month: '2026-08', feeAmount: 1400000, paidAmount: 1400000, status: 'paid', paymentDate: '2026-08-02', paymentMethod: 'Chuyển khoản', notes: 'Phụ huynh CK' },
  { id: 'TUI-202608-006', studentId: 'STU-006', month: '2026-08', feeAmount: 1200000, paidAmount: 0, status: 'unpaid', paymentDate: '', paymentMethod: '', notes: 'Học sinh mới đăng ký học thử' },
  { id: 'TUI-202608-007', studentId: 'STU-007', month: '2026-08', feeAmount: 1700000, paidAmount: 1700000, status: 'paid', paymentDate: '2026-08-08', paymentMethod: 'Chuyển khoản', notes: 'Đã nộp' },
  { id: 'TUI-202608-008', studentId: 'STU-008', month: '2026-08', feeAmount: 1600000, paidAmount: 0, status: 'unpaid', paymentDate: '', paymentMethod: '', notes: 'Chưa đóng' },
  { id: 'TUI-202608-009', studentId: 'STU-009', month: '2026-08', feeAmount: 2700000, paidAmount: 2700000, status: 'paid', paymentDate: '2026-08-04', paymentMethod: 'Chuyển khoản', notes: 'Bố CK qua BIDV' },

  // Tháng 07/2026
  { id: 'TUI-202607-001', studentId: 'STU-001', month: '2026-07', feeAmount: 1600000, paidAmount: 1600000, status: 'paid', paymentDate: '2026-07-05', paymentMethod: 'Chuyển khoản', notes: '' },
  { id: 'TUI-202607-002', studentId: 'STU-002', month: '2026-07', feeAmount: 1800000, paidAmount: 1800000, status: 'paid', paymentDate: '2026-07-04', paymentMethod: 'Chuyển khoản', notes: '' },
  { id: 'TUI-202607-004', studentId: 'STU-004', month: '2026-07', feeAmount: 2400000, paidAmount: 2400000, status: 'paid', paymentDate: '2026-07-08', paymentMethod: 'Tiền mặt', notes: '' },
  { id: 'TUI-202607-005', studentId: 'STU-005', month: '2026-07', feeAmount: 1400000, paidAmount: 1400000, status: 'paid', paymentDate: '2026-07-03', paymentMethod: 'Chuyển khoản', notes: '' },
  { id: 'TUI-202607-007', studentId: 'STU-007', month: '2026-07', feeAmount: 1700000, paidAmount: 1700000, status: 'paid', paymentDate: '2026-07-06', paymentMethod: 'Chuyển khoản', notes: '' },
  { id: 'TUI-202607-008', studentId: 'STU-008', month: '2026-07', feeAmount: 1600000, paidAmount: 1600000, status: 'paid', paymentDate: '2026-07-05', paymentMethod: 'Tiền mặt', notes: '' },
  { id: 'TUI-202607-009', studentId: 'STU-009', month: '2026-07', feeAmount: 2700000, paidAmount: 2700000, status: 'paid', paymentDate: '2026-07-04', paymentMethod: 'Chuyển khoản', notes: '' },

  // Tháng 06/2026
  { id: 'TUI-202606-001', studentId: 'STU-001', month: '2026-06', feeAmount: 1600000, paidAmount: 1600000, status: 'paid', paymentDate: '2026-06-05', paymentMethod: 'Chuyển khoản', notes: '' },
  { id: 'TUI-202606-002', studentId: 'STU-002', month: '2026-06', feeAmount: 1800000, paidAmount: 1800000, status: 'paid', paymentDate: '2026-06-04', paymentMethod: 'Chuyển khoản', notes: '' },
  { id: 'TUI-202606-004', studentId: 'STU-004', month: '2026-06', feeAmount: 2400000, paidAmount: 2400000, status: 'paid', paymentDate: '2026-06-05', paymentMethod: 'Tiền mặt', notes: '' },
  { id: 'TUI-202606-005', studentId: 'STU-005', month: '2026-06', feeAmount: 1400000, paidAmount: 1400000, status: 'paid', paymentDate: '2026-06-02', paymentMethod: 'Chuyển khoản', notes: '' },
  { id: 'TUI-202606-007', studentId: 'STU-007', month: '2026-06', feeAmount: 1700000, paidAmount: 1700000, status: 'paid', paymentDate: '2026-06-07', paymentMethod: 'Chuyển khoản', notes: '' },
  { id: 'TUI-202606-008', studentId: 'STU-008', month: '2026-06', feeAmount: 1600000, paidAmount: 1600000, status: 'paid', paymentDate: '2026-06-05', paymentMethod: 'Tiền mặt', notes: '' },
  { id: 'TUI-202606-009', studentId: 'STU-009', month: '2026-06', feeAmount: 2700000, paidAmount: 2700000, status: 'paid', paymentDate: '2026-06-03', paymentMethod: 'Chuyển khoản', notes: '' },
];
