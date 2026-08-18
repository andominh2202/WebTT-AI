// Danh sách các ngày lễ cố định (MM-DD)
const HOLIDAYS = [
  '01-01', // Tết dương lịch
  '04-30', // Giải phóng miền Nam
  '05-01', // Quốc tế lao động
  '09-02', // Quốc khánh
];

const DAY_MAP = {
  'Chủ Nhật': 0,
  'Thứ 2': 1,
  'Thứ 3': 2,
  'Thứ 4': 3,
  'Thứ 5': 4,
  'Thứ 6': 5,
  'Thứ 7': 6
};

// Kiểm tra xem học sinh có học lớp 12 không
export function isGrade12(student) {
  if (!student || !student.subjects) return false;
  return student.subjects.some(sub => {
    const name = typeof sub === 'string' ? sub : sub.subject;
    return name && name.includes('12');
  });
}

// Kiểm tra ngày lễ
export function isHoliday(date) {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dateStr = `${mm}-${dd}`;
  return HOLIDAYS.includes(dateStr);
}

// Tính tiền học phí thực tế cho 1 tháng
export function calculateTuitionForMonth(student, monthStr) {
  if (!student || !student.scheduleDays || student.scheduleDays.length === 0) {
    return { feeAmount: student?.monthlyFee || 0, notes: 'Không có lịch học để tính toán.' };
  }

  const [year, month] = monthStr.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // Ánh xạ mảng "Thứ 2", "Thứ 3"... sang số [1, 2, ...]
  const targetDays = student.scheduleDays.map(d => DAY_MAP[d]);

  let expectedLessons = 0;
  let holidayLessons = 0;
  let actualLessons = 0;

  const isG12 = isGrade12(student);

  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month - 1, i);
    if (targetDays.includes(d.getDay())) {
      expectedLessons++;
      
      if (isHoliday(d) && !isG12) {
        holidayLessons++;
      } else {
        actualLessons++;
      }
    }
  }

  // Tính tiền 1 buổi
  // Nếu học sinh chưa được lưu feePerLesson (dữ liệu cũ), tự động tính bằng: monthlyFee / (số buổi 1 tuần * 4 tuần)
  let feePerLesson = student.feePerLesson;
  if (!feePerLesson) {
    feePerLesson = (student.monthlyFee || 0) / (student.scheduleDays.length * 4);
  }

  const finalFeeAmount = actualLessons * feePerLesson;
  
  let notes = `Tháng này có ${expectedLessons} buổi.`;
  if (holidayLessons > 0) {
    notes += ` Nghỉ lễ ${holidayLessons} buổi.`;
  }
  notes += ` Thực học: ${actualLessons} buổi.`;

  if (isG12 && expectedLessons !== actualLessons + holidayLessons) {
     // this condition is just for safety, it shouldn't happen unless holiday logic is bypassed
  }

  return {
    feeAmount: Math.round(finalFeeAmount),
    expectedLessons,
    holidayLessons,
    actualLessons,
    feePerLesson: Math.round(feePerLesson),
    notes
  };
}
