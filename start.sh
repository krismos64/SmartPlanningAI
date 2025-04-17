#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Nettoyage complet des processus existants...${NC}"

# Arrêter tous les processus existants de manière plus efficace
pkill -f "node backend/server.js" || true
pkill -f "react-scripts start" || true
pkill -f "node.*Planning/node_modules" || true
pkill -f "node server.js" || true

# Vérifier si des processus node persistent et les arrêter avec force
if pgrep -f "node backend/server.js" > /dev/null; then
  echo -e "${RED}Des processus node server.js persistent, arrêt forcé...${NC}"
  pkill -9 -f "node backend/server.js"
fi

# Attendre que les processus soient complètement arrêtés
sleep 3

# Vérifier et supprimer les fichiers de verrouillage
if [ -f "backend/server.lock" ]; then
  echo -e "${YELLOW}Suppression du fichier de verrouillage du serveur...${NC}"
  rm -f backend/server.lock
fi

# Définition des ports fixes
BACKEND_PORT=5001
FRONTEND_PORT=3000

# Vérifier si le port backend est déjà utilisé et le libérer
if lsof -i :$BACKEND_PORT > /dev/null; then
  echo -e "${YELLOW}Port $BACKEND_PORT déjà utilisé. Tentative de libération...${NC}"
  lsof -ti:$BACKEND_PORT | xargs kill -9 || true
  sleep 2
  
  # Vérifier à nouveau
  if lsof -i :$BACKEND_PORT > /dev/null; then
    echo -e "${RED}Port $BACKEND_PORT toujours occupé. Recherche d'un port alternatif...${NC}"
    # Trouver un port disponible pour le backend
    for port in {5010..5050}; do
      if ! lsof -i :$port > /dev/null; then
        BACKEND_PORT=$port
        echo -e "${GREEN}Port $BACKEND_PORT disponible pour le backend${NC}"
        break
      fi
    done
  else
    echo -e "${GREEN}Port $BACKEND_PORT libéré avec succès${NC}"
  fi
fi

# Vérifier si le port frontend est déjà utilisé et le libérer
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

# Exporter les variables d'environnement pour la session en cours
export NODE_ENV=development
export PORT=$BACKEND_PORT
export DB_HOST=localhost
export DB_USER=root
export DB_PASSWORD=
export DB_NAME=smartplanningai
export FRONTEND_URL=http://localhost:$FRONTEND_PORT
export REACT_APP_API_URL=http://localhost:$BACKEND_PORT

# Créer le fichier .env.development à la racine pour React
cat > .env.development << EOF
PORT=$FRONTEND_PORT
REACT_APP_API_URL=http://localhost:$BACKEND_PORT
EOF

# Afficher clairement la création du fichier
echo -e "${GREEN}Fichier .env.development créé à la racine avec REACT_APP_API_URL=http://localhost:$BACKEND_PORT${NC}"

echo -e "${YELLOW}Variables d'environnement configurées pour la session :${NC}"
echo -e " - BACKEND_PORT=$BACKEND_PORT"
echo -e " - FRONTEND_PORT=$FRONTEND_PORT"
echo -e " - REACT_APP_API_URL=$REACT_APP_API_URL"

# Vérifier si la base de données MySQL est en cours d'exécution via XAMPP
echo -e "${YELLOW}Vérification de la base de données MySQL via XAMPP...${NC}"

# Tenter de se connecter à MySQL sans utiliser mysqladmin
if [ -f "/Applications/XAMPP/xamppfiles/bin/mysql" ]; then
  # Chemin direct à la commande mysql de XAMPP
  if ! /Applications/XAMPP/xamppfiles/bin/mysql -u root -e "SELECT 1" >/dev/null 2>&1; then
    echo -e "${RED}Erreur: Impossible de se connecter à MySQL. Vérifiez que XAMPP est bien démarré.${NC}"
    echo -e "${YELLOW}Tentative de continuer malgré tout...${NC}"
  else
    echo -e "${GREEN}Connexion à MySQL via XAMPP réussie.${NC}"
  fi
else
  # Méthode alternative - vérifier si le processus MySQL est en cours d'exécution
  if pgrep -f "mysqld" > /dev/null; then
    echo -e "${GREEN}Processus MySQL détecté, on suppose qu'il fonctionne.${NC}"
  else
    echo -e "${YELLOW}Processus MySQL non détecté. Vérifiez que XAMPP est démarré, mais on continue...${NC}"
  fi
fi

echo -e "${GREEN}Démarrage du backend sur le port $BACKEND_PORT...${NC}"
cd "$(dirname "$0")"
node backend/server.js &
BACKEND_PID=$!

# Attendre que le backend soit prêt en vérifiant qu'il répond
echo -e "${YELLOW}Attente du démarrage du backend...${NC}"
MAX_ATTEMPTS=30
ATTEMPT=0
BACKEND_READY=false

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  if curl -s http://localhost:$BACKEND_PORT/ > /dev/null; then
    BACKEND_READY=true
    break
  fi
  sleep 2
  ATTEMPT=$((ATTEMPT+1))
  echo -e "${YELLOW}Attente du backend... Tentative $ATTEMPT/$MAX_ATTEMPTS${NC}"
done

if [ "$BACKEND_READY" = false ]; then
  echo -e "${RED}Erreur : Le backend n'a pas démarré correctement après $MAX_ATTEMPTS tentatives${NC}"
  echo -e "${YELLOW}Arrêt forcé des processus du backend...${NC}"
  kill -9 $BACKEND_PID 2>/dev/null || true
  exit 1
fi

echo -e "${GREEN}Backend démarré avec succès sur le PID $BACKEND_PID et le port $BACKEND_PORT${NC}"

echo -e "${GREEN}Démarrage du frontend sur le port $FRONTEND_PORT...${NC}"
echo -e "${YELLOW}Si une question sur le port apparaît, répondez 'y' pour continuer${NC}"
cd "$(dirname "$0")"
PORT=$FRONTEND_PORT npm run dev

# Cette partie ne sera exécutée que si le frontend est arrêté
echo -e "${YELLOW}Arrêt du backend...${NC}"
kill $BACKEND_PID 2>/dev/null || true

# S'assurer que tous les processus sont bien arrêtés
pkill -f "node backend/server.js" || true
pkill -f "react-scripts start" || true

# Supprimer le fichier de verrouillage s'il existe encore
rm -f backend/server.lock 2>/dev/null || true

echo -e "${GREEN}Application arrêtée${NC}"