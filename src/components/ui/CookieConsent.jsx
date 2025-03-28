import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

// Variantes d'animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const modalVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    y: 50,
    opacity: 0,
    transition: {
      type: "spring",
      damping: 30,
      stiffness: 300,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", damping: 25, stiffness: 300 },
  },
  exit: {
    y: -20,
    opacity: 0,
    transition: { type: "spring", damping: 30, stiffness: 300 },
  },
};

const CookieConsent = ({ show, onClose }) => {
  const { t } = useTranslation();
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    if (show) {
      setShowBanner(true);
    } else {
      setShowBanner(false);
    }
  }, [show]);

  const handleAcceptAll = () => {
    setPreferences({
      necessary: true,
      analytics: true,
      marketing: true,
    });
    saveConsent("all");
  };

  const handleReject = () => {
    setPreferences({
      necessary: true,
      analytics: false,
      marketing: false,
    });
    saveConsent("necessary");
  };

  const handleCustomize = () => {
    setShowCustomize(true);
  };

  const handleSavePreferences = () => {
    saveConsent("custom", preferences);
  };

  const saveConsent = (type, customPrefs) => {
    const consent = {
      type,
      date: new Date().toISOString(),
      preferences: customPrefs,
    };
    localStorage.setItem("cookieConsent", JSON.stringify(consent));
    setShowBanner(false);
    setShowCustomize(false);

    if (onClose) {
      onClose(consent);
    }
  };

  const togglePreference = (key) => {
    if (key === "necessary") return;
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            variants={modalVariants}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden relative"
          >
            {/* Forme décorative */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-purple-500 to-pink-400 rounded-full opacity-20 blur-xl"></div>

            {/* Barre colorée du haut */}
            <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

            <div className="p-6 sm:p-8 relative">
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-4 mb-6"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-2xl">🍪</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t("cookieConsent.title")}
                </h2>
              </motion.div>

              <motion.p
                variants={itemVariants}
                className="text-gray-600 dark:text-gray-300 mb-6"
              >
                {t("cookieConsent.description")}
              </motion.p>

              <motion.div variants={itemVariants} className="space-y-4 mb-8">
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t("cookieConsent.necessary")}
                  </p>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 dark:text-purple-400">
                      📊
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t("cookieConsent.preferences.analytics.description")}
                  </p>
                </div>

                <div className="flex items-center gap-3 p-3 bg-pink-50 dark:bg-pink-900/30 rounded-lg">
                  <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center">
                    <span className="text-pink-600 dark:text-pink-400">🎯</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t("cookieConsent.preferences.marketing.description")}
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-3"
              >
                <button
                  onClick={handleReject}
                  className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-gray-400 transition-all duration-200 shadow-sm"
                >
                  {t("cookieConsent.buttons.reject")}
                </button>
                <button
                  onClick={handleCustomize}
                  className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-gray-400 transition-all duration-200 shadow-sm"
                >
                  {t("cookieConsent.buttons.customize")}
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {t("cookieConsent.buttons.accept")}
                </button>
              </motion.div>
            </div>
          </motion.div>

          {/* Modal de personnalisation */}
          {showCustomize && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowCustomize(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 blur-xl"></div>
                  <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-purple-500 to-pink-400 rounded-full opacity-20 blur-xl"></div>

                  {/* Barre colorée du haut */}
                  <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {t("cookieConsent.preferences.title")}
                      </h3>
                      <button
                        onClick={() => setShowCustomize(false)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {t("cookieConsent.preferences.necessary.title")}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t(
                              "cookieConsent.preferences.necessary.description"
                            )}
                          </p>
                        </div>
                        <div className="relative inline-block w-12 h-6">
                          <input
                            type="checkbox"
                            checked={preferences.necessary}
                            disabled
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {t("cookieConsent.preferences.analytics.title")}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t(
                              "cookieConsent.preferences.analytics.description"
                            )}
                          </p>
                        </div>
                        <div className="relative inline-block w-12 h-6">
                          <input
                            type="checkbox"
                            checked={preferences.analytics}
                            onChange={() => togglePreference("analytics")}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-pink-50 dark:bg-pink-900/30 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {t("cookieConsent.preferences.marketing.title")}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t(
                              "cookieConsent.preferences.marketing.description"
                            )}
                          </p>
                        </div>
                        <div className="relative inline-block w-12 h-6">
                          <input
                            type="checkbox"
                            checked={preferences.marketing}
                            onChange={() => togglePreference("marketing")}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 flex justify-end gap-3">
                      <button
                        onClick={() => setShowCustomize(false)}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-gray-400 transition-all duration-200 shadow-sm"
                      >
                        {t("cookieConsent.buttons.cancel")}
                      </button>
                      <button
                        onClick={handleSavePreferences}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                      >
                        {t("cookieConsent.buttons.save")}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
