FROM node:24-alpine AS build

WORKDIR /build

COPY package.json package-lock.json ./

RUN set -ex; \
    npm ci --no-audit --ignore-scripts

COPY tsconfig.json tsconfig.build.json nest-cli.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src

RUN set -ex; \
    npm run build

RUN set -ex; \
    npm ci --omit=dev --no-audit


FROM node:24-alpine

WORKDIR /app

COPY --from=build --chown=node:node /build/node_modules ./node_modules
COPY --from=build --chown=node:node /build/dist ./dist
COPY --from=build --chown=node:node /build/prisma ./prisma
COPY --from=build --chown=node:node /build/src/generated ./src/generated
COPY --chown=node:node prisma.config.ts package.json package-lock.json ./

RUN set -ex; \
    apk add --no-cache \
    ca-certificates \
    dumb-init \
    libgcc \
    openssl

USER node
EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start:prod"]
