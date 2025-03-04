import { lazy, Suspense } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ThemeProvider from "./components/ThemeProvider";
import { NotificationProvider } from "./components/ui/Notification";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import theme from "./theme";

// Layouts
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";

// Pages chargées avec lazy loading
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Employees = lazy(() => import("./pages/Employees"));
const Schedule = lazy(() => import("./pages/Schedule"));
const WeeklySchedulePage = lazy(() => import("./pages/WeeklySchedule"));
const Vacations = lazy(() => import("./pages/Vacations"));
const Reports = lazy(() => import("./pages/Reports"));
const Stats = lazy(() => import("./pages/Stats"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LandingPage = lazy(() => import("./pages/LandingPage"));

// Composant de chargement
const LoadingFallback = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
    }}
  >
    Chargement...
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  // Vérifier si l'utilisateur est authentifié ou s'il existe dans localStorage
  const storedUser = localStorage.getItem("user");
  if (!isAuthenticated && !storedUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Suspense fallback={<LoadingFallback />}>
              <ToastContainer position="top-right" autoClose={3000} />
              <Routes>
                {/* Landing Page */}
                <Route path="/" element={<LandingPage />} />

                {/* Routes d'authentification */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>

                {/* Routes protégées */}
                <Route
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/employees" element={<Employees />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route
                    path="/weekly-schedule"
                    element={
                      <ProtectedRoute>
                        <WeeklySchedulePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/weekly-schedule/:weekStart"
                    element={
                      <ProtectedRoute>
                        <WeeklySchedulePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/vacations" element={<Vacations />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/stats" element={<Stats />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Page 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
