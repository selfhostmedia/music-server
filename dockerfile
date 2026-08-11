FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm ci
RUN npm run build
RUN cd certs \
    openssl genrsa -out private.pem 4096 \
    openssl rsa -in private.pem -pubout -out public.pem
EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
ENV DEFAULT_ROOT_PATH=/music
ENV DATABASE_PATH=/data/music-server.sqlite
CMD ["node", "dist/main.js"]
