import { Outlet, Link, useLocation } from "react-router-dom";
import BrandLogo from "../components/common/BrandLogo";
import Button from "../components/common/Button";

export default function MainLayout() {
  const location = useLocation();
  const isAuthPage =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register") ||
    location.pathname.startsWith("/forgot-password") ||
    location.pathname.startsWith("/reset-password") ||
    location.pathname.startsWith("/2fa") ||
    location.pathname.startsWith("/unauthorized");

  return (
    <div className="min-h-screen flex flex-col bg-[#eef4fb] text-slate-900 selection:bg-sky-500/20 selection:text-[#052e6e]">
      {/* Framed Luxury Glass Header (Inspired by Celestia Smiles) */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <BrandLogo size="md" />

          {!isAuthPage && (
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
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

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-700 hover:text-[#052e6e] px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm" className="rounded-full px-5">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
