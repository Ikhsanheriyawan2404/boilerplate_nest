# Base image
FROM node:18-alpine

# Install required dependencies
RUN apk add --no-cache bash

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install --production

# Bundle app source
COPY . .

# Generate Prisma client (jika diperlukan)
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port
EXPOSE 4000

# Start the server
CMD ["npm", "run", "start:prod"]
