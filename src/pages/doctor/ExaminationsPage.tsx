import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Activity, ArrowRight, Calendar } from "lucide-react";
import { clinicalService } from "../../services/clinicalMockService";
import type { ClinicalRiskLevel } from "../../types/ecg.types";

function parseRiskParam(value: string | null): ClinicalRiskLevel | "All" {
  if (value === "Critical" || value === "Moderate" || value === "Normal") {
    return value;
  }
  return "All";
}

export default function ExaminationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<ClinicalRiskLevel | "All">(() =>
    parseRiskParam(searchParams.get("risk")),
  );

  useEffect(() => {
    setRiskFilter(parseRiskParam(searchParams.get("risk")));
  }, [searchParams]);

  const handleSelectRisk = (next: ClinicalRiskLevel | "All") => {
    setRiskFilter(next);
    if (next === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ risk: next });
    }
  };

  const { data: examinations = [], isLoading } = useQuery({
    queryKey: ["examinations"],
    queryFn: () => clinicalService.getExaminations(),
  });

  const filtered = examinations.filter((exam) => {
    const q = search.trim().toLowerCase();
    const matchQ =
      !q ||
      exam.patientName.toLowerCase().includes(q) ||
      exam.examinationId.toLowerCase().includes(q) ||
      (exam.aiAnalysis?.predictedResult || "").toLowerCase().includes(q);
    const matchRisk = riskFilter === "All" || exam.riskLevel === riskFilter;
    return matchQ && matchRisk;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-dash-card">
      <div className="rounded-3xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name, exam ID, or AI diagnosis..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-100/80 text-xs sm:text-sm text-slate-800 focus:outline-none focus:bg-white focus:border focus:border-[#0284c7]"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["All", "Critical", "Moderate", "Normal"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleSelectRisk(r)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                riskFilter === r
                  ? "btn-landing-gradient text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 rounded-3xl bg-white animate-pulse" />
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl bg-white border border-slate-200/80 p-12 text-center space-y-2">
          <p className="text-sm font-extrabold text-[#052e6e]">
            No {riskFilter !== "All" ? riskFilter : ""} ECG Examinations Found
          </p>
          <p className="text-xs text-slate-500">
            Try clearing the search query or switching the risk filter above.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map((exam) => (
            <div
              key={exam.examinationId}
              className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#eef4fb] text-[#052e6e] text-xs font-extrabold">
                    {exam.examinationId.toUpperCase()}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      exam.riskLevel === "Critical"
                        ? "bg-rose-50 text-[#e11d48]"
                        : exam.riskLevel === "Moderate"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {exam.riskLevel} • {exam.status}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-[#052e6e]">
                  {exam.patientName}
                </h3>
                <p className="text-xs font-bold text-[#0284c7]">
                  {exam.aiAnalysis?.predictedResult} (
                  {exam.aiAnalysis?.confidenceScore}% confidence)
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="inline-flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-[#0284c7]" />
                    {exam.aiAnalysis?.measurements.heartRateBpm} bpm
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(exam.performedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Link
                to={`/doctor/examinations/${exam.examinationId}`}
                className="btn-landing-gradient py-2.5 px-4 rounded-full text-xs font-bold inline-flex items-center justify-center gap-1.5"
              >
                <span>Open 12-Lead XAI Examination Room</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
