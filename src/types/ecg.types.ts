export const ECG_LEAD_ORDER = [
  "I",
  "II",
  "III",
  "aVR",
  "aVL",
  "aVF",
  "V1",
  "V2",
  "V3",
  "V4",
  "V5",
  "V6",
] as const;

export type EcgLeadName = (typeof ECG_LEAD_ORDER)[number];

export type ClinicalRiskLevel = "Critical" | "Moderate" | "Normal";
export type PatientProfileStatus = "Active" | "Incomplete" | "Archived";
export type ExaminationStatus =
  | "Pending"
  | "Completed"
  | "Reviewed"
  | "Flagged";
export type DoctorReviewDecision = "Approved" | "Modified" | "NeedsReRecording";
export type ReportStatus = "Draft" | "Finalized";

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface PatientDto {
  patientId: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  bloodType?: string;
  address?: string;
  profileStatus: PatientProfileStatus;
  latestRiskLevel: ClinicalRiskLevel;
  examinationsCount: number;
  createdAt: string;
}

export interface EcgMeasurements {
  heartRateBpm: number;
  prIntervalMs: number;
  qrsDurationMs: number;
  qtIntervalMs: number;
  qtcMs: number;
}

export interface AiAnalysisDto {
  analysisId: string;
  examinationId: string;
  predictedResult: string;
  confidenceScore: number;
  modelVersion: string;
  inferenceLatencyMs: number;
  measurements: EcgMeasurements;
  xaiLeadWeights: Record<EcgLeadName, number>;
  clinicalRationale: string;
}

export interface ClinicalReportDto {
  reportId: string;
  examinationId: string;
  reportTitle: string;
  reportContent: string;
  status: ReportStatus;
  doctorNotes?: string;
}

export interface ExaminationDto {
  examinationId: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: "Male" | "Female" | "Other";
  performedAt: string;
  samplingRateHz: number;
  durationSeconds: number;
  signalQuality: "Good" | "Acceptable" | "Poor";
  status: ExaminationStatus;
  riskLevel: ClinicalRiskLevel;
  aiAnalysis?: AiAnalysisDto;
  report?: ClinicalReportDto;
}

export type EcgExaminationDto = ExaminationDto;

export type ConsultationTier =
  | "PrimaryFree"
  | "NewDoctorPaid"
  | "OneTimeGuestPaid";

export interface ChatAttachmentDto {
  fileName: string;
  fileSizeLabel: string;
  fileCategory: "image" | "pdf" | "wfdb" | "other";
  previewUrl?: string;
}

export interface ChatMessageDto {
  messageId: string;
  senderRole: "patient" | "doctor";
  senderName: string;
  text: string;
  sentAt: string;
  attachedExamId?: string;
  attachment?: ChatAttachmentDto;
}

export interface ConsultationThreadDto {
  threadId: string;
  patientId?: string | null;
  patientName: string;
  patientAge: number;
  doctorId?: string;
  doctorName?: string;
  doctorSpecialty?: string;
  tier: ConsultationTier;
  isPaid: boolean;
  feeEgp: number;
  status: "Active" | "Completed" | "AwaitingPayment";
  unreadCount: number;
  doctorUnreadCount?: number;
  patientUnreadCount?: number;
  lastMessageAt: string;
  messages: ChatMessageDto[];
}