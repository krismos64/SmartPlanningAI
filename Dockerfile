FROM node:20-alpine as build

WORKDIR /app

# Installer les dépendances
COPY package*.json ./
RUN npm ci

# Copier le code source
COPY . .

# Configurer les variables d'environnement pour la production
ENV NODE_ENV=production
ENV REACT_APP_API_URL=http://backend:5001
ENV REACT_APP_FRONTEND_URL=http://localhost:8080

# Construire l'application
RUN npm run build

# Étape de production avec Nginx
FROM nginx:alpine

# Copier la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers de build depuis l'étape précédente
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 