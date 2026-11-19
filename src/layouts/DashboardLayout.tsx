import { Outlet, Link, useLocation } from "react-router-dom";

export default function DashboardLayout() {
  const location = useLocation();
  const isDoctor = location.pathname.startsWith("/doctor");

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6">
        <Link to="/" className="text-2xl font-bold text-emerald-400 mb-8">
          ECGenius
        </Link>

        <div className="text-xs uppercase tracking-wider text-slate-400 mb-3">
          {isDoctor ? "Doctor Workspace" : "Patient Workspace"}
        </div>

        <nav className="flex flex-col gap-2 text-sm">
          <Link
            to={isDoctor ? "/doctor" : "/patient"}
            className="px-3 py-2 rounded-lg bg-slate-800 text-emerald-400 font-medium"
          >
            Overview
          </Link>
          <Link
            to="/"
            className="px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition"
          >
            Back to Home
          </Link>
        </nav>
      </aside>

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <span className="font-semibold text-slate-700">
            {isDoctor ? "Doctor Dashboard" : "Patient Dashboard"}
          </span>
          <Link to="/login" className="text-sm text-rose-600 hover:underline">
            Logout
          </Link>
        </header>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
