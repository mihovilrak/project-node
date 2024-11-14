package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"
)

func setupTimeZone() error {
	tz := os.Getenv("TZ")
	if tz == "" {
		fmt.Println("No TZ environment variable set, using UTC")
	} else {
		fmt.Printf("Using TZ: %s\n", tz)
	}

	if err := copyFile(filepath.Join("/usr/share/zoneinfo", tz), "/etc/localtime"); err != nil {
		return err
	}
	return ioutil.WriteFile("/etc/timezone", []byte(tz), 0644)
}

func waitForDB() error {
	fmt.Println("Waiting for database to be ready...")
	for {
		cmd := exec.Command(
			"pg_isready",
			"-h", "db",
			"-p", "5432",
			"-U", os.Getenv("POSTGRES_USER"),
		)
		if err := cmd.Run(); err != nil {
			break
		}
		time.Sleep(2 * time.Second)
	}
	fmt.Println("Database is ready!")
	return nil
}

func initDatabase() error {
	fmt.Println("Initializing database...")
	files, err := filepath.Glob("/app/db-init/*.sql")
	if err != nil {
		return err
	}

	for _, file := range files {
		fmt.Printf("Running script: %s\n", file)
		cmd := exec.Command(
			"psql",
			"-h", "db",
			"-U", os.Getenv("POSTGRES_USER"),
			"-d", os.Getenv("POSTGRES_DB"),
			"-f", file,
		)
		cmd.Env = append(os.Environ(),
			fmt.Sprintf("PGPASSWORD=%s", os.Getenv("POSTGRES_PASSWORD")),
		)
		if err := cmd.Run(); err != nil {
			fmt.Printf("Error running script %s: %v\n", file, err)
			return err
		}
	}

	if err := os.RemoveAll("/app/db-init"); err != nil {
		return err
	}
	fmt.Println("Database initialization completed successfully")
	return nil
}

func startApp() ([]*os.Process, error) {
	processes := make([]*os.Process, 0)

	// Start crond
	fmt.Println("Starting crond service...")
	if err := exec.Command("crond").Start(); err != nil {
		return nil, err
	}
	
	// Starting backend API
	fmt.Println("Starting backend API service...")
	backendCmd := exec.Command("node", "/app/api/index.js")
	if err := backendCmd.Start(); err != nil {
		return nil, err
	}
	processes = append(processes, backendCmd.Process)

	// Start notification service
	fmt.Println("Starting notification service...")
	notificationCmd := exec.Command("node", "/app/service/index.js")
	if err := notificationCmd.Start(); err != nil {
		return nil, err
	}
	processes = append(processes, notificationCmd.Process)
	
	// Start nginx
	fmt.Println("Starting nginx service...")
	nginxCmd := exec.Command("nginx", "-g", "daemon off;")
	if err := nginxCmd.Start(); err != nil {
		return nil, err
	}
	processes = append(processes, nginxCmd.Process)

	fmt.Println("All services started successfully")
	return processes, nil
}

func copyFile(src, dst string) error {
	srcFile, err := ioutil.ReadFile(src)
	if err != nil {
		return err
	}
	return ioutil.WriteFile(dst, srcFile, 0644)
}

func main() {
	if err := setupTimeZone(); err != nil {
		fmt.Printf("Failed to setup timezone: %v\n", err)
	}

	if err := waitForDB(); err != nil {
		fmt.Printf("Failed to wait for database: %v\n", err)
	}

	if err := initDatabase(); err != nil {
		fmt.Printf("Failed to initialize database: %v\n", err)
	}

	processes, err := startApp()
	if err != nil {
		fmt.Printf("Failed to start application: %v\n", err)
		os.Exit(1)
	}

	// Wait for termination signal
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan
	fmt.Println("Received termination signal, shutting down...")

	for _, process := range processes {
		if err := process.Kill(); err != nil {
			fmt.Printf("Failed to kill process %v: %v\n", process.Pid, err)
		}
	}
	exec.Command("pkill", "crond").Run()
}
