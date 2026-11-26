interface PatientAvatarProps {
  name: string;
  gender?: "Male" | "Female" | "Other";
  size?: "sm" | "md" | "lg";
}

export default function PatientAvatar({
  name,
  gender = "Male",
  size = "md",
}: PatientAvatarProps) {
  const sizeMap = {
    sm: "w-9 h-9",
    md: "w-11 h-11",
    lg: "w-14 h-14",
  };

  const iconSizeMap = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  const isFemale = gender === "Female";

  return (
    <div
      className={`${sizeMap[size]} rounded-full bg-gradient-to-br ${
        isFemale
          ? "from-[#052e6e] via-[#0284c7] to-[#e11d48]"
          : "from-[#02183b] via-[#052e6e] to-[#0284c7]"
      } p-[2px] shrink-0 shadow-xs relative select-none`}
      title={`${name} (${gender})`}
    >
      <div className="w-full h-full rounded-full bg-[#f4f8ff] flex items-center justify-center text-[#052e6e]">
        {isFemale ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${iconSizeMap[size]} text-[#052e6e]`}
          >
            <circle cx="12" cy="8" r="3.5" />
            <path d="M8.5 8.5c0 2.5-1 4-2 5" />
            <path d="M15.5 8.5c0 2.5 1 4 2 5" />
            <path d="M6.5 20a5.5 5.5 0 0 1 11 0" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${iconSizeMap[size]} text-[#052e6e]`}
          >
            <circle cx="12" cy="8" r="3.8" />
            <path d="M6 20a6 6 0 0 1 12 0" />
          </svg>
        )}
      </div>

      {/* مؤشر ثيم ECGenius */}
      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-white flex items-center justify-center shadow-2xs">
        <span
          className={`w-2 h-2 rounded-full ${
            isFemale ? "bg-[#e11d48]" : "bg-[#0284c7]"
          }`}
        />
      </span>
    </div>
  );
}
