import { lazy, Suspense, useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
} from "react-router-dom";
import styled from "styled-components";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import ThemeProvider from "./components/ThemeProvider";
import Chatbot from "./components/ui/Chatbot";
import { NotificationProvider } from "./components/ui/Notification";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import theme from "./theme";

// Layouts
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import PublicLayout from "./layouts/PublicLayout";

// Pages chargées avec lazy loading
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Employees = lazy(() => import("./pages/Employees"));
const WeeklySchedule = lazy(() => import("./pages/WeeklySchedule"));
const Vacations = lazy(() => import("./pages/Vacations"));
const Activities = lazy(() => import("./pages/Activities"));
const Stats = lazy(() => import("./pages/Stats"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Contact = lazy(() => import("./pages/Contact"));
const ConfirmDeletionPage = lazy(() =>
  import("./components/modals/ConfirmDeletionPage")
);

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
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier s'il y a un token dans localStorage
    const token = localStorage.getItem("token");

    if (!isAuthenticated && !token) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return <LoadingFallback />;
  }

  return children;
};

// Style pour le contenu principal qui doit s'adapter à la sidebar
const MainContent = styled.div`
  min-height: 100vh;
  padding-top: ${({ hasNavbar, isPublicPage }) =>
    hasNavbar && !isPublicPage
      ? "64px"
      : "0"}; /* Hauteur de la navbar seulement pour les pages protégées */
  width: 100%;
  position: relative;
`;

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

const AppContent = () => {
  const auth = useAuth();
  const location = window.location;

  // Vérifier les pages publiques
  const isPublicPage = ["/", "/terms", "/privacy", "/contact"].includes(
    location.pathname
  );

  // Vérifier si l'utilisateur est sur une page d'authentification
  const isAuthPage = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/account/delete-confirmation",
    "/unauthorized",
  ].some((path) => location.pathname.startsWith(path));

  // Vérifier si c'est une page protégée (ni publique ni auth)
  const isProtectedPage = !isPublicPage && !isAuthPage;

  // Force l'affichage de la navbar et sidebar sur les pages protégées
  const shouldShowNavbar = isProtectedPage;

  console.log("App state:", {
    isAuthenticated: auth.isAuthenticated,
    hasToken: !!localStorage.getItem("token"),
    isProtectedPage,
    shouldShowNavbar,
    pathname: location.pathname,
  });

  return (
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
          <HelmetProvider>
            <Navbar />
            <MainContent
              hasNavbar={shouldShowNavbar}
              isPublicPage={isPublicPage}
            >
              <Routes>
                {/* Pages publiques avec PublicLayout */}
                <Route element={<PublicLayout />}>
                  {/* Landing Page */}
                  <Route path="/" element={<LandingPage />} />

                  {/* Pages légales */}
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/contact" element={<Contact />} />
                </Route>

                {/* Routes d'authentification */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route
                    path="/reset-password/:token"
                    element={<ResetPassword />}
                  />
                  <Route
                    path="/account/delete-confirmation/:token"
                    element={<ConfirmDeletionPage />}
                  />
                  <Route path="/unauthorized" element={<Unauthorized />} />
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
                  <Route
                    path="/employees/:employeeId"
                    element={<Employees />}
                  />
                  <Route path="/schedule" element={<WeeklySchedule />} />
                  <Route path="/weekly-schedule" element={<WeeklySchedule />} />
                  <Route
                    path="/weekly-schedule/:weekStart"
                    element={<WeeklySchedule />}
                  />
                  <Route path="/vacations" element={<Vacations />} />
                  <Route path="/activities" element={<Activities />} />
                  <Route path="/stats" element={<Stats />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Page 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              {!isAuthPage && <Footer />}
            </MainContent>
          </HelmetProvider>

          {/* Chatbot disponible sur toutes les pages */}
          <Chatbot />
        </Suspense>
      </Router>
    </NotificationProvider>
  );
};

export default App;
