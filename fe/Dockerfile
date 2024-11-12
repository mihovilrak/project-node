# Build the React frontend
FROM node:23-alpine3.19 AS build

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json yarn.lock ./

RUN mkdir node_modules && \
    yarn config set cache-folder /tmp/yarn-cache && \
    yarn install --frozen-lockfile --prefer-offline \
    --production=true --link-duplicates --ignore-optional && \
    yarn add -D @babel/plugin-proposal-private-property-in-object && \
    yarn cache clean --all

# Copy the rest of the React application
COPY ./src/ ./src/
COPY ./public/ ./public/

ENV NODE_OPTIONS=--openssl-legacy-provider
ENV BABEL_ENV=production

# Build the application
RUN yarn run build --verbose

# Serve the built app with NGINX
FROM nginx:1.27.2-alpine-slim

# Copy React build files to NGINX HTML directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 for NGINX
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
