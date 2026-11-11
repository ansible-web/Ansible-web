# PREVIOUS_WEB_IMAGE is the immutable digest currently serving production
ARG PREVIOUS_WEB_IMAGE
FROM ${PREVIOUS_WEB_IMAGE} AS previous

FROM node:26-alpine AS builder
RUN apk add --no-cache git bash
WORKDIR /app
COPY . .
RUN rm -f .npmrc .node-version .nvmrc && npm ci
ARG ANSIBLE_API_ID
ARG ANSIBLE_API_HASH
ARG SOURCE_REVISION
ENV APP_ENV=production
ENV BUILD_NUMBER=${SOURCE_REVISION}
RUN test -n "$ANSIBLE_API_ID" && test -n "$ANSIBLE_API_HASH" \
    && echo "$SOURCE_REVISION" | grep -Eq '^[0-9a-f]{40}$' \
    && npm run build:production
COPY --from=previous /usr/share/nginx/html /previous
RUN node deploy/retainAssets.js /app/dist /previous /composed

FROM nginx:alpine
ARG SOURCE_REVISION
LABEL org.opencontainers.image.revision=${SOURCE_REVISION}
COPY --from=builder /composed /usr/share/nginx/html
COPY deploy/web.nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
