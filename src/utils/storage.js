import { collection, doc, setDoc, getDoc, getDocs, onSnapshot, writeBatch, deleteDoc, query, where, limit, startAfter, orderBy, getCountFromServer, documentId } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { INITIAL_STUDENTS, INITIAL_TUITION_RECORDS, INITIAL_SUBJECTS, INITIAL_TEACHERS, CLASS_MAP } from '../data/mockData';

const COLLECTIONS = {
  STUDENTS: 'students',
  TUITION: 'tuition',
  SUBJECTS: 'subjects',
  TEACHERS: 'teachers',
  USERS: 'users',
  SETTINGS: 'settings',
};

export async function migrateSubjectData() {
  const snap = await getDocs(collection(db, COLLECTIONS.STUDENTS));
  const batch = writeBatch(db);
  
  snap.forEach(docSnap => {
    const student = docSnap.data();
    if (!student.subjects || student.subjects.length === 0) return;
    
    // Check if subjects already have scheduleDays. If so, they are migrated.
    if (student.subjects[0] && student.subjects[0].scheduleDays) return;

    const globalSchedule = student.scheduleDays || [];
    const globalFee = student.feePerLesson || 0;

    const newSubjects = student.subjects.map(sub => {
      return {
        ...sub,
        scheduleDays: globalSchedule,
        feePerLesson: globalFee
      };
    });
    
    const ref = doc(db, COLLECTIONS.STUDENTS, docSnap.id);
    batch.update(ref, { subjects: newSubjects });
  });
  
  await batch.commit();
}

// Initialize default data if empty (Optional, but good for first run)
export async function initStorage() {
  // Bỏ logic khởi tạo users tự động vì không muốn lưu tk/mk mặc định trong source code
  // Users sẽ được quản lý trực tiếp trên database (Firestore)

  const studentsSnap = await getDocs(collection(db, COLLECTIONS.STUDENTS));
  if (studentsSnap.empty) {
    const batch = writeBatch(db);
    INITIAL_STUDENTS.forEach(s => {
      const docRef = doc(collection(db, COLLECTIONS.STUDENTS), s.id);
      const { id, ...dataToSave } = s;
      batch.set(docRef, dataToSave);
    });
    INITIAL_TUITION_RECORDS.forEach(t => {
      const docRef = doc(collection(db, COLLECTIONS.TUITION), t.id);
      const { id, ...dataToSave } = t;
      batch.set(docRef, dataToSave);
    });
    INITIAL_SUBJECTS.forEach((sub, idx) => {
      const docRef = doc(collection(db, COLLECTIONS.SUBJECTS), `sub_${idx}`);
      batch.set(docRef, { name: sub });
    });
    INITIAL_TEACHERS.forEach((t, idx) => {
      const docRef = doc(collection(db, COLLECTIONS.TEACHERS), `teacher_${idx}`);
      batch.set(docRef, { name: t });
    });
    await batch.commit();
  }
}

export async function authenticateUser(emailOrUsername, password) {
  let loginEmail = emailOrUsername;
  let userData = null;

  try {
    const usersSnap = await getDocs(query(collection(db, COLLECTIONS.USERS), where('email', '==', emailOrUsername)));
    const found = usersSnap.docs[0];

    if (found) {
      userData = found.data();
      loginEmail = userData.email;
    }
  } catch (err) {
    // If it fails before login due to rules, we fall back to email directly (which might fail auth if it's a username).
  }

  const userCredential = await signInWithEmailAndPassword(auth, loginEmail, password);
  const user = userCredential.user;
  
  if (!userData) {
    try {
      const docSnap = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
      if (docSnap.exists()) {
        userData = docSnap.data();
      } else {
        const usersSnap = await getDocs(query(collection(db, COLLECTIONS.USERS), where('email', '==', user.email)));
        if (!usersSnap.empty) {
          userData = usersSnap.docs[0].data();
        } else {
          throw new Error("Tài khoản chưa được phân quyền hoặc không tồn tại trong hệ thống (Profile Not Found).");
        }
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin user post-login:", err);
      // Security fix: Không giả định role, quăng lỗi ngay lập tức
      throw new Error("Không thể xác thực thông tin quyền (Profile Fetch Error). Vui lòng thử lại.");
    }
  }

  return {
    uid: user.uid,
    email: user.email,
    username: userData.username || emailOrUsername,
    role: userData.role,
    displayName: userData.displayName || emailOrUsername.split('@')[0]
  };
}

export async function logoutUser() {
  await signOut(auth);
}

// ==== Async CRUD Operations ====

function validateAndWhitelistStudent(student, isUpdate = false) {
  if (!student.fullName || typeof student.fullName !== 'string' || !student.fullName.trim()) {
    throw new Error('fullName is required and must be a string');
  }

  const subjects = Array.isArray(student.subjects) ? student.subjects : [];
  const whitelistedSubjects = subjects.map(sub => {
    if (typeof sub.feePerLesson !== 'number' || !Number.isFinite(sub.feePerLesson) || sub.feePerLesson < 0) {
      throw new Error('feePerLesson must be a valid positive number');
    }
    return {
      subject: String(sub.subject || ''),
      teacher: String(sub.teacher || ''),
      feePerLesson: sub.feePerLesson,
      scheduleDays: Array.isArray(sub.scheduleDays) ? sub.scheduleDays.map(String) : []
    };
  });

  const whitelisted = {
    fullName: student.fullName.trim(),
    parentPhone: student.parentPhone ? String(student.parentPhone) : '',
    dob: student.dob ? String(student.dob) : '',
    school: student.school ? String(student.school) : '',
    referrer: student.referrer ? String(student.referrer) : '',
    status: student.status === 'trial' ? 'trial' : 'official',
    subjects: whitelistedSubjects
  };

  if (!isUpdate || student.createdAt) {
    whitelisted.createdAt = student.createdAt ? String(student.createdAt) : new Date().toISOString().split('T')[0];
  }

  return whitelisted;
}

export async function addStudent(student) {
  const dataToSave = validateAndWhitelistStudent(student, false);
  const { id } = student;
  
  if (!id) {
    // Sử dụng Firestore Auto-generated ID để tránh Race Condition
    const docRef = doc(collection(db, COLLECTIONS.STUDENTS));
    student.id = docRef.id;
    await setDoc(docRef, dataToSave);
  } else {
    await setDoc(doc(db, COLLECTIONS.STUDENTS, id), dataToSave);
  }
  return student;
}

export async function updateStudent(student) {
  const dataToSave = validateAndWhitelistStudent(student, true);
  await setDoc(doc(db, COLLECTIONS.STUDENTS, student.id), dataToSave, { merge: true });
  return student;
}

export async function deleteStudent(id) {
  const batch = writeBatch(db);
  // Xóa học sinh
  batch.delete(doc(db, COLLECTIONS.STUDENTS, id));
  
  // Xóa toàn bộ học phí liên quan trong cùng 1 Transaction/Batch (Atomic Delete)
  const tSnap = await getDocs(query(collection(db, COLLECTIONS.TUITION), where('studentId', '==', id)));
  tSnap.docs.forEach(d => {
    batch.delete(d.ref);
  });
  
  await batch.commit();
}

function validateAndWhitelistTuition(record) {
  const feeAmount = typeof record.feeAmount === 'number' ? record.feeAmount : Number(record.feeAmount);
  const paidAmount = typeof record.paidAmount === 'number' ? record.paidAmount : Number(record.paidAmount);

  if (!Number.isFinite(feeAmount) || feeAmount < 0) {
    throw new Error('feeAmount phải là số hợp lệ và >= 0');
  }
  if (!Number.isFinite(paidAmount) || paidAmount < 0) {
    throw new Error('paidAmount phải là số hợp lệ và >= 0');
  }

  const breakdown = Array.isArray(record.subjectBreakdown) ? record.subjectBreakdown.map(sub => {
    const validateNum = (val, name) => {
      const num = typeof val === 'number' ? val : Number(val);
      if (!Number.isFinite(num) || num < 0) throw new Error(`${name} trong subjectBreakdown phải là số hợp lệ và >= 0`);
      return num;
    };
    return {
      subject: String(sub.subject || ''),
      teacher: String(sub.teacher || ''),
      expectedLessons: validateNum(sub.expectedLessons || 0, 'expectedLessons'),
      holidayLessons: validateNum(sub.holidayLessons || 0, 'holidayLessons'),
      actualLessons: validateNum(sub.actualLessons || 0, 'actualLessons'),
      feePerLesson: validateNum(sub.feePerLesson || 0, 'feePerLesson'),
      feeAmount: validateNum(sub.feeAmount || 0, 'feeAmount'),
      notes: String(sub.notes || '')
    };
  }) : [];

  return {
    studentId: String(record.studentId || ''),
    month: String(record.month || ''),
    feeAmount,
    paidAmount,
    status: record.status === 'paid' || record.status === 'partial' || record.status === 'unpaid' ? record.status : 'unpaid',
    paymentDate: String(record.paymentDate || ''),
    paymentMethod: String(record.paymentMethod || ''),
    notes: String(record.notes || ''),
    subjectBreakdown: breakdown
  };
}

export async function saveTuitionRecord(record) {
  if (!record.id) {
    record.id = `TUI-${record.month.replace('-', '')}-${Date.now().toString().slice(-4)}`;
  }
  const dataToSave = validateAndWhitelistTuition(record);
  await setDoc(doc(db, COLLECTIONS.TUITION, record.id), dataToSave);
  return record;
}

export async function syncMonthlyTuition(monthStr, students, existingRecords) {
  // Import calculateTuitionForMonth dynamically or at the top
  const { calculateTuitionForMonth } = await import('./tuitionCalculator.js');
  let updated = false;
  const batch = writeBatch(db);
  
  students.forEach(student => {
    if (!existingRecords.some(r => r.studentId === student.id && r.month === monthStr)) {
      const calcResult = calculateTuitionForMonth(student, monthStr);
      
      const docId = `TUI-${monthStr.replace('-', '')}-${student.id}`;
      const newRec = {
        studentId: student.id,
        month: monthStr,
        feeAmount: calcResult.feeAmount,
        paidAmount: 0,
        status: 'unpaid',
        paymentDate: '',
        paymentMethod: '',
        notes: calcResult.notes || ''
      };
      const docRef = doc(collection(db, COLLECTIONS.TUITION), docId);
      batch.set(docRef, newRec);
      updated = true;
    }
  });
  
  if (updated) {
    await batch.commit();
  }
}

// Subscribe to collections (for AppContext)
export function subscribeToCollection(collectionName, callback) {
  const q = query(collection(db, collectionName));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => {
      // For subjects/teachers, we might have stored { name: '...' }
      const docData = doc.data();
      if (collectionName === COLLECTIONS.SUBJECTS || collectionName === COLLECTIONS.TEACHERS) {
        return docData.name || doc.id; 
      }
      return { id: doc.id, ...docData };
    });
    callback(data);
  });
}

// Pagination for students (Real-time with increasing limit)
export function subscribeToStudentsPaginated(pageSize, callback) {
  const q = query(
    collection(db, COLLECTIONS.STUDENTS),
    orderBy(documentId(), 'asc'),
    limit(pageSize)
  );
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
}

export async function getStudentsCount() {
  try {
    const coll = collection(db, COLLECTIONS.STUDENTS);
    const snapshot = await getCountFromServer(coll);
    return snapshot.data().count;
  } catch (err) {
    console.error("Lỗi getStudentsCount:", err);
    return 0;
  }
}

// --- Settings ---
export async function getSettings(docId = 'general') {
  try {
    const snap = await getDocs(query(collection(db, COLLECTIONS.SETTINGS)));
    let data = {};
    snap.forEach(d => {
      if (d.id === docId) data = d.data();
    });
    return data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return {};
  }
}

export async function saveSettings(docId = 'general', data) {
  try {
    const ref = doc(db, COLLECTIONS.SETTINGS, docId);
    await setDoc(ref, data, { merge: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

export function subscribeToSettings(docId, callback) {
  const ref = doc(db, COLLECTIONS.SETTINGS, docId);
  return onSnapshot(ref, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    } else {
      callback({});
    }
  }, (error) => {
    console.error('Error subscribing to settings:', error);
  });
}

// --- Formatting ---(Keep unchanged) ====
export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}
export function formatDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}
export function calculateAge(dobStr) {
  if (!dobStr) return null;
  const diff = Date.now() - new Date(dobStr).getTime();
  const age = new Date(diff).getUTCFullYear() - 1970;
  return age > 0 ? `${age} tuổi` : null;
}
export function getSavedTheme() {
  return localStorage.getItem('qlhs_app_theme') || 'light';
}
export function saveTheme(theme) {
  localStorage.setItem('qlhs_app_theme', theme);
}

// --- Backup & Restore ---
export async function exportDatabase() {
  const data = {};
  const collectionsToExport = [COLLECTIONS.STUDENTS, COLLECTIONS.TUITION, COLLECTIONS.SUBJECTS, COLLECTIONS.TEACHERS, COLLECTIONS.USERS, COLLECTIONS.SETTINGS];
  
  for (const coll of collectionsToExport) {
    try {
      const snap = await getDocs(collection(db, coll));
      data[coll] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.warn(`Lỗi khi export collection ${coll}:`, e);
    }
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `webtt_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importDatabase(jsonData) {
  try {
    const data = JSON.parse(jsonData);
    const collectionsToImport = [COLLECTIONS.STUDENTS, COLLECTIONS.TUITION, COLLECTIONS.SUBJECTS, COLLECTIONS.TEACHERS, COLLECTIONS.USERS, COLLECTIONS.SETTINGS];
    
    let count = 0;
    let currentBatch = writeBatch(db);
    let batches = [currentBatch];

    for (const coll of collectionsToImport) {
      if (data[coll] && Array.isArray(data[coll])) {
        for (const item of data[coll]) {
          const { id, ...rest } = item;
          if (!id) continue;
          
          let sanitized = {};
          if (coll === COLLECTIONS.STUDENTS) {
            sanitized = validateAndWhitelistStudent(rest, false);
          } else if (coll === COLLECTIONS.TUITION) {
            sanitized = validateAndWhitelistTuition(rest);
          } else if (coll === COLLECTIONS.USERS) {
            // Admin import users: whitelist to prevent dangerous fields injected in JSON
            sanitized = {
              email: String(rest.email || ''),
              displayName: String(rest.displayName || ''),
              role: (rest.role === 'admin' || rest.role === 'staff') ? rest.role : 'user',
              username: String(rest.username || '')
            };
          } else {
            // For settings, teachers, subjects: just copy basic string properties or specific schema
            // If they are objects, we shallow clone safely.
            // Simplified safe copy:
            for (const key of Object.keys(rest)) {
              if (typeof rest[key] === 'string' || typeof rest[key] === 'number' || typeof rest[key] === 'boolean' || Array.isArray(rest[key])) {
                sanitized[key] = rest[key];
              }
            }
          }

          const ref = doc(db, coll, id);
          currentBatch.set(ref, sanitized);
          count++;
          
          if (count >= 490) { // Firestore batch limit is 500
            currentBatch = writeBatch(db);
            batches.push(currentBatch);
            count = 0;
          }
        }
      }
    }
    
    for (const b of batches) {
      await b.commit();
    }
    return true;
  } catch (err) {
    console.error("Lỗi khôi phục:", err);
    throw err;
  }
}
