# Build the React frontend
FROM node:23-alpine3.19 AS build

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN apk update && \
    apk add --no-cache yarn && \
    mkdir node_modules && \
    yarn install --production=true --link-duplicates --ignore-optional

# Copy the rest of the React application
COPY . .

ENV NODE_OPTIONS=--openssl-legacy-provider

# Build the application
RUN yarn run build && \
    yarn cache clean --all && \
    yarn autoclean

# Serve the built app with NGINX
FROM nginx:1.27.2-alpine-slim

# Copy React build files to NGINX HTML directory
COPY --from=build /app/build /usr/share/nginx/html

# Copy NGINX configuration file (for reverse proxy)
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80 for NGINX
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
