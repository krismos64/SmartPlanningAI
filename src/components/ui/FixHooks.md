# Comment corriger les erreurs de hooks conditionnels dans Chatbot.js

Les erreurs dans le fichier Chatbot.js sont dues à l'appel de hooks React (useCallback, useEffect) de manière conditionnelle, ce qui est contraire aux règles d'utilisation des hooks React.

## Solution

Pour résoudre le problème, il faut déplacer tous les hooks (useCallback, useEffect) au niveau supérieur du composant, juste après la déclaration des états. Voici comment faire :

1. Ouvrez le fichier `src/components/ui/Chatbot.js`

2. Identifiez les hooks conditionnels suivants qui causent des erreurs :

   - `startScheduleGenerationDialog` (ligne ~2755)
   - `handleDialogStep` (ligne ~2772)
   - `handleGenerateSchedule` (ligne ~2898)
   - `handleApplySchedule` (ligne ~2966)
   - `handleRegenerateSchedule` (ligne ~2981)
   - `useEffect` pour l'intégration NLP (ligne ~2987)

3. Déplacez tous ces hooks juste après la déclaration des états, comme ceci :

```javascript
const Chatbot = () => {
  const { user } = useAuth();
  const location = useLocation();
  // ... autres états existants ...
  const [dialogTree, setDialogTree] = useState(null);
  const [dialogStep, setDialogStep] = useState(null);
  const [collectedData, setCollectedData] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [scheduleValidationOpen, setScheduleValidationOpen] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState(null);

  const nlpIntegration = useRef(null);

  // Déplacer tous les hooks ici, au lieu de les déclarer à l'intérieur de conditions

  const handleGenerateSchedule = useCallback(async (data) => {
    // Code existant...
  }, []);

  const handleApplySchedule = useCallback((schedule) => {
    // Code existant...
  }, []);

  const handleRegenerateSchedule = useCallback(() => {
    // Code existant...
  }, [collectedData, handleGenerateSchedule]);

  const startScheduleGenerationDialog = useCallback(() => {
    // Code existant...
  }, []);

  const handleDialogStep = useCallback(async (userInput) => {
    // Code existant...
  }, [dialogTree, dialogStep, collectedData, handleGenerateSchedule]);

  // Initialiser l'intégration NLP
  useEffect(() => {
    // Code existant...
  }, [processIntent, startScheduleGenerationDialog]);

  // Autres fonctions et useEffects existants...

  // Fonctions auxiliaires, qui ne sont pas des hooks...

  return (
    // JSX existant...
  );
};
```

4. Assurez-vous que toutes les dépendances des hooks sont correctement déclarées.

5. Si vous avez une fonction qui est utilisée comme dépendance d'un hook mais qui est définie après, déplacez-la également vers le haut.

Cette restructuration permettra de respecter la règle des hooks React qui exige que tous les hooks soient appelés au niveau supérieur du composant et dans le même ordre à chaque rendu.

## Autres erreurs à corriger

1. Manque de fonctions dans dateUtils.js :

   - Ajoutez `getWeekDayName` et `formatDateToLocale`

2. Module non trouvé dans services/ChatbotService.js :
   - Créez le fichier `AuthService.js` manquant

Ces modifications devraient résoudre les erreurs de compilation actuelles.
