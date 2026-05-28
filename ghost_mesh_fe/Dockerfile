# Multi-stage Dockerfile for Ghost Mesh Frontend
# Supports both development (hot-reload) and production (Nginx)

# 1. Base stage - Install package dependencies
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

# 2. Development stage (Vite dev server with hot-reload)
FROM base AS dev
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

# 3. Production Build stage - Compile TypeScript & Vite assets
FROM base AS build
COPY . .
RUN npm run build

# 4. Production Serve stage - Serve compiled assets via Nginx
FROM nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
