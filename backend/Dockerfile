FROM node:20-alpine

WORKDIR /app

# Installer les dépendances
COPY package*.json ./
RUN npm ci --only=production

# Copier le code source
COPY . .

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=5001
ENV JWT_SECRET=smartplanningai_secret_key
ENV FRONTEND_URL=http://frontend

# Exposition du port
EXPOSE 5001

# Commande de démarrage
CMD ["node", "server.js"] 