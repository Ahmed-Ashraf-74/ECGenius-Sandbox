import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Activity,
  FileCheck2,
  UserCheck,
  ArrowUpRight,
  CheckCheck,
  Bell,
} from "lucide-react";
import {
  clinicalService,
  type ClinicalNotificationDto,
} from "../../services/clinicalMockService";

function formatRelativeTime(iso: string): string {
  const diffSec = Math.max(
    1,
    Math.floor((Date.now() - new Date(iso).getTime()) / 1000),
  );
  if (diffSec < 60) return "Just now";
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString();
}

function getCategoryStyle(category: ClinicalNotificationDto["category"]) {
  switch (category) {
    case "Critical Alert":
      return {
        icon: AlertTriangle,
        accent: "bg-rose-50 text-[#e11d48]",
      };
    case "Report Finalized":
      return {
        icon: FileCheck2,
        accent: "bg-emerald-50 text-emerald-700",
      };
    case "Patient Update":
      return {
        icon: UserCheck,
        accent: "bg-indigo-50 text-indigo-700",
      };
    default:
      return {
        icon: Activity,
        accent: "bg-sky-50 text-[#0284c7]",
      };
  }
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => clinicalService.getNotifications(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => clinicalService.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => clinicalService.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="space-y-4 max-w-4xl mx-auto animate-dash-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#052e6e]">
            Clinical Notifications & Activity Feed
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time sync for new ECG exams, AI alerts, finalized reports, and
            patient updates
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllMutation.mutate()}
            className="btn-landing-gradient px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All Read ({unreadCount})
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-3xl bg-white animate-pulse" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="rounded-3xl bg-white border border-slate-200/80 p-12 text-center space-y-2">
          <Bell className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-extrabold text-[#052e6e]">
            No Notifications Yet
          </p>
        </div>
      ) : (
        alerts.map((item) => {
          const { icon: Icon, accent } = getCategoryStyle(item.category);
          return (
            <Link
              key={item.id}
              to={item.to}
              onClick={() => {
                if (!item.read) markReadMutation.mutate(item.id);
              }}
              className={`rounded-3xl bg-white border p-5 shadow-xs hover:shadow-md transition flex items-center justify-between gap-4 group ${
                item.read
                  ? "border-slate-200/80 opacity-85"
                  : "border-sky-300 ring-1 ring-sky-100"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${accent}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase text-slate-400">
                      {item.category}
                    </span>
                    {!item.read && (
                      <span className="px-2 py-0.5 rounded-full bg-sky-50 text-[#0284c7] text-[10px] font-extrabold">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-extrabold text-[#052e6e] group-hover:text-[#0284c7] transition">
                    {item.title}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
                <span>{formatRelativeTime(item.createdAt)}</span>
                <ArrowUpRight className="w-4 h-4 text-[#0284c7]" />
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}
