import type {
  PatientDto,
  ExaminationDto,
  PaginatedResponse,
  PatientProfileStatus,
  ClinicalRiskLevel,
  DoctorReviewDecision,
  ConsultationThreadDto,
} from "../types/ecg.types";
import type { PatientFormValues } from "../schemas/patient.schema";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface ClinicalNotificationDto {
  id: string;
  category:
    | "Critical Alert"
    | "New Exam Arrival"
    | "Report Finalized"
    | "Patient Update";
  title: string;
  createdAt: string;
  to: string;
  read: boolean;
}

export interface ConsultationDoctorDto {
  doctorId: string;
  fullName: string;
  specialty: string;
  hospital: string;
  rating: number;
  reviewsCount: number;
  experienceYears: number;
  responseTimeLabel: string;
  isPrimaryForCurrentPatient: boolean;
  feeEgp: number;
  online: boolean;
}

export const AVAILABLE_DOCTORS: ConsultationDoctorDto[] = [
  {
    doctorId: "doc-1",
    fullName: "Dr. Ahmed Ashraf",
    specialty: "Consultant Interventional Cardiologist",
    hospital: "Cairo Heart Institute • Primary Care",
    rating: 4.9,
    reviewsCount: 218,
    experienceYears: 16,
    responseTimeLabel: "~10 mins reply",
    isPrimaryForCurrentPatient: true,
    feeEgp: 0,
    online: true,
  },
  {
    doctorId: "doc-2",
    fullName: "Dr. Mariam Soliman",
    specialty: "Electrophysiology & Arrhythmia Specialist",
    hospital: "Al-Salam International Hospital",
    rating: 4.8,
    reviewsCount: 164,
    experienceYears: 12,
    responseTimeLabel: "~15 mins reply",
    isPrimaryForCurrentPatient: false,
    feeEgp: 250,
    online: true,
  },
  {
    doctorId: "doc-3",
    fullName: "Dr. Khaled Abdel-Nasser",
    specialty: "Heart Failure & Echocardiography Consultant",
    hospital: "Dar Al-Fouad Heart Center",
    rating: 4.95,
    reviewsCount: 310,
    experienceYears: 20,
    responseTimeLabel: "~8 mins reply",
    isPrimaryForCurrentPatient: false,
    feeEgp: 350,
    online: true,
  },
  {
    doctorId: "doc-4",
    fullName: "Dr. Nourhan Tarek",
    specialty: "Preventive Cardiology & ECG Diagnostics",
    hospital: "Cleopatra Hospital Group",
    rating: 4.7,
    reviewsCount: 95,
    experienceYears: 9,
    responseTimeLabel: "~20 mins reply",
    isPrimaryForCurrentPatient: false,
    feeEgp: 180,
    online: true,
  },
];

const STORAGE_KEY = "ecgenius_clinical_store_v4";

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return 45;
  const diff = Date.now() - birth.getTime();
  return Math.max(1, Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000)));
}

const INITIAL_PATIENTS: PatientDto[] = [
  {
    patientId: "pat-1001",
    userId: "usr-2001",
    fullName: "Mahmoud Abdel-Rahman",
    email: "mahmoud.abdelrahman@example.com",
    phoneNumber: "+20 100 412 8890",
    dateOfBirth: "1968-04-14",
    age: 58,
    gender: "Male",
    bloodType: "A+",
    address: "Egypt, Giza, 14 Dokki St.",
    profileStatus: "Active",
    latestRiskLevel: "Critical",
    examinationsCount: 2,
    createdAt: "2026-09-12T09:30:00Z",
  },
  {
    patientId: "pat-1002",
    userId: "usr-2002",
    fullName: "Nadia El-Sayed Hassan",
    email: "nadia.elsayed@example.com",
    phoneNumber: "+20 101 884 2210",
    dateOfBirth: "1975-11-02",
    age: 51,
    gender: "Female",
    bloodType: "O+",
    address: "Egypt, Cairo, Nasr City, Abbas El-Akkad",
    profileStatus: "Active",
    latestRiskLevel: "Moderate",
    examinationsCount: 1,
    createdAt: "2026-10-03T11:15:00Z",
  },
  {
    patientId: "pat-1003",
    userId: "usr-2003",
    fullName: "Tarek Mostafa Kamel",
    email: "tarek.kamel@example.com",
    phoneNumber: "+20 112 339 7741",
    dateOfBirth: "1989-07-21",
    age: 37,
    gender: "Male",
    bloodType: "B+",
    address: "Egypt, Alexandria, Smouha",
    profileStatus: "Active",
    latestRiskLevel: "Normal",
    examinationsCount: 1,
    createdAt: "2026-10-19T14:40:00Z",
  },
  {
    patientId: "pat-1004",
    userId: "usr-2004",
    fullName: "Salma Ibrahim Farouk",
    email: "salma.farouk@example.com",
    phoneNumber: "+20 122 509 6134",
    dateOfBirth: "1962-01-30",
    age: 64,
    gender: "Female",
    bloodType: "AB-",
    address: "Egypt, Giza, Sheikh Zayed District 4",
    profileStatus: "Active",
    latestRiskLevel: "Moderate",
    examinationsCount: 1,
    createdAt: "2026-11-01T08:50:00Z",
  },
];

const INITIAL_EXAMINATIONS: ExaminationDto[] = [
  {
    examinationId: "exam-5001",
    patientId: "pat-1001",
    patientName: "Mahmoud Abdel-Rahman",
    patientAge: 58,
    patientGender: "Male",
    performedAt: "2026-11-24T10:15:00Z",
    samplingRateHz: 500,
    durationSeconds: 10,
    signalQuality: "Good",
    status: "Reviewed",
    riskLevel: "Critical",
    aiAnalysis: {
      analysisId: "ai-9001",
      examinationId: "exam-5001",
      predictedResult: "Anterior ST-Elevation Myocardial Infarction (STEMI)",
      confidenceScore: 96.4,
      modelVersion: "ResNet1D-ECG-v2.4 (XAI-GradCAM)",
      inferenceLatencyMs: 142,
      clinicalRationale:
        "Significant convex ST-segment elevation (+3.2 to +4.1 mm) across precordial leads V2–V4 with reciprocal ST depression in inferior leads.",
      measurements: {
        heartRateBpm: 108,
        prIntervalMs: 164,
        qrsDurationMs: 98,
        qtIntervalMs: 368,
        qtcMs: 446,
      },
      xaiLeadWeights: {
        I: 0.18,
        II: 0.24,
        III: 0.41,
        aVR: 0.15,
        aVL: 0.29,
        aVF: 0.36,
        V1: 0.62,
        V2: 0.89,
        V3: 0.95,
        V4: 0.84,
        V5: 0.38,
        V6: 0.21,
      },
    },
    report: {
      reportId: "rep-7001",
      examinationId: "exam-5001",
      reportTitle: "Acute Anterior STEMI Diagnostic Report",
      reportContent:
        "12-lead ECG demonstrates sinus tachycardia at 108 bpm with marked anterior ST-segment elevation in leads V2–V4 (peak +4.1 mm in V3), consistent with acute anterior wall myocardial injury.",
      doctorNotes:
        "Immediate cath-lab activation protocol initiated. Dual antiplatelet loading administered.",
      status: "Finalized",
    },
  },
  {
    examinationId: "exam-5002",
    patientId: "pat-1002",
    patientName: "Nadia El-Sayed Hassan",
    patientAge: 51,
    patientGender: "Female",
    performedAt: "2026-11-24T12:30:00Z",
    samplingRateHz: 500,
    durationSeconds: 10,
    signalQuality: "Good",
    status: "Flagged",
    riskLevel: "Moderate",
    aiAnalysis: {
      analysisId: "ai-9002",
      examinationId: "exam-5002",
      predictedResult:
        "Atrial Fibrillation (AFib) with Controlled Ventricular Rate",
      confidenceScore: 93.8,
      modelVersion: "ResNet1D-ECG-v2.4 (XAI-GradCAM)",
      inferenceLatencyMs: 135,
      clinicalRationale:
        "Irregularly irregular R-R intervals without discrete P-waves; low-amplitude fibrillatory baseline oscillations prominent in Lead II and V1.",
      measurements: {
        heartRateBpm: 88,
        prIntervalMs: 0,
        qrsDurationMs: 88,
        qtIntervalMs: 360,
        qtcMs: 422,
      },
      xaiLeadWeights: {
        I: 0.31,
        II: 0.91,
        III: 0.54,
        aVR: 0.19,
        aVL: 0.27,
        aVF: 0.66,
        V1: 0.86,
        V2: 0.44,
        V3: 0.33,
        V4: 0.28,
        V5: 0.25,
        V6: 0.22,
      },
    },
    report: {
      reportId: "rep-7002",
      examinationId: "exam-5002",
      reportTitle: "Atrial Fibrillation Rhythm Evaluation (Draft)",
      reportContent:
        "Irregularly irregular narrow-complex rhythm averaging 88 bpm with absent P-waves, compatible with atrial fibrillation.",
      doctorNotes:
        "Evaluate CHA2DS2-VASc score and confirm anticoagulation plan.",
      status: "Draft",
    },
  },
  {
    examinationId: "exam-5003",
    patientId: "pat-1003",
    patientName: "Tarek Mostafa Kamel",
    patientAge: 37,
    patientGender: "Male",
    performedAt: "2026-11-23T16:10:00Z",
    samplingRateHz: 500,
    durationSeconds: 10,
    signalQuality: "Good",
    status: "Reviewed",
    riskLevel: "Normal",
    aiAnalysis: {
      analysisId: "ai-9003",
      examinationId: "exam-5003",
      predictedResult: "Normal Sinus Rhythm",
      confidenceScore: 99.1,
      modelVersion: "ResNet1D-ECG-v2.4 (XAI-GradCAM)",
      inferenceLatencyMs: 121,
      clinicalRationale:
        "Regular upright P waves before every narrow QRS complex; normal axis and physiological PR/QTc intervals across all 12 leads.",
      measurements: {
        heartRateBpm: 72,
        prIntervalMs: 156,
        qrsDurationMs: 86,
        qtIntervalMs: 372,
        qtcMs: 404,
      },
      xaiLeadWeights: {
        I: 0.22,
        II: 0.35,
        III: 0.18,
        aVR: 0.12,
        aVL: 0.16,
        aVF: 0.24,
        V1: 0.19,
        V2: 0.25,
        V3: 0.27,
        V4: 0.23,
        V5: 0.21,
        V6: 0.18,
      },
    },
    report: {
      reportId: "rep-7003",
      examinationId: "exam-5003",
      reportTitle: "Pre-Operative 12-Lead ECG Clearance",
      reportContent:
        "Normal sinus rhythm at 72 bpm. No acute ischemic ST-T changes or conduction abnormalities.",
      doctorNotes: "Cleared for routine elective procedure.",
      status: "Finalized",
    },
  },
  {
    examinationId: "exam-5004",
    patientId: "pat-1004",
    patientName: "Salma Ibrahim Farouk",
    patientAge: 64,
    patientGender: "Female",
    performedAt: "2026-11-22T09:45:00Z",
    samplingRateHz: 500,
    durationSeconds: 10,
    signalQuality: "Good",
    status: "Completed",
    riskLevel: "Moderate",
    aiAnalysis: {
      analysisId: "ai-9004",
      examinationId: "exam-5004",
      predictedResult: "Complete Left Bundle Branch Block (LBBB)",
      confidenceScore: 95.2,
      modelVersion: "ResNet1D-ECG-v2.4 (XAI-GradCAM)",
      inferenceLatencyMs: 138,
      clinicalRationale:
        "Widened QRS complex (>128 ms) with broad notched monophasic R waves in lateral leads I, aVL, V5, and V6.",
      measurements: {
        heartRateBpm: 76,
        prIntervalMs: 178,
        qrsDurationMs: 134,
        qtIntervalMs: 392,
        qtcMs: 438,
      },
      xaiLeadWeights: {
        I: 0.81,
        II: 0.26,
        III: 0.22,
        aVR: 0.18,
        aVL: 0.79,
        aVF: 0.21,
        V1: 0.64,
        V2: 0.45,
        V3: 0.34,
        V4: 0.48,
        V5: 0.92,
        V6: 0.89,
      },
    },
    report: {
      reportId: "rep-7004",
      examinationId: "exam-5004",
      reportTitle: "Intraventricular Conduction Delay Report (Draft)",
      reportContent:
        "Sinus rhythm at 76 bpm with complete left bundle branch block morphology (QRS 134 ms) and secondary ST-T discordance.",
      doctorNotes:
        "Compare with prior baseline ECGs and schedule echocardiogram.",
      status: "Draft",
    },
  },
  {
    examinationId: "exam-5005",
    patientId: "pat-1001",
    patientName: "Mahmoud Abdel-Rahman",
    patientAge: 58,
    patientGender: "Male",
    performedAt: "2026-10-18T11:00:00Z",
    samplingRateHz: 500,
    durationSeconds: 10,
    signalQuality: "Good",
    status: "Reviewed",
    riskLevel: "Moderate",
    aiAnalysis: {
      analysisId: "ai-9005",
      examinationId: "exam-5005",
      predictedResult:
        "Sinus Rhythm with Borderline Anterior T-Wave Flattening",
      confidenceScore: 91.5,
      modelVersion: "ResNet1D-ECG-v2.4 (XAI-GradCAM)",
      inferenceLatencyMs: 129,
      clinicalRationale:
        "Baseline sinus rhythm at 78 bpm with mild T-wave flattening in V3–V4; no acute ST elevation at time of baseline visit.",
      measurements: {
        heartRateBpm: 78,
        prIntervalMs: 162,
        qrsDurationMs: 92,
        qtIntervalMs: 366,
        qtcMs: 416,
      },
      xaiLeadWeights: {
        I: 0.2,
        II: 0.28,
        III: 0.19,
        aVR: 0.14,
        aVL: 0.21,
        aVF: 0.23,
        V1: 0.31,
        V2: 0.49,
        V3: 0.68,
        V4: 0.61,
        V5: 0.27,
        V6: 0.22,
      },
    },
    report: {
      reportId: "rep-7005",
      examinationId: "exam-5005",
      reportTitle: "Baseline Cardiology Follow-Up ECG",
      reportContent:
        "Sinus rhythm at 78 bpm with non-specific anterior T-wave flattening. Retained as baseline reference study.",
      doctorNotes: "Follow up in 4 weeks or sooner if chest discomfort occurs.",
      status: "Finalized",
    },
  },
];

const INITIAL_NOTIFICATIONS: ClinicalNotificationDto[] = [
  {
    id: "ntf-1",
    category: "Critical Alert",
    title: "Anterior STEMI detected for Mahmoud Abdel-Rahman",
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    to: "/doctor/examinations/exam-5001",
    read: false,
  },
  {
    id: "ntf-2",
    category: "New Exam Arrival",
    title: "500Hz 12-lead recording uploaded for Nadia El-Sayed Hassan",
    createdAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    to: "/doctor/examinations/exam-5002",
    read: false,
  },
];

const INITIAL_THREADS: ConsultationThreadDto[] = [
  {
    threadId: "thr-301",
    patientId: "pat-1001",
    patientName: "Mahmoud Abdel-Rahman",
    patientAge: 58,
    doctorId: "doc-1",
    doctorName: "Dr. Ahmed Ashraf",
    doctorSpecialty: "Consultant Interventional Cardiologist",
    tier: "PrimaryFree",
    isPaid: true,
    feeEgp: 0,
    status: "Active",
    unreadCount: 1, doctorUnreadCount: 1, patientUnreadCount: 0,
    lastMessageAt: "2026-11-25T10:20:00Z",
    messages: [
      {
        messageId: "msg-1",
        senderRole: "patient",
        senderName: "Mahmoud Abdel-Rahman",
        text: "Good morning Doctor, I uploaded my morning 12-lead ECG strip for your review.",
        sentAt: "2026-11-25T10:20:00Z",
        attachedExamId: "exam-5001",
      },
    ],
  },
  {
    threadId: "thr-302",
    patientId: "pat-1002",
    patientName: "Nadia El-Sayed Hassan",
    patientAge: 51,
    doctorId: "doc-2",
    doctorName: "Dr. Mariam Soliman",
    doctorSpecialty: "Electrophysiology & Arrhythmia Specialist",
    tier: "NewDoctorPaid",
    isPaid: false,
    feeEgp: 250,
    status: "AwaitingPayment",
    unreadCount: 0, doctorUnreadCount: 0, patientUnreadCount: 1,
    lastMessageAt: "2026-11-25T11:10:00Z",
    messages: [],
  },
  {
    threadId: "thr-303",
    patientId: null,
    patientName: "Omar Youssef (Guest Patient)",
    patientAge: 42,
    doctorId: "doc-3",
    doctorName: "Dr. Khaled Abdel-Nasser",
    doctorSpecialty: "Heart Failure & Echocardiography Consultant",
    tier: "OneTimeGuestPaid",
    isPaid: false,
    feeEgp: 300,
    status: "AwaitingPayment",
    unreadCount: 0, doctorUnreadCount: 0, patientUnreadCount: 1,
    lastMessageAt: "2026-11-25T11:45:00Z",
    messages: [],
  },
];

interface PersistedClinicalState {
  patients: PatientDto[];
  examinations: ExaminationDto[];
  notifications: ClinicalNotificationDto[];
  threads: ConsultationThreadDto[];
  nextPatientSeq: number;
  nextExamSeq: number;
}

function loadState(): PersistedClinicalState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedClinicalState;
      if (
        Array.isArray(parsed.patients) &&
        Array.isArray(parsed.examinations)
      ) {
        return {
          patients: parsed.patients,
          examinations: parsed.examinations,
          notifications: parsed.notifications || INITIAL_NOTIFICATIONS,
          threads: parsed.threads || INITIAL_THREADS,
          nextPatientSeq: Math.max(1005, parsed.nextPatientSeq || 1005),
          nextExamSeq: Math.max(5006, parsed.nextExamSeq || 5006),
        };
      }
    }
  } catch {
    // fallback to defaults
  }
  return {
    patients: [...INITIAL_PATIENTS],
    examinations: [...INITIAL_EXAMINATIONS],
    notifications: [...INITIAL_NOTIFICATIONS],
    threads: [...INITIAL_THREADS],
    nextPatientSeq: 1005,
    nextExamSeq: 5006,
  };
}

let state: PersistedClinicalState = loadState();

function persistState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

function pushNotification(
  category: ClinicalNotificationDto["category"],
  title: string,
  to: string,
) {
  const item: ClinicalNotificationDto = {
    id: `ntf-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    category,
    title,
    createdAt: new Date().toISOString(),
    to,
    read: false,
  };
  state.notifications = [item, ...state.notifications].slice(0, 40);
}

export const clinicalService = {
  async getPatients(params: {
    search?: string;
    status?: PatientProfileStatus | "All";
    risk?: ClinicalRiskLevel | "All";
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<PatientDto>> {
    await sleep(140);
    const q = (params.search || "").trim().toLowerCase();
    const filtered = state.patients.filter((p) => {
      const matchesSearch =
        !q ||
        p.fullName.toLowerCase().includes(q) ||
        p.patientId.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phoneNumber.toLowerCase().includes(q);
      const matchesStatus =
        !params.status ||
        params.status === "All" ||
        p.profileStatus === params.status;
      const matchesRisk =
        !params.risk ||
        params.risk === "All" ||
        p.latestRiskLevel === params.risk;
      return matchesSearch && matchesStatus && matchesRisk;
    });

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;

    return {
      items: filtered.slice(start, start + pageSize),
      page: safePage,
      pageSize,
      totalCount,
      totalPages,
    };
  },

  async getPatientById(
    patientId: string,
  ): Promise<{ patient: PatientDto; examinations: ExaminationDto[] }> {
    await sleep(130);
    const patient = state.patients.find((p) => p.patientId === patientId);
    if (!patient) throw new Error("Patient record not found.");
    const examinations = state.examinations
      .filter((e) => e.patientId === patientId)
      .sort(
        (a, b) =>
          new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime(),
      );
    return { patient, examinations };
  },

  async createPatient(values: PatientFormValues): Promise<PatientDto> {
    await sleep(180);
    const duplicateEmail = state.patients.some(
      (p) => p.email.toLowerCase() === values.email.trim().toLowerCase(),
    );
    if (duplicateEmail) {
      throw new Error("A patient with this email address already exists.");
    }
    const duplicatePhone = state.patients.some(
      (p) =>
        p.phoneNumber.replace(/\s+/g, "") ===
        values.phoneNumber.replace(/\s+/g, ""),
    );
    if (duplicatePhone) {
      throw new Error("A patient with this phone number already exists.");
    }

    // توليد ID تسلسلي مضمون التفرد حتى بعد حذف مرضى سابقين
    let seq = state.nextPatientSeq;
    while (state.patients.some((p) => p.patientId === `pat-${seq}`)) {
      seq += 1;
    }
    state.nextPatientSeq = seq + 1;

    const newPatient: PatientDto = {
      patientId: `pat-${seq}`,
      userId: `usr-${seq + 1000}`,
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phoneNumber: values.phoneNumber.trim(),
      dateOfBirth: values.dateOfBirth,
      age: calculateAge(values.dateOfBirth),
      gender: values.gender,
      bloodType: values.bloodType || undefined,
      address: values.address || undefined,
      profileStatus: values.profileStatus || "Active",
      latestRiskLevel: "Normal",
      examinationsCount: 0,
      createdAt: new Date().toISOString(),
    };

    state.patients = [newPatient, ...state.patients];
    pushNotification(
      "Patient Update",
      `New patient registered: ${newPatient.fullName} (${newPatient.patientId})`,
      `/doctor/patients/${newPatient.patientId}`,
    );
    persistState();
    return newPatient;
  },

  async updatePatient(
    patientId: string,
    values: PatientFormValues,
  ): Promise<PatientDto> {
    await sleep(180);
    const idx = state.patients.findIndex((p) => p.patientId === patientId);
    if (idx === -1) throw new Error("Patient record not found.");

    const updated: PatientDto = {
      ...state.patients[idx],
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phoneNumber: values.phoneNumber.trim(),
      dateOfBirth: values.dateOfBirth,
      age: calculateAge(values.dateOfBirth),
      gender: values.gender,
      bloodType: values.bloodType || undefined,
      address: values.address || undefined,
      profileStatus: values.profileStatus || state.patients[idx].profileStatus,
    };

    state.patients[idx] = updated;
    state.examinations = state.examinations.map((ex) =>
      ex.patientId === patientId
        ? {
            ...ex,
            patientName: updated.fullName,
            patientAge: updated.age,
            patientGender: updated.gender,
          }
        : ex,
    );
    pushNotification(
      "Patient Update",
      `Patient profile updated: ${updated.fullName} (${updated.patientId})`,
      `/doctor/patients/${updated.patientId}`,
    );
    persistState();
    return updated;
  },

  async deletePatient(patientId: string): Promise<void> {
    await sleep(180);
    const target = state.patients.find((p) => p.patientId === patientId);
    if (!target) throw new Error("Patient record not found.");
    state.patients = state.patients.filter((p) => p.patientId !== patientId);
    state.examinations = state.examinations.filter(
      (e) => e.patientId !== patientId,
    );
    pushNotification(
      "Patient Update",
      `Removed patient record: ${target.fullName} (${target.patientId})`,
      "/doctor/patients",
    );
    persistState();
  },

  async getExaminations(): Promise<ExaminationDto[]> {
    await sleep(130);
    return [...state.examinations].sort(
      (a, b) =>
        new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime(),
    );
  },

  async getExaminationById(examinationId: string): Promise<ExaminationDto> {
    await sleep(120);
    const found = state.examinations.find(
      (e) => e.examinationId === examinationId,
    );
    if (!found) throw new Error("ECG examination not found.");
    return found;
  },

  async createExamination(payload: {
    patientId: string;
    sourceLabel: string;
  }): Promise<ExaminationDto> {
    await sleep(200);
    const patient = state.patients.find(
      (p) => p.patientId === payload.patientId,
    );
    if (!patient) throw new Error("Selected patient was not found.");

    let examSeq = state.nextExamSeq;
    while (
      state.examinations.some((e) => e.examinationId === `exam-${examSeq}`)
    ) {
      examSeq += 1;
    }
    state.nextExamSeq = examSeq + 1;

    const examinationId = `exam-${examSeq}`;

    const newExam: ExaminationDto = {
      examinationId,
      patientId: patient.patientId,
      patientName: patient.fullName,
      patientAge: patient.age,
      patientGender: patient.gender,
      performedAt: new Date().toISOString(),
      samplingRateHz: 500,
      durationSeconds: 10,
      signalQuality: "Good",
      status: "Flagged",
      riskLevel: "Critical",
      aiAnalysis: {
        analysisId: `ai-${examSeq + 4000}`,
        examinationId,
        predictedResult: "Anterior ST-Segment Elevation & T-Wave Inversion",
        confidenceScore: 95.6,
        modelVersion: "ResNet1D-ECG-v2.4 (XAI-GradCAM)",
        inferenceLatencyMs: 139,
        clinicalRationale: `Acquired via ${payload.sourceLabel}. Automated 12-lead ResNet1D inference flagged precordial ST elevation in leads V2–V3 with secondary repolarization shift.`,
        measurements: {
          heartRateBpm: 94,
          prIntervalMs: 162,
          qrsDurationMs: 96,
          qtIntervalMs: 374,
          qtcMs: 436,
        },
        xaiLeadWeights: {
          I: 0.24,
          II: 0.38,
          III: 0.31,
          aVR: 0.16,
          aVL: 0.28,
          aVF: 0.34,
          V1: 0.58,
          V2: 0.91,
          V3: 0.94,
          V4: 0.72,
          V5: 0.35,
          V6: 0.22,
        },
      },
      report: {
        reportId: `rep-${examSeq + 2000}`,
        examinationId,
        reportTitle: "12-Lead AI ECG Diagnostic Report (Draft)",
        reportContent:
          "Sinus rhythm at 94 bpm with focal anterior ST-segment elevation in leads V2–V3 detected by ResNet1D-XAI.",
        doctorNotes: "Awaiting cardiologist review and sign-off.",
        status: "Draft",
      },
    };

    state.examinations = [newExam, ...state.examinations];
    state.patients = state.patients.map((p) =>
      p.patientId === patient.patientId
        ? {
            ...p,
            latestRiskLevel: "Critical",
            examinationsCount: state.examinations.filter(
              (e) => e.patientId === patient.patientId,
            ).length,
          }
        : p,
    );

    pushNotification(
      "Critical Alert",
      `New AI ECG analysis (${examinationId.toUpperCase()}) flagged for ${patient.fullName}`,
      `/doctor/examinations/${examinationId}`,
    );
    persistState();
    return newExam;
  },

  async submitDoctorReview(payload: {
    examinationId: string;
    decision: DoctorReviewDecision;
    reportTitle: string;
    reportContent: string;
    doctorNotes: string;
  }): Promise<ExaminationDto> {
    await sleep(180);
    const idx = state.examinations.findIndex(
      (e) => e.examinationId === payload.examinationId,
    );
    if (idx === -1) throw new Error("Examination record not found.");

    const current = state.examinations[idx];
    const isFinal =
      payload.decision === "Approved" || payload.decision === "Modified";

    const updated: ExaminationDto = {
      ...current,
      status: payload.decision === "NeedsReRecording" ? "Flagged" : "Reviewed",
      report: {
        reportId: current.report?.reportId || `rep-${Date.now()}`,
        examinationId: current.examinationId,
        reportTitle: payload.reportTitle,
        reportContent: payload.reportContent,
        doctorNotes: payload.doctorNotes,
        status: isFinal ? "Finalized" : "Draft",
      },
    };

    state.examinations[idx] = updated;
    pushNotification(
      "Report Finalized",
      `${isFinal ? "Signed & Finalized" : "Updated"} report for ${current.patientName} (${current.examinationId.toUpperCase()})`,
      `/doctor/patients/${current.patientId}?report=${current.examinationId}`,
    );
    persistState();
    return updated;
  },

  async getNotifications(): Promise<ClinicalNotificationDto[]> {
    await sleep(100);
    return [...state.notifications];
  },

  async markNotificationRead(id: string): Promise<void> {
    state.notifications = state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    persistState();
  },

  async markAllNotificationsRead(): Promise<void> {
    state.notifications = state.notifications.map((n) => ({
      ...n,
      read: true,
    }));
    persistState();
  },

  async getConsultationThreads(): Promise<ConsultationThreadDto[]> {
    state = loadState();
    await sleep(100);
    return [...state.threads].sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime(),
    );
  },

  async startOrGetConsultationThread(payload: {
    patientId?: string | null;
    patientName: string;
    patientAge: number;
    doctorId: string;
    isGuestUser?: boolean;
  }): Promise<ConsultationThreadDto> {
    await sleep(140);
    state = loadState();
    const doc =
      AVAILABLE_DOCTORS.find((d) => d.doctorId === payload.doctorId) ||
      AVAILABLE_DOCTORS[0];

    const existing = state.threads.find(
      (t) =>
        t.doctorId === doc.doctorId &&
        (payload.patientId
          ? t.patientId === payload.patientId
          : t.patientName === payload.patientName),
    );
    if (existing) return existing;

    const isPrimary =
      !payload.isGuestUser &&
      Boolean(payload.patientId) &&
      doc.isPrimaryForCurrentPatient;
    const tier = isPrimary
      ? "PrimaryFree"
      : payload.isGuestUser || !payload.patientId
        ? "OneTimeGuestPaid"
        : "NewDoctorPaid";
    const feeEgp = isPrimary
      ? 0
      : payload.isGuestUser
        ? 300
        : doc.feeEgp || 250;

    const newThread: ConsultationThreadDto = {
      threadId: `thr-${Date.now()}`,
      patientId: payload.patientId || null,
      patientName: payload.patientName,
      patientAge: payload.patientAge,
      doctorId: doc.doctorId,
      doctorName: doc.fullName,
      doctorSpecialty: doc.specialty,
      tier,
      isPaid: isPrimary,
      feeEgp,
      status: isPrimary ? "Active" : "AwaitingPayment",
      unreadCount: 0, doctorUnreadCount: 0, patientUnreadCount: 1,
      lastMessageAt: new Date().toISOString(),
      messages: [],
    };

    state.threads = [newThread, ...state.threads];
    persistState();
    return newThread;
  },

  async unlockConsultationPayment(payload: {
    threadId: string;
    paymentMethod: "card" | "wallet";
    referenceLast4: string;
  }): Promise<ConsultationThreadDto> {
    await sleep(450);
    state = loadState();
    const idx = state.threads.findIndex((t) => t.threadId === payload.threadId);
    if (idx === -1) throw new Error("Consultation thread not found.");

    const current = state.threads[idx];
    const updated: ConsultationThreadDto = {
      ...current,
      isPaid: true,
      status: "Active",
      lastMessageAt: new Date().toISOString(),
      messages: [
        ...current.messages,
        {
          messageId: `msg-${Date.now()}`,
          senderRole: "patient",
          senderName: current.patientName,
          text: `✅ Paid consultation unlocked (${current.feeEgp} EGP via ${
            payload.paymentMethod === "card"
              ? `Card •••• ${payload.referenceLast4}`
              : `Mobile Wallet (${payload.referenceLast4})`
          }). Ready for specialist review.`,
          sentAt: new Date().toISOString(),
        },
      ],
    };

    state.threads[idx] = updated;
    pushNotification(
      "New Exam Arrival",
      `Paid consultation unlocked by ${current.patientName} (${current.feeEgp} EGP)`,
      "/doctor/consultations",
    );
    persistState();
    return updated;
  },

  async sendConsultationMessage(payload: {
    threadId: string;
    senderRole: "patient" | "doctor";
    senderName: string;
    text: string;
    attachedExamId?: string;
    attachment?: {
      fileName: string;
      fileSizeLabel: string;
      fileCategory: "image" | "pdf" | "wfdb" | "other";
      previewUrl?: string;
    };
  }): Promise<ConsultationThreadDto> {
    await sleep(110);
    state = loadState();
    const idx = state.threads.findIndex((t) => t.threadId === payload.threadId);
    if (idx === -1) throw new Error("Consultation thread not found.");

    const thread = state.threads[idx];
    if (!thread.isPaid && thread.feeEgp > 0) {
      throw new Error("Please complete the consultation fee payment first.");
    }

    const updated: ConsultationThreadDto = {
      ...thread,
      unreadCount: payload.senderRole === "patient" ? (thread.unreadCount ?? 0) + 1 : 0, doctorUnreadCount: payload.senderRole === "patient" ? (thread.doctorUnreadCount ?? thread.unreadCount ?? 0) + 1 : 0, patientUnreadCount: payload.senderRole === "doctor" ? (thread.patientUnreadCount ?? 0) + 1 : 0,
      lastMessageAt: new Date().toISOString(),
      messages: [
        ...thread.messages,
        {
          messageId: `msg-${Date.now()}-${Math.floor(Math.random() * 100)}`,
          senderRole: payload.senderRole,
          senderName: payload.senderName,
          text: payload.text,
          sentAt: new Date().toISOString(),
          attachedExamId: payload.attachedExamId,
          attachment: payload.attachment,
        },
      ],
    };

    state.threads[idx] = updated;
    if (payload.senderRole === "patient") {
      pushNotification(
        "New Exam Arrival",
        `New consultation message from ${thread.patientName}`,
        "/doctor/consultations",
      );
    }
    persistState();
    return updated;
  },

  async markConsultationThreadRead(
    threadId: string,
    readerRole: "doctor" | "patient",
  ): Promise<void> {
    state = loadState();
    const idx = state.threads.findIndex((t) => t.threadId === threadId);
    if (idx === -1) return;
    const thread = state.threads[idx];
    state.threads[idx] = {
      ...thread,
      unreadCount: readerRole === "doctor" ? 0 : thread.unreadCount,
      doctorUnreadCount:
        readerRole === "doctor" ? 0 : (thread.doctorUnreadCount ?? 0),
      patientUnreadCount:
        readerRole === "patient" ? 0 : (thread.patientUnreadCount ?? 0),
    };
    persistState();
  },
};


