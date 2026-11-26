import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Users,
  Activity,
  FilePlus2,
  FileCheck2,
  MessageSquareHeart,
  Bell,
  Settings,
  Home,
  LogOut,
  Menu,
  X,
  PanelLeft,
  Stethoscope,
  HeartPulse,
  ShieldAlert,
} from "lucide-react";
import { clearSession, getStoredSession } from "../services/api";
import { clinicalService } from "../services/clinicalMockService";

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const session = getStoredSession();
  const isDoctor = location.pathname.startsWith("/doctor");
  const isAdmin = location.pathname.startsWith("/admin");

  const { data: threads = [] } = useQuery({
    queryKey: ["consultation-threads"],
    queryFn: () => clinicalService.getConsultationThreads(),
    refetchInterval: 2000,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => clinicalService.getNotifications(),
    refetchInterval: 3000,
  });

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "ecgenius_clinical_store_v4") {
        queryClient.invalidateQueries({ queryKey: ["consultation-threads"] });
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [queryClient]);

  const doctorUnreadChatCount = threads.reduce(
    (sum, t) => sum + (t.doctorUnreadCount ?? t.unreadCount ?? 0),
    0,
  );
  const patientUnreadChatCount = threads.reduce(
    (sum, t) => sum + (t.patientUnreadCount ?? 0),
    0,
  );
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    clearSession();
    const roleParam = isDoctor ? "doctor" : isAdmin ? "admin" : "patient";
    navigate(`/login?role=${roleParam}`);
  };

  const clinicalNav = isDoctor
    ? [
        {
          label: "Dashboard",
          to: "/doctor",
          icon: LayoutDashboard,
          exact: true,
          badge: null as string | null,
        },
        {
          label: "Start Examination",
          to: "/doctor/start-exam",
          icon: FilePlus2,
          exact: false,
          badge: null as string | null,
        },
        {
          label: "Examinations",
          to: "/doctor/examinations",
          icon: Activity,
          exact: false,
          badge: null as string | null,
        },
        {
          label: "Patients",
          to: "/doctor/patients",
          icon: Users,
          exact: false,
          badge: null as string | null,
        },
      ]
    : isAdmin
      ? [
          {
            label: "Admin Overview",
            to: "/admin",
            icon: ShieldAlert,
            exact: true,
            badge: null as string | null,
          },
        ]
      : [
          {
            label: "Heart Dashboard",
            to: "/patient",
            icon: HeartPulse,
            exact: true,
            badge: null as string | null,
          },
          {
            label: "Consultations & Chat",
            to: "/patient/consultations",
            icon: MessageSquareHeart,
            exact: false,
            badge:
              patientUnreadChatCount > 0
                ? String(patientUnreadChatCount)
                : null,
          },
        ];

  const secondaryNav = isDoctor
    ? [
        {
          label: "Reports",
          to: "/doctor/reports",
          icon: FileCheck2,
          badge: null as string | null,
        },
        {
          label: "Consultations",
          to: "/doctor/consultations",
          icon: MessageSquareHeart,
          badge:
            doctorUnreadChatCount > 0 ? String(doctorUnreadChatCount) : null,
        },
        {
          label: "Notifications",
          to: "/doctor/notifications",
          icon: Bell,
          badge: unreadNotifCount > 0 ? String(unreadNotifCount) : null,
        },
        {
          label: "Settings",
          to: "/doctor/settings",
          icon: Settings,
          badge: null as string | null,
        },
      ]
    : [];

  const isRouteActive = (to: string, exact = false) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  const pageTitleMap: Record<string, string> = {
    "/doctor": "Clinical Overview",
    "/doctor/start-exam": "Start New ECG Examination",
    "/doctor/examinations": "12-Lead ECG Examinations",
    "/doctor/patients": "Patient Management",
    "/doctor/reports": "Clinical Reports Archive",
    "/doctor/consultations": "Patient Consultations & Chat",
    "/doctor/notifications": "Notifications Center",
    "/doctor/settings": "Doctor Profile & Settings",
    "/patient": "My Heart Health Dashboard",
    "/patient/consultations": "Cardiologist Consultations & Chat",
  };

  const currentHeading =
    Object.entries(pageTitleMap).find(([path]) =>
      path === "/doctor" || path === "/patient"
        ? location.pathname === path
        : location.pathname.startsWith(path),
    )?.[1] || "ECGenius Workspace";

  const SidebarBody = ({ isMobile = false }: { isMobile?: boolean }) => {
    const mini = !isMobile && collapsed;
    return (
      <div className="flex flex-col h-full justify-between py-6 px-3.5 select-none bg-[#fbfdff]">
        <div className="space-y-6">
          {/* Logo + Collapse Button */}
          <div
            className={`flex items-center ${
              mini ? "justify-center" : "justify-between px-2"
            }`}
          >
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center gap-2.5"
            >
              <div className="w-9 h-9 rounded-xl btn-landing-gradient flex items-center justify-center shadow-xs">
                <img
                  src="/images/glass-heart.png"
                  alt="ECGenius"
                  className="w-5 h-5 object-contain"
                />
              </div>
              {!mini && (
                <span className="text-lg font-black tracking-tight text-[#052e6e]">
                  ECG<span className="text-[#0284c7]">enius</span>
                </span>
              )}
            </Link>

            {!isMobile && (
              <button
                type="button"
                onClick={() => setCollapsed((c) => !c)}
                className="hidden lg:inline-flex p-1.5 rounded-xl text-slate-400 hover:text-[#052e6e] hover:bg-slate-100 transition cursor-pointer"
                title={mini ? "Expand" : "Collapse"}
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Group 1: Clinical Core */}
          <div>
            {!mini && (
              <p className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                {isDoctor ? "Clinical Core" : "Patient Portal"}
              </p>
            )}
            <nav className="space-y-1">
              {clinicalNav.map((item) => {
                const Icon = item.icon;
                const active = isRouteActive(item.to, item.exact);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    title={mini ? item.label : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center ${
                      mini ? "justify-center px-2" : "justify-between px-3"
                    } py-2.5 rounded-2xl text-[13px] font-bold transition-all ${
                      active
                        ? "bg-white text-[#052e6e] shadow-[0_6px_18px_-6px_rgba(5,46,110,0.16)] border border-sky-100"
                        : "text-slate-500 hover:bg-white/80 hover:text-[#052e6e]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`relative w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                          active
                            ? "btn-landing-gradient text-white"
                            : "bg-slate-100/90 text-slate-500"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {mini && item.badge && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#e11d48] ring-2 ring-white" />
                        )}
                      </span>
                      {!mini && <span className="truncate">{item.label}</span>}
                    </div>
                    {!mini && item.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-[#e11d48] text-white text-[10px] font-extrabold animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Group 2: Reports, Chat & System */}
          {secondaryNav.length > 0 && (
            <div>
              {!mini && (
                <p className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Records & Comms
                </p>
              )}
              <nav className="space-y-1">
                {secondaryNav.map((item) => {
                  const Icon = item.icon;
                  const active = isRouteActive(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      title={mini ? item.label : undefined}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center ${
                        mini ? "justify-center px-2" : "justify-between px-3"
                      } py-2.5 rounded-2xl text-[13px] font-bold transition-all ${
                        active
                          ? "bg-white text-[#052e6e] shadow-[0_6px_18px_-6px_rgba(5,46,110,0.16)] border border-sky-100"
                          : "text-slate-500 hover:bg-white/80 hover:text-[#052e6e]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`relative w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                            active
                              ? "btn-landing-gradient text-white"
                              : "bg-slate-100/90 text-slate-500"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {mini && item.badge && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#e11d48] ring-2 ring-white" />
                          )}
                        </span>
                        {!mini && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>
                      {!mini && item.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-[#e11d48] text-white text-[10px] font-extrabold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Bottom Profile & Home (Ø¨Ø¯ÙˆÙ† Ù…Ø³Ø­ Ø§Ù„Ø³ÙŠØ´Ù† Ø¹Ù†Ø¯ Ø§Ù„Ø°Ù‡Ø§Ø¨ Ù„Ù„Ù‡ÙˆÙ…) */}
        <div className="pt-4 border-t border-slate-200/70 space-y-1.5">
          <div
            className={`flex items-center ${
              mini ? "justify-center" : "gap-2.5 px-2.5"
            } py-2`}
          >
            <div className="w-8 h-8 rounded-full btn-landing-gradient text-white flex items-center justify-center shrink-0">
              {isDoctor ? (
                <Stethoscope className="w-4 h-4" />
              ) : isAdmin ? (
                <ShieldAlert className="w-4 h-4" />
              ) : (
                <HeartPulse className="w-4 h-4" />
              )}
            </div>
            {!mini && (
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-[#052e6e] truncate">
                  {session?.fullName ||
                    (isDoctor
                      ? "Dr. Ahmed Ashraf"
                      : isAdmin
                        ? "System Admin"
                        : "Mahmoud Abdel-Rahman")}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {session?.email ||
                    (isDoctor
                      ? "doctor@ecgenius.health"
                      : "patient@ecgenius.health")}
                </p>
              </div>
            )}
          </div>

          <div className={`flex ${mini ? "flex-col gap-1" : "gap-1.5"}`}>
            <Link
              to="/"
              title="Public Home (Keep Session)"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 text-[11px] font-bold text-slate-600 transition"
            >
              <Home className="w-3.5 h-3.5" />
              {!mini && <span>Home</span>}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-[11px] font-bold text-[#e11d48] transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              {!mini && <span>Exit</span>}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dce8f8] via-[#e9f1fc] to-[#dde9f9] p-2 sm:p-4 lg:p-5 text-slate-900">
      <div className="max-w-[1440px] mx-auto min-h-[calc(100vh-2.5rem)] rounded-[2.25rem] bg-white shadow-[0_28px_80px_-24px_rgba(5,46,110,0.16)] border border-white flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:flex shrink-0 border-r border-slate-200/70 flex-col transition-all duration-300 ${
            collapsed ? "w-20" : "w-60"
          }`}
        >
          <SidebarBody />
        </aside>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="relative z-10 w-72 max-w-[85vw] bg-white flex flex-col shadow-2xl">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute top-5 right-4 p-2 rounded-xl bg-slate-100 text-[#052e6e]"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarBody isMobile />
            </aside>
          </div>
        )}

        {/* Clean Spacious Workspace */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f7faff]">
          <header className="px-5 sm:px-8 py-4 flex items-center justify-between gap-4 border-b border-slate-200/60 bg-white/75 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-white border border-slate-200 text-[#052e6e]"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-[#052e6e] tracking-tight">
                  {currentHeading}
                </h1>
              </div>
            </div>

            {isDoctor ? (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/doctor/consultations"
                  className="relative p-2.5 rounded-full bg-white border border-slate-200/80 text-[#052e6e] hover:border-sky-300 transition shadow-2xs"
                  title="Consultations"
                >
                  <MessageSquareHeart className="w-4 h-4" />
                  {doctorUnreadChatCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#e11d48] text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white">
                      {doctorUnreadChatCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/doctor/notifications"
                  className="relative p-2.5 rounded-full bg-white border border-slate-200/80 text-[#052e6e] hover:border-sky-300 transition shadow-2xs"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#e11d48] ring-2 ring-white" />
                  )}
                </Link>

                <Link
                  to="/doctor/start-exam"
                  className="btn-landing-gradient px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <FilePlus2 className="w-3.5 h-3.5 text-sky-200" />
                  <span>Start Exam</span>
                </Link>
              </div>
            ) : (
              !isAdmin && (
                <Link
                  to="/patient/consultations"
                  className="relative btn-landing-gradient px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <MessageSquareHeart className="w-3.5 h-3.5 text-sky-200" />
                  <span>Consult Cardiologist</span>
                  {patientUnreadChatCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#e11d48] text-white text-[10px] font-extrabold">
                      {patientUnreadChatCount} new
                    </span>
                  )}
                </Link>
              )
            )}
          </header>

          <main className="flex-1 p-5 sm:p-8 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}


