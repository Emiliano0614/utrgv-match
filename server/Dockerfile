# small, fast base image — we don't need the full node image just to run express
FROM node:20-slim

WORKDIR /app

# copy package files first so npm install is cached and only reruns
# when dependencies actually change, not on every code edit
COPY package*.json ./
RUN npm install --omit=dev

# now copy the rest of the backend source
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
