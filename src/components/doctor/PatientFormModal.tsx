import { useState, useEffect, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, UserCog, X, AlertCircle } from "lucide-react";
import Button from "../common/Button";
import {
  patientFormSchema,
  BLOOD_TYPES,
  type PatientFormValues,
} from "../../schemas/patient.schema";
import { clinicalService } from "../../services/clinicalMockService";
import { COUNTRIES_AND_GOVERNORATES } from "../../data/locations";
import type { PatientDto } from "../../types/ecg.types";

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPatient?: PatientDto | null;
  onSuccessMessage?: (msg: string) => void;
  onPatientSaved?: (patient: PatientDto) => void;
}

const emptyForm: PatientFormValues = {
  fullName: "",
  email: "",
  phoneNumber: "+20 ",
  dateOfBirth: "",
  gender: "Male",
  bloodType: "",
  address: "",
  profileStatus: "Active",
};

export default function PatientFormModal({
  isOpen,
  onClose,
  editingPatient,
  onSuccessMessage,
  onPatientSaved,
}: PatientFormModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<PatientFormValues>(emptyForm);
  const [country, setCountry] = useState<string>("Egypt");
  const [governorate, setGovernorate] = useState<string>("Cairo");
  const [streetDetail, setStreetDetail] = useState<string>("");

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof PatientFormValues, string>>
  >({});
  const [serverError, setServerError] = useState<string | null>(null);

  const selectedCountryObj =
    COUNTRIES_AND_GOVERNORATES.find((c) => c.name === country) ||
    COUNTRIES_AND_GOVERNORATES[0];

  useEffect(() => {
    if (!isOpen) return;
    setFieldErrors({});
    setServerError(null);
    if (editingPatient) {
      const parts = (editingPatient.address || "")
        .split(",")
        .map((s) => s.trim());
      const matchedCountry = COUNTRIES_AND_GOVERNORATES.find(
        (c) => c.name.toLowerCase() === (parts[0] || "").toLowerCase(),
      );
      if (matchedCountry) {
        setCountry(matchedCountry.name);
        setGovernorate(parts[1] || matchedCountry.governorates[0]);
        setStreetDetail(parts.slice(2).join(", "));
      } else {
        setCountry("Egypt");
        setGovernorate("Cairo");
        setStreetDetail(editingPatient.address || "");
      }

      setFormData({
        fullName: editingPatient.fullName,
        email: editingPatient.email,
        phoneNumber: editingPatient.phoneNumber,
        dateOfBirth: editingPatient.dateOfBirth,
        gender: editingPatient.gender,
        bloodType:
          (editingPatient.bloodType as PatientFormValues["bloodType"]) || "",
        address: editingPatient.address || "",
        profileStatus: editingPatient.profileStatus,
      });
    } else {
      setCountry("Egypt");
      setGovernorate("Cairo");
      setStreetDetail("");
      setFormData(emptyForm);
    }
  }, [isOpen, editingPatient]);

  const mutation = useMutation({
    mutationFn: async (values: PatientFormValues) => {
      if (editingPatient) {
        return clinicalService.updatePatient(editingPatient.patientId, values);
      }
      return clinicalService.createPatient(values);
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({
        queryKey: ["patient", saved.patientId],
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      onPatientSaved?.(saved);
      onSuccessMessage?.(
        editingPatient
          ? `Updated patient profile for ${saved.fullName}.`
          : `Registered new patient: ${saved.fullName} (${saved.patientId}).`,
      );
      onClose();
    },
    onError: (err: Error) => {
      setServerError(err.message || "Failed to save patient record.");
    },
  });

  if (!isOpen) return null;

  const handleCountryChange = (nextCountryName: string) => {
    setCountry(nextCountryName);
    const nextObj =
      COUNTRIES_AND_GOVERNORATES.find((c) => c.name === nextCountryName) ||
      COUNTRIES_AND_GOVERNORATES[0];
    setGovernorate(nextObj.governorates[0] || "");
    if (!editingPatient) {
      setFormData((prev) => ({
        ...prev,
        phoneNumber: `${nextObj.dialCode} `,
      }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setServerError(null);

    const composedAddress = [country, governorate, streetDetail.trim()]
      .filter(Boolean)
      .join(", ");

    const candidate: PatientFormValues = {
      ...formData,
      address: composedAddress,
    };

    const parsed = patientFormSchema.safeParse(candidate);
    if (!parsed.success) {
      const errors: Partial<Record<keyof PatientFormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof PatientFormValues;
        if (key && !errors[key]) {
          errors[key] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    mutation.mutate(parsed.data);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-[#052e6e]/15 backdrop-blur-[3px] transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-2xl rounded-[2rem] bg-white shadow-2xl border border-slate-200/80 overflow-hidden animate-dash-card">
        <div className="btn-landing-gradient px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              {editingPatient ? (
                <UserCog className="w-5 h-5 text-sky-200" />
              ) : (
                <UserPlus className="w-5 h-5 text-sky-200" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">
                {editingPatient
                  ? "Edit Patient Profile"
                  : "Register New Patient"}
              </h2>
              <p className="text-xs text-sky-100/85">
                Unique Patient ID, Phone & Email • Ready for Backend API sync
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-[82vh] overflow-y-auto"
        >
          {serverError && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 flex items-center gap-2 text-xs font-bold text-[#e11d48]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#052e6e] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="e.g. Omar Hassan Mahmoud"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border focus:border-[#0284c7]"
              />
              {fieldErrors.fullName && (
                <p className="mt-1 text-[11px] font-medium text-[#e11d48]">
                  {fieldErrors.fullName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#052e6e] mb-1">
                Email Address (Unique) *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="patient@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border focus:border-[#0284c7]"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-[11px] font-medium text-[#e11d48]">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#052e6e] mb-1">
                Phone Number ({selectedCountryObj.dialCode}) *
              </label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                placeholder={`${selectedCountryObj.dialCode} 100 000 0000`}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border focus:border-[#0284c7]"
              />
              {fieldErrors.phoneNumber && (
                <p className="mt-1 text-[11px] font-medium text-[#e11d48]">
                  {fieldErrors.phoneNumber}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#052e6e] mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border focus:border-[#0284c7]"
              />
              {fieldErrors.dateOfBirth && (
                <p className="mt-1 text-[11px] font-medium text-[#e11d48]">
                  {fieldErrors.dateOfBirth}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#052e6e] mb-1">
                Gender *
              </label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gender: e.target.value as PatientFormValues["gender"],
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 text-sm text-slate-800"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#052e6e] mb-1">
                Blood Type
              </label>
              <select
                value={formData.bloodType || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bloodType: e.target.value as PatientFormValues["bloodType"],
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 text-sm text-slate-800"
              >
                <option value="">Not specified</option>
                {BLOOD_TYPES.map((bt) => (
                  <option key={bt} value={bt}>
                    {bt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#052e6e] mb-1">
                Country *
              </label>
              <select
                value={country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 text-sm text-slate-800"
              >
                {COUNTRIES_AND_GOVERNORATES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#052e6e] mb-1">
                Governorate / State *
              </label>
              <select
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 text-sm text-slate-800"
              >
                {selectedCountryObj.governorates.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#052e6e] mb-1">
                Detailed Street / District Address
              </label>
              <input
                type="text"
                value={streetDetail}
                onChange={(e) => setStreetDetail(e.target.value)}
                placeholder="Building, Street Name, District / Neighborhood..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100/80 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border focus:border-[#0284c7]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={mutation.isPending}
            >
              {mutation.isPending
                ? "Saving Record..."
                : editingPatient
                  ? "Save Changes"
                  : "Create Patient"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
