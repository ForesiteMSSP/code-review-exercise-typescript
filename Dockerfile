FROM node:24.14.0-slim AS build

RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc* ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:24.14.0-slim AS production

RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc* ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/build ./build

EXPOSE 3000

CMD ["pnpm", "start"]
