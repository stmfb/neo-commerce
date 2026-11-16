FROM node:24-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine AS production-stage
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY --from=build-stage /app/.output ./.output
EXPOSE 8080
USER node
CMD ["node", ".output/server/index.mjs"]
