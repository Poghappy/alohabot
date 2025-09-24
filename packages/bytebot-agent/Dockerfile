# Base image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy app source from monorepo structure
COPY packages/shared /app/shared
COPY packages/bytebot-agent /app/bytebot-agent

WORKDIR /app/bytebot-agent

# Install dependencies
RUN npm install


RUN npm run build

# Run the application
CMD ["npm", "run", "start:prod"] 


