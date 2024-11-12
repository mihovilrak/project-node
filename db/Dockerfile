# Use the official PostgreSQL alpine image as the base image
FROM postgres:17.0-alpine3.20

# Copy SQL and shell scripts into the container
COPY init/ /docker-entrypoint-initdb.d/

# Install cron, tzdata and postgresql packages for crypt and gen_salt
RUN apk update && \
    apk add --no-cache dcron \
    postgresql-contrib \
    libpq-dev && \
    rm -rf /var/cache/apk/* && \
    chmod +x /usr/local/bin/backup.sh && \
    chmod 0644 /etc/cron.d/pg_dump_cron && \
    crontab /etc/cron.d/pg_dump_cron

# Ensure cron is started as well as PostgreSQL
CMD ["bash", "-c", "crond && docker-entrypoint.sh postgres"]
