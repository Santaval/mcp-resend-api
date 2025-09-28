# Use Node.js 20 LTS as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the default port
EXPOSE 7505

# Set default environment variables
ENV PORT=7505
ENV NODE_ENV=production

# Start the application
CMD ["node", "index.js"]