# Frontend Vue Dockerfile - Optimizado para Railway
FROM node:20-alpine AS build
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Build la aplicación
RUN npm run build

# Etapa de producción con Nginx
FROM nginx:alpine AS production

# Instalar dependencias para el script de reemplazo de env vars
RUN apk add --no-cache bash

# Copiar archivos de build
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar script de inicio
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
