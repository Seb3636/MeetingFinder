#FROM node:20-alpine
#WORKDIR /app
#COPY package*.json ./
#RUN npm install
#COPY . .
#EXPOSE 5173
#CMD ["npm", "run", "dev"]

# ===== Build =====
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ===== Runtime =====
FROM nginx:alpine

# Nginx Config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static Files
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]