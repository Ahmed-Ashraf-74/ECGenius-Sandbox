import { type ReactNode } from "react";
import { Navigate, Link, useLocation } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Button from "./Button";

export type UserRole = "patient" | "doctor" | "admin";

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

interface StoredSession {
  role: UserRole;
  email: string;
  verified2FA?: boolean;
  loggedInAt: string;
}

const ROLE_HOME: Record<UserRole, string> = {
  patient: "/patient",
  doctor: "/doctor",
  admin: "/admin",
};

export default function ProtectedRoute({
  allowedRoles,
  children,
}: ProtectedRouteProps) {
  const location = useLocation();
  const rawSession = localStorage.getItem("ecgenius_session");

  if (!rawSession) {
    const preferredRole = allowedRoles[0] || "patient";
    return (
      <Navigate
        to={`/login?role=${preferredRole}`}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  let session: StoredSession | null = null;
  try {
    session = JSON.parse(rawSession) as StoredSession;
  } catch {
    localStorage.removeItem("ecgenius_session");
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(session.role)) {
    return (
      <div className="min-h-screen bg-[#eef4fb] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-[2rem] bg-white border border-slate-200/80 shadow-xl p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-[#e11d48] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <span className="inline-block px-3 py-1 rounded-full bg-rose-50 text-[#e11d48] text-xs font-bold uppercase tracking-wider">
              403 • Unauthorized Access
            </span>
            <h1 className="text-2xl font-extrabold text-[#052e6e]">
              Access Restricted
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              You are signed in as{" "}
              <strong className="capitalize text-[#052e6e]">
                {session.role}
              </strong>
              , which does not have permission to view this clinical workspace.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to={ROLE_HOME[session.role]}>
              <Button variant="primary" size="md" className="w-full sm:w-auto">
                Go to My Portal
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="md" className="w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
