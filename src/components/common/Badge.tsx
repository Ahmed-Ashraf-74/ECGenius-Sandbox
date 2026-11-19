import type { ReactNode } from "react";

interface BadgeProps {
  variant?: "info" | "success" | "warning" | "critical" | "neutral";
  pulse?: boolean;
  children: ReactNode;
}

export default function Badge({
  variant = "info",
  pulse = false,
  children,
}: BadgeProps) {
  const styles = {
    info: "bg-sky-50 text-[#0284c7] border-sky-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    critical: "bg-rose-50 text-rose-700 border-rose-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const dotColors = {
    info: "bg-sky-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    critical: "bg-rose-600",
    neutral: "bg-slate-500",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles[variant]}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[variant]}`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${dotColors[variant]}`}
          />
        </span>
      )}
      {children}
    </span>
  );
}
