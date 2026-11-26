import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  UserPlus,
  Edit3,
  Eye,
  Trash2,
  AlertCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { createPortal } from "react-dom";
import Button from "../../components/common/Button";
import PatientAvatar from "../../components/common/PatientAvatar";
import PatientFormModal from "../../components/doctor/PatientFormModal";
import { clinicalService } from "../../services/clinicalMockService";
import type {
  PatientDto,
  PatientProfileStatus,
  ClinicalRiskLevel,
} from "../../types/ecg.types";

const RISK_BADGE: Record<ClinicalRiskLevel, string> = {
  Critical: "bg-rose-50 text-[#e11d48] border-rose-200",
  Moderate: "bg-amber-50 text-amber-700 border-amber-200",
  Normal: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const STATUS_BADGE: Record<PatientProfileStatus, string> = {
  Active: "bg-sky-50 text-[#0284c7] border-sky-200",
  Incomplete: "bg-amber-50 text-amber-700 border-amber-200",
  Archived: "bg-slate-100 text-slate-500 border-slate-200",
};

export default function PatientsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    PatientProfileStatus | "All"
  >("All");
  const [riskFilter, setRiskFilter] = useState<ClinicalRiskLevel | "All">(
    "All",
  );
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientDto | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<PatientDto | null>(
    null,
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: [
      "patients",
      { search, statusFilter, riskFilter, page, pageSize },
    ],
    queryFn: () =>
      clinicalService.getPatients({
        search,
        status: statusFilter,
        risk: riskFilter,
        page,
        pageSize,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (patientId: string) => clinicalService.deletePatient(patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["examinations"] });
      handleToast(
        `Deleted patient "${deletingPatient?.fullName}" and all linked ECG records.`,
      );
      setDeletingPatient(null);
    },
  });

  const handleOpenCreate = () => {
    setEditingPatient(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (patient: PatientDto) => {
    setEditingPatient(patient);
    setModalOpen(true);
  };

  const handleToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-dash-card">
      {toastMsg && (
        <div className="rounded-2xl bg-emerald-600 text-white px-5 py-3.5 shadow-lg flex items-center justify-between text-sm font-semibold">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5" />
            <span>{toastMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#052e6e] tracking-tight">
            Patients Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Search, filter, register, edit, delete, and inspect longitudinal
            12-lead ECG histories & PDF reports.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreate}
          className="self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 text-sky-200" />
          Add New Patient
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-3xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-xs grid sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, ID, email, or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-100/80 border border-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0284c7]"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as PatientProfileStatus | "All");
              setPage(1);
            }}
            className="w-full px-4 py-2.5 rounded-full bg-slate-100/80 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:bg-white focus:border-[#0284c7]"
          >
            <option value="All">Status: All Profiles</option>
            <option value="Active">Active</option>
            <option value="Incomplete">Incomplete</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value as ClinicalRiskLevel | "All");
              setPage(1);
            }}
            className="w-full px-4 py-2.5 rounded-full bg-slate-100/80 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:bg-white focus:border-[#0284c7]"
          >
            <option value="All">Risk: All Levels</option>
            <option value="Critical">Critical Alert</option>
            <option value="Moderate">Moderate</option>
            <option value="Normal">Normal</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="rounded-3xl bg-white border border-slate-200/80 p-8 space-y-4">
          {[1, 2, 3, 4].map((row) => (
            <div
              key={row}
              className="h-14 rounded-2xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-3xl bg-white border border-rose-200 p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#e11d48] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-extrabold text-[#052e6e]">
            Unable to Load Patient Records
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {(error as Error)?.message ||
              "A network error occurred while fetching patient records."}
          </p>
          <Button variant="primary" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
            Retry Query
          </Button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && data && data.items.length === 0 && (
        <div className="rounded-3xl bg-white border border-slate-200/80 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#eef4fb] text-[#0284c7] flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-extrabold text-[#052e6e]">
            No Matching Patients Found
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Clear your search or filters, or register a new patient record.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
                setRiskFilter("All");
                setPage(1);
              }}
            >
              Reset Filters
            </Button>
            <Button variant="primary" size="sm" onClick={handleOpenCreate}>
              <UserPlus className="w-4 h-4" />
              Register Patient
            </Button>
          </div>
        </div>
      )}

      {/* Patients Table with Profile, Edit & Delete */}
      {!isLoading && !isError && data && data.items.length > 0 && (
        <div className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-5">Patient</th>
                  <th className="py-3.5 px-4">Demographics</th>
                  <th className="py-3.5 px-4">Profile Status</th>
                  <th className="py-3.5 px-4">Latest Triage</th>
                  <th className="py-3.5 px-4">ECGs</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {data.items.map((patient: PatientDto) => (
                  <tr
                    key={patient.patientId}
                    className="hover:bg-[#eef4fb]/50 transition-colors"
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <PatientAvatar
                          name={patient.fullName}
                          gender={patient.gender}
                          size="sm"
                        />
                        <div>
                          <Link
                            to={`/doctor/patients/${patient.patientId}`}
                            className="font-bold text-[#052e6e] hover:text-[#0284c7] transition"
                          >
                            {patient.fullName}
                          </Link>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {patient.patientId} • {patient.phoneNumber}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      <span className="font-semibold text-slate-800">
                        {patient.age} yrs
                      </span>{" "}
                      • {patient.gender}
                      {patient.bloodType && (
                        <span className="ml-2 px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-bold text-[#052e6e]">
                          {patient.bloodType}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${
                          STATUS_BADGE[patient.profileStatus]
                        }`}
                      >
                        {patient.profileStatus}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${
                          RISK_BADGE[patient.latestRiskLevel]
                        }`}
                      >
                        {patient.latestRiskLevel}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-bold text-[#052e6e]">
                      {patient.examinationsCount}
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          to={`/doctor/patients/${patient.patientId}`}
                          className="btn-landing-gradient inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Profile
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(patient)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingPatient(patient)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-50 text-[#e11d48] border border-rose-200/80 hover:bg-[#e11d48] hover:text-white text-xs font-bold transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-4 bg-slate-50/70 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing{" "}
              <strong className="text-[#052e6e]">{data.items.length}</strong> of{" "}
              <strong className="text-[#052e6e]">{data.totalCount}</strong>{" "}
              patients {isFetching && "• Updating..."}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={data.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-slate-200 font-bold text-[#052e6e] disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Prev
              </button>
              <span className="font-bold text-[#052e6e] px-2">
                Page {data.page} of {data.totalPages}
              </span>
              <button
                type="button"
                disabled={data.page >= data.totalPages}
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-slate-200 font-bold text-[#052e6e] disabled:opacity-40 cursor-pointer"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <PatientFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingPatient={editingPatient}
        onSuccessMessage={handleToast}
      />

      {/* نافذة تأكيد حذف المريض بالكامل */}
      {deletingPatient &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-[#052e6e]/15 backdrop-blur-[3px]"
              onClick={() => setDeletingPatient(null)}
            />
            <div className="relative z-10 w-full max-w-md rounded-3xl bg-white border border-rose-200 p-6 shadow-2xl space-y-4 animate-dash-card">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 text-[#e11d48] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#052e6e]">
                    Delete Patient Record?
                  </h3>
                  <p className="text-xs text-slate-500">
                    This action permanently removes the patient and all ECG
                    studies.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                <p className="font-extrabold text-[#052e6e]">
                  {deletingPatient.fullName} ({deletingPatient.patientId})
                </p>
                <p className="text-slate-500">
                  {deletingPatient.phoneNumber} •{" "}
                  {deletingPatient.examinationsCount} linked ECG examination(s)
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingPatient(null)}
                  disabled={deleteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  disabled={deleteMutation.isPending}
                  onClick={() =>
                    deleteMutation.mutate(deletingPatient.patientId)
                  }
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {deleteMutation.isPending
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
