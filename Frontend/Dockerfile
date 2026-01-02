# Frontend Dockerfile for Vite build
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev=false

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
# Use a lightweight static server for the built assets
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 5173
cmd ['npm', 'run', 'dev']
# CMD ["serve", "-s", "dist", "-l", "5173"]