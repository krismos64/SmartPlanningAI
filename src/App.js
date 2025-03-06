import { lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
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
const WeeklySchedule = lazy(() => import("./pages/WeeklySchedule"));
const Vacations = lazy(() => import("./pages/Vacations"));
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
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#333",
                    color: "#fff",
                  },
                  success: {
                    style: {
                      background: "#28a745",
                    },
                  },
                  error: {
                    style: {
                      background: "#dc3545",
                    },
                  },
                }}
              />
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
                  <Route path="/schedule" element={<WeeklySchedule />} />
                  <Route
                    path="/weekly-schedule"
                    element={
                      <ProtectedRoute>
                        <WeeklySchedule />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/weekly-schedule/:weekStart"
                    element={
                      <ProtectedRoute>
                        <WeeklySchedule />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/vacations" element={<Vacations />} />
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
