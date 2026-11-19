import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import PatientDashboard from "./pages/patient/PatientDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* الصفحات العامة بالـ Navbar الرئيسي */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* صفحات المصادقة (Sign In, 2FA, Forgot Password, Register, Pending State) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* بوابة الطبيب محمية بـ RBAC Guard */}
        <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/doctor" element={<DoctorDashboard />} />
          </Route>
        </Route>

        {/* بوابة المريض محمية بـ RBAC Guard */}
        <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/patient" element={<PatientDashboard />} />
          </Route>
        </Route>

        {/* توجيه أي مسار غير معروف */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
