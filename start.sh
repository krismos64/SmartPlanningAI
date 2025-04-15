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
pkill -f "node server.js" || true

# Attendre que les processus soient complètement arrêtés
sleep 3

# Vérifier si des fichiers de verrouillage existent et les supprimer
if [ -f "backend/server.lock" ]; then
  echo -e "${YELLOW}Suppression du fichier de verrouillage du serveur...${NC}"
  rm backend/server.lock
fi

# Définition des ports fixes
BACKEND_PORT=5001
FRONTEND_PORT=3000

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

# Vérifier si le port frontend est déjà utilisé et le libérer si nécessaire
if lsof -i :$FRONTEND_PORT > /dev/null; then
  echo -e "${YELLOW}Port $FRONTEND_PORT déjà utilisé. Tentative de libération...${NC}"
  lsof -ti:$FRONTEND_PORT | xargs kill -9 || true
  sleep 2
  
  # Vérifier si le port est maintenant libre
  if lsof -i :$FRONTEND_PORT > /dev/null; then
    echo -e "${RED}Impossible de libérer le port $FRONTEND_PORT. Utilisation d'un port alternatif.${NC}"
    # Trouver un port disponible pour le frontend
    for port in {3001..3050}; do
      if ! lsof -i :$port > /dev/null; then
        FRONTEND_PORT=$port
        echo -e "${GREEN}Port $FRONTEND_PORT disponible pour le frontend${NC}"
        break
      fi
    done
  else
    echo -e "${GREEN}Port $FRONTEND_PORT libéré avec succès${NC}"
  fi
fi

# Exporter les variables d'environnement à la volée pour éviter la création de fichiers
export NODE_ENV=development
export PORT=$BACKEND_PORT
export DB_HOST=localhost
export DB_USER=root
export DB_PASSWORD=
export DB_NAME=smartplanningai
export FRONTEND_URL=http://localhost:$FRONTEND_PORT

export REACT_APP_API_URL=http://localhost:$BACKEND_PORT

echo -e "${YELLOW}Variables d'environnement exportées pour la session :${NC}"
echo -e " - BACKEND_PORT=$BACKEND_PORT"
echo -e " - FRONTEND_PORT=$FRONTEND_PORT"
echo -e " - REACT_APP_API_URL=$REACT_APP_API_URL"

echo -e "${GREEN}Démarrage du backend sur le port $BACKEND_PORT...${NC}"
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
PORT=$FRONTEND_PORT npm run dev

# Cette partie ne sera exécutée que si le frontend est arrêté
echo -e "${YELLOW}Arrêt du backend...${NC}"
kill $BACKEND_PID

echo -e "${GREEN}Application arrêtée${NC}"
