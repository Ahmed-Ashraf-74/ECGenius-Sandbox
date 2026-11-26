import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Activity,
  Sparkles,
  FileCheck2,
  ArrowRight,
  MessageSquareHeart,
  FilePlus2,
  RefreshCw,
  Play,
  Square,
} from "lucide-react";
import Button from "../../components/common/Button";
import PatientAvatar from "../../components/common/PatientAvatar";
import { clinicalService } from "../../services/clinicalMockService";

function AnimatedNumber({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let frame = 0;
    const totalFrames = 28;
    const timer = setInterval(() => {
      frame += 1;
      const progress = Math.min(1, frame / totalFrames);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Number((target * eased).toFixed(target % 1 === 0 ? 0 : 1)));
      if (frame >= totalFrames) clearInterval(timer);
    }, 24);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <span className="tabular-nums">
      {val}
      {suffix}
    </span>
  );
}

const CHART_DATA = {
  Week: [
    { day: "Mon", total: 24 },
    { day: "Tue", total: 32, striped: true },
    { day: "Wed", total: 27 },
    { day: "Thu", total: 44 },
    { day: "Fri", total: 36, striped: true },
    { day: "Sat", total: 21 },
    { day: "Sun", total: 29, striped: true },
  ],
  Month: [
    { day: "W1", total: 118 },
    { day: "W2", total: 146, striped: true },
    { day: "W3", total: 132 },
    { day: "W4", total: 168 },
  ],
};

const IDLE_BASELINE_PATH =
  "M0 32 L65 32 L72 30 L78 34 L84 32 L155 32 L162 30 L168 34 L174 32 L245 32 L252 30 L258 34 L264 32 L300 32";

const LIVE_ECG_PATH =
  "M0 32 L25 32 Q32 24 38 32 L44 37 L50 8 L56 46 L62 32 Q72 20 82 32 L115 32 Q122 24 128 32 L134 37 L140 8 L146 46 L152 32 Q162 20 172 32 L205 32 Q212 24 218 32 L224 37 L230 8 L236 46 L242 32 Q252 20 262 32 L300 32";

export default function DoctorDashboard() {
  const [period, setPeriod] = useState<"Week" | "Month">("Week");
  const [liveStreamActive, setLiveStreamActive] = useState(false);

  const {
    data: examinations = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["examinations"],
    queryFn: () => clinicalService.getExaminations(),
  });

  const criticalExams = examinations.filter(
    (e) => e.riskLevel === "Critical" && e.status !== "Reviewed",
  );
  const reviewedCount = examinations.filter(
    (e) => e.status === "Reviewed" || e.status === "Completed",
  ).length;
  const avgConfidence = examinations.length
    ? Number(
        (
          examinations.reduce(
            (acc, e) => acc + (e.aiAnalysis?.confidenceScore ?? 0),
            0,
          ) / examinations.length
        ).toFixed(1),
      )
    : 95.4;

  const bars = CHART_DATA[period];
  const maxVal = Math.max(...bars.map((b) => b.total), 1);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-3xl bg-white animate-pulse" />
          ))}
        </div>
        <div className="h-80 rounded-3xl bg-white animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl bg-white border border-rose-200 p-10 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-[#e11d48] mx-auto" />
        <h2 className="text-lg font-extrabold text-[#052e6e]">
          Unable to Load Clinical Dashboard
        </h2>
        <Button variant="primary" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-7 max-w-6xl mx-auto">
      {/* Header + Period Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-dash-card">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#052e6e] tracking-tight">
            Welcome back, Dr. Ahmed
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here is your prioritized cardiology summary for today.
          </p>
        </div>

        <div className="inline-flex items-center gap-1 p-1.5 rounded-full bg-white border border-slate-200/80 shadow-2xs self-start">
          {(["Week", "Month"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setPeriod(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                period === tab
                  ? "btn-landing-gradient text-white"
                  : "text-slate-500 hover:text-[#052e6e]"
              }`}
            >
              This {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ROW 1: 4 Clickable KPI Cards with Continuously Moving Colors */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link
          to="/doctor/examinations?risk=Critical"
          className="card-animated-tint relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-200/80 via-rose-100/70 to-amber-50/80 border border-rose-200/90 p-6 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all block"
        >
          <div className="animate-orb-float pointer-events-none absolute -right-5 -top-5 w-24 h-24 rounded-full bg-rose-400/35 blur-xl" />
          <div className="flex items-center justify-between relative z-10">
            <div className="w-10 h-10 rounded-full bg-white text-[#e11d48] flex items-center justify-center shadow-2xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-[#e11d48] text-[11px] font-extrabold">
              Red Alerts
            </span>
          </div>
          <p className="mt-4 text-xs font-semibold text-slate-600 relative z-10">
            Needs Urgent Review
          </p>
          <p className="mt-1 text-3xl font-black text-[#052e6e] relative z-10">
            <AnimatedNumber target={criticalExams.length} />
          </p>
        </Link>

        <Link
          to="/doctor/examinations"
          className="card-animated-tint relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-200/85 via-blue-100/75 to-indigo-100/80 border border-sky-200/90 p-6 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all block"
        >
          <div className="animate-orb-float pointer-events-none absolute -right-5 -top-5 w-24 h-24 rounded-full bg-sky-400/35 blur-xl" />
          <div className="flex items-center justify-between relative z-10">
            <div className="w-10 h-10 rounded-full bg-white text-[#0284c7] flex items-center justify-center shadow-2xs">
              <Activity className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-[#0284c7] text-[11px] font-extrabold">
              +14%
            </span>
          </div>
          <p className="mt-4 text-xs font-semibold text-slate-600 relative z-10">
            Active Examinations
          </p>
          <p className="mt-1 text-3xl font-black text-[#052e6e] relative z-10">
            <AnimatedNumber target={examinations.length} />
          </p>
        </Link>

        <Link
          to="/doctor/start-exam"
          className="card-animated-tint relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-200/80 via-sky-100/75 to-purple-100/75 border border-indigo-200/90 p-6 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all block"
        >
          <div className="animate-orb-float pointer-events-none absolute -right-5 -top-5 w-24 h-24 rounded-full bg-indigo-400/35 blur-xl" />
          <div className="flex items-center justify-between relative z-10">
            <div className="w-10 h-10 rounded-full bg-white text-[#052e6e] flex items-center justify-center shadow-2xs">
              <Sparkles className="w-5 h-5 text-[#0284c7]" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-[#052e6e] text-[11px] font-extrabold">
              XAI Engine
            </span>
          </div>
          <p className="mt-4 text-xs font-semibold text-slate-600 relative z-10">
            Mean AI Confidence
          </p>
          <p className="mt-1 text-3xl font-black text-[#052e6e] relative z-10">
            <AnimatedNumber target={avgConfidence} suffix="%" />
          </p>
        </Link>

        <Link
          to="/doctor/reports"
          className="card-animated-tint relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-200/80 via-teal-100/70 to-sky-100/75 border border-emerald-200/90 p-6 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all block"
        >
          <div className="animate-orb-float pointer-events-none absolute -right-5 -top-5 w-24 h-24 rounded-full bg-emerald-400/35 blur-xl" />
          <div className="flex items-center justify-between relative z-10">
            <div className="w-10 h-10 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-2xs">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-emerald-700 text-[11px] font-extrabold">
              Signed
            </span>
          </div>
          <p className="mt-4 text-xs font-semibold text-slate-600 relative z-10">
            Approved Reports
          </p>
          <p className="mt-1 text-3xl font-black text-[#052e6e] relative z-10">
            <AnimatedNumber target={reviewedCount} />
          </p>
        </Link>
      </div>

      {/* ROW 2: Breathing Analytics + Live AI Monitor */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#052e6e]">
                12-Lead Examination Flow
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Live telemetry throughput ({period})
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#eef4fb] text-[#0284c7] text-xs font-extrabold">
              500Hz PTB-XL
            </span>
          </div>

          <div className="relative mt-6 pt-4">
            <div className="absolute left-0 right-0 top-6 border-t-2 border-dashed border-rose-300 flex justify-end">
              <span className="-mt-3 px-2.5 py-0.5 rounded-full bg-[#e11d48] text-white text-[10px] font-bold">
                peak threshold
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 items-end h-48 pt-4">
              {bars.map((bar, idx) => {
                const pct = Math.max(
                  20,
                  Math.round((bar.total / maxVal) * 100),
                );
                const isPeak = bar.total === maxVal;
                return (
                  <div
                    key={`${period}-${bar.day}`}
                    className="flex flex-col items-center h-full justify-end"
                  >
                    <span
                      className={`mb-2 px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                        isPeak
                          ? "btn-landing-gradient text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {bar.total}
                    </span>
                    <div
                      style={{
                        height: `${pct}%`,
                        animationDelay: `${idx * 220}ms`,
                      }}
                      className={`w-full rounded-t-2xl animate-bar-live ${
                        isPeak
                          ? "btn-landing-gradient"
                          : bar.striped
                            ? "bg-striped-sky border-t-2 border-[#0284c7]"
                            : "bg-gradient-to-t from-sky-100 to-sky-200/80 border-t-2 border-sky-400"
                      }`}
                    />
                    <span className="mt-2.5 text-xs font-bold text-slate-500">
                      {bar.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-extrabold text-[#052e6e]">
                Live AI Signal Monitor
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                    liveStreamActive ? "text-emerald-600" : "text-slate-400"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      liveStreamActive
                        ? "bg-emerald-500 animate-ping"
                        : "bg-slate-400"
                    }`}
                  />
                  {liveStreamActive ? "Active" : "Standby"}
                </span>

                <button
                  type="button"
                  onClick={() => setLiveStreamActive((prev) => !prev)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 transition cursor-pointer ${
                    liveStreamActive
                      ? "bg-rose-50 text-[#e11d48] border border-rose-200 hover:bg-rose-100"
                      : "btn-landing-gradient text-white"
                  }`}
                >
                  {liveStreamActive ? (
                    <>
                      <Square className="w-2.5 h-2.5" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="w-2.5 h-2.5" />
                      Simulate
                    </>
                  )}
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {liveStreamActive
                ? "Continuous Lead II rhythm preview"
                : "Standby baseline • No active ECG capture right now"}
            </p>

            <div className="mt-4 rounded-2xl bg-gradient-to-r from-[#eef4fb] via-sky-50 to-[#eef4fb] border border-sky-100 p-4 overflow-hidden">
              <svg
                viewBox="0 0 300 64"
                className="w-full h-16 overflow-visible"
              >
                <path
                  d={liveStreamActive ? LIVE_ECG_PATH : IDLE_BASELINE_PATH}
                  fill="none"
                  stroke={liveStreamActive ? "#0284c7" : "#94a3b8"}
                  strokeWidth={liveStreamActive ? "2.4" : "1.8"}
                  strokeLinecap="round"
                  className="animate-ecg-loop"
                />
              </svg>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link
              to="/doctor/start-exam"
              className="btn-landing-gradient py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2"
            >
              <FilePlus2 className="w-4 h-4 text-sky-200" />
              <span>Start Exam</span>
            </Link>
            <Link
              to="/doctor/consultations"
              className="btn-landing-gradient py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2"
            >
              <MessageSquareHeart className="w-4 h-4 text-sky-200" />
              <span>Consult Chat</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ROW 3: Prioritized Cases with Patient Avatars */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#052e6e]">
              Prioritized Cases Needing Review
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any case to open the dedicated 12-Lead XAI Examination Room
            </p>
          </div>
          <Link
            to="/doctor/examinations"
            className="text-xs font-bold text-[#0284c7] hover:text-[#052e6e] inline-flex items-center gap-1"
          >
            View All Examinations <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {examinations.slice(0, 4).map((exam) => (
            <div
              key={exam.examinationId}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5">
                <PatientAvatar
                  name={exam.patientName}
                  gender={exam.patientGender}
                  size="md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/doctor/patients/${exam.patientId}`}
                      className="text-sm font-extrabold text-[#052e6e] hover:text-[#0284c7]"
                    >
                      {exam.patientName}
                    </Link>
                    <span className="text-xs font-medium text-slate-400">
                      - {exam.patientAge}y ({exam.patientGender})
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        exam.riskLevel === "Critical"
                          ? "bg-[#e11d48] animate-ping"
                          : exam.riskLevel === "Moderate"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {exam.aiAnalysis?.predictedResult} •{" "}
                    <strong className="text-[#0284c7]">
                      {exam.aiAnalysis?.confidenceScore}% AI Confidence
                    </strong>
                  </p>
                </div>
              </div>

              <Link
                to={`/doctor/examinations/${exam.examinationId}`}
                className="btn-landing-gradient px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>Inspect 12-Lead ECG</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
