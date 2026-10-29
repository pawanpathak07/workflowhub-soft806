# ---- WorkFlowHub frontend (React + Vite) ----
# Stage 1: install packages with npm and build the static site
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

# The API address is baked in at build time (Vite reads VITE_* variables while building).
ARG VITE_API_URL=http://localhost:8000/api
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build

# Stage 2: serve the built files with nginx
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
