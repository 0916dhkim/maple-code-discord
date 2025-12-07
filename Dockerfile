# Build stage
FROM node:22 AS builder

WORKDIR /app
COPY . .

# Install dependencies
RUN npm ci

# Build TypeScript code
RUN npm run build

# Run the compiled entry point
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
