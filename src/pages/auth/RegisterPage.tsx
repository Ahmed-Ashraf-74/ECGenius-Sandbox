import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Stethoscope,
  Activity,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Button from "../../components/common/Button";

type RegisterRole = "patient" | "doctor";

export default function RegisterPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const paramRole = searchParams.get("role")?.toLowerCase();
  const initialRole: RegisterRole =
    paramRole === "doctor" ? "doctor" : "patient";

  const [role, setRole] = useState<RegisterRole>(initialRole);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [medicalLicense, setMedicalLicense] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    const qRole = searchParams.get("role")?.toLowerCase();
    if (qRole === "doctor" || qRole === "patient") {
      setRole(qRole);
    }
  }, [searchParams]);

  // Auto-cycle illuminated numbered cards every 1700ms
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 1700);
    return () => clearInterval(timer);
  }, []);

  const handleRoleChange = (newRole: RegisterRole) => {
    setRole(newRole);
    setActiveStep(0);
    setError(null);
    setSubmittedSuccess(false);
    setSearchParams({ role: newRole });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (fullName.trim().length < 3) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (role === "doctor" && medicalLicense.trim().length < 4) {
      setError("Please enter your valid Medical Syndicate / License ID.");
      return;
    }
    if (password.trim().length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (role === "doctor") {
      setSubmittedSuccess(true);
    } else {
      localStorage.setItem(
        "ecgenius_session",
        JSON.stringify({
          role: "patient",
          fullName: fullName.trim(),
          email: email.trim(),
          loggedInAt: new Date().toISOString(),
        }),
      );
      navigate("/patient");
    }
  };

  const steps =
    role === "doctor"
      ? [
          { num: "1", title: "Submit clinician credentials" },
          { num: "2", title: "Support verifies medical license" },
          { num: "3", title: "Access 12-lead XAI portal" },
        ]
      : [
          { num: "1", title: "Register your patient account" },
          { num: "2", title: "Link your doctor-verified ECGs" },
          { num: "3", title: "Track daily heart health habits" },
        ];

  return (
    <div className="min-h-screen bg-[#eef4fb] flex flex-col justify-center items-center px-4 sm:px-6 py-8">
      <div className="max-w-5xl w-full rounded-[2.5rem] bg-white shadow-[0_25px_80px_-20px_rgba(5,46,110,0.18)] p-4 sm:p-5 lg:p-4 grid lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT INSET MESH GRADIENT CARD (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-6 rounded-[2rem] bg-gradient-to-br from-[#02183b] via-[#052e6e] to-[#0284c7] animate-gradient-shift text-white p-7 sm:p-9 flex-col justify-between relative overflow-hidden min-h-[520px]">
          <div className="pointer-events-none absolute -top-20 -right-16 w-72 h-72 rounded-full bg-sky-300/30 blur-3xl" />
          <div className="pointer-events-none absolute bottom-16 -left-16 w-64 h-64 rounded-full bg-[#0284c7]/40 blur-3xl" />
          <div className="pointer-events-none absolute top-1/2 right-6 w-40 h-40 rounded-full bg-rose-500/20 blur-2xl" />

          {/* Top Brand Mark */}
          <div className="relative z-10 flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <img
                src="/images/glass-heart.png"
                alt="ECGenius"
                className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-110"
              />
              <span className="text-lg font-black tracking-tight text-white">
                ECG<span className="text-sky-300">enius</span>
              </span>
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-100/90 hover:text-white bg-white/10 hover:bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Home
            </Link>
          </div>

          {/* Center Headline */}
          <div className="relative z-10 my-10">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-sky-100 border border-white/15">
              {role === "doctor"
                ? "Clinician Onboarding"
                : "Join ECGenius Care"}
            </span>

            <h1 className="mt-5 text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.12]">
              Start your Journey
            </h1>
            <p className="mt-3 text-sm font-normal text-sky-100/85 leading-relaxed max-w-sm">
              {role === "doctor"
                ? "Request verified cardiologist access to review 12-lead ECGs with explainable AI attribution."
                : "Follow these simple steps to set up your personal cardiac companion account."}
            </p>
          </div>

          {/* Bottom 3 Auto-Cycling Numbered Cards */}
          <div className="relative z-10 grid grid-cols-3 gap-2.5">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={`text-left rounded-2xl p-3.5 flex flex-col justify-between min-h-[112px] transition-all duration-500 cursor-pointer ${
                    isActive
                      ? "bg-white text-[#052e6e] shadow-lg -translate-y-1"
                      : "bg-white/12 backdrop-blur-md text-white border border-white/15 hover:bg-white/18"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full text-xs font-extrabold flex items-center justify-center transition-colors duration-500 ${
                      isActive
                        ? "bg-[#052e6e] text-white"
                        : "bg-white/20 text-sky-100"
                    }`}
                  >
                    {step.num}
                  </span>
                  <p
                    className={`text-[11px] sm:text-xs font-semibold leading-snug mt-3 transition-colors duration-500 ${
                      isActive ? "text-[#052e6e]" : "text-sky-100/90"
                    }`}
                  >
                    {step.title}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT REGISTRATION FORM (Full width on mobile) */}
        <div className="lg:col-span-6 p-4 sm:p-8 lg:p-10 flex flex-col justify-center">
          {/* Mobile-Only Top Navigation Bar */}
          <div className="flex lg:hidden items-center justify-between pb-5 mb-5 border-b border-slate-100">
            <Link to="/" className="inline-flex items-center gap-2">
              <img
                src="/images/glass-heart.png"
                alt="ECGenius"
                className="w-7 h-7 object-contain"
              />
              <span className="text-lg font-black tracking-tight text-[#052e6e]">
                ECG<span className="text-[#0284c7]">enius</span>
              </span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#052e6e] bg-[#eef4fb] px-3.5 py-1.5 rounded-full"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Home
            </Link>
          </div>

          <div className="max-w-sm w-full mx-auto">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#052e6e] tracking-tight">
                {role === "doctor" ? "Doctor Activation" : "Join Us"}
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm font-normal text-slate-500">
                Choose your account type to get started with ECGenius.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-slate-100">
              <button
                type="button"
                onClick={() => handleRoleChange("patient")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  role === "patient"
                    ? "bg-white text-[#052e6e] shadow-sm"
                    : "text-slate-500 hover:text-[#052e6e]"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Patient Account
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange("doctor")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  role === "doctor"
                    ? "bg-white text-[#052e6e] shadow-sm"
                    : "text-slate-500 hover:text-[#052e6e]"
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                Doctor Activation
              </button>
            </div>

            {submittedSuccess ? (
              <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-base font-extrabold text-[#052e6e]">
                  Activation Request Submitted
                </h3>
                <p className="text-xs font-normal text-slate-600 leading-relaxed">
                  Thank you, <strong>{fullName}</strong>. Our Technical Support
                  team is verifying license <strong>{medicalLicense}</strong>{" "}
                  and will notify <strong>{email}</strong> shortly.
                </p>
                <Link to="/login?role=doctor" className="inline-block pt-2">
                  <Button variant="primary" size="sm" className="rounded-xl">
                    Return to Doctor Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 flex items-center gap-2 text-xs font-medium text-[#e11d48]">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#052e6e] mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={
                          role === "doctor"
                            ? "Dr. Ahmed Ashraf"
                            : "Sara Mahmoud"
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0284c7] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#052e6e] mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+20 100 000 0000"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0284c7] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#052e6e] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        role === "doctor"
                          ? "dr.ahmed@hospital.org"
                          : "sara@patient.health"
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0284c7] transition-all"
                    />
                  </div>

                  {role === "doctor" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#052e6e] mb-1">
                          Medical License ID
                        </label>
                        <input
                          type="text"
                          value={medicalLicense}
                          onChange={(e) => setMedicalLicense(e.target.value)}
                          placeholder="EG-MED-94821"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0284c7] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#052e6e] mb-1">
                          Hospital / Clinic
                        </label>
                        <input
                          type="text"
                          value={hospitalName}
                          onChange={(e) => setHospitalName(e.target.value)}
                          placeholder="Cairo Heart Center"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 border border-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0284c7] transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#052e6e] mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3.5 pr-10 py-2.5 rounded-xl bg-slate-100/80 border border-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0284c7] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#052e6e] cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-[11px] font-normal text-slate-400">
                      At least 8 characters with uppercase, lowercase, and
                      numbers.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full rounded-xl mt-1"
                  >
                    {role === "doctor"
                      ? "Submit Activation Request"
                      : "Continue"}
                  </Button>
                </form>

                <p className="mt-5 text-center text-xs font-normal text-slate-500">
                  Already have an account?{" "}
                  <Link
                    to={`/login?role=${role}`}
                    className="font-bold text-[#0284c7] hover:text-[#052e6e]"
                  >
                    Log in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
