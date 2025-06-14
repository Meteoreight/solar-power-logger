# Use Node.js 18 base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Build the application
RUN npm run build

# Use lightweight Nginx image for production
FROM nginx:alpine

# Copy built files to Nginx public directory
COPY --from=0 /app/dist /usr/share/nginx/html

# Copy Nginx configuration file (for SPA routing support)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
