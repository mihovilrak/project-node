#!/bin/bash

# Create array of logging configs and allow listening to all addresses
declare -a configs=("logging_collector = on" "log_statement = 'mod'" "log_directory = 'pg_log'"
                        "log_filename = 'postgresql_%Y_%m_%d_%H%M%S.log'" "log_rotation_age = 1d"
                        "log_rotation_size = 10MB" "log_duration = on" "log_min_duration_statement = 1000"
                        "log_min_messages = warning" "listen_addresses = '*'")

# Loop through all array items to add them to postgresql.conf
for i in "${configs[@]}"
do 
    echo "$i" >> /var/lib/postgresql/data/postgresql.conf
done 

# Accept all incomming connectiona with pg_hba.conf 
echo "host  all all 0.0.0.0/0   md5" >> /var/lib/postgresql/data/pg_hba.conf