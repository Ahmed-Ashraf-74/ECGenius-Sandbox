import { useState, useEffect, useRef, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Cpu,
  UploadCloud,
  CheckCircle2,
  Activity,
  Sparkles,
  Image as ImageIcon,
  ArrowRight,
  Radio,
  Search,
  UserPlus,
  AlertTriangle,
  UserCheck,
  X,
} from "lucide-react";
import Button from "../../components/common/Button";
import PatientAvatar from "../../components/common/PatientAvatar";
import PatientFormModal from "../../components/doctor/PatientFormModal";
import { clinicalService } from "../../services/clinicalMockService";
import type { PatientDto } from "../../types/ecg.types";

const TIMELINE_STEPS = [
  {
    step: "01",
    title: "Signal / ECG Image Ingestion",
    desc: "Calibrating 500Hz grid & digitizing 12-lead trace contours",
  },
  {
    step: "02",
    title: "Baseline Drift & R-Peak Extraction",
    desc: "Isolating P-QRS-T complexes and scanning beat regularity",
  },
  {
    step: "03",
    title: "ResNet1D-XAI Inference & Saliency",
    desc: "Detecting ST-segment & T-wave abnormalities across leads",
  },
  {
    step: "04",
    title: "Patient Record & Report Sync",
    desc: "Full 12-lead diagnostic signal mapped with all detected anomalies",
  },
];

// خط استاندباي هادئ قبل بدء الفحص (No active ECG recording)
const IDLE_FLATLINE_PATH =
  "M0 32 L65 32 L72 30 L78 34 L84 32 L155 32 L162 30 L168 34 L174 32 L245 32 L252 30 L258 34 L264 32 L300 32";

const NORMAL_WAVE_PATH =
  "M0 30 L25 30 Q32 22 38 30 L44 35 L50 10 L56 42 L62 30 Q72 23 82 30 L115 30 Q122 22 128 30 L134 35 L140 10 L146 42 L152 30 Q162 23 172 30 L205 30 Q212 22 218 30 L224 35 L230 10 L236 42 L242 30 Q252 23 262 30 L300 30";

const ABNORMAL_WAVE_PATH =
  "M0 30 L20 30 Q28 20 35 30 L42 37 L49 6 L56 47 L63 23 Q74 13 85 30 L115 30 Q123 20 130 30 L137 37 L144 6 L151 47 L158 23 Q169 13 180 30 L210 30 Q218 20 225 30 L232 37 L239 6 L246 47 L253 23 Q264 13 275 30 L300 30";

interface ActiveBoxState {
  active: boolean;
  boxX: number;
  boxLabel: string;
}

interface LoggedWarning {
  id: string;
  tag: string;
  text: string;
}

export default function StartExaminationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get("patientId");
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<"image" | "device" | "file">("image");
  const [patientSearch, setPatientSearch] = useState("");
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientDto | null>(
    null,
  );
  const [patientCleared, setPatientCleared] = useState(false);
  const [newPatientModalOpen, setNewPatientModalOpen] = useState(false);

  const [deviceId, setDeviceId] = useState("ECG-500HZ-04 (CardioLink Pro)");
  const [uploadedName, setUploadedName] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [runningStep, setRunningStep] = useState<number>(-1);
  const [createdExamId, setCreatedExamId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const monitorRef = useRef<HTMLDivElement | null>(null);
  const [wavePaused, setWavePaused] = useState(false);
  const [activeBox, setActiveBox] = useState<ActiveBoxState>({
    active: false,
    boxX: 112,
    boxLabel: "ST-Anomaly",
  });
  const [detectedWarnings, setDetectedWarnings] = useState<LoggedWarning[]>([]);

  const timeoutsRef = useRef<number[]>([]);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  const clearPipelineTimers = () => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  };

  useEffect(() => {
    return () => clearPipelineTimers();
    setTimeout(() => monitorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: patientsPage } = useQuery({
    queryKey: ["patients", { search: patientSearch, pageSize: 50 }],
    queryFn: () =>
      clinicalService.getPatients({ search: patientSearch, pageSize: 50 }),
  });

  const matchingPatients = patientsPage?.items || [];

  useEffect(() => {
    if (
      preselectedPatientId &&
      matchingPatients.length > 0 &&
      !selectedPatient &&
      !patientCleared
    ) {
      const found = matchingPatients.find(
        (p) => p.patientId === preselectedPatientId,
      );
      if (found) {
        setSelectedPatient(found);
      }
    }
  }, [preselectedPatientId, matchingPatients, selectedPatient, patientCleared]);

  const activePatient = patientCleared ? null : selectedPatient;
  const isCompleted = Boolean(createdExamId);
  const isRunning = runningStep >= 0 && !isCompleted;
  const isIdle = runningStep === -1 && !isCompleted;

  const handleClearSelectedPatient = () => {
    setSelectedPatient(null);
    setPatientCleared(true);
    setPatientSearch("");
    setSearchDropdownOpen(true);
  };

  const handleSelectPatient = (p: PatientDto) => {
    setSelectedPatient(p);
    setPatientCleared(false);
    setPatientSearch("");
    setSearchDropdownOpen(false);
  };

  const handleImageSelect = (file?: File) => {
    if (!file) return;
    setUploadedName(file.name);
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    } else {
      setImagePreviewUrl(null);
    }
  };

  const scheduleStep = (delayMs: number, fn: () => void) => {
    const id = window.setTimeout(fn, delayMs);
    timeoutsRef.current.push(id);
  };

  const handleRunPipeline = (e: FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;

    clearPipelineTimers();
    setCreatedExamId(null);
    setWavePaused(false);
    setActiveBox({ active: false, boxX: 112, boxLabel: "" });
    setDetectedWarnings([]);

    setRunningStep(0);

    scheduleStep(1300, () => {
      setRunningStep(1);
    });

    scheduleStep(2300, () => {
      setWavePaused(true);
      setActiveBox({
        active: true,
        boxX: 112,
        boxLabel: "ST-Elevation",
      });
      setDetectedWarnings((prev) => [
        ...prev,
        {
          id: "warn-1",
          tag: "Beat #2 • ST-Segment",
          text: "Abnormal ST-segment elevation detected in precordial cycle #2.",
        },
      ]);
    });

    scheduleStep(4300, () => {
      setActiveBox((prev) => ({ ...prev, active: false }));
      setWavePaused(false);
      setRunningStep(2);
    });

    scheduleStep(5500, () => {
      setWavePaused(true);
      setActiveBox({
        active: true,
        boxX: 206,
        boxLabel: "T-Wave Inversion",
      });
      setDetectedWarnings((prev) => [
        ...prev,
        {
          id: "warn-2",
          tag: "Beat #3 • T-Wave",
          text: "Secondary T-wave repolarization anomaly flagged in cycle #3.",
        },
      ]);
    });

    scheduleStep(7400, () => {
      setActiveBox((prev) => ({ ...prev, active: false }));
      setWavePaused(false);
      setRunningStep(3);
    });

    scheduleStep(8600, async () => {
      setWavePaused(true);
      setRunningStep(TIMELINE_STEPS.length);

      const sourceLabel =
        mode === "device"
          ? deviceId
          : mode === "image"
            ? `ECG Image (${uploadedName || "12lead_scan.png"})`
            : `WFDB File (${uploadedName || "record_500hz.dat"})`;

      const created = await clinicalService.createExamination({
        patientId: activePatient.patientId,
        sourceLabel,
      });
      queryClient.invalidateQueries({ queryKey: ["examinations"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({
        queryKey: ["patient", activePatient.patientId],
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setCreatedExamId(created.examinationId);
    });
  };

  const currentWavePath = isIdle
    ? IDLE_FLATLINE_PATH
    : detectedWarnings.length > 0 || isCompleted
      ? ABNORMAL_WAVE_PATH
      : NORMAL_WAVE_PATH;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-dash-card">
      {toastMsg && (
        <div className="rounded-2xl bg-emerald-600 text-white px-5 py-3.5 shadow-lg flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div>
        <h2 className="text-xl font-extrabold text-[#052e6e]">
          Start New 12-Lead ECG Examination
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Select or register a patient, choose your ECG acquisition method, and
          run real-time AI waveform analysis
        </p>
      </div>

      {/* 1. شريط البحث مع إمكانية إزالة المريض المختار + زر إضافة مريض جديد */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold uppercase tracking-wider text-[#052e6e]">
            Step 1 • Select or Register Patient
          </label>
          {activePatient ? (
            <span className="text-[11px] font-bold text-slate-400">
              ID:{" "}
              <strong className="text-[#052e6e]">
                {activePatient.patientId}
              </strong>{" "}
              • {activePatient.phoneNumber}
            </span>
          ) : (
            <span className="text-[11px] font-bold text-amber-600">
              No patient selected yet
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div ref={searchContainerRef} className="relative flex-1">
            <div
              onClick={() => setSearchDropdownOpen(true)}
              className={`w-full min-h-[46px] pl-11 pr-10 py-1.5 rounded-full flex items-center flex-wrap gap-2 transition cursor-text ${
                searchDropdownOpen
                  ? "bg-white border border-[#0284c7] ring-2 ring-sky-100"
                  : "bg-slate-100/80 border border-transparent hover:border-sky-200"
              }`}
            >
              <Search className="w-4 h-4 text-[#0284c7] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />

              {/* شارة المريض الملونة مع زر إزالة المريض (X) */}
              {activePatient && (
                <span className="btn-landing-gradient inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-xs font-extrabold text-white shadow-2xs">
                  <UserCheck className="w-3.5 h-3.5 text-sky-200" />
                  <span>{activePatient.fullName}</span>
                  <span className="text-[10px] text-sky-200 font-semibold">
                    ({activePatient.patientId})
                  </span>
                  <button
                    type="button"
                    title="Remove selected patient"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearSelectedPatient();
                    }}
                    className="ml-1 w-4 h-4 rounded-full bg-white/20 hover:bg-rose-500 text-white flex items-center justify-center transition cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <input
                type="text"
                value={patientSearch}
                onFocus={() => setSearchDropdownOpen(true)}
                onClick={() => setSearchDropdownOpen(true)}
                onChange={(e) => {
                  setPatientSearch(e.target.value);
                  setSearchDropdownOpen(true);
                }}
                placeholder={
                  activePatient
                    ? "Search another patient..."
                    : "Click to browse patients or search by name / ID..."
                }
                className="flex-1 min-w-[150px] bg-transparent text-xs sm:text-sm font-semibold text-[#052e6e] placeholder:text-slate-400 focus:outline-none py-1"
              />
            </div>

            {patientSearch && (
              <button
                type="button"
                onClick={() => setPatientSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {searchDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 z-30 rounded-3xl bg-white border border-sky-200 shadow-xl p-3 max-h-64 overflow-y-auto space-y-1.5 animate-dash-card">
                <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>
                    Showing {matchingPatients.slice(0, 6).length} of{" "}
                    {matchingPatients.length} patients
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchDropdownOpen(false)}
                    className="text-[#0284c7] hover:underline cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                {matchingPatients.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">
                    No patients match "{patientSearch}". Click "Add New Patient"
                    to register.
                  </p>
                ) : (
                  matchingPatients.slice(0, 6).map((p) => {
                    const isSelected = activePatient?.patientId === p.patientId;
                    return (
                      <button
                        key={p.patientId}
                        type="button"
                        onClick={() => handleSelectPatient(p)}
                        className={`w-full flex items-center justify-between gap-3 p-2.5 rounded-2xl text-left transition cursor-pointer ${
                          isSelected
                            ? "bg-[#eef4fb] border border-[#0284c7]"
                            : "hover:bg-slate-50 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <PatientAvatar
                            name={p.fullName}
                            gender={p.gender}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-[#052e6e] truncate">
                              {p.fullName}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {p.patientId} • {p.phoneNumber} • {p.age} yrs
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            isSelected
                              ? "btn-landing-gradient text-white"
                              : "bg-white border border-slate-200 text-[#052e6e]"
                          }`}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => setNewPatientModalOpen(true)}
            className="shrink-0"
          >
            <UserPlus className="w-4 h-4 text-sky-200" />
            Add New Patient
          </Button>
        </div>
      </div>

      {/* 2. طريقة الفحص */}
      <form
        onSubmit={handleRunPipeline}
        className="rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="text-xs font-extrabold uppercase tracking-wider text-[#052e6e]">
            Step 2 • Choose ECG Acquisition Method
          </label>

          <div className="inline-flex flex-wrap gap-1.5 p-1.5 rounded-full bg-slate-100/90 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setMode("image")}
              className={`px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer ${
                mode === "image"
                  ? "btn-landing-gradient text-white shadow-xs"
                  : "text-slate-600 hover:text-[#052e6e]"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              ECG Image Upload
            </button>
            <button
              type="button"
              onClick={() => setMode("device")}
              className={`px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer ${
                mode === "device"
                  ? "btn-landing-gradient text-white shadow-xs"
                  : "text-slate-600 hover:text-[#052e6e]"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              Device Sync
            </button>
            <button
              type="button"
              onClick={() => setMode("file")}
              className={`px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer ${
                mode === "file"
                  ? "btn-landing-gradient text-white shadow-xs"
                  : "text-slate-600 hover:text-[#052e6e]"
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              WFDB / CSV File
            </button>
          </div>
        </div>

        {mode === "image" && (
          <div className="grid md:grid-cols-12 gap-4 items-center">
            <label
              className={`${
                imagePreviewUrl ? "md:col-span-7" : "md:col-span-12"
              } flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-sky-300 bg-[#f8fbff] hover:bg-[#eef4fb] transition p-6 cursor-pointer text-center`}
            >
              <ImageIcon className="w-9 h-9 text-[#0284c7] mb-2" />
              <span className="text-sm font-extrabold text-[#052e6e]">
                {uploadedName || "Upload 12-Lead ECG Image (PNG, JPG, WEBP)"}
              </span>
              <span className="text-xs text-slate-400 mt-1">
                AI waveform digitizer extracts all 12 leads automatically
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageSelect(e.target.files?.[0])}
              />
            </label>

            {imagePreviewUrl && (
              <div className="md:col-span-5 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 p-2.5">
                <img
                  src={imagePreviewUrl}
                  alt="Uploaded ECG preview"
                  className="w-full max-h-40 object-contain rounded-xl"
                />
              </div>
            )}
          </div>
        )}

        {mode === "device" && (
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-[#052e6e] mb-1.5">
                Connected 12-Lead ECG Hardware Unit
              </label>
              <select
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-100/80 text-xs sm:text-sm font-semibold text-slate-800"
              >
                <option>ECG-500HZ-04 (CardioLink Pro • Online)</option>
                <option>ECG-500HZ-02 (Ward B Mobile Cart • Online)</option>
                <option>ECG-500HZ-07 (ICU Telemetry Station • Online)</option>
              </select>
            </div>
            <div className="rounded-2xl bg-[#eef4fb] border border-sky-200 p-4 flex items-center gap-3">
              <Cpu className="w-6 h-6 text-[#0284c7] shrink-0" />
              <div className="text-xs">
                <p className="font-extrabold text-[#052e6e]">
                  12/12 Electrodes Calibrated at 500Hz
                </p>
                <p className="text-slate-500 mt-0.5">
                  Low-noise baseline filter active • Ready for direct capture
                </p>
              </div>
            </div>
          </div>
        )}

        {mode === "file" && (
          <label className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-sky-300 bg-[#f8fbff] hover:bg-[#eef4fb] transition p-6 cursor-pointer text-center">
            <UploadCloud className="w-9 h-9 text-[#0284c7] mb-2" />
            <span className="text-sm font-extrabold text-[#052e6e]">
              {uploadedName || "Select WFDB (.dat/.hea) or Raw CSV Signal File"}
            </span>
            <span className="text-xs text-slate-400 mt-1">
              Supports PhysioNet PTB-XL / MIT-BIH 12-lead digital signal formats
            </span>
            <input
              type="file"
              accept=".dat,.hea,.csv,.json"
              className="hidden"
              onChange={(e) => handleImageSelect(e.target.files?.[0])}
            />
          </label>
        )}

        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Target Patient:{" "}
            <strong className="text-[#052e6e]">
              {activePatient?.fullName || "Please select a patient above"}
            </strong>
          </span>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!activePatient || isRunning}
          >
            <Sparkles className="w-4 h-4 text-sky-200" />
            {isRunning
              ? activeBox.active
                ? "Inspecting Flagged Beat..."
                : `Scanning Waveforms (${Math.min(runningStep + 1, 4)}/4)...`
              : activePatient
                ? `Run AI Analysis for ${activePatient.fullName.split(" ")[0]}`
                : "Select a Patient to Start"}
          </Button>
        </div>
      </form>

      {/* 3. AI Diagnostic Journey بالعرض الكامل (Idle baseline -> Live ECG Simulation) */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#052e6e]">
              AI Diagnostic Journey
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isIdle
                ? "Standby baseline • Waiting for ECG acquisition to begin waveform simulation"
                : isCompleted
                  ? "Analysis Complete • Full signal & anomalies mapped and saved to patient record"
                  : activeBox.active
                    ? "Signal paused • Anomaly detected on waveform"
                    : "Scanning continuous 12-lead ECG stream..."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isIdle
                  ? "bg-slate-100 text-slate-500 border border-slate-200"
                  : activeBox.active
                    ? "bg-rose-50 text-[#e11d48] border border-rose-200"
                    : isCompleted
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-sky-50 text-[#0284c7] border border-sky-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isIdle
                    ? "bg-slate-400"
                    : activeBox.active
                      ? "bg-[#e11d48] animate-ping"
                      : isCompleted
                        ? "bg-emerald-600"
                        : "bg-[#0284c7] animate-ping"
                }`}
              />
              {isIdle
                ? "Standby • No Active ECG"
                : activeBox.active
                  ? "Paused on Anomaly"
                  : isCompleted
                    ? "Completed & Saved"
                    : "Live ECG Simulation"}
            </span>

            {createdExamId && (
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  navigate(`/doctor/examinations/${createdExamId}`)
                }
              >
                Inspect 12-Lead XAI
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* شريط الموجة */}
        <div
          className={`rounded-2xl bg-ecg-grid border p-4 overflow-hidden transition-colors duration-300 ${
            activeBox.active
              ? "border-[#e11d48] shadow-sm"
              : isIdle
                ? "border-slate-200/80"
                : "border-rose-200/80"
          }`}
        >
          <svg viewBox="0 0 300 64" className="w-full h-24 overflow-visible">
            {activeBox.active && !isCompleted && (
              <g className="animate-dash-card">
                <rect
                  x={activeBox.boxX}
                  y="3"
                  width="66"
                  height="56"
                  rx="7"
                  fill="rgba(225, 29, 72, 0.16)"
                  stroke="#e11d48"
                  strokeWidth="1.9"
                  strokeDasharray="4 2"
                />
                <text
                  x={activeBox.boxX + 5}
                  y="12"
                  fontSize="7.2"
                  fontWeight="bold"
                  fill="#e11d48"
                >
                  {activeBox.boxLabel}
                </text>
              </g>
            )}

            {isCompleted && (
              <g>
                <rect
                  x="112"
                  y="3"
                  width="66"
                  height="56"
                  rx="6"
                  fill="rgba(225, 29, 72, 0.14)"
                  stroke="#e11d48"
                  strokeWidth="1.6"
                  strokeDasharray="3 2"
                />
                <text
                  x="116"
                  y="12"
                  fontSize="6.8"
                  fontWeight="bold"
                  fill="#e11d48"
                >
                  ST-Elevation
                </text>

                <rect
                  x="206"
                  y="3"
                  width="66"
                  height="56"
                  rx="6"
                  fill="rgba(225, 29, 72, 0.14)"
                  stroke="#e11d48"
                  strokeWidth="1.6"
                  strokeDasharray="3 2"
                />
                <text
                  x="210"
                  y="12"
                  fontSize="6.8"
                  fontWeight="bold"
                  fill="#e11d48"
                >
                  T-Wave Alert
                </text>
              </g>
            )}

            <path
              d={currentWavePath}
              fill="none"
              stroke={
                isIdle
                  ? "#94a3b8"
                  : activeBox.active
                    ? "#e11d48"
                    : isCompleted
                      ? "#052e6e"
                      : "#0284c7"
              }
              strokeWidth={isIdle ? "1.8" : "2.2"}
              strokeLinecap="round"
              style={{
                animationPlayState:
                  wavePaused || isCompleted ? "paused" : "running",
                transition: "stroke 0.35s ease",
              }}
              className={isCompleted ? "" : "animate-ecg-loop"}
            />
          </svg>
        </div>

        {/* سجل التحذيرات */}
        {detectedWarnings.length > 0 && (
          <div className="grid md:grid-cols-2 gap-2.5">
            {detectedWarnings.map((warn) => (
              <div
                key={warn.id}
                className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 flex items-start gap-2.5 text-xs text-[#e11d48] animate-dash-card"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block text-[11px] uppercase tracking-wide">
                    {warn.tag}
                  </span>
                  <span className="font-semibold">{warn.text}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* التايم لاين الأفقي */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {TIMELINE_STEPS.map((st, idx) => {
            const isDone = runningStep > idx || isCompleted;
            const isCurrent = runningStep === idx && !isCompleted;
            return (
              <div
                key={st.step}
                className={`p-4 rounded-2xl border transition-all relative ${
                  isDone
                    ? "bg-emerald-50/60 border-emerald-200"
                    : isCurrent
                      ? "bg-[#eef4fb] border-[#0284c7] shadow-xs"
                      : "bg-slate-50/70 border-slate-200/70"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <span
                    className={`w-7 h-7 rounded-full text-[11px] font-black flex items-center justify-center border-2 transition-all ${
                      isDone
                        ? "btn-landing-gradient text-white border-white"
                        : isCurrent
                          ? "bg-white text-[#0284c7] border-[#0284c7]"
                          : "bg-white text-slate-400 border-slate-200"
                    }`}
                  >
                    {isDone ? "✓" : st.step}
                  </span>
                  <p className="text-xs font-extrabold text-[#052e6e]">
                    {st.title}
                  </p>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            );
          })}
        </div>

        {createdExamId && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              Saved permanently to {activePatient?.fullName} ({createdExamId})
            </span>
            <div className="flex items-center gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  navigate(`/doctor/patients/${activePatient?.patientId}`)
                }
              >
                Open Patient Profile
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  navigate(`/doctor/examinations/${createdExamId}`)
                }
              >
                Inspect & Finalize Report
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <PatientFormModal
        isOpen={newPatientModalOpen}
        onClose={() => setNewPatientModalOpen(false)}
        onPatientSaved={(saved) => handleSelectPatient(saved)}
        onSuccessMessage={(msg) => {
          setToastMsg(msg);
          setTimeout(() => setToastMsg(null), 4000);
        }}
      />
    </div>
  );
}
