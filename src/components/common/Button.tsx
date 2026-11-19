import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 ease-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]";

  const variants = {
    primary:
      "bg-gradient-to-r from-[#052e6e] to-[#0284c7] text-white shadow-sm hover:from-[#031d47] hover:to-[#0369a1] hover:shadow-[0_10px_25px_-5px_rgba(2,132,199,0.45)]",
    secondary:
      "bg-[#eef4fb] text-[#052e6e] hover:bg-sky-100 hover:shadow-[0_8px_20px_-6px_rgba(5,46,110,0.2)]",
    outline:
      "border border-slate-300 bg-white text-[#052e6e] hover:border-[#0284c7] hover:bg-sky-50/70 hover:text-[#0284c7] hover:shadow-[0_8px_20px_-6px_rgba(2,132,199,0.18)]",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-[#052e6e]",
    danger:
      "bg-[#e11d48] text-white hover:bg-rose-700 hover:shadow-[0_10px_25px_-5px_rgba(225,29,72,0.45)]",
  };

  const sizes = {
    sm: "text-xs px-4 py-2 rounded-xl",
    md: "text-sm px-5 py-2.5 rounded-xl",
    lg: "text-sm sm:text-base px-6 py-3 rounded-2xl",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
