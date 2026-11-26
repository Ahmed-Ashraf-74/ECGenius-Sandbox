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
  const base =
    "inline-flex items-center justify-center gap-2 font-bold rounded-full transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: "btn-landing-gradient text-white",
    secondary:
      "bg-white text-[#052e6e] border border-slate-200 hover:bg-sky-50 shadow-2xs",
    outline:
      "bg-transparent text-[#052e6e] border border-[#052e6e]/30 hover:border-[#0284c7] hover:text-[#0284c7]",
    ghost: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-[#e11d48] text-white hover:bg-rose-700",
  };

  const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "px-4 py-2 text-xs",
    md: "px-5 py-2.5 text-xs sm:text-sm",
    lg: "px-6 py-3 text-sm",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
