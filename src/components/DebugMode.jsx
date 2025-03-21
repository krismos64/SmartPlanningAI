import BugReportIcon from "@mui/icons-material/BugReport";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Dialog,
  Fab,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { formatError } from "../utils/errorHandling";

/**
 * Composant permettant de déboguer l'application en environnement de développement
 * Affiche un bouton flottant qui ouvre une boîte de dialogue avec des informations de débogage
 */
const DebugMode = () => {
  // On n'affiche ce composant qu'en développement
  const isDev = process.env.NODE_ENV === "development";
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState([]);
  const [apiCalls, setApiCalls] = useState([]);
  const [appState, setAppState] = useState({});

  // Intercepter les erreurs non capturées
  useEffect(() => {
    if (!isDev) return;

    const errorHandler = (event) => {
      const error =
        event?.error || event?.reason || new Error("Erreur inconnue");
      const formattedError = formatError(error);

      setErrors((prev) => [
        ...prev,
        {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          message: formattedError,
          stack: error.stack || "Pas de stack trace disponible",
        },
      ]);
    };

    window.addEventListener("error", errorHandler);
    window.addEventListener("unhandledrejection", errorHandler);

    return () => {
      window.removeEventListener("error", errorHandler);
      window.removeEventListener("unhandledrejection", errorHandler);
    };
  }, [isDev]);

  // Intercepter les appels API
  useEffect(() => {
    if (!isDev) return;

    // On sauvegarde la méthode originale fetch
    const originalFetch = window.fetch;

    // On remplace fetch par une version qui enregistre les appels
    window.fetch = async function (...args) {
      const [url, options = {}] = args;

      const requestId = Date.now();
      const requestData = {
        id: requestId,
        url: url,
        method: options.method || "GET",
        startTime: new Date().toISOString(),
        body: options.body ? JSON.parse(options.body) : null,
        headers: options.headers || {},
        status: "pending",
      };

      setApiCalls((prev) => [...prev, requestData]);

      try {
        const response = await originalFetch.apply(this, args);

        // Clone la réponse pour pouvoir la lire
        const cloned = response.clone();
        let responseData;
        try {
          responseData = await cloned.json();
        } catch (e) {
          responseData = { error: "Impossible de parser la réponse en JSON" };
        }

        // Mettre à jour l'appel avec la réponse
        setApiCalls((prev) =>
          prev.map((call) =>
            call.id === requestId
              ? {
                  ...call,
                  status: response.ok ? "success" : "error",
                  statusCode: response.status,
                  endTime: new Date().toISOString(),
                  response: responseData,
                }
              : call
          )
        );

        return response;
      } catch (error) {
        // Mettre à jour l'appel avec l'erreur
        setApiCalls((prev) =>
          prev.map((call) =>
            call.id === requestId
              ? {
                  ...call,
                  status: "error",
                  endTime: new Date().toISOString(),
                  error: formatError(error),
                }
              : call
          )
        );

        throw error;
      }
    };

    // Nettoyer l'interception
    return () => {
      window.fetch = originalFetch;
    };
  }, [isDev]);

  // Collecter les informations sur l'état de l'application
  useEffect(() => {
    if (!isDev || !open) return;

    // Mise à jour périodique des informations d'état
    const intervalId = setInterval(() => {
      setAppState({
        timestamp: new Date().toISOString(),
        localStorage: Object.keys(localStorage).reduce((acc, key) => {
          try {
            acc[key] = localStorage.getItem(key);
          } catch (e) {
            acc[key] = "[error accessing this key]";
          }
          return acc;
        }, {}),
        url: window.location.href,
        userAgent: navigator.userAgent,
        windowSize: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        memory:
          window.performance && window.performance.memory
            ? {
                jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit,
                totalJSHeapSize: window.performance.memory.totalJSHeapSize,
                usedJSHeapSize: window.performance.memory.usedJSHeapSize,
              }
            : "Non disponible",
      });
    }, 3000);

    return () => clearInterval(intervalId);
  }, [isDev, open]);

  // Si ce n'est pas l'environnement de développement, ne rien afficher
  if (!isDev) return null;

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        fractionalSecondDigits: 3,
      });
    } catch (e) {
      return "Date invalide";
    }
  };

  // Effacer tous les logs
  const clearLogs = () => {
    setErrors([]);
    setApiCalls([]);
  };

  return (
    <>
      <Fab
        color="error"
        size="small"
        sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999 }}
        onClick={() => setOpen(true)}
      >
        <BugReportIcon />
      </Fab>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            minHeight: "70vh",
            maxHeight: "90vh",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            borderBottom: "1px solid rgba(0,0,0,0.12)",
          }}
        >
          <Typography variant="h6">Mode Debug</Typography>
          <Box>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={clearLogs}
              sx={{ mr: 1 }}
            >
              Effacer logs
            </Button>
            <IconButton size="small" onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ p: 2, overflow: "auto", height: "100%" }}>
          {/* Section Erreurs */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography
                variant="subtitle1"
                color={errors.length > 0 ? "error" : "textPrimary"}
              >
                Erreurs ({errors.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ maxHeight: "300px", overflow: "auto" }}>
              {errors.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  Aucune erreur interceptée
                </Typography>
              ) : (
                errors.map((error) => (
                  <Paper
                    key={error.id}
                    sx={{
                      p: 2,
                      mb: 2,
                      bgcolor: "error.light",
                      color: "error.contrastText",
                    }}
                  >
                    <Typography variant="caption" display="block">
                      {formatDate(error.timestamp)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "bold", my: 1 }}
                    >
                      {error.message}
                    </Typography>
                    <Box
                      component="pre"
                      sx={{
                        fontSize: "0.75rem",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        bgcolor: "rgba(0,0,0,0.1)",
                        p: 1,
                        borderRadius: 1,
                        maxHeight: "150px",
                        overflow: "auto",
                      }}
                    >
                      {error.stack}
                    </Box>
                  </Paper>
                ))
              )}
            </AccordionDetails>
          </Accordion>

          {/* Section Appels API */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                Appels API ({apiCalls.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ maxHeight: "300px", overflow: "auto" }}>
              {apiCalls.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  Aucun appel API intercepté
                </Typography>
              ) : (
                apiCalls
                  .slice()
                  .reverse()
                  .map((call) => {
                    const isError = call.status === "error";
                    const isSuccess = call.status === "success";
                    const isPending = call.status === "pending";

                    let bgColor = "info.light";
                    if (isError) bgColor = "error.light";
                    if (isSuccess) bgColor = "success.light";
                    if (isPending) bgColor = "warning.light";

                    return (
                      <Paper
                        key={call.id}
                        sx={{ p: 2, mb: 2, bgcolor: bgColor }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold" }}
                          >
                            {call.method} {call.url}
                          </Typography>
                          <Typography variant="caption">
                            {call.status.toUpperCase()}
                            {call.statusCode ? ` (${call.statusCode})` : ""}
                          </Typography>
                        </Box>

                        <Typography variant="caption" display="block">
                          Démarré à {formatDate(call.startTime)}
                          {call.endTime &&
                            ` - Terminé à ${formatDate(call.endTime)}`}
                        </Typography>

                        <Accordion
                          sx={{ mt: 1, bgcolor: "rgba(255,255,255,0.7)" }}
                        >
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="caption">Détails</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            {/* Affichage des headers */}
                            {Object.keys(call.headers).length > 0 && (
                              <Box sx={{ mb: 2 }}>
                                <Typography
                                  variant="caption"
                                  sx={{ fontWeight: "bold" }}
                                >
                                  Headers:
                                </Typography>
                                <Box
                                  component="pre"
                                  sx={{
                                    fontSize: "0.75rem",
                                    bgcolor: "rgba(0,0,0,0.05)",
                                    p: 1,
                                    borderRadius: 1,
                                    maxHeight: "100px",
                                    overflow: "auto",
                                  }}
                                >
                                  {JSON.stringify(call.headers, null, 2)}
                                </Box>
                              </Box>
                            )}

                            {/* Affichage du body */}
                            {call.body && (
                              <Box sx={{ mb: 2 }}>
                                <Typography
                                  variant="caption"
                                  sx={{ fontWeight: "bold" }}
                                >
                                  Body:
                                </Typography>
                                <Box
                                  component="pre"
                                  sx={{
                                    fontSize: "0.75rem",
                                    bgcolor: "rgba(0,0,0,0.05)",
                                    p: 1,
                                    borderRadius: 1,
                                    maxHeight: "100px",
                                    overflow: "auto",
                                  }}
                                >
                                  {JSON.stringify(call.body, null, 2)}
                                </Box>
                              </Box>
                            )}

                            {/* Affichage de la réponse */}
                            {call.response && (
                              <Box sx={{ mb: 2 }}>
                                <Typography
                                  variant="caption"
                                  sx={{ fontWeight: "bold" }}
                                >
                                  Réponse:
                                </Typography>
                                <Box
                                  component="pre"
                                  sx={{
                                    fontSize: "0.75rem",
                                    bgcolor: "rgba(0,0,0,0.05)",
                                    p: 1,
                                    borderRadius: 1,
                                    maxHeight: "100px",
                                    overflow: "auto",
                                  }}
                                >
                                  {JSON.stringify(call.response, null, 2)}
                                </Box>
                              </Box>
                            )}

                            {/* Affichage de l'erreur */}
                            {call.error && (
                              <Box sx={{ mb: 2 }}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: "bold",
                                    color: "error.main",
                                  }}
                                >
                                  Erreur:
                                </Typography>
                                <Box
                                  component="pre"
                                  sx={{
                                    fontSize: "0.75rem",
                                    bgcolor: "rgba(255,0,0,0.05)",
                                    color: "error.main",
                                    p: 1,
                                    borderRadius: 1,
                                    maxHeight: "100px",
                                    overflow: "auto",
                                  }}
                                >
                                  {call.error}
                                </Box>
                              </Box>
                            )}
                          </AccordionDetails>
                        </Accordion>
                      </Paper>
                    );
                  })
              )}
            </AccordionDetails>
          </Accordion>

          {/* Section Informations système */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Informations système</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ maxHeight: "300px", overflow: "auto" }}>
              <Box
                component="pre"
                sx={{
                  fontSize: "0.75rem",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  bgcolor: "rgba(0,0,0,0.05)",
                  p: 1,
                  borderRadius: 1,
                }}
              >
                {JSON.stringify(appState, null, 2)}
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Dialog>
    </>
  );
};

export default DebugMode;
