#!/bin/bash
set -e

# Reemplazar variables de entorno en nginx.conf
# BACKEND_URL debe estar configurado en Railway (ej: https://backend-production-xxxx.up.railway.app)
# En Railway el backend expone el puerto 8080 internamente
export BACKEND_URL=${BACKEND_URL:-http://localhost:5055}

echo "Configurando nginx con BACKEND_URL: $BACKEND_URL"

# Reemplazar ${BACKEND_URL} en el archivo de configuración de nginx
envsubst '${BACKEND_URL}' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp
mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf

echo "Configuración de nginx completada"
cat /etc/nginx/conf.d/default.conf

# Iniciar nginx
exec nginx -g 'daemon off;'
