# Use Node.js 20 Alpine for smaller image size
FROM node:20-alpine

# Install Bun
RUN npm install -g bun

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies using Bun
RUN bun install --frozen-lockfile

# Copy source code and configuration files
COPY tsconfig.json ./
COPY xmcp.config.ts ./
COPY xmcp-env.d.ts ./
COPY src/ ./src/

# Build the application
RUN bun run build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose the port (adjust if your app uses a different port)
EXPOSE 3000

# Start the HTTP server
CMD ["node", "dist/http.js"]