# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    OPENAI_API_KEY="" \
    CDP_API_KEY_NAME="" \
    CDP_API_KEY_PRIVATE_KEY=""

# Expose default Node.js port
EXPOSE 3000

# Run the application in API mode
CMD ["node", "dist/chatbot.js", "--api"]

