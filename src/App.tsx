import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import StartExaminationPage from "./pages/doctor/StartExaminationPage";
import ExaminationsPage from "./pages/doctor/ExaminationsPage";
import ExaminationDetailPage from "./pages/doctor/ExaminationDetailPage";
import PatientsPage from "./pages/doctor/PatientsPage";
import PatientProfilePage from "./pages/doctor/PatientProfilePage";
import ReportsPage from "./pages/doctor/ReportsPage";
import ConsultationsPage from "./pages/doctor/ConsultationsPage";
import NotificationsPage from "./pages/doctor/NotificationsPage";
import DoctorSettingsPage from "./pages/doctor/DoctorSettingsPage";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientConsultationsPage from "./pages/patient/PatientConsultationsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedRoute from "./components/common/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<DashboardLayout />}>
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/consultations"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PatientConsultationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/start-exam"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <StartExaminationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/examinations"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <ExaminationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/examinations/:examinationId"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <ExaminationDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patients"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <PatientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patients/:patientId"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <PatientProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/reports"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/consultations"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <ConsultationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/notifications"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/settings"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
