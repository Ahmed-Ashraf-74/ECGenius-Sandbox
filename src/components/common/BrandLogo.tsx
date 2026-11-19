import { Link } from "react-router-dom";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  darkText?: boolean;
}

export default function BrandLogo({
  size = "md",
  showTagline = false,
  darkText = false,
}: BrandLogoProps) {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <Link to="/" className="inline-flex items-center gap-3 group select-none">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-sky-400/25 blur-md group-hover:bg-rose-500/25 transition-colors duration-300" />
        <img
          src="/images/glass-heart.png"
          alt="ECGenius Logo"
          className={`${iconSizes[size]} object-contain relative z-10 transition-transform duration-300 group-hover:scale-105`}
        />
      </div>

      <div className="flex flex-col">
        <div
          className={`font-extrabold tracking-tight leading-none ${textSizes[size]}`}
        >
          <span className={darkText ? "text-white" : "text-[#052e6e]"}>
            ECG
          </span>
          <span className="bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] bg-clip-text text-transparent">
            enius
          </span>
        </div>

        {showTagline && (
          <span
            className={`text-[10px] font-semibold tracking-[0.22em] uppercase mt-1 ${
              darkText ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Smarter Heart Care
          </span>
        )}
      </div>
    </Link>
  );
}
