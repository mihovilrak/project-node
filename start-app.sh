#!/bin/sh

# Function to set timezone
setup_timezone() {
    if [ ! -z "$TZ" ]; then
        echo "Setting timezone to $TZ"
        cp /usr/share/zoneinfo/$TZ /etc/localtime
        echo "$TZ" > /etc/timezone
    else
        echo "No timezone set, using default UTC"
        cp /usr/share/zoneinfo/UTC /etc/localtime
        echo "UTC" > /etc/timezone
    fi
}

# Function to wait for database
wait_for_db() {
    echo "Waiting for database to be ready..."
    while ! pg_isready -h db -p 5432 -U $POSTGRES_USER
    do
        sleep 2
    done
    echo "Database is ready!"
}

# Function to run database initialization scripts
init_database() {
    echo "Running database initialization scripts..."
    for file in /app/db-init/*.sql; do
        if [ -f "$file" ]; then
            echo "Running $file"
            PGPASSWORD=$POSTGRES_PASSWORD psql -h db -U $POSTGRES_USER -d $POSTGRES_DB -f "$file"
            if [ $? -ne 0 ]; then
                echo "Error running $file"
                return 1
            fi
        fi
    done
    if [ -n "$ADMIN_PASSWORD" ]; then
        echo "Seeding admin user..."
        /app/seed-admin.sh
    fi
    rm -rf /app/db-init
    echo "Database initialization completed successfully"
}

# Function to start backend services
start_services() {
    echo "Starting crond service..."
    crond

    echo "Starting backend API service..."
    cd /app/api && node index.js &
    BACKEND_PID=$!

    echo "Starting notification service..."
    cd /app/service && TEMPLATES_PATH=/app/service/templates node index.js &
    NOTIFICATION_PID=$!

    echo "Starting NGINX..."
    nginx -g "daemon off;" &
    NGINX_PID=$!
}

# Function to handle shutdown
handle_shutdown() {
    echo "Received shutdown signal"
    kill $BACKEND_PID
    kill $NOTIFICATION_PID
    kill $NGINX_PID
    pkill crond
    exit 0
}

# Main execution
main() {
    # Set up timezone first
    setup_timezone

    # Set up signal handling
    trap 'handle_shutdown' SIGTERM SIGINT

    # Wait for database and initialize
    wait_for_db
    init_database
    if [ $? -ne 0 ]; then
        echo "Database initialization failed"
        exit 1
    fi

    # Start all services
    start_services

    # Keep the script running and wait for all background processes
    wait
}

# Run main function
main