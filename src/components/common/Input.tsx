import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  rightElement?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, rightElement, className = "", id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3.5 text-slate-400 pointer-events-none">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none
              ${icon ? "pl-10" : ""}
              ${rightElement ? "pr-10" : ""}
              ${
                error
                  ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  : "border-slate-300 focus:border-[#0284c7] focus:ring-2 focus:ring-sky-500/20"
              }
              ${className}`}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3 flex items-center">
              {rightElement}
            </div>
          )}
        </div>

        {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
