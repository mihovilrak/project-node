# fe/Dockerfile
FROM node:16 as build

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install
RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Serve the application using a simple server
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
