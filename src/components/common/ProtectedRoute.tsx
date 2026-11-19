import { Link, Outlet } from "react-router-dom";
import { ShieldAlert, ArrowLeft, LogIn } from "lucide-react";
import Button from "./Button";

type AllowedRole = "doctor" | "patient" | "support";

interface ProtectedRouteProps {
  allowedRoles: AllowedRole[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const rawSession = localStorage.getItem("ecgenius_session");
  let session: { role?: AllowedRole; email?: string } | null = null;

  if (rawSession) {
    try {
      session = JSON.parse(rawSession);
    } catch {
      session = null;
    }
  }

  const currentRole = session?.role;
  const isAuthorized = currentRole && allowedRoles.includes(currentRole);

  if (isAuthorized) {
    return <Outlet />;
  }

  const targetRole = allowedRoles[0];

  return (
    <div className="min-h-screen bg-[#eef4fb] flex flex-col justify-center items-center px-4 sm:px-6 py-8">
      <div className="max-w-4xl w-full rounded-[2.5rem] bg-white shadow-[0_25px_80px_-20px_rgba(5,46,110,0.18)] p-3.5 sm:p-4 grid md:grid-cols-12 gap-6 items-stretch">
        {/* Left Mesh Gradient Card */}
        <div className="md:col-span-5 rounded-[2rem] bg-gradient-to-br from-[#02183b] via-[#052e6e] to-[#0284c7] animate-gradient-shift text-white p-7 flex flex-col justify-between relative overflow-hidden">
          <div className="pointer-events-none absolute -top-16 -right-12 w-56 h-56 rounded-full bg-sky-300/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-12 w-48 h-48 rounded-full bg-rose-500/25 blur-3xl" />

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2">
              <img
                src="/images/glass-heart.png"
                alt="ECGenius"
                className="w-7 h-7 object-contain"
              />
              <span className="text-lg font-black tracking-tight text-white">
                ECG<span className="text-sky-300">enius</span>
              </span>
            </Link>
          </div>

          <div className="relative z-10 my-8">
            <span className="inline-block px-3 py-1 rounded-full bg-rose-500/25 border border-rose-400/35 text-rose-200 text-xs font-bold">
              HTTP 403 - RBAC Guard
            </span>
            <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold leading-tight">
              Protected Clinical Workspace
            </h1>
            <p className="mt-2.5 text-xs sm:text-sm font-normal text-sky-100/85 leading-relaxed">
              ECGenius enforces strict role-based access control to protect
              patient ECG telemetry and clinical records.
            </p>
          </div>

          <p className="relative z-10 text-[11px] font-normal text-sky-200/75">
            HIPAA & Clinical Audit Protected
          </p>
        </div>

        {/* Right Unauthorized Explanation */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#e11d48] flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <h2 className="text-2xl font-extrabold text-[#052e6e] tracking-tight">
            Unauthorized Access
          </h2>
          <p className="mt-2 text-sm font-normal text-slate-600 leading-relaxed">
            {currentRole ? (
              <>
                You are currently signed in with the{" "}
                <strong className="capitalize">{currentRole}</strong> role,
                which does not have permission to view this portal.
              </>
            ) : (
              <>
                You must sign in with an authorized{" "}
                <strong className="capitalize">{targetRole}</strong> account to
                access this clinical workspace.
              </>
            )}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link to={`/login?role=${targetRole}`}>
              <Button variant="primary" size="md" className="rounded-xl">
                <LogIn className="w-4 h-4" />
                Sign In as{" "}
                {targetRole.charAt(0).toUpperCase() + targetRole.slice(1)}
              </Button>
            </Link>

            {currentRole ? (
              <Link to={`/${currentRole}`}>
                <Button variant="outline" size="md" className="rounded-xl">
                  Go to My{" "}
                  {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}{" "}
                  Portal
                </Button>
              </Link>
            ) : (
              <Link to="/">
                <Button variant="outline" size="md" className="rounded-xl">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
