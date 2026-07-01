# ======================================================
# Dockerfile - Backend (Node.js + Express)
# ======================================================

FROM node:18-alpine

WORKDIR /app

# Ferramenta usada pelo healthcheck
RUN apk add --no-cache curl

# Usuario nao-root para execucao segura
RUN addgroup -S appuser && adduser -S appuser -G appuser

COPY package*.json ./

# Instala apenas deps de producao
RUN npm ci --only=production && \
    npm cache clean --force

COPY --chown=appuser:appuser . .

USER appuser

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "src/server.js"]
