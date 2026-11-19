import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidthClass?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidthClass = "max-w-lg",
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#02183b]/50 backdrop-blur-xs transition-opacity"
      />

      <div
        className={`relative z-10 w-full ${maxWidthClass} rounded-3xl bg-white border border-slate-200/80 shadow-2xl overflow-hidden`}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-extrabold text-[#052e6e] tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs font-normal text-slate-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-[#052e6e] flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>

        {footer && (
          <div className="px-6 py-4 bg-[#eef4fb]/70 border-t border-slate-100 flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
