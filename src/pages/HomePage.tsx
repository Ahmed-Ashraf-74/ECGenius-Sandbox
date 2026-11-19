import { useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  BrainCircuit,
  Stethoscope,
  Wrench,
  ArrowRight,
  CalendarCheck,
  ShieldCheck,
  BellRing,
  HeartPulse,
  CheckCircle2,
  Cpu,
  MoveHorizontal,
  Radio,
  FileCheck2,
  MessageSquareHeart,
} from "lucide-react";
import Button from "../components/common/Button";

const interactiveServices = [
  {
    id: "acquisition",
    title: "12-Lead Acquisition",
    short: "Direct ECG hardware & WFDB sync",
    detail:
      "Seamless real-time capture from connected ECG machines or digital WFDB/CSV files with automatic lead ordering.",
    metric: "12 Leads • 500Hz",
    icon: Cpu,
  },
  {
    id: "quality",
    title: "Signal Quality AI",
    short: "Noise & flatline detection",
    detail:
      "Pre-inference validation flags baseline wander, powerline interference, and lead disconnection before diagnosis.",
    metric: "99.4% Noise Filter",
    icon: ShieldCheck,
  },
  {
    id: "xai",
    title: "Explainable XAI",
    short: "Lead-level saliency heatmaps",
    detail:
      "Integrated Gradients & Saliency highlight exact P-QRS-T segments driving every AI prediction for full clinical trust.",
    metric: "Lead-by-Lead Focus",
    icon: BrainCircuit,
  },
  {
    id: "triage",
    title: "Critical Red Alerts",
    short: "Automated risk prioritization",
    detail:
      "High-risk arrhythmias trigger instant red-alert badges on the Doctor Dashboard so urgent cases are reviewed first.",
    metric: "< 1.5s Alert Sync",
    icon: BellRing,
  },
  {
    id: "patient",
    title: "Patient Companion",
    short: "AI explainer & daily habits",
    detail:
      "Translates doctor-approved reports into plain language with a RAG medical assistant and personalized heart habits.",
    metric: "24/7 Guided Care",
    icon: HeartPulse,
  },
];

const workflowStages = [
  {
    step: "01",
    title: "Hardware & Signal Capture",
    role: "ECG Device / Technician",
    duration: "0.4 sec",
    summary:
      "12-lead voltage streams directly from the clinical ECG unit or uploaded WFDB records with automatic baseline noise filtering.",
    highlights: [
      "500Hz synchronous sampling",
      "Automatic lead-off detection",
      "Encrypted TLS ingestion",
    ],
    icon: Radio,
  },
  {
    step: "02",
    title: "Deep Learning & XAI Saliency",
    role: "ECGenius AI Engine",
    duration: "0.8 sec",
    summary:
      "Multi-label neural models classify rhythm and ischemia patterns while generating lead-by-lead saliency maps on P-QRS-T waves.",
    highlights: [
      "Calibrated confidence scoring",
      "PR, QRS & QTc interval extraction",
      "Visual ST-segment attribution",
    ],
    icon: BrainCircuit,
  },
  {
    step: "03",
    title: "Clinician Review & Sign-Off",
    role: "Cardiologist Portal",
    duration: "Priority Triage",
    summary:
      "Critical findings surface at the top of the Doctor Dashboard with red-alert flags, historical ECG comparison, and one-click report approval.",
    highlights: [
      "Accept, override, or annotate AI",
      "Side-by-side prior ECG diff",
      "Digital clinical signature",
    ],
    icon: FileCheck2,
  },
  {
    step: "04",
    title: "Guided Patient Follow-Up",
    role: "Patient Companion",
    duration: "24/7 Care",
    summary:
      "Once approved by the physician, patients receive a plain-language summary, personalized daily heart habits, and a medical RAG assistant.",
    highlights: [
      "Jargon-free report translation",
      "Daily medication & habit tracker",
      "Doctor-verified guardrails",
    ],
    icon: MessageSquareHeart,
  },
];

export default function HomePage() {
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 });
  const [activeService, setActiveService] = useState<string>("xai");
  const [activeStage, setActiveStage] = useState<number>(0);
  const [sliderPos, setSliderPos] = useState(50);

  const handleHeroMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
    setHeroTilt({ x, y });
  };

  const currentStage = workflowStages[activeStage];

  return (
    <div className="flex flex-col">
      {/* =====================================================================
          SECTION 1: ASYMMETRIC SPLIT HERO + THICK 3D ORBITAL WAVES
         ===================================================================== */}
      <section id="overview" className="px-4 sm:px-6 pt-5 pb-12">
        <div
          onMouseMove={handleHeroMouseMove}
          onMouseLeave={() => setHeroTilt({ x: 0, y: 0 })}
          className="max-w-7xl mx-auto rounded-[2.5rem] bg-white border border-white shadow-[0_24px_70px_-15px_rgba(5,46,110,0.12)] relative overflow-hidden px-6 sm:px-14 pt-12 pb-16 lg:py-20"
        >
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full bg-gradient-to-tr from-[#052e6e]/15 via-sky-400/25 to-rose-500/18 blur-3xl" />

          <div className="relative z-10 grid lg:grid-cols-12 gap-4 items-center">
            {/* Left Split Headline */}
            <div className="lg:col-span-4 text-left z-20">
              <h1 className="animate-reveal-up text-4xl sm:text-5xl lg:text-[3.35rem] font-extrabold tracking-tight text-[#052e6e] leading-[1.06]">
                <span className="block">Not all signals</span>
                <span className="block">need guessing,</span>
                <span className="block">some need vision</span>
              </h1>
              <p className="animate-reveal-delay-1 mt-5 text-sm sm:text-[15px] font-normal text-slate-600 leading-relaxed max-w-xs">
                An AI-powered 12-lead ECG ecosystem combining real-time hardware
                acquisition and explainable deep learning.
              </p>
            </div>

            {/* Center Glass Heart Surrounded by Bold 3D Circular Orbital Waves */}
            <div className="lg:col-span-4 flex justify-center items-center py-6 lg:py-0 relative z-20">
              <div
                style={{
                  transform: `perspective(1100px) rotateX(${heroTilt.y}deg) rotateY(${heroTilt.x}deg)`,
                  transition: "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
                  transformStyle: "preserve-3d",
                }}
                className="relative flex items-center justify-center w-[23rem] h-[23rem] sm:w-[28rem] sm:h-[28rem]"
              >
                <div className="pointer-events-none absolute inset-5 rounded-full border-2 border-sky-500/55 animate-pulse-wave" />
                <div className="pointer-events-none absolute inset-5 rounded-full border-2 border-rose-500/45 animate-pulse-wave-delay" />

                <div
                  style={{ transformStyle: "preserve-3d" }}
                  className="pointer-events-none absolute inset-0 rounded-full border-[3px] border-sky-500/65 shadow-[0_0_28px_rgba(14,165,233,0.35)] animate-orbit-cw"
                >
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#0284c7] ring-4 ring-sky-300/40 shadow-[0_0_16px_#0ea5e9]" />
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#e11d48] ring-4 ring-rose-300/40 shadow-[0_0_14px_#e11d48]" />
                </div>

                <div
                  style={{ transformStyle: "preserve-3d" }}
                  className="pointer-events-none absolute inset-3 rounded-full border-2 border-dashed border-[#052e6e]/45 animate-orbit-ccw"
                >
                  <span className="absolute top-1/2 -right-2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-sky-500 shadow-[0_0_14px_#0284c7]" />
                </div>

                <svg
                  viewBox="0 0 320 320"
                  className="pointer-events-none absolute inset-0 w-full h-full animate-orbit-cw opacity-85"
                >
                  <defs>
                    <linearGradient
                      id="ecgRingGrad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        stopColor="#0284c7"
                        stopOpacity="0.95"
                      />
                      <stop
                        offset="50%"
                        stopColor="#e11d48"
                        stopOpacity="0.95"
                      />
                      <stop
                        offset="100%"
                        stopColor="#052e6e"
                        stopOpacity="0.45"
                      />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="160"
                    cy="160"
                    r="146"
                    fill="none"
                    stroke="url(#ecgRingGrad)"
                    strokeWidth="3.5"
                    strokeDasharray="24 10 6 10"
                    strokeLinecap="round"
                  />
                </svg>

                <img
                  src="/images/glass-heart.png"
                  alt="ECGenius 3D Glass Heart"
                  className="w-[21rem] h-[21rem] sm:w-[26rem] sm:h-[26rem] lg:w-[28rem] lg:h-[28rem] lg:scale-105 object-contain animate-heart-3d drop-shadow-[0_32px_50px_rgba(5,46,110,0.28)] relative z-10"
                />
              </div>
            </div>

            {/* Right Split Headline + Pill CTA */}
            <div className="lg:col-span-4 flex flex-col items-start lg:pl-8 z-20">
              <h2 className="animate-reveal-delay-1 text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold tracking-tight text-[#052e6e] leading-[1.08]">
                Cardiac care made personal
              </h2>
              <p className="animate-reveal-delay-2 mt-4 text-sm sm:text-[15px] font-normal text-slate-600 leading-relaxed">
                Instant clinical measurements, lead-level XAI heatmaps, and
                doctor-verified reports.
              </p>
              <div className="animate-reveal-delay-2 mt-7 flex flex-wrap items-center gap-3">
                <a href="#gateways">
                  <Button
                    variant="primary"
                    size="lg"
                    className="rounded-full px-7 shadow-lg shadow-sky-950/20"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    Access Portal
                  </Button>
                </a>
                <a href="#workflow">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full px-6"
                  >
                    Explore Workflow
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Giant Subtle Background Watermark (Standard hyphen -) */}
          <div className="pointer-events-none select-none mt-6 lg:-mt-6 text-center overflow-hidden relative z-10">
            <span className="text-5xl sm:text-7xl lg:text-[6.2rem] font-black tracking-tight text-[#052e6e]/[0.05] whitespace-nowrap block">
              ECGenius - Smart. Explained.
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 2: MESH GRADIENT ROYAL NAVY STATEMENT
         ===================================================================== */}
      <section className="px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto rounded-[2.5rem] bg-gradient-to-br from-[#02183b] via-[#052e6e] to-[#0284c7] animate-gradient-shift text-white p-8 sm:p-14 relative overflow-hidden shadow-xl">
          <div className="pointer-events-none absolute -top-24 -right-20 w-80 h-80 rounded-full bg-sky-300/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-[#0284c7]/35 blur-3xl" />
          <div className="pointer-events-none absolute top-1/2 right-12 w-48 h-48 rounded-full bg-rose-500/15 blur-3xl" />
          <div className="absolute inset-0 bg-ecg-grid opacity-[0.06] pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between text-xs font-semibold tracking-widest uppercase text-sky-200/85 mb-6">
            <span>About ECGenius</span>
            <span>Device • AI • Backend • Web</span>
          </div>

          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.12]">
              Unveil precision. Discover the ECGenius difference.
            </h2>
            <p className="mt-5 text-sky-100/90 text-sm sm:text-[15px] font-normal leading-relaxed">
              We believe cardiac diagnostics deserve transparency, speed, and
              clarity. By embedding deep learning directly into the ECG
              workflow, doctors focus on critical decisions while patients stay
              connected to their recovery.
            </p>
          </div>

          <div className="relative z-10 mt-12 pt-8 border-t border-white/15 grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold">12-Lead</p>
              <p className="text-xs sm:text-sm font-normal text-sky-200/85 mt-1">
                Full synchronous waveform analysis
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold">98.6%</p>
              <p className="text-xs sm:text-sm font-normal text-sky-200/85 mt-1">
                Calibrated AI diagnostic confidence
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold">&lt; 2 sec</p>
              <p className="text-xs sm:text-sm font-normal text-sky-200/85 mt-1">
                Device-to-Dashboard real-time sync
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold">3 Portals</p>
              <p className="text-xs sm:text-sm font-normal text-sky-200/85 mt-1">
                Doctor, Patient & Technical Support
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 3: CORE CAPABILITIES (MESH GRADIENT ACTIVE CARDS)
         ===================================================================== */}
      <section id="capabilities" className="px-4 sm:px-6 py-12">
        <div className="max-w-7xl mx-auto rounded-[2.5rem] bg-white border border-slate-200/80 p-8 sm:p-14 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0284c7]">
              Core Capabilities
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#052e6e] tracking-tight">
              Expert intelligence for every heartbeat
            </h2>
            <p className="mt-3 text-sm sm:text-[15px] font-normal text-slate-600 leading-relaxed">
              Hover or click any module to explore how ECGenius automates signal
              quality, explainable AI, and patient care.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 lg:h-[360px]">
            {interactiveServices.map((service) => {
              const Icon = service.icon;
              const isExpanded = activeService === service.id;
              return (
                <div
                  key={service.id}
                  onMouseEnter={() => setActiveService(service.id)}
                  onClick={() => setActiveService(service.id)}
                  style={{
                    transition:
                      "flex 1.25s cubic-bezier(0.16, 1, 0.3, 1), background 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.8s ease",
                  }}
                  className={`group relative rounded-3xl p-7 cursor-pointer overflow-hidden flex flex-col justify-between border select-none ${
                    isExpanded
                      ? "lg:flex-[2.6] bg-gradient-to-br from-[#02183b] via-[#052e6e] to-[#0284c7] animate-gradient-shift text-white border-sky-400/50 shadow-[0_22px_48px_-12px_rgba(2,132,199,0.38)] lg:-translate-y-1.5"
                      : "lg:flex-1 bg-gradient-to-b from-[#eef4fb] to-[#e1ecf8] text-[#052e6e] border-slate-200/80 hover:border-sky-300"
                  }`}
                >
                  {/* Mesh Light Orbs Inside Active Card */}
                  <div
                    className={`pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full bg-sky-300/30 blur-2xl transition-opacity duration-1000 ${
                      isExpanded ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <div
                    className={`pointer-events-none absolute -bottom-10 left-8 w-36 h-36 rounded-full bg-rose-500/20 blur-2xl transition-opacity duration-1000 ${
                      isExpanded ? "opacity-100" : "opacity-0"
                    }`}
                  />

                  <div className="relative z-10 flex items-center justify-between gap-2 min-h-[48px]">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md text-sky-200 flex items-center justify-center shadow-inner transition-all duration-700 ${
                        isExpanded
                          ? "opacity-100 scale-100 translate-y-0"
                          : "opacity-0 scale-75 -translate-y-2 pointer-events-none"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <span
                      className={`text-[11px] font-mono font-semibold px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-sky-100 whitespace-nowrap transition-all duration-700 ${
                        isExpanded
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 translate-x-3 pointer-events-none"
                      }`}
                    >
                      {service.metric}
                    </span>
                  </div>

                  <div className="relative z-10 mt-6">
                    <h3 className="text-lg sm:text-xl font-extrabold tracking-tight leading-snug">
                      {service.title}
                    </h3>
                    <p
                      className={`text-xs mt-1.5 font-normal transition-colors duration-500 ${
                        isExpanded ? "text-sky-100/90" : "text-slate-600"
                      }`}
                    >
                      {service.short}
                    </p>

                    <div
                      style={{
                        transition:
                          "max-height 1.15s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.75s ease 0.15s, margin-top 0.75s ease",
                      }}
                      className={`overflow-hidden ${
                        isExpanded
                          ? "max-h-36 opacity-100 mt-4"
                          : "max-h-0 opacity-0 mt-0"
                      }`}
                    >
                      <p className="text-sm font-normal text-white/90 leading-relaxed min-w-[240px]">
                        {service.detail}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 4: END-TO-END CLINICAL WORKFLOW (MESH GRADIENT CARDS)
         ===================================================================== */}
      <section id="Workflow" className="px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto rounded-[2.5rem] bg-white border border-slate-200/80 p-8 sm:p-14 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0284c7]">
              End-to-End Clinical Workflow
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#052e6e]">
              From ECG lead to verified recovery plan
            </h2>
            <p className="mt-3 text-sm sm:text-[15px] font-normal text-slate-600 leading-relaxed">
              Select any stage in the ECGenius pipeline to inspect how hardware
              telemetry, AI explainability, and clinical review connect
              seamlessly.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            {/* Hidden on Mobile, Visible on Desktop */}
            <div className="hidden lg:flex lg:col-span-5 flex-col justify-between gap-3">
              {workflowStages.map((item, idx) => {
                const StageIcon = item.icon;
                const isSelected = activeStage === idx;
                return (
                  <button
                    key={item.step}
                    onClick={() => setActiveStage(idx)}
                    className={`w-full text-left rounded-3xl p-5 border transition-all duration-300 cursor-pointer flex items-center justify-between gap-4 relative overflow-hidden ${
                      isSelected
                        ? "bg-gradient-to-br from-[#02183b] via-[#052e6e] to-[#0284c7] animate-gradient-shift text-white border-sky-400/50 shadow-lg"
                        : "bg-[#eef4fb]/80 text-[#052e6e] border-slate-200/80 hover:bg-sky-50"
                    }`}
                  >
                    <div className="relative z-10 flex items-center gap-4">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-mono text-xs font-extrabold ${
                          isSelected
                            ? "bg-white/15 backdrop-blur-md text-sky-200"
                            : "bg-white text-[#0284c7] shadow-2xs"
                        }`}
                      >
                        {item.step}
                      </div>
                      <div>
                        <h3 className="text-base font-bold leading-snug">
                          {item.title}
                        </h3>
                        <p
                          className={`text-xs mt-0.5 font-normal ${
                            isSelected ? "text-sky-100/85" : "text-slate-500"
                          }`}
                        >
                          {item.role}
                        </p>
                      </div>
                    </div>
                    <StageIcon
                      className={`relative z-10 w-5 h-5 shrink-0 ${
                        isSelected ? "text-sky-200" : "text-slate-400"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-[#02183b] via-[#052e6e] to-[#0284c7] animate-gradient-shift text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden shadow-xl">
              <div className="pointer-events-none absolute -top-20 -right-16 w-72 h-72 rounded-full bg-sky-300/25 blur-3xl" />
              <div className="pointer-events-none absolute bottom-10 -left-16 w-60 h-60 rounded-full bg-[#0284c7]/35 blur-3xl" />
              <div className="pointer-events-none absolute top-1/2 right-8 w-40 h-40 rounded-full bg-rose-500/15 blur-2xl" />
              <div className="absolute inset-0 bg-ecg-grid opacity-[0.06] pointer-events-none" />

              <div className="relative z-10">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <span className="px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-sky-100 text-xs font-bold tracking-wide border border-white/15">
                    Stage {currentStage.step} - {currentStage.role}
                  </span>
                  <span className="font-mono text-xs font-semibold px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-sky-100 border border-white/15">
                    Latency: {currentStage.duration}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {currentStage.title}
                </h3>
                <p className="mt-4 text-sm sm:text-base font-normal text-sky-100/90 leading-relaxed">
                  {currentStage.summary}
                </p>

                <div className="mt-7 grid sm:grid-cols-3 gap-3">
                  {currentStage.highlights.map((point) => (
                    <div
                      key={point}
                      className="rounded-2xl bg-white/12 backdrop-blur-md border border-white/15 p-3.5 text-xs font-normal text-sky-100 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-sky-200 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 mt-8 pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {workflowStages.map((s, i) => (
                    <button
                      key={s.step}
                      onClick={() => setActiveStage(i)}
                      aria-label={`Go to stage ${s.step}`}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        activeStage === i
                          ? "w-8 bg-white"
                          : "w-2 bg-white/30 hover:bg-white/50"
                      }`}
                    />
                  ))}
                </div>

                <Link to="/login">
                  <Button
                    variant="secondary"
                    size="md"
                    className="rounded-full bg-white text-[#052e6e] hover:bg-sky-50 font-bold"
                  >
                    Launch Clinical Portal
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 5: CLEAN, ZERO-OVERLAP BEFORE/AFTER XAI COMPARISON SLIDER
         ===================================================================== */}
      <section id="xai-compare" className="px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto rounded-[2.5rem] bg-white border border-slate-200/80 p-8 sm:p-14 shadow-sm">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0284c7]">
                Explainable AI Transparency
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#052e6e] leading-tight">
                Raw waveforms, transformed into clarity.
              </h2>
              <p className="mt-4 text-sm sm:text-[15px] font-normal text-slate-600 leading-relaxed">
                Drag the comparison slider to see how ECGenius overlays XAI
                saliency regions, automated interval markers, and diagnostic
                confidence directly onto standard 12-lead ECG paper.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm font-normal text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Highlights exact QRS & ST segments influencing AI</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Reduces manual caliper measurement time by 70%</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Doctor retains full Accept, Override & Annotate control
                  </span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-7">
              <div className="relative h-80 rounded-3xl overflow-hidden border border-slate-300 shadow-inner select-none bg-ecg-grid">
                {/* AFTER LAYER */}
                <div className="absolute inset-0 flex flex-col justify-between p-6">
                  <div className="flex justify-end items-center z-10">
                    <span className="px-3.5 py-1.5 rounded-full bg-[#052e6e] text-white text-xs font-bold shadow-sm">
                      After: ECGenius XAI • 98.4%
                    </span>
                  </div>

                  <div className="relative w-full h-36 overflow-hidden flex items-center">
                    <div className="flex w-[200%] animate-ecg-flow">
                      {[0, 1].map((loop) => (
                        <svg
                          key={loop}
                          viewBox="0 0 600 120"
                          className="w-1/2 h-36 shrink-0"
                        >
                          <rect
                            x="118"
                            y="12"
                            width="74"
                            height="96"
                            rx="10"
                            fill="rgba(225, 29, 72, 0.14)"
                            stroke="#e11d48"
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                          />
                          <rect
                            x="296"
                            y="10"
                            width="76"
                            height="100"
                            rx="10"
                            fill="rgba(225, 29, 72, 0.18)"
                            stroke="#e11d48"
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                          />
                          <path
                            d="M0 65 H90 L110 48 L125 70 L142 18 L160 104 L178 52 L205 65 H265 L285 42 L302 72 L320 12 L338 108 L356 48 L385 65 H460 L480 48 L495 70 L512 20 L530 100 L548 55 L600 65"
                            fill="none"
                            stroke="#052e6e"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end items-center gap-3 text-xs font-mono z-10">
                    <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-lg border border-slate-200 text-slate-700">
                      PR: 158ms • QRS: 92ms • QTc: 408ms
                    </span>
                    <span className="bg-rose-50 border border-rose-200 text-[#e11d48] font-bold px-3 py-1 rounded-lg">
                      XAI: V2-V4
                    </span>
                  </div>
                </div>

                {/* BEFORE LAYER (Mesh Gradient Matching Auth Card) */}
                <div
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                  className="absolute inset-0 bg-gradient-to-br from-[#02183b] via-[#052e6e] to-[#0284c7] animate-gradient-shift text-white flex flex-col justify-between p-6 overflow-hidden"
                >
                  <div className="pointer-events-none absolute -top-16 -right-12 w-56 h-56 rounded-full bg-sky-300/25 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-16 -left-12 w-48 h-48 rounded-full bg-[#0284c7]/35 blur-3xl" />

                  <div className="flex justify-start items-center z-10">
                    <span className="px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-sky-100 text-xs font-bold border border-white/15">
                      Before: Raw Unprocessed Signal
                    </span>
                  </div>

                  <div className="relative w-full h-36 overflow-hidden flex items-center z-10">
                    <div className="flex w-[200%] animate-ecg-flow">
                      {[0, 1].map((loop) => (
                        <svg
                          key={loop}
                          viewBox="0 0 600 120"
                          className="w-1/2 h-36 shrink-0"
                        >
                          <path
                            d="M0 65 H90 L110 48 L125 70 L142 18 L160 104 L178 52 L205 65 H265 L285 42 L302 72 L320 12 L338 108 L356 48 L385 65 H460 L480 48 L495 70 L512 20 L530 100 L548 55 L600 65"
                            fill="none"
                            stroke="#7dd3fc"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-start items-center text-xs font-mono text-sky-100/85 z-10">
                    <span>
                      Raw 12-lead voltage • No automated intervals or saliency
                    </span>
                  </div>
                </div>

                {/* Vertical Divider Handle */}
                <div
                  style={{ left: `${sliderPos}%` }}
                  className="absolute top-0 bottom-0 w-0.5 bg-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.8)] pointer-events-none z-20"
                >
                  <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white text-[#052e6e] shadow-xl flex items-center justify-center border-2 border-[#0284c7]">
                    <MoveHorizontal className="w-5 h-5" />
                  </div>
                </div>

                <input
                  type="range"
                  min={5}
                  max={95}
                  value={sliderPos}
                  onChange={(e) => setSliderPos(Number(e.target.value))}
                  aria-label="Compare Raw ECG and XAI Overlay"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 6: ROLE QUICK-ACCESS GATEWAYS
         ===================================================================== */}
      <section id="gateways" className="px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto rounded-[2.5rem] bg-white border border-slate-200/80 p-8 sm:p-14 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0284c7]">
              Role-Based Access Gateways
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#052e6e]">
              Enter your ECGenius workspace
            </h2>
            <p className="mt-2 text-sm sm:text-[15px] font-normal text-slate-600">
              Select your authorized role to sign in or register a new account.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-3xl bg-[#eef4fb] p-7 border border-slate-200/80 hover:border-[#0284c7] hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#052e6e] text-white flex items-center justify-center mb-5">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#052e6e]">
                  Doctor Login
                </h3>
                <p className="mt-2 text-sm font-normal text-slate-600 leading-relaxed">
                  Triage critical red-alert cases, inspect 12-lead XAI overlays,
                  compare patient history, and sign off reports.
                </p>
              </div>
              <div className="mt-7 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                <Link
                  to="/login?role=doctor"
                  className="text-sm font-bold text-[#052e6e] hover:text-[#0284c7] inline-flex items-center gap-1.5"
                >
                  Doctor Sign In <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register?role=doctor"
                  className="text-xs font-semibold text-[#0284c7] hover:underline"
                >
                  Activation Request
                </Link>
              </div>
            </div>

            <div className="rounded-3xl bg-[#eef4fb] p-7 border border-slate-200/80 hover:border-[#e11d48] hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#e11d48] text-white flex items-center justify-center mb-5">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#052e6e]">
                  Patient Login
                </h3>
                <p className="mt-2 text-sm font-normal text-slate-600 leading-relaxed">
                  Understand your approved ECG report, chat with the AI
                  Assistant, and track daily heart-healthy habits.
                </p>
              </div>
              <div className="mt-7 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                <Link
                  to="/login?role=patient"
                  className="text-sm font-bold text-[#e11d48] hover:text-rose-700 inline-flex items-center gap-1.5"
                >
                  Patient Sign In <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register?role=patient"
                  className="text-xs font-semibold text-[#e11d48] hover:underline"
                >
                  Patient Sign-Up
                </Link>
              </div>
            </div>

            <div className="rounded-3xl bg-[#eef4fb] p-7 border border-slate-200/80 hover:border-slate-500 hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center mb-5">
                  <Wrench className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#052e6e]">
                  Support Login
                </h3>
                <p className="mt-2 text-sm font-normal text-slate-600 leading-relaxed">
                  Monitor connected ECG hardware telemetry, review audit logs,
                  and approve healthcare accounts.
                </p>
              </div>
              <div className="mt-7 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                <Link
                  to="/login?role=support"
                  className="text-sm font-bold text-slate-800 hover:text-[#052e6e] inline-flex items-center gap-1.5"
                >
                  Support Console <ArrowRight className="w-4 h-4" />
                </Link>
                <span className="text-[11px] font-semibold text-slate-400">
                  RBAC Protected
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 7: STRUCTURED CLINICAL FOOTER (MESH GRADIENT STYLE)
         ===================================================================== */}
      <footer className="px-4 sm:px-6 pt-8 pb-12">
        <div className="max-w-7xl mx-auto rounded-[2.5rem] bg-gradient-to-br from-[#02183b] via-[#052e6e] to-[#0284c7] animate-gradient-shift text-white p-8 sm:p-14 relative overflow-hidden shadow-2xl">
          {/* Mesh Light Orbs Matching Auth Card */}
          <div className="pointer-events-none absolute -top-24 -right-20 w-80 h-80 rounded-full bg-sky-300/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-[#0284c7]/35 blur-3xl" />
          <div className="pointer-events-none absolute top-1/2 right-14 w-44 h-44 rounded-full bg-rose-500/15 blur-3xl" />

          <div className="relative z-10 grid md:grid-cols-12 gap-10 pb-10 border-b border-white/15">
            {/* Brand Column (Text Only - No Logo Image) */}
            <div className="md:col-span-5">
              <Link to="/" className="inline-block">
                <div className="text-3xl sm:text-4xl font-black tracking-tight">
                  <span className="text-white">ECG</span>
                  <span className="text-sky-300">enius</span>
                </div>
              </Link>
              <p className="mt-4 text-sm font-normal text-sky-100/85 leading-relaxed max-w-sm">
                AI-powered 12-lead ECG acquisition, explainable deep learning
                diagnostics, and doctor-guided cardiac recovery in one unified
                clinical platform.
              </p>
              <p className="mt-4 text-xs font-semibold tracking-[0.22em] uppercase text-sky-200/85">
                Smart. Explained.
              </p>
            </div>

            {/* Platform Navigation Column */}
            <div className="md:col-span-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-sky-200 mb-4">
                Platform
              </h4>
              <ul className="space-y-2.5 text-sm font-normal text-sky-100/85">
                <li>
                  <a
                    href="#overview"
                    className="hover:text-white transition-colors"
                  >
                    Overview
                  </a>
                </li>
                <li>
                  <a
                    href="#capabilities"
                    className="hover:text-white transition-colors"
                  >
                    Core Capabilities
                  </a>
                </li>
                <li>
                  <a
                    href="#workflow"
                    className="hover:text-white transition-colors"
                  >
                    Clinical Workflow
                  </a>
                </li>
                <li>
                  <a
                    href="#xai-compare"
                    className="hover:text-white transition-colors"
                  >
                    XAI Transparency
                  </a>
                </li>
              </ul>
            </div>

            {/* Role Portals Column */}
            <div className="md:col-span-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-sky-200 mb-4">
                Clinical Gateways
              </h4>
              <ul className="space-y-2.5 text-sm font-normal text-sky-100/85">
                <li>
                  <Link
                    to="/login?role=doctor"
                    className="hover:text-white transition-colors"
                  >
                    Doctor Workspace Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login?role=patient"
                    className="hover:text-white transition-colors"
                  >
                    Patient Companion Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login?role=support"
                    className="hover:text-white transition-colors"
                  >
                    Technical Support Console
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="hover:text-white transition-colors"
                  >
                    Request Account Activation
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="relative z-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-normal text-sky-100/80">
            <p>
              © {new Date().getFullYear()} ECGenius Clinical Platform. All
              rights reserved.
            </p>
            <p>12-Lead ECG • Explainable AI (XAI) • Role-Based Clinical Care</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
