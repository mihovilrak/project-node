# Import node image
FROM node:23-alpine3.19 AS builder

# Set working directory
WORKDIR /usr/src

# Copy package.json and install dependencies
COPY package*.json ./
COPY ./src/ .
RUN apk update && \
    apk add --no-cache yarn && \
    mkdir node_modules && \
    yarn install --production=true --link-duplicates --ignore-optional && \
    npm install -g @vercel/ncc && \
    ncc build app.js -o dist --no-cache -q

FROM node:23-alpine3.19

# Set working directory
WORKDIR /usr/src

COPY --from=builder /usr/src/dist/index.js .

# Expose port 5000 for the API
EXPOSE 5000

# Start the server
CMD ["node", "index.js"]
