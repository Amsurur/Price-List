# Build stage — NEXT_PUBLIC_* vars are inlined into the client bundle at
# build time, so this must be a build ARG, not just a runtime env var.
FROM node:22-slim AS build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CURRENCY=$
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_CURRENCY=${NEXT_PUBLIC_CURRENCY}
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
RUN npm ci --workspace apps/web
COPY apps/web apps/web
RUN npm run build --workspace apps/web

# Runtime stage — production deps only.
FROM node:22-slim AS runtime
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CURRENCY=$
# next.config.ts reads these at server boot (rewrites/images), not just at
# build time when they're inlined into the client bundle — needs both.
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_CURRENCY=${NEXT_PUBLIC_CURRENCY}
WORKDIR /repo
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
RUN npm ci --workspace apps/web --omit=dev
COPY --from=build /repo/apps/web/.next apps/web/.next
COPY --from=build /repo/apps/web/public apps/web/public
COPY --from=build /repo/apps/web/next.config.ts apps/web/next.config.ts
WORKDIR /repo/apps/web
EXPOSE 3000
CMD ["npm", "run", "start"]
