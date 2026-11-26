import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, LogOut, Trash2, AlertTriangle } from "lucide-react";
import Button from "../../components/common/Button";
import { clearSession } from "../../services/api";

export default function DoctorSettingsPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  const handleDeleteAccount = () => {
    clearSession();
    localStorage.clear();
    sessionStorage.clear();
    navigate("/register");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-dash-card">
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
        {saved && (
          <div className="rounded-2xl bg-emerald-600 text-white px-4 py-3 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Clinician profile & consultation fee settings updated.
          </div>
        )}
        <h2 className="text-lg font-extrabold text-[#052e6e]">
          Clinician Profile & Consultation Preferences
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-[#052e6e] mb-1">
              Full Name
            </label>
            <input
              defaultValue="Dr. Ahmed Ashraf"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100/80 font-semibold"
            />
          </div>
          <div>
            <label className="block font-bold text-[#052e6e] mb-1">
              Specialty
            </label>
            <input
              defaultValue="Interventional Cardiology & Electrophysiology"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100/80 font-semibold"
            />
          </div>
          <div>
            <label className="block font-bold text-[#052e6e] mb-1">
              New Specialist Consult Fee (EGP)
            </label>
            <input
              defaultValue="250"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100/80 font-semibold"
            />
          </div>
          <div>
            <label className="block font-bold text-[#052e6e] mb-1">
              One-Time Guest Consult Fee (EGP)
            </label>
            <input
              defaultValue="150"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100/80 font-semibold"
            />
          </div>
        </div>
        <Button variant="primary" size="md" onClick={() => setSaved(true)}>
          Save Preferences
        </Button>
      </div>

      {/* Account & Session Management */}
      <div className="rounded-3xl bg-white border border-rose-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-[#052e6e]">
            Account & Session Management
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Sign out of your current clinical session or permanently remove your
            clinician account data.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-[#052e6e] text-xs font-extrabold inline-flex items-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>

          <button
            type="button"
            onClick={() => setConfirmDeleteOpen(true)}
            className="px-4 py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[#e11d48] text-xs font-extrabold inline-flex items-center gap-2 transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-white border border-slate-200 p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#e11d48] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-[#052e6e]">
                  Delete Clinician Account?
                </h4>
                <p className="text-xs text-slate-500">
                  This action will permanently clear your clinician profile and
                  local session state.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded-full bg-[#e11d48] hover:bg-rose-700 text-white text-xs font-extrabold cursor-pointer"
              >
                Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
