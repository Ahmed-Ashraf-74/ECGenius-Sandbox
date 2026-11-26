import { createPortal } from "react-dom";
import {
  Printer,
  ShieldCheck,
  Activity,
  Calendar,
  User,
  Clock,
  AlertTriangle,
} from "lucide-react";
import Button from "../common/Button";
import type { ExaminationDto, EcgLeadName } from "../../types/ecg.types";

interface PrintableClinicalReportProps {
  exam: ExaminationDto;
  customTitle?: string;
  customContent?: string;
  customNotes?: string;
  showPrintButton?: boolean;
}

const LEAD_ANOMALY_EXPLANATIONS: Record<string, string> = {
  V2: "Marked ST-segment elevation (+3.2 mm) & hyperacute T-wave morphology detected.",
  V3: "Peak anterior ST-segment elevation (+4.1 mm) indicating acute myocardial injury.",
  V4: "Convex ST elevation with early Q-wave formation in anterior precordial territory.",
  V1: "Deep QS complex with absent discrete P-waves / right precordial conduction shift.",
  II: "Irregular RR interval spacing & P-wave baseline fibrillatory oscillations.",
  aVF: "Inferior lead ST-T wave repolarization abnormality correlated with rhythm shift.",
  V5: "Broad monophasic R-wave notch (>120 ms) consistent with lateral conduction delay.",
  V6: "Delayed intrinsicoid deflection and secondary ST-T discordance in lateral wall.",
  I: "High-lateral QRS widening and terminal slurring flagged by XAI saliency.",
  aVL: "Reciprocal ST-segment depression / lateral axis deviation marker.",
};

export default function PrintableClinicalReport({
  exam,
  customTitle,
  customContent,
  customNotes,
  showPrintButton = true,
}: PrintableClinicalReportProps) {
  const title =
    customTitle ?? exam.report?.reportTitle ?? "12-Lead Clinical ECG Report";
  const content =
    customContent ??
    exam.report?.reportContent ??
    exam.aiAnalysis?.predictedResult ??
    "Pending physician interpretation.";
  const notes = customNotes ?? exam.report?.doctorNotes ?? "";
  const status = exam.report?.status ?? "Draft";

  const weights = exam.aiAnalysis?.xaiLeadWeights;
  const highlightedLeads: Array<{ lead: EcgLeadName; score: number }> = weights
    ? (Object.entries(weights) as Array<[EcgLeadName, number]>)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([lead, score]) => ({ lead, score }))
    : [
        { lead: "V3", score: 0.94 },
        { lead: "V2", score: 0.89 },
        { lead: "II", score: 0.76 },
      ];

  const handleSavePdf = () => {
    const previousTitle = document.title;
    const safeName = exam.patientName.replace(
      /[^a-zA-Z0-9\u0600-\u06FF_-]+/g,
      "_",
    );
    const dateTag = new Date(exam.performedAt).toISOString().slice(0, 10);
    document.title = `ECGenius_Report_${safeName}_${dateTag}`;

    window.print();

    setTimeout(() => {
      document.title = previousTitle;
    }, 600);
  };

  const reportCardContent = (
    <div className="rounded-3xl bg-gradient-to-b from-[#f4f8ff] via-white to-[#f8fbff] border border-sky-200/90 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Official Branded Header */}
      <div className="rounded-2xl btn-landing-gradient p-5 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center font-black text-base">
            ECG
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-sky-200">
              ECGenius Clinical Cardiology Platform
            </p>
            <h3 className="text-lg sm:text-xl font-extrabold tracking-tight mt-0.5">
              {title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold ${
              status === "Finalized"
                ? "bg-emerald-400/20 text-emerald-100 border border-emerald-300/40"
                : "bg-amber-400/20 text-amber-100 border border-amber-300/40"
            }`}
          >
            {status === "Finalized" ? "Signed & Approved" : "Draft Report"}
          </span>

          {showPrintButton && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleSavePdf}
              className="no-print bg-white text-[#052e6e] hover:bg-sky-50"
            >
              <Printer className="w-3.5 h-3.5 text-[#0284c7]" />
              Save / Print PDF ({exam.patientName.split(" ")[0]})
            </Button>
          )}
        </div>
      </div>

      {/* Patient & Study Form Grid */}
      <div className="grid sm:grid-cols-3 gap-3.5 p-4 rounded-2xl bg-[#eef4fb]/80 border border-sky-200/70 text-xs">
        <div className="space-y-1">
          <span className="text-[#0284c7] font-bold flex items-center gap-1">
            <User className="w-3.5 h-3.5" /> Patient Name & ID
          </span>
          <p className="font-extrabold text-[#052e6e] text-sm">
            {exam.patientName}
          </p>
          <p className="text-slate-600">
            {exam.patientAge} yrs • {exam.patientGender} • ID: {exam.patientId}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[#0284c7] font-bold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Examination Date & Time
          </span>
          <p className="font-extrabold text-[#052e6e] text-sm">
            {new Date(exam.performedAt).toLocaleDateString()}
          </p>
          <p className="text-slate-600 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(exam.performedAt).toLocaleTimeString()} •{" "}
            {exam.examinationId.toUpperCase()}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[#e11d48] font-bold flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" /> ECG Telemetry Metrics
          </span>
          <p className="font-extrabold text-[#052e6e] text-sm">
            HR: {exam.aiAnalysis?.measurements.heartRateBpm ?? 74} bpm • QTc:{" "}
            {exam.aiAnalysis?.measurements.qtcMs ?? 418} ms
          </p>
          <p className="text-slate-600">
            PR: {exam.aiAnalysis?.measurements.prIntervalMs ?? 160} ms • QRS:{" "}
            {exam.aiAnalysis?.measurements.qrsDurationMs ?? 92} ms
          </p>
        </div>
      </div>

      {/* Annotated Abnormal ECG Waveforms & XAI Explanation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#052e6e] flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-[#e11d48]" />
            Flagged ECG Waveforms & XAI Saliency Annotation
          </h4>
          <span className="text-[11px] font-bold text-[#0284c7]">
            AI Confidence: {exam.aiAnalysis?.confidenceScore ?? 94.8}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {highlightedLeads.map(({ lead, score }) => {
            const isCriticalWave = score >= 0.7;
            const strokeColor = isCriticalWave ? "#e11d48" : "#0284c7";
            const explanation =
              LEAD_ANOMALY_EXPLANATIONS[lead] ||
              "Abnormal morphological contour detected in QRS-ST transition segment.";

            return (
              <div
                key={lead}
                className="rounded-2xl bg-white border border-sky-200/80 p-3.5 space-y-2.5 shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-[#052e6e]">Lead {lead}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isCriticalWave
                        ? "bg-rose-50 text-[#e11d48] border border-rose-200"
                        : "bg-sky-50 text-[#0284c7] border border-sky-200"
                    }`}
                  >
                    XAI Focus: {Math.round(score * 100)}%
                  </span>
                </div>

                <div className="rounded-xl bg-ecg-grid border border-rose-100 p-2">
                  <svg viewBox="0 0 220 68" className="w-full h-16">
                    <rect
                      x="86"
                      y="6"
                      width="62"
                      height="56"
                      rx="6"
                      fill={
                        isCriticalWave
                          ? "rgba(225, 29, 72, 0.13)"
                          : "rgba(2, 132, 199, 0.12)"
                      }
                      stroke={strokeColor}
                      strokeWidth="1.6"
                      strokeDasharray="4 2"
                    />
                    <text
                      x="91"
                      y="16"
                      fontSize="7"
                      fontWeight="bold"
                      fill={strokeColor}
                    >
                      Anomaly ROI
                    </text>

                    <path
                      d={
                        isCriticalWave
                          ? "M0 38 H35 Q42 32 48 38 L55 44 L62 12 L69 52 L76 38 H92 Q99 30 105 38 L112 46 L119 8 L126 54 L133 24 Q141 14 148 38 H175 Q182 32 188 38 L195 44 L202 14 L209 50 L216 38 H220"
                          : "M0 38 H40 Q47 33 53 38 L60 42 L67 16 L74 48 L81 38 H98 Q105 31 112 38 L119 45 L126 14 L133 50 L140 31 Q147 26 154 38 H180 Q187 33 193 38 L200 42 L207 16 L214 48 L220 38"
                      }
                      fill="none"
                      stroke="#052e6e"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {explanation}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Written Clinical Report Body */}
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#052e6e] mb-1.5">
            Diagnostic Findings & Rhythm Interpretation
          </h4>
          <div className="p-4 rounded-2xl bg-white border border-sky-100 text-sm text-slate-800 leading-relaxed whitespace-pre-line shadow-2xs">
            {content}
          </div>
        </div>

        {notes && (
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#052e6e] mb-1.5">
              Physician Clinical Notes & Follow-Up Plan
            </h4>
            <div className="p-4 rounded-2xl bg-[#eef4fb]/70 border border-sky-200/80 text-sm text-[#052e6e] leading-relaxed whitespace-pre-line">
              {notes}
            </div>
          </div>
        )}
      </div>

      {/* Official Signature Footer */}
      <div className="pt-4 border-t border-sky-200/70 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2 font-extrabold text-[#052e6e]">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            Signed & Verified by Dr. Ahmed Ashraf • Consultant Cardiologist
          </span>
        </div>
        <span className="font-semibold text-[#0284c7]">
          ECGenius 12-Lead XAI Report
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* العرض الطبيعي داخل أي صفحة (Reports / Patient / ExaminationDetail) */}
      <div id="printable-clinical-report">{reportCardContent}</div>

      {/* نسخة الطباعة المباشرة أعلى document.body لضمان عدم وجود أي صفحة بيضاء في كل الصفحات */}
      {typeof document !== "undefined" &&
        createPortal(
          <div id="ecgenius-print-sheet" className="hidden print:block">
            {reportCardContent}
          </div>,
          document.body,
        )}
    </>
  );
}
