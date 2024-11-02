# Use the official PostgreSQL alpine image as the base image
FROM postgres:17.0-alpine3.20

# Install cron, tzdata and postgresql packages for crypt and gen_salt
RUN apk update && \
    apk add --no-cache dcron \
    tzdata \
    postgresql-contrib \
    libpq-dev

# Set timezone
RUN ln -fs /usr/share/zoneinfo/${TZ} /etc/localtime && \
    echo ${TZ} > /etc/timezone

# Copy SQL and shell scripts into the container
COPY init/ /docker-entrypoint-initdb.d/
COPY backup/backup.sh /backups/backup.sh
COPY crontab /etc/cron.d/pg_dump_cron

# Set permissions for the scripts
RUN chmod +x /backups/backup.sh && \
    chmod 0644 /etc/cron.d/pg_dump_cron && \
    crontab /etc/cron.d/pg_dump_cron

# Ensure cron is started as well as PostgreSQL
CMD ["bash", "-c", "crond && docker-entrypoint.sh postgres"]
