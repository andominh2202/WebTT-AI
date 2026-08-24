import { collection, doc, setDoc, getDoc, getDocs, onSnapshot, writeBatch, deleteDoc, query, where, limit, startAfter, orderBy, getCountFromServer } from 'firebase/firestore';
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
    
    const ref = doc(db, COLLECTIONS.STUDENTS, student.id);
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

export async function authenticateUser(emailOrUsername, password) {
  let loginEmail = emailOrUsername;
  let userData = null;

  try {
    const usersSnap = await getDocs(collection(db, COLLECTIONS.USERS));
    const found = usersSnap.docs.find(d => {
      const data = d.data();
      return data.username === emailOrUsername || data.email === emailOrUsername;
    });

    if (found) {
      userData = found.data();
      loginEmail = userData.email;
    }
  } catch (err) {
    console.warn("Lỗi truy vấn users pre-login (do security rules), tiếp tục đăng nhập trực tiếp bằng email.");
  }

  const userCredential = await signInWithEmailAndPassword(auth, loginEmail, password);
  const user = userCredential.user;
  
  if (!userData) {
    try {
      const usersSnap = await getDocs(collection(db, COLLECTIONS.USERS));
      const found = usersSnap.docs.find(d => {
        const data = d.data();
        return data.email === user.email || data.username === emailOrUsername;
      });
      if (found) {
        userData = found.data();
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin user post-login:", err);
    }
  }

  if (userData) {
    return {
      uid: user.uid,
      email: user.email,
      username: userData.username || emailOrUsername,
      role: userData.role,
      displayName: userData.displayName
    };
  }
  
  return {
    uid: user.uid,
    email: user.email,
    username: emailOrUsername,
    role: 'user',
    displayName: emailOrUsername.split('@')[0]
  };
}

export async function logoutUser() {
  await signOut(auth);
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

// Pagination for students (Real-time with increasing limit)
export function subscribeToStudentsPaginated(pageSize, callback) {
  const q = query(
    collection(db, COLLECTIONS.STUDENTS),
    orderBy('id', 'asc'),
    limit(pageSize)
  );
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => doc.data());
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
          const ref = doc(db, coll, id);
          currentBatch.set(ref, rest);
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
