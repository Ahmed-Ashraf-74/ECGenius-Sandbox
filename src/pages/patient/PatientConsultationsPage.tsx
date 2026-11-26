import UnifiedConsultationWorkspace from "../../components/chat/UnifiedConsultationWorkspace";

export default function PatientConsultationsPage() {
  return (
    <UnifiedConsultationWorkspace
      role="patient"
      currentPatientId="pat-1001"
      currentPatientName="Mahmoud Abdel-Rahman"
      currentPatientAge={58}
    />
  );
}
