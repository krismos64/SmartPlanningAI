import { lazy, Suspense, useEffect, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styled from "styled-components";
import ErrorBoundary from "./components/ErrorBoundary";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import ThemeProvider from "./components/ThemeProvider";
import Chatbot from "./components/ui/Chatbot";
import CookieConsent from "./components/ui/CookieConsent";
import ApiProvider from "./contexts/ApiContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { initializeErrorHandling } from "./utils/errorHandling";
import { setupErrorInterceptors } from "./utils/errorInterceptor";

// Layouts
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import PublicLayout from "./layouts/PublicLayout";

// Pages chargées avec lazy loading
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const LoginSuccess = lazy(() => import("./pages/auth/LoginSuccess"));
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
  const [isStuck, setIsStuck] = useState(false);
  const location = window.location;

  // Vérifier si la page actuelle est publique
  const isPublicPage = ["/", "/terms", "/privacy", "/contact"].includes(
    location.pathname
  );

  useEffect(() => {
    console.log("ProtectedRoute - vérification d'authentification:", {
      isAuthenticated,
      isLoading,
      token: localStorage.getItem("token") ? "présent" : "absent",
      user: localStorage.getItem("user") ? "présent" : "absent",
      isPublicPage,
    });

    // Timeout de sécurité pour éviter de rester bloqué en chargement
    const stuckTimer = setTimeout(() => {
      if (isLoading && localStorage.getItem("token")) {
        console.log(
          "ProtectedRoute - timeout de chargement atteint, mais token présent"
        );
        setIsStuck(true);
      }
    }, 3000); // 3 secondes maximum pour le chargement

    // Vérifier s'il y a un token dans localStorage
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    // Ne rediriger que si ce n'est pas une page publique
    if (!isAuthenticated && !token && !isPublicPage) {
      console.log(
        "ProtectedRoute - redirection vers login (pas authentifié et pas de token)"
      );
      navigate(
        "/login?redirect=" + encodeURIComponent(window.location.pathname),
        { replace: true }
      );
    } else if (token && !isAuthenticated) {
      console.log(
        "ProtectedRoute - token présent mais pas authentifié, attendons..."
      );
      // On attend que isAuthenticated soit mis à jour
    }

    return () => clearTimeout(stuckTimer);
  }, [isAuthenticated, navigate, isLoading, isPublicPage]);

  // Si on a détecté que le chargement est bloqué mais qu'un token existe
  if (isStuck) {
    console.log(
      "ProtectedRoute - forcage de l'affichage malgré le chargement bloqué"
    );
    return children;
  }

  if (isLoading) {
    return <LoadingFallback />;
  }

  // Si on a un token mais qu'on n'est pas authentifié, on affiche quand même
  // le composant pour éviter les redirections inutiles pendant que le contexte se charge
  const token = localStorage.getItem("token");
  if (token || isAuthenticated || isPublicPage) {
    return children;
  }

  // En dernier recours, affiche quand même le loading
  return <LoadingFallback />;
};

// Style pour le contenu principal qui doit s'adapter à la sidebar
const MainContent = styled.div`
  min-height: 100vh;
  width: 100%;
  position: relative;

  /* Utiliser un sélecteur CSS plutôt que des props qui sont transmises à l'élément DOM */
  ${(props) =>
    props.$hasNavbar &&
    !props.$isPublicPage &&
    `
    padding-top: 64px; /* Hauteur de la navbar seulement pour les pages protégées */
  `}
`;

const App = () => {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <ThemeProvider>
          <AuthProvider>
            <ApiProvider>
              <Router>
                <AppContent />
              </Router>
            </ApiProvider>
          </AuthProvider>
        </ThemeProvider>
        <ToastContainer />
      </NotificationProvider>
    </ErrorBoundary>
  );
};

const AppContent = () => {
  const auth = useAuth();
  const location = window.location;

  // Initialiser les gestionnaires d'erreurs
  useEffect(() => {
    // Initialisation de notre gestionnaire d'erreur global amélioré
    const cleanupErrorHandling = initializeErrorHandling();

    // Intercepteur pour débogage spécifique des erreurs [object Object]
    const cleanupInterceptor = setupErrorInterceptors();

    // Nettoyer lors du démontage
    return () => {
      cleanupErrorHandling();
      cleanupInterceptor();
    };
  }, []);

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

  // Gérer correctement le chemin de confirmation de suppression de compte
  const isDeleteConfirmationPage = location.pathname.startsWith(
    "/account/delete-confirmation"
  );

  // Vérifier si c'est une page protégée (ni publique ni auth)
  const isProtectedPage =
    !isPublicPage && !isAuthPage && !isDeleteConfirmationPage;

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
        <MainContent $hasNavbar={shouldShowNavbar} $isPublicPage={isPublicPage}>
          <ErrorBoundary>
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
                <Route path="/login-success" element={<LoginSuccess />} />
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
                <Route path="/employees/:employeeId" element={<Employees />} />
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
          </ErrorBoundary>
          {!isAuthPage && <Footer />}
        </MainContent>
        <CookieConsent />
      </HelmetProvider>

      {auth.isAuthenticated && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 9999,
          }}
        >
          <Chatbot
            onClose={() => {
              console.log("Chatbot fermé");
            }}
            onGenerate={() => {
              console.log("Génération démarrée");
            }}
          />
        </div>
      )}
    </Suspense>
  );
};

export default App;
