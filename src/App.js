import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import ThemeProvider from "./components/ThemeProvider";
import { NotificationProvider } from "./components/ui/Notification";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import theme from "./theme";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

// Pages chargées avec lazy loading
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Employees = lazy(() => import("./pages/Employees"));
const Schedule = lazy(() => import("./pages/Schedule"));
const Vacations = lazy(() => import("./pages/Vacations"));
const Stats = lazy(() => import("./pages/Stats"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
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

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  // Vérifier si l'utilisateur est authentifié ou s'il existe dans localStorage
  const storedUser = localStorage.getItem("user");
  if (!isAuthenticated && !storedUser) {
    return <Navigate to="/login" replace />;
  }

  // Vérifier le rôle de l'utilisateur (soit depuis le contexte, soit depuis localStorage)
  const currentUser = user || (storedUser ? JSON.parse(storedUser) : null);
  if (currentUser && currentUser.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
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
                  <Route path="/vacations" element={<Vacations />} />
                  <Route path="/stats" element={<Stats />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />

                  {/* Routes Admin */}
                  <Route
                    path="/users"
                    element={
                      <AdminRoute>
                        <UserManagement />
                      </AdminRoute>
                    }
                  />
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
