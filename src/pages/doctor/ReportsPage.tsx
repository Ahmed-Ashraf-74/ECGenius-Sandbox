import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, FileText, UserCheck, ArrowUpRight } from "lucide-react";
import PrintableClinicalReport from "../../components/doctor/PrintableClinicalReport";
import PatientAvatar from "../../components/common/PatientAvatar";
import { clinicalService } from "../../services/clinicalMockService";

export default function ReportsPage() {
  const [selectedExamId, setSelectedExamId] = useState<string>("exam-5001");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Finalized" | "Draft"
  >("All");

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ["examinations"],
    queryFn: () => clinicalService.getExaminations(),
  });

  const q = searchQuery.trim().toLowerCase();
  const filteredExams = exams.filter((ex) => {
    const reportTitle = (
      ex.report?.reportTitle ||
      ex.aiAnalysis?.predictedResult ||
      ""
    ).toLowerCase();
    const matchesQuery =
      !q ||
      ex.patientName.toLowerCase().includes(q) ||
      ex.patientId.toLowerCase().includes(q) ||
      ex.examinationId.toLowerCase().includes(q) ||
      reportTitle.includes(q);

    const isFinalized = ex.report?.status === "Finalized";
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Finalized" && isFinalized) ||
      (statusFilter === "Draft" && !isFinalized);

    return matchesQuery && matchesStatus;
  });

  const activeExam =
    filteredExams.find((e) => e.examinationId === selectedExamId) ||
    filteredExams[0] ||
    exams[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-dash-card">
      <div>
        <h2 className="text-xl font-extrabold text-[#052e6e]">
          Clinical Reports & Branded PDF Export
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Search by patient name, patient ID, or report title, and export
          branded ECG reports as PDF
        </p>
      </div>

      {/* Search & Status Filter Bar */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-4 shadow-xs grid sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient name, patient ID (pat-1001), or report title..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-100/80 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border focus:border-[#0284c7]"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "All" | "Finalized" | "Draft")
            }
            className="w-full px-4 py-2 rounded-full bg-slate-100/80 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:bg-white focus:border focus:border-[#0284c7]"
          >
            <option value="All">All Reports ({exams.length})</option>
            <option value="Finalized">Signed & Approved</option>
            <option value="Draft">Draft Reports</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 rounded-3xl bg-white animate-pulse" />
      ) : (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
            {filteredExams.length === 0 ? (
              <div className="rounded-3xl bg-white border border-slate-200/80 p-8 text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-[#052e6e]">
                  No reports match "{searchQuery}"
                </p>
              </div>
            ) : (
              filteredExams.map((ex) => {
                const isSelected =
                  activeExam?.examinationId === ex.examinationId;
                return (
                  <button
                    key={ex.examinationId}
                    type="button"
                    onClick={() => setSelectedExamId(ex.examinationId)}
                    className={`w-full text-left p-4 rounded-3xl border transition cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? "btn-landing-gradient text-white border-sky-400 shadow-md"
                        : "bg-white text-[#052e6e] border-slate-200/80 hover:border-sky-300"
                    }`}
                  >
                    <PatientAvatar
                      name={ex.patientName}
                      gender={ex.patientGender}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold truncate">
                          {ex.patientName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : ex.report?.status === "Finalized"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {ex.report?.status || "Draft"}
                        </span>
                      </div>
                      <p
                        className={`text-xs font-bold mt-1 truncate ${
                          isSelected ? "text-sky-100" : "text-slate-700"
                        }`}
                      >
                        {ex.report?.reportTitle ||
                          ex.aiAnalysis?.predictedResult}
                      </p>
                      <p
                        className={`text-[10px] mt-0.5 ${
                          isSelected ? "text-sky-200" : "text-slate-400"
                        }`}
                      >
                        {ex.patientId} •{" "}
                        {new Date(ex.performedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="lg:col-span-8 space-y-3">
            {activeExam && (
              <>
                <div className="no-print rounded-2xl bg-white border border-sky-200/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5 text-xs">
                    <UserCheck className="w-4 h-4 text-[#0284c7]" />
                    <span className="text-slate-500">Selected Report:</span>
                    <strong className="text-[#052e6e]">
                      {activeExam.report?.reportTitle ||
                        activeExam.examinationId.toUpperCase()}
                    </strong>
                    <span className="px-2 py-0.5 rounded-full bg-[#eef4fb] text-[#0284c7] font-bold text-[11px]">
                      {activeExam.patientName}
                    </span>
                  </div>

                  <Link
                    to={`/doctor/patients/${activeExam.patientId}?report=${activeExam.examinationId}`}
                    className="btn-landing-gradient px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    Open Report in Patient Profile
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <PrintableClinicalReport exam={activeExam} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
