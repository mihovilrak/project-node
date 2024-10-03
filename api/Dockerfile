# Import node image
FROM node:latest

# Set working directory
WORKDIR /usr/src

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app source code
COPY . .

# Expose port 5000 for the API
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
