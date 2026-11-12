# PREVIOUS_WEB_IMAGE is the immutable digest currently serving production
ARG PREVIOUS_WEB_IMAGE=scratch
FROM ${PREVIOUS_WEB_IMAGE} AS previous

FROM node:26-alpine AS builder
ARG PREVIOUS_WEB_IMAGE
RUN test "$PREVIOUS_WEB_IMAGE" != scratch \
    || { echo 'PREVIOUS_WEB_IMAGE must name the serving immutable image' >&2; exit 1; }
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

FROM builder AS compatibility-assets
RUN node deploy/retainAssets.js /previous /composed /compatibility

FROM previous AS rollback
ARG PREVIOUS_WEB_IMAGE
ARG SOURCE_REVISION
LABEL org.ansible.web.rollout-role="compatibility" \
      org.ansible.web.application-base=${PREVIOUS_WEB_IMAGE} \
      org.ansible.web.assets-source=${SOURCE_REVISION}
COPY --from=compatibility-assets /compatibility /usr/share/nginx/html
COPY deploy/web.nginx.conf /etc/nginx/conf.d/default.conf

FROM nginx:alpine AS candidate
ARG SOURCE_REVISION
LABEL org.opencontainers.image.revision=${SOURCE_REVISION}
COPY --from=builder /composed /usr/share/nginx/html
COPY deploy/web.nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
