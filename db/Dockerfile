# Use the official PostgreSQL image as the base image
FROM postgres:latest

# Install cron, tzdata and postgresql packages for bcrypt, crypt and gen_salt
RUN apt-get update && apt-get install -y cron tzdata postgresql-contrib libpq-dev

# Set timezone
RUN ln -fs /usr/share/zoneinfo/${TZ} /etc/localtime && \
    echo ${TZ} > /etc/timezone

# Copy SQL and shell scripts into the container
COPY init/ /docker-entrypoint-initdb.d/
COPY backup/backup.sh /backups/backup.sh
COPY crontab /etc/cron.d/pg_dump_cron

# Set permissions for the scripts
RUN chmod +x /backups/backup.sh

# Give execution rights to the cron job file
RUN chmod 0644 /etc/cron.d/pg_dump_cron

# Apply cron job
RUN crontab /etc/cron.d/pg_dump_cron

# Ensure cron is started as well as PostgreSQL
CMD ["bash", "-c", "cron && docker-entrypoint.sh postgres"]
