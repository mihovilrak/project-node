# Import nginx image
FROM nginx:latest

# Copy NGINX configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80 for HTTP
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]