#!/bin/bash

# Set timezone
echo "log_timezone = '${TZ}'" >> /var/lib/postgresql/data/postgresql.conf

# Accept all incomming connectiona with pg_hba.conf
echo "host  all all 0.0.0.0/0   md5" >> /var/lib/postgresql/data/pg_hba.conf

# Delete all files in /docker-entrypoint-initdb.d
rm -rf /docker-entrypoint-initdb.d/*