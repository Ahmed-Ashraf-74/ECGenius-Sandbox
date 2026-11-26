import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  Stethoscope,
  HeartPulse,
  ShieldAlert,
} from "lucide-react";
import BrandLogo from "../components/common/BrandLogo";
import Button from "../components/common/Button";
import { getStoredSession, clearSession } from "../services/api";

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState(() => getStoredSession());

  const isAuthPage =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register") ||
    location.pathname.startsWith("/forgot-password") ||
    location.pathname.startsWith("/reset-password") ||
    location.pathname.startsWith("/2fa") ||
    location.pathname.startsWith("/unauthorized");

  const dashboardPath =
    session?.role === "doctor"
      ? "/doctor"
      : session?.role === "admin"
        ? "/admin"
        : "/patient";

  const displayName =
    session?.fullName ||
    (session?.role === "doctor"
      ? "Dr. Ahmed Ashraf"
      : session?.role === "admin"
        ? "System Admin"
        : "Mahmoud Abdel-Rahman");

  const handleLogout = () => {
    clearSession();
    setSession(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#eef4fb] text-slate-900 selection:bg-sky-500/20 selection:text-[#052e6e]">
      {/* Framed Luxury Glass Header */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          <BrandLogo size="md" />

          {!isAuthPage && (
            <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a
                href="#overview"
                className="hover:text-[#052e6e] transition-colors"
              >
                Overview
              </a>
              <a
                href="#capabilities"
                className="hover:text-[#052e6e] transition-colors"
              >
                AI Capabilities
              </a>
              <a
                href="#Workflow"
                className="hover:text-[#052e6e] transition-colors"
              >
                Workflow
              </a>
              <a
                href="#xai-compare"
                className="hover:text-[#052e6e] transition-colors"
              >
                XAI Comparison
              </a>
              <a
                href="#gateways"
                className="hover:text-[#052e6e] transition-colors"
              >
                Portals
              </a>
            </nav>
          )}

          {session ? (
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* شارة البروفايل النشط */}
              <Link
                to={dashboardPath}
                className="hidden sm:inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#eef4fb] border border-sky-200/80 hover:border-[#0284c7] transition"
                title="Open Your Workspace"
              >
                <span className="w-7 h-7 rounded-full btn-landing-gradient text-white flex items-center justify-center shrink-0">
                  {session.role === "doctor" ? (
                    <Stethoscope className="w-3.5 h-3.5" />
                  ) : session.role === "admin" ? (
                    <ShieldAlert className="w-3.5 h-3.5" />
                  ) : (
                    <HeartPulse className="w-3.5 h-3.5" />
                  )}
                </span>
                <div className="text-left leading-tight">
                  <p className="text-xs font-extrabold text-[#052e6e]">
                    {displayName}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#0284c7]">
                    {session.role} Portal
                  </p>
                </div>
              </Link>

              <Link to={dashboardPath}>
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-full px-4 sm:px-5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-sky-200" />
                  <span>My Dashboard</span>
                </Button>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                title="Sign Out"
                className="p-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-[#e11d48] transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 hover:text-[#052e6e] px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link to="/register">
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-full px-5"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
