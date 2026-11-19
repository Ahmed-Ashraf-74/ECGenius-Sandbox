import { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string | null;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = "info",
  onClose,
  duration = 3200,
}: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const styles: Record<ToastType, { box: string; icon: typeof Info }> = {
    success: {
      box: "bg-emerald-50 border-emerald-200 text-emerald-900",
      icon: CheckCircle2,
    },
    error: {
      box: "bg-rose-50 border-rose-200 text-[#e11d48]",
      icon: AlertCircle,
    },
    info: {
      box: "bg-white border-sky-200 text-[#052e6e]",
      icon: Info,
    },
  };

  const IconComponent = styles[type].icon;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
      <div
        className={`pointer-events-auto rounded-2xl border px-4 py-3.5 shadow-xl flex items-center justify-between gap-3 ${styles[type].box}`}
      >
        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
          <IconComponent className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="text-current/70 hover:text-current cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
