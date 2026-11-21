import {
  Users,
  ShieldCheck,
  Activity,
  FileText,
  Server,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { clearSession, getStoredSession } from "../../services/api";

const adminModules = [
  {
    title: "User Management",
    subtitle: "إدارة المستخدمين",
    description:
      "View registered accounts, provision Doctor accounts, and activate or deactivate user access.",
    icon: Users,
    badge: "Accounts & Doctors",
  },
  {
    title: "Role & Permission Management",
    subtitle: "إدارة الصلاحيات",
    description:
      "Configure role-based access control (RBAC) matrices across Patient, Doctor, and Admin roles.",
    icon: ShieldCheck,
    badge: "RBAC Matrix",
  },
  {
    title: "Platform Monitoring",
    subtitle: "متابعة النظام",
    description:
      "Track total patients, doctors, uploaded 12-lead ECGs, generated reports, and failed operations.",
    icon: Activity,
    badge: "Live Telemetry",
  },
  {
    title: "Immutable Audit Logs",
    subtitle: "سجل العمليات",
    description:
      "Tamper-protected log of logins, account changes, ECG uploads, and clinical report approvals.",
    icon: FileText,
    badge: "Tamper-Protected",
  },
  {
    title: "System Management",
    subtitle: "إدارة النظام",
    description:
      "Inspect core microservice health, allowed system settings, and operational alerts.",
    icon: Server,
    badge: "Core Services",
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const session = getStoredSession();

  const handleLogout = () => {
    clearSession();
    navigate("/login?role=admin");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-[2rem] bg-gradient-to-br from-[#02183b] via-[#052e6e] to-[#0284c7] text-white p-7 sm:p-9 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-lg">
        <div>
          <span className="inline-block px-3.5 py-1 rounded-full bg-white/15 text-xs font-semibold text-sky-100">
            Admin Governance Console • Flow 4 Ready
          </span>
          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
            ECGenius System Administration
          </h1>
          <p className="mt-1.5 text-sm text-sky-100/85">
            Signed in as{" "}
            <strong>{session?.email || "admin@ecgenius.health"}</strong>
          </p>
        </div>
        <Button
          variant="secondary"
          size="md"
          onClick={handleLogout}
          className="self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* 5 Core Admin Modules Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminModules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.title}
              className="rounded-[2rem] bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-[#eef4fb] text-[#052e6e] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#0284c7]" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-[11px] font-bold text-[#052e6e]">
                    {mod.badge}
                  </span>
                </div>
                <h2 className="mt-4 text-lg font-extrabold text-[#052e6e]">
                  {mod.title}
                </h2>
                <p className="text-xs font-semibold text-[#0284c7] mt-0.5">
                  {mod.subtitle}
                </p>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {mod.description}
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-400">
                Scheduled for Flow 4 implementation
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
