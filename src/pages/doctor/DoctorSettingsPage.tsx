// src/pages/doctor/DoctorSettingsPage.tsx
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Button from "../../components/common/Button";

export default function DoctorSettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="max-w-3xl mx-auto rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5 animate-dash-card">
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
  );
}
