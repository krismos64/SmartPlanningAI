#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Nettoyage complet des processus existants...${NC}"

# Arrêter tous les processus existants de manière plus agressive
pkill -f "node backend/server.js" || true
pkill -f "react-scripts start" || true
pkill -f "node.*Planning/node_modules" || true

# Attendre que les processus soient complètement arrêtés
sleep 3

# Vérifier si des fichiers de verrouillage existent et les supprimer
if [ -f "backend/server.lock" ]; then
  echo -e "${YELLOW}Suppression du fichier de verrouillage du serveur...${NC}"
  rm backend/server.lock
fi

# Vérifier les ports utilisés
echo -e "${YELLOW}Vérification des ports utilisés...${NC}"
BACKEND_PORT=5001
FRONTEND_PORT=5002

# Vérifier si le port backend est déjà utilisé
if lsof -i :$BACKEND_PORT > /dev/null; then
  echo -e "${RED}Port $BACKEND_PORT déjà utilisé. Recherche d'un port alternatif...${NC}"
  # Trouver un port disponible pour le backend
  for port in {5010..5050}; do
    if ! lsof -i :$port > /dev/null; then
      BACKEND_PORT=$port
      echo -e "${GREEN}Port $BACKEND_PORT disponible pour le backend${NC}"
      break
    fi
  done
fi

# Vérifier si le port frontend est déjà utilisé
if lsof -i :$FRONTEND_PORT > /dev/null; then
  echo -e "${RED}Port $FRONTEND_PORT déjà utilisé. Recherche d'un port alternatif...${NC}"
  # Trouver un port disponible pour le frontend
  for port in {3000..3050}; do
    if ! lsof -i :$port > /dev/null; then
      FRONTEND_PORT=$port
      echo -e "${GREEN}Port $FRONTEND_PORT disponible pour le frontend${NC}"
      break
    fi
  done
fi

# Créer un fichier .env.development temporaire avec les bons ports
echo -e "${YELLOW}Configuration des ports pour cette session...${NC}"
cat > .env.development.tmp << EOF
PORT=$FRONTEND_PORT
REACT_APP_API_URL=http://localhost:$BACKEND_PORT/api
EOF

# Remplacer le fichier .env.development
mv .env.development.tmp .env.development

# Créer un fichier .env temporaire pour le backend
cat > .env.tmp << EOF
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=SmartPlanningAI
PORT=$BACKEND_PORT
FRONTEND_URL=http://localhost:$FRONTEND_PORT
EOF

# Remplacer le fichier .env
mv .env.tmp .env

echo -e "${GREEN}Démarrage du backend sur le port $BACKEND_PORT...${NC}"
# Démarrer le backend en arrière-plan
cd "$(dirname "$0")"
node backend/server.js &
BACKEND_PID=$!

# Attendre que le backend soit prêt
echo -e "${YELLOW}Attente du démarrage du backend...${NC}"
sleep 5

# Vérifier si le backend a démarré correctement
if ps -p $BACKEND_PID > /dev/null; then
  echo -e "${GREEN}Backend démarré avec succès sur le PID $BACKEND_PID et le port $BACKEND_PORT${NC}"
else
  echo -e "${RED}Erreur lors du démarrage du backend${NC}"
  exit 1
fi

echo -e "${GREEN}Démarrage du frontend sur le port $FRONTEND_PORT...${NC}"
echo -e "${YELLOW}Si une question sur le port apparaît, répondez 'y' pour continuer${NC}"
# Démarrer le frontend avec la variable PORT explicite
PORT=$FRONTEND_PORT npm start

# Cette partie ne sera exécutée que si le frontend est arrêté
echo -e "${YELLOW}Arrêt du backend...${NC}"
kill $BACKEND_PID

echo -e "${GREEN}Application arrêtée${NC}" 