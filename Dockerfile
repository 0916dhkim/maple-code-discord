# Build stage
FROM node:24-trixie-slim@sha256:1c78323e27e7aff8ac92377845119cd52ac3d3b22e197b3b14e8eb64af387f8c AS builder

WORKDIR /app
COPY . .

# Install dependencies
RUN npm ci

# Build TypeScript code
RUN npm run build

# Run the compiled entry point
ENV NODE_ENV=production
CMD ["node", "dist/src/index.js"]
