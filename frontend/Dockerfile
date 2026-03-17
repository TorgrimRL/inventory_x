FROM node:20-alpine

WORKDIR /app

# Pin npm for reproducible builds
RUN npm i -g npm@11.11.1

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
