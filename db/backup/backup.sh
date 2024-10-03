#!/bin/bash

export PGPASSWORD=${POSTGRES_PASSWORD}

# Formatt date
now=$(date +"%Y_%m_%d_%H-%M")

# Perform the pg_dump
pg_dump -U ${POSTGRES_USER} -h localhost ${POSTGRES_DB} > /backups/db_dump_$now.sql

# Remove all dumps older than 30 days
find /backups -name "*.sql" -type f -mtime +30 -delete