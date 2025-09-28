# Use Node.js 20 LTS as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./


# Install git
RUN apk add --no-cache git


# Install TypeScript globally
RUN npm install -g typescript @types/node @types/minimist



# Install dependencies for main app
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