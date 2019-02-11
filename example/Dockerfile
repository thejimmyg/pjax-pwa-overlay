FROM node:alpine as base

FROM base as builder
RUN mkdir /app
WORKDIR /app
COPY package.json.docker /app/package.json
COPY package-lock.json /app
COPY pjax-pwa-overlay /app/pjax-pwa-overlay
RUN npm install --only=prod

FROM base

COPY --from=builder /app /app
COPY server.js /app
COPY views-overlay /app/views-overlay
WORKDIR /app
EXPOSE 80
ENV NODE_PATH=/app/node_modules
ENV NODE_ENV=production
ENV PORT=80
ENV PATH="${PATH}:/app/node_modules/.bin"
CMD ["node", "server.js"]
