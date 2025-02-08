FROM node:18

WORKDIR /app

# Copy package files first
COPY package*.json ./
COPY agentkit/package*.json ./agentkit/

# Install root dependencies without agentkit first
RUN npm install --ignore-scripts

# Copy agentkit source
COPY agentkit ./agentkit/

# Build and install agentkit
WORKDIR /app/agentkit
RUN npm install
RUN npm run build

# Return to main directory and finish installation
WORKDIR /app
RUN npm install

# Copy the rest of your application (excluding node_modules and agentkit)
COPY .env* ./ 
COPY tsconfig*.json ./
COPY *.ts ./
COPY .eslintrc* ./
COPY .prettier* ./

# Build your application
RUN npm run build

CMD ["node", "dist/chatbot.js", "--api"]