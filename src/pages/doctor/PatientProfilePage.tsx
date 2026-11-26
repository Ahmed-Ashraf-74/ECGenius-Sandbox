import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  useParams,
  useSearchParams,
  useNavigate,
  Link,
} from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Activity,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Droplet,
  AlertCircle,
  AlertTriangle,
  FileHeart,
  CheckCircle2,
  FileText,
  Columns2,
  ShieldCheck,
  Printer,
  HeartPulse,
} from "lucide-react";
import Button from "../../components/common/Button";
import PatientAvatar from "../../components/common/PatientAvatar";
import PatientFormModal from "../../components/doctor/PatientFormModal";
import PrintableClinicalReport from "../../components/doctor/PrintableClinicalReport";
import { clinicalService } from "../../services/clinicalMockService";

export default function PatientProfilePage() {
  const { patientId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const targetReportId = searchParams.get("report");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [selectedReportExamId, setSelectedReportExamId] = useState<
    string | null
  >(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareLeftId, setCompareLeftId] = useState<string>("");
  const [compareRightId, setCompareRightId] = useState<string>("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => clinicalService.getPatientById(patientId),
    enabled: Boolean(patientId),
  });

  useEffect(() => {
    if (
      targetReportId &&
      data?.examinations.some((e) => e.examinationId === targetReportId)
    ) {
      setSelectedReportExamId(targetReportId);
      const timer = setTimeout(() => {
        document
          .getElementById("printable-clinical-report")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [targetReportId, data]);

  const approveDraftMutation = useMutation({
    mutationFn: (examId: string) => {
      const target = data?.examinations.find((e) => e.examinationId === examId);
      return clinicalService.submitDoctorReview({
        examinationId: examId,
        decision: "Approved",
        reportTitle:
          target?.report?.reportTitle || "12-Lead Clinical ECG Report",
        reportContent:
          target?.report?.reportContent ||
          target?.aiAnalysis?.predictedResult ||
          "Approved clinical ECG interpretation.",
        doctorNotes:
          target?.report?.doctorNotes ||
          "Reviewed and signed off from patient history.",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      queryClient.invalidateQueries({ queryKey: ["examinations"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setToastMsg("Draft report converted to Signed & Approved!");
      setTimeout(() => setToastMsg(null), 4000);
    },
  });

  const deletePatientMutation = useMutation({
    mutationFn: () => clinicalService.deletePatient(patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["examinations"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      navigate("/doctor/patients");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-44 rounded-3xl bg-white animate-pulse" />
        <div className="h-64 rounded-3xl bg-white animate-pulse" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-3xl bg-white border border-rose-200 p-10 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-[#e11d48] mx-auto" />
        <h2 className="text-xl font-extrabold text-[#052e6e]">
          Patient Record Unavailable
        </h2>
        <p className="text-sm text-slate-500">
          {(error as Error)?.message || "Could not load patient profile."}
        </p>
        <div className="flex justify-center gap-3">
          <Link to="/doctor/patients">
            <Button variant="ghost" size="sm">
              Back to Directory
            </Button>
          </Link>
          <Button variant="primary" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const { patient, examinations } = data;
  const activeReportExam =
    examinations.find((e) => e.examinationId === selectedReportExamId) ||
    examinations[0];

  const leftCompareExam =
    examinations.find((e) => e.examinationId === compareLeftId) ||
    examinations[0];
  const rightCompareExam =
    examinations.find((e) => e.examinationId === compareRightId) ||
    examinations[1] ||
    examinations[0];

  const handleOpenReport = (examId: string) => {
    setSelectedReportExamId(examId);
    setTimeout(() => {
      document
        .getElementById("printable-clinical-report")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  // طباعة تقرير المقارنة بين فحصين في نافذة PDF نظيفة
  const handlePrintComparison = () => {
    if (!leftCompareExam || !rightCompareExam) return;
    const mA = leftCompareExam.aiAnalysis?.measurements;
    const mB = rightCompareExam.aiAnalysis?.measurements;

    const printWin = window.open("", "_blank", "width=960,height=780");
    if (!printWin) return;

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>ECGenius Comparative ECG Report - ${patient.fullName}</title>
          <style>
            * { box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif; }
            body { margin: 28px; color: #0f172a; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #052e6e; padding-bottom: 14px; margin-bottom: 20px; }
            .brand { font-size: 22px; font-weight: 800; color: #052e6e; }
            .brand span { color: #0284c7; }
            .meta { font-size: 12px; color: #475569; text-align: right; }
            .patient-box { background: #f1f5f9; border-radius: 12px; padding: 12px 16px; margin-bottom: 18px; font-size: 13px; display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
            th, td { border: 1px solid #cbd5e1; padding: 9px 12px; text-align: left; }
            th { background: #052e6e; color: #fff; font-weight: 700; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            .card { border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px; }
            .card h3 { margin: 0 0 6px 0; font-size: 15px; color: #052e6e; }
            .tag { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; background: #e0f2fe; color: #0284c7; margin-bottom: 8px; }
            .section-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 10px; }
            p { margin: 4px 0 0 0; font-size: 12.5px; line-height: 1.5; }
            @media print { body { margin: 14px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">ECG<span>enius</span> Clinical Comparison</div>
              <div style="font-size:12px;color:#64748b;">Serial 12-Lead ECG & Diagnostic Report Audit</div>
            </div>
            <div class="meta">
              Generated: ${new Date().toLocaleString()}<br/>
              Patient ID: <strong>${patient.patientId}</strong>
            </div>
          </div>

          <div class="patient-box">
            <div><strong>Patient:</strong> ${patient.fullName} (${patient.age} yrs, ${patient.gender})</div>
            <div><strong>Blood Type:</strong> ${patient.bloodType || "N/A"} | <strong>Phone:</strong> ${patient.phoneNumber}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>ECG Parameter</th>
                <th>Report A (${leftCompareExam.examinationId.toUpperCase()})</th>
                <th>Report B (${rightCompareExam.examinationId.toUpperCase()})</th>
                <th>Delta (B - A)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Heart Rate (HR)</td>
                <td>${mA?.heartRateBpm ?? "--"} bpm</td>
                <td>${mB?.heartRateBpm ?? "--"} bpm</td>
                <td>${mA && mB ? (mB.heartRateBpm - mA.heartRateBpm >= 0 ? "+" : "") + (mB.heartRateBpm - mA.heartRateBpm) + " bpm" : "--"}</td>
              </tr>
              <tr>
                <td>PR Interval</td>
                <td>${mA?.prIntervalMs ?? "--"} ms</td>
                <td>${mB?.prIntervalMs ?? "--"} ms</td>
                <td>${mA && mB ? (mB.prIntervalMs - mA.prIntervalMs >= 0 ? "+" : "") + (mB.prIntervalMs - mA.prIntervalMs) + " ms" : "--"}</td>
              </tr>
              <tr>
                <td>QRS Duration</td>
                <td>${mA?.qrsDurationMs ?? "--"} ms</td>
                <td>${mB?.qrsDurationMs ?? "--"} ms</td>
                <td>${mA && mB ? (mB.qrsDurationMs - mA.qrsDurationMs >= 0 ? "+" : "") + (mB.qrsDurationMs - mA.qrsDurationMs) + " ms" : "--"}</td>
              </tr>
              <tr>
                <td>Corrected QTc</td>
                <td>${mA?.qtcMs ?? "--"} ms</td>
                <td>${mB?.qtcMs ?? "--"} ms</td>
                <td>${mA && mB ? (mB.qtcMs - mA.qtcMs >= 0 ? "+" : "") + (mB.qtcMs - mA.qtcMs) + " ms" : "--"}</td>
              </tr>
            </tbody>
          </table>

          <div class="grid">
            <div class="card">
              <span class="tag">Report A • ${new Date(leftCompareExam.performedAt).toLocaleDateString()}</span>
              <h3>${leftCompareExam.report?.reportTitle || "12-Lead ECG Report"}</h3>
              <div class="section-label">AI Classification</div>
              <p><strong>${leftCompareExam.aiAnalysis?.predictedResult || "N/A"}</strong> (${leftCompareExam.aiAnalysis?.confidenceScore ?? 95}%)</p>
              <div class="section-label">Clinical Findings</div>
              <p>${leftCompareExam.report?.reportContent || leftCompareExam.aiAnalysis?.clinicalRationale || ""}</p>
              <div class="section-label">Physician Notes</div>
              <p>${leftCompareExam.report?.doctorNotes || "None"}</p>
            </div>

            <div class="card">
              <span class="tag">Report B • ${new Date(rightCompareExam.performedAt).toLocaleDateString()}</span>
              <h3>${rightCompareExam.report?.reportTitle || "12-Lead ECG Report"}</h3>
              <div class="section-label">AI Classification</div>
              <p><strong>${rightCompareExam.aiAnalysis?.predictedResult || "N/A"}</strong> (${rightCompareExam.aiAnalysis?.confidenceScore ?? 95}%)</p>
              <div class="section-label">Clinical Findings</div>
              <p>${rightCompareExam.report?.reportContent || rightCompareExam.aiAnalysis?.clinicalRationale || ""}</p>
              <div class="section-label">Physician Notes</div>
              <p>${rightCompareExam.report?.doctorNotes || "None"}</p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-dash-card">
      {toastMsg && (
        <div className="rounded-2xl bg-emerald-600 text-white px-5 py-3.5 shadow-lg flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* شريط العودة والأزرار الثلاثة الموحدة بدون أي تكرار */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/doctor/patients"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#052e6e] hover:text-[#0284c7]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Patients Directory
        </Link>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* زر بدء فحص جديد بلون سماوي مميز وواضح */}
          <Link
            to={`/doctor/start-exam?patientId=${patient.patientId}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] hover:from-[#0369a1] hover:to-[#0284c7] text-white text-xs font-extrabold shadow-md hover:shadow-lg transition"
          >
            <HeartPulse className="w-4 h-4 text-white" />
            Start New ECG Exam
          </Link>

          <Button variant="primary" size="sm" onClick={() => setEditOpen(true)}>
            <Edit3 className="w-3.5 h-3.5" />
            Edit Patient Info
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setConfirmDeleteOpen(true)}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Patient
          </Button>
        </div>
      </div>

      {/* Patient Demographics Header */}
      <div className="rounded-[2rem] bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <PatientAvatar
              name={patient.fullName}
              gender={patient.gender}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-extrabold text-[#052e6e]">
                  {patient.fullName}
                </h1>
                <span className="px-3 py-0.5 rounded-full bg-[#eef4fb] text-[#0284c7] text-xs font-bold">
                  {patient.patientId}
                </span>
                <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  {patient.profileStatus}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {patient.age} years old • {patient.gender} • Registered{" "}
                {new Date(patient.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 space-y-1">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#0284c7]" /> Email
            </span>
            <p className="font-bold text-[#052e6e] truncate">{patient.email}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 space-y-1">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#0284c7]" /> Phone
            </span>
            <p className="font-bold text-[#052e6e]">{patient.phoneNumber}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 space-y-1">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 text-[#e11d48]" /> Blood & DOB
            </span>
            <p className="font-bold text-[#052e6e]">
              {patient.bloodType || "N/A"} • {patient.dateOfBirth}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 space-y-1">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0284c7]" /> Address
            </span>
            <p className="font-bold text-[#052e6e] truncate">
              {patient.address || "Not provided"}
            </p>
          </div>
        </div>
      </div>

      {/* Longitudinal ECG History & Reports */}
      <div className="rounded-[2rem] bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-[#052e6e]">
              12-Lead ECG Studies & Signed Reports History
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Multiple studies & reports history • Approve drafts, compare
              serial ECGs, or print comparative reports
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {examinations.length >= 2 && (
              <button
                type="button"
                onClick={() => setCompareMode((c) => !c)}
                className={`px-3.5 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer ${
                  compareMode
                    ? "btn-landing-gradient text-white"
                    : "bg-[#eef4fb] text-[#052e6e] hover:bg-sky-100"
                }`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                {compareMode
                  ? "Hide ECG Comparison"
                  : `Compare Serial ECGs (${examinations.length})`}
              </button>
            )}
            <span className="px-3 py-1 rounded-full bg-[#eef4fb] text-xs font-extrabold text-[#052e6e]">
              {examinations.length} Report(s)
            </span>
          </div>
        </div>

        {/* Detailed Multi-Report & Serial 12-Lead ECG Comparison + Print Button */}
        {compareMode &&
          examinations.length >= 2 &&
          leftCompareExam &&
          rightCompareExam && (
            <div className="rounded-3xl bg-[#f8fbff] border border-sky-200 p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-sky-200/70">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#052e6e]">
                    Detailed Comparative Report & Serial ECG Audit
                  </h3>
                  <p className="text-xs text-slate-500">
                    Side-by-side comparison of diagnostic findings, intervals,
                    flagged leads, and physician notes
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <select
                    value={leftCompareExam.examinationId}
                    onChange={(e) => setCompareLeftId(e.target.value)}
                    className="px-3.5 py-1.5 rounded-full bg-white border border-sky-200 font-bold text-[#052e6e]"
                  >
                    {examinations.map((ex) => (
                      <option key={ex.examinationId} value={ex.examinationId}>
                        Report A: {ex.report?.reportTitle || ex.examinationId} (
                        {new Date(ex.performedAt).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                  <span className="font-extrabold text-[#0284c7]">VS</span>
                  <select
                    value={rightCompareExam.examinationId}
                    onChange={(e) => setCompareRightId(e.target.value)}
                    className="px-3.5 py-1.5 rounded-full bg-white border border-sky-200 font-bold text-[#052e6e]"
                  >
                    {examinations.map((ex) => (
                      <option key={ex.examinationId} value={ex.examinationId}>
                        Report B: {ex.report?.reportTitle || ex.examinationId} (
                        {new Date(ex.performedAt).toLocaleDateString()})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handlePrintComparison}
                    className="btn-landing-gradient px-4 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Comparison PDF
                  </button>
                </div>
              </div>

              {leftCompareExam.aiAnalysis && rightCompareExam.aiAnalysis && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {[
                    {
                      label: "Heart Rate (HR)",
                      valA: leftCompareExam.aiAnalysis.measurements
                        .heartRateBpm,
                      valB: rightCompareExam.aiAnalysis.measurements
                        .heartRateBpm,
                      unit: "bpm",
                    },
                    {
                      label: "PR Interval",
                      valA: leftCompareExam.aiAnalysis.measurements
                        .prIntervalMs,
                      valB: rightCompareExam.aiAnalysis.measurements
                        .prIntervalMs,
                      unit: "ms",
                    },
                    {
                      label: "QRS Duration",
                      valA: leftCompareExam.aiAnalysis.measurements
                        .qrsDurationMs,
                      valB: rightCompareExam.aiAnalysis.measurements
                        .qrsDurationMs,
                      unit: "ms",
                    },
                    {
                      label: "Corrected QTc",
                      valA: leftCompareExam.aiAnalysis.measurements.qtcMs,
                      valB: rightCompareExam.aiAnalysis.measurements.qtcMs,
                      unit: "ms",
                    },
                  ].map((metric) => {
                    const diff = metric.valB - metric.valA;
                    return (
                      <div
                        key={metric.label}
                        className="rounded-2xl bg-white border border-sky-100 p-3.5 space-y-1"
                      >
                        <span className="text-[11px] font-bold text-slate-400">
                          {metric.label}
                        </span>
                        <div className="flex items-baseline justify-between">
                          <span className="font-extrabold text-[#052e6e]">
                            {metric.valA} → {metric.valB} {metric.unit}
                          </span>
                          <span
                            className={`text-[11px] font-extrabold ${
                              diff === 0
                                ? "text-slate-400"
                                : diff > 0
                                  ? "text-[#e11d48]"
                                  : "text-emerald-600"
                            }`}
                          >
                            {diff > 0 ? `+${diff}` : diff} {metric.unit}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: "Report A", study: leftCompareExam },
                  { label: "Report B", study: rightCompareExam },
                ].map(({ label, study }) => {
                  const topLeads = study.aiAnalysis?.xaiLeadWeights
                    ? Object.entries(study.aiAnalysis.xaiLeadWeights)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                    : [];

                  return (
                    <div
                      key={`${label}-${study.examinationId}`}
                      className="rounded-2xl bg-white border border-slate-200/90 p-5 space-y-3 text-xs shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0284c7]">
                            {label} • {study.examinationId.toUpperCase()}
                          </span>
                          <h4 className="text-sm font-extrabold text-[#052e6e]">
                            {study.report?.reportTitle ||
                              "12-Lead ECG Clinical Report"}
                          </h4>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            study.riskLevel === "Critical"
                              ? "bg-rose-50 text-[#e11d48]"
                              : study.riskLevel === "Moderate"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {study.riskLevel}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500">
                        <span>
                          Date:{" "}
                          <strong className="text-slate-700">
                            {new Date(study.performedAt).toLocaleString()}
                          </strong>
                        </span>
                        <span>
                          Status:{" "}
                          <strong className="text-[#052e6e]">
                            {study.report?.status === "Finalized"
                              ? "Signed & Approved"
                              : "Draft"}
                          </strong>
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#eef4fb]/70 space-y-1">
                        <span className="font-bold text-[#052e6e]">
                          AI Diagnostic Classification (
                          {study.aiAnalysis?.confidenceScore ?? 95}%):
                        </span>
                        <p className="text-slate-800 font-semibold">
                          {study.aiAnalysis?.predictedResult}
                        </p>
                      </div>

                      {topLeads.length > 0 && (
                        <div className="space-y-1">
                          <span className="font-bold text-slate-500">
                            Top XAI Flagged Leads:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {topLeads.map(([lead, score]) => (
                              <span
                                key={lead}
                                className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[#e11d48] font-bold text-[11px]"
                              >
                                Lead {lead}: {Math.round(score * 100)}%
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-1">
                        <span className="font-bold text-slate-500">
                          Written Report Findings:
                        </span>
                        <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl">
                          {study.report?.reportContent ||
                            study.aiAnalysis?.clinicalRationale}
                        </p>
                      </div>

                      {study.report?.doctorNotes && (
                        <div className="space-y-1">
                          <span className="font-bold text-slate-500">
                            Physician Notes:
                          </span>
                          <p className="text-[#052e6e] font-medium bg-sky-50/70 p-2.5 rounded-xl">
                            {study.report.doctorNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {examinations.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-200 p-10 text-center space-y-2">
            <FileHeart className="w-9 h-9 text-slate-400 mx-auto" />
            <h3 className="text-sm font-extrabold text-[#052e6e]">
              No ECG Examinations Recorded Yet
            </h3>
          </div>
        ) : (
          <div className="space-y-3">
            {examinations.map((exam) => {
              const isDraft = exam.report?.status !== "Finalized";
              const isActive =
                activeReportExam?.examinationId === exam.examinationId;
              return (
                <div
                  key={exam.examinationId}
                  className={`rounded-2xl border p-4 sm:p-5 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isActive
                      ? "bg-[#eef4fb]/60 border-[#0284c7]"
                      : "border-slate-200/80 hover:border-[#0284c7]"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          exam.riskLevel === "Critical"
                            ? "bg-rose-50 text-[#e11d48]"
                            : exam.riskLevel === "Moderate"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {exam.riskLevel}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isDraft
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {isDraft ? "Draft Report" : "Signed & Approved"}
                      </span>
                      <span className="text-sm font-extrabold text-[#052e6e]">
                        {exam.report?.reportTitle ||
                          exam.aiAnalysis?.predictedResult}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(exam.performedAt).toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5" />
                        HR: {exam.aiAnalysis?.measurements.heartRateBpm ??
                          "--"}{" "}
                        bpm
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {isDraft && (
                      <button
                        type="button"
                        disabled={approveDraftMutation.isPending}
                        onClick={() =>
                          approveDraftMutation.mutate(exam.examinationId)
                        }
                        className="px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Sign & Approve Draft
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenReport(exam.examinationId)}
                      className="px-4 py-2 rounded-full bg-white border border-sky-200 hover:bg-sky-50 text-[#052e6e] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#0284c7]" />
                      Read / View Report
                    </button>

                    <Link
                      to={`/doctor/examinations/${exam.examinationId}`}
                      className="btn-landing-gradient px-4 py-2 rounded-full text-xs font-bold"
                    >
                      12-Lead XAI Viewer
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Report Viewer & Branded PDF Download */}
      {activeReportExam && <PrintableClinicalReport exam={activeReportExam} />}

      <PatientFormModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        editingPatient={patient}
        onSuccessMessage={(msg) => {
          setToastMsg(msg);
          setTimeout(() => setToastMsg(null), 4000);
        }}
      />

      {/* نافذة تأكيد حذف المريض */}
      {confirmDeleteOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-[#052e6e]/15 backdrop-blur-[3px]"
              onClick={() => setConfirmDeleteOpen(false)}
            />
            <div className="relative z-10 w-full max-w-md rounded-3xl bg-white border border-rose-200 p-6 shadow-2xl space-y-4 animate-dash-card">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 text-[#e11d48] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#052e6e]">
                    Delete {patient.fullName}?
                  </h3>
                  <p className="text-xs text-slate-500">
                    All ECG studies and signed reports for this patient will be
                    permanently deleted.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDeleteOpen(false)}
                  disabled={deletePatientMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  disabled={deletePatientMutation.isPending}
                  onClick={() => deletePatientMutation.mutate()}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {deletePatientMutation.isPending
                    ? "Deleting..."
                    : "Confirm Permanent Delete"}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
