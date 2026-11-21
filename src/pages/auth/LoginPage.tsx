import {
  useState,
  useEffect,
  useRef,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Stethoscope,
  Activity,
  ShieldAlert,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  KeyRound,
  Clock,
  CheckCircle2,
  MailCheck,
} from "lucide-react";
import Button from "../../components/common/Button";

type UserRole = "patient" | "doctor" | "admin";
type AuthView = "signin" | "2fa" | "forgot" | "pending";

interface StepCard {
  num: string;
  title: string;
}

interface RoleTheme {
  id: UserRole;
  label: string;
  pillText: string;
  headline: string;
  subtext: string;
  demoEmail: string;
  redirectPath: string;
  requires2FA: boolean;
  icon: typeof Stethoscope;
  steps: StepCard[];
}

const roleThemes: Record<UserRole, RoleTheme> = {
  patient: {
    id: "patient",
    label: "Patient",
    pillText: "Patient Companion Portal",
    headline: "Understand your Heart Health",
    subtext:
      "Access doctor-approved ECG summaries, AI explanations, and daily heart care habits.",
    demoEmail: "Samir.mahmoud@patient.health",
    redirectPath: "/patient",
    requires2FA: false,
    icon: Activity,
    steps: [
      { num: "1", title: "Read plain-language ECG results" },
      { num: "2", title: "Ask your medical AI companion" },
      { num: "3", title: "Track daily heart wellness habits" },
    ],
  },
  doctor: {
    id: "doctor",
    label: "Doctor",
    pillText: "Cardiology & Clinical Portal",
    headline: "Start your Clinical Triage",
    subtext:
      "Inspect 12-lead ECGs, XAI saliency maps, and critical arrhythmia alerts in one place.",
    demoEmail: "dr.ahmed@ecgenius.health",
    redirectPath: "/doctor",
    requires2FA: true,
    icon: Stethoscope,
    steps: [
      { num: "1", title: "Review priority red-alert cases" },
      { num: "2", title: "Inspect lead-level XAI heatmaps" },
      { num: "3", title: "Verify & sign clinical reports" },
    ],
  },
  admin: {
    id: "admin",
    label: "Admin",
    pillText: "Platform Governance & Admin Console",
    headline: "Govern Users & System Health",
    subtext:
      "Manage user accounts, RBAC permissions, immutable audit logs, and core platform services.",
    demoEmail: "admin@ecgenius.health",
    redirectPath: "/admin",
    requires2FA: true,
    icon: ShieldAlert,
    steps: [
      { num: "1", title: "Manage users & doctor activations" },
      { num: "2", title: "Configure RBAC roles & permissions" },
      { num: "3", title: "Monitor system health & audit logs" },
    ],
  },
};

export default function LoginPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const paramRole = searchParams.get("role")?.toLowerCase();
  const initialRole: UserRole =
    paramRole === "patient" || paramRole === "doctor" || paramRole === "admin"
      ? paramRole
      : "patient";

  const sessionReason = searchParams.get("reason");

  const [role, setRole] = useState<UserRole>(initialRole);
  const [view, setView] = useState<AuthView>("signin");
  const [activeStep, setActiveStep] = useState<number>(0);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 2FA State (Doctor & Admin only)
  const [otpDigits, setOtpDigits] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const qRole = searchParams.get("role")?.toLowerCase();
    if (qRole === "patient" || qRole === "doctor" || qRole === "admin") {
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

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setActiveStep(0);
    setView("signin");
    setError(null);
    setSearchParams({ role: newRole });
  };

  const handleFillDemo = () => {
    setEmail(roleThemes[role].demoEmail);
    setPassword("ECGenius2026!");
    setError(null);
  };

  const completeLoginSession = () => {
    localStorage.setItem(
      "ecgenius_session",
      JSON.stringify({
        role,
        email: email.trim() || roleThemes[role].demoEmail,
        verified2FA: roleThemes[role].requires2FA,
        loggedInAt: new Date().toISOString(),
      }),
    );
    navigate(roleThemes[role].redirectPath);
  };

  const handleSignInSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.trim().length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (email.toLowerCase().includes("deactivated")) {
      setError(
        "This account has been deactivated by an Administrator. Contact system governance to restore access.",
      );
      return;
    }

    if (role === "doctor" && email.toLowerCase().includes("pending")) {
      setView("pending");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (roleThemes[role].requires2FA) {
        setOtpDigits(["", "", "", "", "", ""]);
        setView("2fa");
      } else {
        completeLoginSession();
      }
    }, 450);
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    setError(null);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleFillOtp = () => {
    setOtpDigits(["4", "8", "2", "9", "1", "6"]);
    setError(null);
  };

  const handleVerify2FA = (e: FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      completeLoginSession();
    }, 450);
  };

  const handleForgotSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!resetEmail.trim() || !resetEmail.includes("@")) {
      setError("Please enter the email address associated with your account.");
      return;
    }
    setResetSent(true);
  };

  const current = roleThemes[role];

  return (
    <div className="min-h-screen bg-[#eef4fb] flex flex-col justify-center items-center px-4 sm:px-6 py-8">
      <div className="max-w-5xl w-full rounded-[2.5rem] bg-white shadow-[0_25px_80px_-20px_rgba(5,46,110,0.18)] p-4 sm:p-5 lg:p-4 grid lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT INSET MESH GRADIENT CARD (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-6 rounded-[2rem] bg-gradient-to-br from-[#02183b] via-[#052e6e] to-[#0284c7] animate-gradient-shift text-white p-7 sm:p-9 flex-col justify-between relative overflow-hidden min-h-[500px]">
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

          {/* Center Headline & Subtext */}
          <div className="relative z-10 my-10">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-sky-100 border border-white/15">
              {current.pillText}
            </span>

            <h1 className="mt-5 text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.12]">
              {current.headline}
            </h1>
            <p className="mt-3 text-sm font-normal text-sky-100/85 leading-relaxed max-w-sm">
              {current.subtext}
            </p>
          </div>

          {/* Bottom 3 Auto-Cycling Numbered Glass Cards (1700ms) */}
          <div className="relative z-10 grid grid-cols-3 gap-2.5">
            {current.steps.map((step, idx) => {
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

        {/* RIGHT AUTHENTICATION FLOW PANEL (Full width on mobile) */}
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
            {sessionReason === "expired" && view === "signin" && (
              <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5 flex items-center gap-2 text-xs font-medium text-amber-800">
                <Clock className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  Your clinical session expired. Please sign in again to
                  continue.
                </span>
              </div>
            )}

            {/* VIEW 1: SIGN IN */}
            {view === "signin" && (
              <>
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#052e6e] tracking-tight">
                    Sign in to ECGenius
                  </h2>
                  <p className="mt-1.5 text-xs sm:text-sm font-normal text-slate-500">
                    Select your role and access your clinical workspace.
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-slate-100">
                  {(["patient", "doctor", "admin"] as UserRole[]).map((r) => {
                    const Icon = roleThemes[r].icon;
                    const active = role === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRoleChange(r)}
                        className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                          active
                            ? "bg-white text-[#052e6e] shadow-sm"
                            : "text-slate-500 hover:text-[#052e6e]"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {roleThemes[r].label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#eef4fb] text-xs">
                  <span className="inline-flex items-center gap-1.5 text-[#052e6e] font-normal">
                    <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" />
                    Demo {current.label} credentials
                  </span>
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="font-bold text-[#0284c7] hover:text-[#052e6e] cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>

                {error && (
                  <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 flex items-center gap-2 text-xs font-medium text-[#e11d48]">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSignInSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#052e6e] mb-1.5">
                      Your email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={current.demoEmail}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100/80 border border-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0284c7] focus:ring-4 focus:ring-sky-500/10 transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-[#052e6e]">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setResetEmail(email);
                          setResetSent(false);
                          setError(null);
                          setView("forgot");
                        }}
                        className="text-xs font-semibold text-[#0284c7] hover:text-[#052e6e] cursor-pointer"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-4 pr-11 py-3 rounded-xl bg-slate-100/80 border border-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0284c7] focus:ring-4 focus:ring-sky-500/10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#052e6e] cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full rounded-xl mt-2"
                  >
                    {isSubmitting
                      ? "Verifying Credentials..."
                      : current.requires2FA
                        ? "Continue to 2FA Verification"
                        : `Continue as ${current.label}`}
                  </Button>
                </form>

                <p className="mt-6 text-center text-xs font-normal text-slate-500">
                  {role === "admin" ? (
                    "Administrator accounts are provisioned by system governance."
                  ) : (
                    <>
                      Don&apos;t have an account?{" "}
                      <Link
                        to={`/register?role=${role}`}
                        className="font-bold text-[#0284c7] hover:text-[#052e6e]"
                      >
                        {role === "doctor" ? "Request Activation" : "Sign up"}
                      </Link>
                    </>
                  )}
                </p>
              </>
            )}

            {/* VIEW 2: 2FA VERIFICATION (DOCTOR & ADMIN ONLY) */}
            {view === "2fa" && (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setView("signin");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#052e6e] mb-5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </button>

                <div className="w-11 h-11 rounded-2xl bg-[#eef4fb] text-[#052e6e] flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 text-[#0284c7]" />
                </div>

                <h2 className="text-2xl font-extrabold text-[#052e6e] tracking-tight">
                  Two-Factor Verification
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm font-normal text-slate-500 leading-relaxed">
                  Enter the 6-digit security code sent to{" "}
                  <strong className="text-[#052e6e]">
                    {email || current.demoEmail}
                  </strong>{" "}
                  to unlock the {current.label} workspace.
                </p>

                <div className="mt-4 flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#eef4fb] text-xs">
                  <span className="inline-flex items-center gap-1.5 text-[#052e6e] font-normal">
                    <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" />
                    Demo 6-digit security code
                  </span>
                  <button
                    type="button"
                    onClick={handleFillOtp}
                    className="font-bold text-[#0284c7] hover:text-[#052e6e] cursor-pointer"
                  >
                    Auto-Fill OTP
                  </button>
                </div>

                {error && (
                  <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 flex items-center gap-2 text-xs font-medium text-[#e11d48]">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleVerify2FA} className="mt-5 space-y-5">
                  <div className="grid grid-cols-6 gap-2">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          otpRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="h-12 text-center text-lg font-extrabold font-mono rounded-xl bg-slate-100/90 border border-transparent text-[#052e6e] focus:outline-none focus:bg-white focus:border-[#0284c7] focus:ring-4 focus:ring-sky-500/10 transition-all"
                      />
                    ))}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full rounded-xl"
                  >
                    {isSubmitting
                      ? "Verifying Code..."
                      : `Verify & Enter ${current.label} Portal`}
                  </Button>
                </form>

                <p className="mt-5 text-center text-xs font-normal text-slate-500">
                  Didn&apos;t receive a code?{" "}
                  <button
                    type="button"
                    onClick={handleFillOtp}
                    className="font-bold text-[#0284c7] hover:text-[#052e6e] cursor-pointer"
                  >
                    Resend Code
                  </button>
                </p>
              </div>
            )}

            {/* VIEW 3: FORGOT PASSWORD */}
            {view === "forgot" && (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setView("signin");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#052e6e] mb-5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </button>

                <div className="w-11 h-11 rounded-2xl bg-[#eef4fb] text-[#052e6e] flex items-center justify-center mb-4">
                  <KeyRound className="w-6 h-6 text-[#0284c7]" />
                </div>

                <h2 className="text-2xl font-extrabold text-[#052e6e] tracking-tight">
                  Reset Password
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm font-normal text-slate-500 leading-relaxed">
                  Enter your registered email address and we will send you a
                  secure password reset link.
                </p>

                {resetSent ? (
                  <div className="mt-5 rounded-2xl bg-emerald-50 border border-emerald-200 p-5 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                      <MailCheck className="w-5 h-5" />
                      <span>Reset Link Sent</span>
                    </div>
                    <p className="text-xs font-normal text-slate-600 leading-relaxed">
                      We sent recovery instructions to{" "}
                      <strong>{resetEmail}</strong>. Check your inbox to set a
                      new password.
                    </p>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => setView("signin")}
                      className="w-full rounded-xl mt-2"
                    >
                      Return to Sign In
                    </Button>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 flex items-center gap-2 text-xs font-medium text-[#e11d48]">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <form
                      onSubmit={handleForgotSubmit}
                      className="mt-5 space-y-4"
                    >
                      <div>
                        <label className="block text-xs font-bold text-[#052e6e] mb-1.5">
                          Registered email
                        </label>
                        <input
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder={current.demoEmail}
                          className="w-full px-4 py-3 rounded-xl bg-slate-100/80 border border-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0284c7] focus:ring-4 focus:ring-sky-500/10 transition-all"
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full rounded-xl"
                      >
                        Send Recovery Link
                      </Button>
                    </form>
                  </>
                )}
              </div>
            )}

            {/* VIEW 4: ACCOUNT STATE (PENDING CLINICIAN APPROVAL) */}
            {view === "pending" && (
              <div className="text-center space-y-4 py-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-extrabold text-[#052e6e]">
                  Verification Pending
                </h2>
                <p className="text-xs sm:text-sm font-normal text-slate-600 leading-relaxed">
                  Your clinician activation request for <strong>{email}</strong>{" "}
                  is currently under review by an Administrator. You will be
                  notified once your medical license is verified.
                </p>
                <div className="rounded-xl bg-[#eef4fb] p-3 text-xs font-normal text-[#052e6e] flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0284c7]" />
                  <span>Estimated verification window: under 24 hours</span>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => setView("signin")}
                  className="w-full rounded-xl"
                >
                  Back to Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
