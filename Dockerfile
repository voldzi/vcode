FROM node:24.20.0-alpine AS build
ENV ASTRO_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN --mount=type=secret,id=recall_acceptance --mount=type=secret,id=recall_publisher_public_key \
    VCODE_RECALL_BUILD_PROOF=/run/secrets/recall_acceptance \
    VCODE_RECALL_BUILD_TRUST=/run/secrets/recall_publisher_public_key pnpm build

FROM nginx:1.29.1-alpine
COPY deploy/nginx-main.conf /etc/nginx/nginx.conf
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
# Public assets must remain readable by the Nginx worker even when the source
# release was prepared with a restrictive umask. Normalize only the public tree.
RUN find /usr/share/nginx/html -type d -exec chmod 0755 {} + \
    && find /usr/share/nginx/html -type f -exec chmod 0644 {} +
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -qO- http://127.0.0.1:8080/health || exit 1
