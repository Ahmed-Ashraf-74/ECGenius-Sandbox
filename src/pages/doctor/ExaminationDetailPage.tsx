import { useState, useEffect, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
  Pin,
  Columns2,
  Stethoscope,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import Button from "../../components/common/Button";
import PatientAvatar from "../../components/common/PatientAvatar";
import PrintableClinicalReport from "../../components/doctor/PrintableClinicalReport";
import { clinicalService } from "../../services/clinicalMockService";
import {
  ECG_LEAD_ORDER,
  type DoctorReviewDecision,
  type EcgLeadName,
} from "../../types/ecg.types";

function buildWaveform(
  lead: EcgLeadName,
  abnormal: boolean,
  gain: number,
): string {
  const idx = ECG_LEAD_ORDER.indexOf(lead) + 1;
  const amp =
    (abnormal && ["V2", "V3", "V4", "II", "V1"].includes(lead) ? 1.25 : 0.85) *
    gain;
  const stShift = abnormal && ["V2", "V3", "V4"].includes(lead) ? -6 * gain : 0;

  const pts: string[] = ["M 0 28"];
  const step = 55;
  for (let c = 0; c < 4; c++) {
    const x = c * step;
    const j = ((idx * (c + 2)) % 4) - 1.5;
    pts.push(`L ${x + 8} 28`);
    pts.push(`Q ${x + 12} ${23 + j * 0.3}, ${x + 16} 28`);
    pts.push(`L ${x + 21} ${31}`);
    pts.push(`L ${x + 25} ${Math.max(3, 28 - 20 * amp)}`);
    pts.push(`L ${x + 29} ${Math.min(52, 34 + 6 * amp)}`);
    pts.push(`L ${x + 34} ${28 + stShift}`);
    pts.push(`Q ${x + 42} ${20 + stShift}, ${x + 49} 28`);
    pts.push(`L ${x + step} 28`);
  }
  return pts.join(" ");
}

export default function ExaminationDetailPage() {
  const { examinationId = "exam-5001" } = useParams();
  const queryClient = useQueryClient();

  const [showXai, setShowXai] = useState(true);
  const [gainScale, setGainScale] = useState<number>(1);
  const [compareBaseline, setCompareBaseline] = useState(false);
  const [selectedLead, setSelectedLead] = useState<EcgLeadName>("V3");

  // Per-lead isolated manual annotations map
  const [leadAnnotations, setLeadAnnotations] = useState<
    Partial<Record<EcgLeadName, Array<{ id: string; note: string }>>>
  >({
    V3: [{ id: "pin-1", note: "J-point elevation +3.2mm observed at 4.1s" }],
  });
  const [newMarkerNote, setNewMarkerNote] = useState("");

  const [decision, setDecision] = useState<DoctorReviewDecision>("Approved");
  const [reportTitle, setReportTitle] = useState("");
  const [reportContent, setReportContent] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ["examinations"],
    queryFn: () => clinicalService.getExaminations(),
  });

  const exam = exams.find((e) => e.examinationId === examinationId) || exams[0];

  useEffect(() => {
    if (exam) {
      setReportTitle(exam.report?.reportTitle || "12-Lead Clinical ECG Report");
      setReportContent(
        exam.report?.reportContent || exam.aiAnalysis?.predictedResult || "",
      );
      setDoctorNotes(exam.report?.doctorNotes || "");
    }
  }, [exam]);

  const signOffMutation = useMutation({
    mutationFn: () =>
      clinicalService.submitDoctorReview({
        examinationId: exam!.examinationId,
        decision,
        reportTitle,
        reportContent,
        doctorNotes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["examination", examinationId],
      });
      queryClient.invalidateQueries({ queryKey: ["examinations"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      if (exam?.patientId) {
        queryClient.invalidateQueries({
          queryKey: ["patient", exam.patientId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setSavedBanner("Report synced & saved to patient history!");
      setTimeout(() => setSavedBanner(null), 4000);
    },
  });

  if (isLoading || !exam) {
    return <div className="h-96 rounded-3xl bg-white animate-pulse" />;
  }

  const currentLeadNotes = leadAnnotations[selectedLead] || [];

  const handleAddAnnotation = (e: FormEvent) => {
    e.preventDefault();
    if (!newMarkerNote.trim()) return;
    setLeadAnnotations((prev) => ({
      ...prev,
      [selectedLead]: [
        { id: `pin-${Date.now()}`, note: newMarkerNote.trim() },
        ...(prev[selectedLead] || []),
      ],
    }));
    setNewMarkerNote("");
  };

  const handleRemoveAnnotation = (lead: EcgLeadName, pinId: string) => {
    setLeadAnnotations((prev) => ({
      ...prev,
      [lead]: (prev[lead] || []).filter((item) => item.id !== pinId),
    }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-dash-card">
      {savedBanner && (
        <div className="rounded-2xl bg-emerald-600 text-white px-5 py-3.5 shadow-lg flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5" />
          <span>{savedBanner}</span>
        </div>
      )}

      {/* Top Navigation & Waveform Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/doctor/examinations"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#052e6e] hover:text-[#0284c7]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Examinations
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setGainScale((g) => Math.max(0.5, Number((g - 0.25).toFixed(2))))
            }
            className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-[#052e6e] inline-flex items-center gap-1 cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
            Scale -
          </button>
          <span className="text-xs font-mono font-bold text-[#052e6e] px-1">
            {Math.round(gainScale * 10)} mm/mV
          </span>
          <button
            type="button"
            onClick={() =>
              setGainScale((g) => Math.min(2.5, Number((g + 0.25).toFixed(2))))
            }
            className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-[#052e6e] inline-flex items-center gap-1 cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            Scale +
          </button>

          <button
            type="button"
            onClick={() => setCompareBaseline((c) => !c)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer ${
              compareBaseline
                ? "btn-landing-gradient text-white"
                : "bg-white border border-slate-200 text-[#052e6e]"
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            Side-by-Side Baseline
          </button>

          <button
            type="button"
            onClick={() => setShowXai((s) => !s)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer ${
              showXai
                ? "btn-landing-gradient text-white"
                : "bg-white border border-slate-200 text-[#052e6e]"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {showXai ? "XAI Overlay: ON" : "XAI Overlay: OFF"}
          </button>
        </div>
      </div>

      {/* Main Split: 12-Lead Matrix + Per-Lead Isolated Pins (8 Cols) & Sign-Off (4 Cols) */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-5">
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <PatientAvatar
                  name={exam.patientName}
                  gender={exam.patientGender}
                  size="md"
                />
                <div>
                  <Link
                    to={`/doctor/patients/${exam.patientId}`}
                    className="text-lg font-extrabold text-[#052e6e] hover:text-[#0284c7]"
                  >
                    {exam.patientName} • {exam.examinationId.toUpperCase()}
                  </Link>
                  <p className="text-xs font-bold text-[#e11d48] mt-0.5">
                    AI Prediction: {exam.aiAnalysis?.predictedResult} (
                    {exam.aiAnalysis?.confidenceScore}% confidence)
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                Signal Quality: {exam.signalQuality}
              </span>
            </div>

            {/* 12-Lead Grid with Per-Lead Pin Counter */}
            {compareBaseline && (<div className="px-3.5 py-2 rounded-2xl bg-slate-100 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs"><span className="font-bold text-[#052e6e]">Side-by-Side Baseline Overlay Active (Current Patient Trace vs. Healthy Sinus Reference)</span><span className="inline-flex items-center gap-4 font-semibold text-slate-600"><span className="inline-flex items-center gap-1.5"><span className="w-4 h-0.5 bg-[#052e6e] inline-block"></span>Patient ECG</span><span className="inline-flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed border-slate-400 inline-block"></span>Normal Baseline</span></span></div>)}<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {ECG_LEAD_ORDER.map((lead) => {
                const weight = exam.aiAnalysis?.xaiLeadWeights[lead] ?? 0.2;
                const high = showXai && weight >= 0.75;
                const focused = selectedLead === lead;
                const pinCount = (leadAnnotations[lead] || []).length;

                return (
                  <button
                    key={lead}
                    type="button"
                    onClick={() => setSelectedLead(lead)}
                    className={`text-left rounded-2xl p-3 border transition cursor-pointer relative overflow-hidden ${
                      focused
                        ? "ring-2 ring-[#0284c7] border-[#0284c7] bg-white"
                        : high
                          ? "bg-rose-50/70 border-rose-300"
                          : "bg-[#f8fbff] border-slate-200/80"
                    }`}
                  >
                    {showXai && weight >= 0.55 && (
                      <div
                        style={{ opacity: Math.min(0.3, weight * 0.34) }}
                        className={`pointer-events-none absolute inset-y-0 left-[34%] w-[26%] ${
                          weight >= 0.75 ? "bg-[#e11d48]" : "bg-[#0284c7]"
                        }`}
                      />
                    )}
                    <div className="flex items-center justify-between text-[11px] relative z-10">
                      <span className="font-black text-[#052e6e] flex items-center gap-1">
                        {lead}
                        {pinCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-[#0284c7] text-white text-[9px] font-bold">
                            {pinCount} pin
                          </span>
                        )}
                      </span>
                      {showXai && (
                        <span className="text-[10px] font-mono font-bold text-[#0284c7]">
                          {Math.round(weight * 100)}%
                        </span>
                      )}
                    </div>
                    <svg
                      viewBox="0 0 220 56"
                      style={{ height: `${Math.round(48 * gainScale)}px` }} className="w-full mt-1 relative z-10 transition-all duration-200"
                    >
                      {compareBaseline && (
                        <path
                          d={buildWaveform(lead, false, gainScale)}
                          fill="none"
                          stroke="#94a3b8"
                          strokeWidth="1.4"
                          strokeDasharray="3 3"
                        />
                      )}
                      <path
                        d={buildWaveform(
                          lead,
                          exam.riskLevel !== "Normal",
                          gainScale,
                        )}
                        fill="none"
                        stroke={high ? "#e11d48" : "#052e6e"}
                        strokeWidth="2"
                      />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Isolated Per-Lead Manual Annotation Tool with Delete Action */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#052e6e] flex items-center gap-2">
                <Pin className="w-4 h-4 text-[#0284c7]" />
                Lead {selectedLead} Pinned Notes ({currentLeadNotes.length})
              </h3>
              <span className="text-[11px] text-slate-400">
                Click any lead card above to switch channel notes
              </span>
            </div>

            <form onSubmit={handleAddAnnotation} className="flex gap-2">
              <input
                type="text"
                value={newMarkerNote}
                onChange={(e) => setNewMarkerNote(e.target.value)}
                placeholder={`Pin a clinical note specifically on Lead ${selectedLead}...`}
                className="flex-1 px-4 py-2 rounded-full bg-slate-100/80 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border focus:border-[#0284c7]"
              />
              <Button type="submit" variant="primary" size="sm">
                Pin to {selectedLead}
              </Button>
            </form>

            {currentLeadNotes.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No pinned annotations on Lead {selectedLead} yet.
              </p>
            ) : (
              <div className="space-y-2">
                {currentLeadNotes.map((pin) => (
                  <div
                    key={pin.id}
                    className="px-4 py-2.5 rounded-2xl bg-[#f8fbff] border border-slate-200/80 text-xs flex items-center justify-between gap-3"
                  >
                    <span>
                      <strong className="text-[#0284c7]">
                        [{selectedLead}]
                      </strong>{" "}
                      {pin.note}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveAnnotation(selectedLead, pin.id)
                      }
                      title="Remove pin"
                      className="p-1.5 rounded-xl text-slate-400 hover:text-[#e11d48] hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Doctor Review & Sign-Off Form */}
        <div className="lg:col-span-4 rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              signOffMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Stethoscope className="w-5 h-5 text-[#0284c7]" />
              <h3 className="text-base font-extrabold text-[#052e6e]">
                Doctor Review & Sign-off
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  "Approved",
                  "Modified",
                  "NeedsReRecording",
                ] as DoctorReviewDecision[]
              ).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setDecision(opt)}
                  className={`py-2 rounded-full text-[11px] font-extrabold transition cursor-pointer ${
                    decision === opt
                      ? "btn-landing-gradient text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {opt === "NeedsReRecording" ? "Re-Record" : opt}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#052e6e] mb-1">
                Report Title
              </label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100/80 text-xs font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#052e6e] mb-1">
                Clinical Interpretation
              </label>
              <textarea
                rows={4}
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100/80 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#052e6e] mb-1">
                Medical Notes & Follow-up Plan
              </label>
              <textarea
                rows={3}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100/80 text-xs text-slate-800"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={signOffMutation.isPending}
              className="w-full"
            >
              {signOffMutation.isPending
                ? "Saving..."
                : "Finalize & Sync to Patient"}
            </Button>
          </form>
        </div>
      </div>

      {/* Live Unified Report Preview & PDF Export (Matches Reports & Patient Profile) */}
      <PrintableClinicalReport
        exam={exam}
        customTitle={reportTitle}
        customContent={reportContent}
        customNotes={doctorNotes}
      />
    </div>
  );
}

