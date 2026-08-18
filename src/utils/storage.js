import { collection, doc, getDocs, setDoc, deleteDoc, query, onSnapshot, writeBatch, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { INITIAL_STUDENTS, INITIAL_TUITION_RECORDS, INITIAL_SUBJECTS, INITIAL_TEACHERS, CLASS_MAP } from '../data/mockData';

const COLLECTIONS = {
  STUDENTS: 'students',
  TUITION: 'tuition',
  SUBJECTS: 'subjects',
  TEACHERS: 'teachers',
  USERS: 'users',
};

// Initialize default data if empty (Optional, but good for first run)
export async function initStorage() {
  // Initialize users if empty
  const usersSnap = await getDocs(collection(db, COLLECTIONS.USERS));
  if (usersSnap.empty) {
    const batch = writeBatch(db);
    const defaultUsers = [
      { id: 'admin', username: 'admin', password: 'admin', role: 'admin', displayName: 'Quản trị viên' },
      { id: 'user', username: 'user', password: 'user', role: 'user', displayName: 'Nhân viên' }
    ];
    defaultUsers.forEach(u => {
      const docRef = doc(collection(db, COLLECTIONS.USERS), u.id);
      batch.set(docRef, u);
    });
    await batch.commit();
  }

  const studentsSnap = await getDocs(collection(db, COLLECTIONS.STUDENTS));
  if (studentsSnap.empty) {
    const batch = writeBatch(db);
    INITIAL_STUDENTS.forEach(s => {
      const docRef = doc(collection(db, COLLECTIONS.STUDENTS), s.id);
      batch.set(docRef, s);
    });
    INITIAL_TUITION_RECORDS.forEach(t => {
      const docRef = doc(collection(db, COLLECTIONS.TUITION), t.id);
      batch.set(docRef, t);
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

export async function authenticateUser(username, password) {
  const u = username.trim().toLowerCase();
  const usersSnap = await getDocs(collection(db, COLLECTIONS.USERS));
  const found = usersSnap.docs.find(d => {
    const data = d.data();
    return data.username.toLowerCase() === u && data.password === password;
  });
  if (found) {
    const data = found.data();
    return {
      username: data.username,
      role: data.role,
      displayName: data.displayName
    };
  }
  return null;
}

// ==== Async CRUD Operations ====

export async function addStudent(student) {
  if (!student.id) {
    const snap = await getDocs(collection(db, COLLECTIONS.STUDENTS));
    const maxIdNum = snap.docs.reduce((max, d) => {
      const num = parseInt(d.id.replace('STU-', '')) || 0;
      return num > max ? num : max;
    }, 0);
    student.id = `STU-${String(maxIdNum + 1).padStart(3, '0')}`;
  }
  student.createdAt = student.createdAt || new Date().toISOString().split('T')[0];
  await setDoc(doc(db, COLLECTIONS.STUDENTS, student.id), student);
  return student;
}

export async function updateStudent(student) {
  await setDoc(doc(db, COLLECTIONS.STUDENTS, student.id), student, { merge: true });
  return student;
}

export async function deleteStudent(id) {
  await deleteDoc(doc(db, COLLECTIONS.STUDENTS, id));
  // Tuitions should ideally be deleted via cloud function or batch, 
  // but for simplicity we do it client-side.
  const tSnap = await getDocs(collection(db, COLLECTIONS.TUITION));
  const batch = writeBatch(db);
  tSnap.docs.forEach(d => {
    if (d.data().studentId === id) batch.delete(d.ref);
  });
  await batch.commit();
}

export async function saveTuitionRecord(record) {
  if (!record.id) {
    record.id = `TUI-${record.month.replace('-', '')}-${Date.now().toString().slice(-4)}`;
  }
  await setDoc(doc(db, COLLECTIONS.TUITION, record.id), record);
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
      
      const newRec = {
        id: `TUI-${monthStr.replace('-', '')}-${student.id}`,
        studentId: student.id,
        month: monthStr,
        feeAmount: calcResult.feeAmount,
        paidAmount: 0,
        status: 'unpaid',
        paymentDate: '',
        paymentMethod: '',
        notes: calcResult.notes || ''
      };
      const docRef = doc(collection(db, COLLECTIONS.TUITION), newRec.id);
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
      return docData;
    });
    callback(data);
  });
}

// ==== Formatters (Keep unchanged) ====
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
