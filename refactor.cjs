const fs = require('fs');
const files = [
  'src/components/tuition/ReceiptModal.jsx',
  'src/components/tuition/PaymentModal.jsx',
  'src/components/Toast.jsx',
  'src/components/Sidebar.jsx',
  'src/components/students/StudentModal.jsx',
  'src/components/students/StudentList.jsx',
  'src/components/students/StudentDetailModal.jsx',
  'src/components/settings/SettingsPage.jsx',
  'src/components/Login.jsx',
  'src/components/Header.jsx',
  'src/components/reports/ReportsPage.jsx',
  'src/App.jsx',
  'src/components/dashboard/Dashboard.jsx'
];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/import \{ useApp \} from '.*AppContext';/, 'import { useUI } from "../../context/UIContext";\nimport { useAuth } from "../../context/AuthContext";\nimport { useSettings } from "../../context/SettingsContext";\nimport { useStudent } from "../../context/StudentContext";\nimport { useTuition } from "../../context/TuitionContext";');
  
  if (f.includes('ReceiptModal')) {
    content = content.replace('const { students, tuition } = useApp();', 'const { students } = useStudent();\n  const { tuition } = useTuition();');
  } else if (f.includes('PaymentModal')) {
    content = content.replace('const { students, tuition, saveTuition, showToast } = useApp();', 'const { students } = useStudent();\n  const { tuition, saveTuition } = useTuition();\n  const { showToast } = useUI();');
  } else if (f.includes('Toast')) {
    content = content.replace('const { toasts } = useApp();', 'const { toasts } = useUI();');
  } else if (f.includes('Sidebar')) {
    content = content.replace('const { currentTab, switchTab, theme, toggleTheme, currentUser, logout } = useApp();', 'const { currentTab, switchTab, theme, toggleTheme } = useUI();\n  const { currentUser, logout } = useAuth();');
  } else if (f.includes('StudentModal')) {
    content = content.replace('const { students, addStudent, updateStudent, showToast, teacherFees } = useApp();', 'const { students, addStudent, updateStudent } = useStudent();\n  const { teacherFees } = useSettings();\n  const { showToast } = useUI();');
  } else if (f.includes('StudentList')) {
    content = content.replace('const { students, subjects, deleteStudent, showToast, currentUser } = useApp();', 'const { students, deleteStudent } = useStudent();\n  const { subjects } = useSettings();\n  const { currentUser } = useAuth();\n  const { showToast } = useUI();');
  } else if (f.includes('StudentDetailModal')) {
    content = content.replace('const { tuition, students } = useApp();', 'const { tuition } = useTuition();\n  const { students } = useStudent();');
  } else if (f.includes('SettingsPage')) {
    content = content.replace('const { exportBackup, importBackup, resetData } = useApp();', 'const { exportBackup, importBackup } = useSettings();\n  const resetData = () => {}; // disabled');
  } else if (f.includes('Login')) {
    content = content.replace('const { login } = useApp();', 'const { login } = useAuth();');
  } else if (f.includes('Header')) {
    content = content.replace('const { currentTab } = useApp();', 'const { currentTab } = useUI();');
  } else if (f.includes('ReportsPage')) {
    content = content.replace('const { students, tuition, subjects } = useApp();', 'const { students } = useStudent();\n  const { tuition } = useTuition();\n  const { subjects } = useSettings();');
  } else if (f.includes('App.jsx')) {
    content = content.replace('const { currentTab, currentUser, switchTab } = useApp();', 'const { currentTab, switchTab } = useUI();\n  const { currentUser } = useAuth();');
  } else if (f.includes('Dashboard')) {
    content = content.replace('const { students, tuition, switchTab } = useApp();', 'const { students } = useStudent();\n  const { tuition } = useTuition();\n  const { switchTab } = useUI();');
  }

  // Adjust relative paths based on depth
  const depth = f.split('/').length;
  if (depth === 2) { // src/App.jsx
    content = content.replace(/\"\.\.\/\.\.\/context\//g, '"./context/');
  } else if (depth === 3) { // src/components/Login.jsx
    content = content.replace(/\"\.\.\/\.\.\/context\//g, '"../context/');
  }

  fs.writeFileSync(f, content);
});
console.log('Refactoring done');
