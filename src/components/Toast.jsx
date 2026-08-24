import { useUI } from "../context/UIContext";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { useStudent } from "../context/StudentContext";
import { useTuition } from "../context/TuitionContext";
import { CheckCircle, AlertOctagon, AlertTriangle, Info } from 'lucide-react';

const iconMap = {
  success: CheckCircle,
  danger: AlertOctagon,
  warning: AlertTriangle,
  info: Info,
};

export default function Toast() {
  const { toasts } = useUI();

  return (
    <div className="toast-container" id="toast-container">
      {toasts.map(t => {
        const Icon = iconMap[t.type] || Info;
        return (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <div className="toast-icon"><Icon size={20} /></div>
            <div className="toast-content">
              <div className="toast-title">{t.title}</div>
              <div className="toast-msg">{t.message}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
