FROM node:22-alpine AS build
WORKDIR /app
ARG NEXT_PUBLIC_USER_SERVICE_URL=http://localhost:5000
ARG NEXT_PUBLIC_CHAT_SERVICE_URL=http://localhost:5002
ENV NEXT_PUBLIC_USER_SERVICE_URL=$NEXT_PUBLIC_USER_SERVICE_URL
ENV NEXT_PUBLIC_CHAT_SERVICE_URL=$NEXT_PUBLIC_CHAT_SERVICE_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
