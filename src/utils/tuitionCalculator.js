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
  if (!student || !student.subjects || student.subjects.length === 0) {
    return { feeAmount: student?.monthlyFee || 0, notes: 'Không có môn học nào để tính toán.', subjectBreakdown: [] };
  }

  const [year, month] = monthStr.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  
  let totalFeeAmount = 0;
  let totalExpected = 0;
  let totalHoliday = 0;
  let totalActual = 0;
  const breakdown = [];

  student.subjects.forEach(sub => {
    const isG12 = sub.subject && sub.subject.includes('12');
    const targetDays = (sub.scheduleDays || []).map(d => DAY_MAP[d]).filter(d => d !== undefined);
    
    let expectedLessons = 0;
    let holidayLessons = 0;
    let actualLessons = 0;

    if (targetDays.length > 0) {
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
    }

    const feePerLesson = sub.feePerLesson || 0;
    const subFeeAmount = actualLessons * feePerLesson;
    
    let subNotes = `Tháng này có ${expectedLessons} buổi.`;
    if (holidayLessons > 0) {
      subNotes += ` Nghỉ lễ ${holidayLessons} buổi.`;
    }
    subNotes += ` Thực học: ${actualLessons} buổi.`;

    totalFeeAmount += subFeeAmount;
    totalExpected += expectedLessons;
    totalHoliday += holidayLessons;
    totalActual += actualLessons;

    breakdown.push({
      subject: sub.subject,
      teacher: sub.teacher,
      expectedLessons,
      holidayLessons,
      actualLessons,
      feePerLesson,
      feeAmount: subFeeAmount,
      notes: subNotes
    });
  });

  const overallNotes = `Tổng cộng: ${totalExpected} buổi. Nghỉ lễ: ${totalHoliday} buổi. Thực học: ${totalActual} buổi.`;

  return {
    feeAmount: Math.round(totalFeeAmount),
    expectedLessons: totalExpected,
    holidayLessons: totalHoliday,
    actualLessons: totalActual,
    notes: overallNotes,
    subjectBreakdown: breakdown
  };
}
