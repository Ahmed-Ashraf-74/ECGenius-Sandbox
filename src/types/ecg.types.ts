export type UserRole = "doctor" | "patient";

export interface ECGSignalSummary {
  id: string;
  patientId: string;
  recordedAt: string;
  signalQuality: "good" | "acceptable" | "poor";
  diagnosis?: string;
  confidenceScore?: number;
}
