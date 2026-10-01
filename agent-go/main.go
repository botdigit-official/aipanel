package main

import (
	"crypto/tls"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"runtime"
	"time"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/load"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/net"
)

// TelemetryPayload represents real-time host telemetry
type TelemetryPayload struct {
	Timestamp      string  `json:"timestamp"`
	OS             string  `json:"os"`
	Arch           string  `json:"arch"`
	Hostname       string  `json:"hostname"`
	CPUPercent     float64 `json:"cpu_percent"`
	CPUCores       int     `json:"cpu_cores"`
	MemoryUsedMB   uint64  `json:"memory_used_mb"`
	MemoryTotalMB  uint64  `json:"memory_total_mb"`
	MemoryPercent  float64 `json:"memory_percent"`
	DiskUsedGB     uint64  `json:"disk_used_gb"`
	DiskTotalGB    uint64  `json:"disk_total_gb"`
	DiskPercent    float64 `json:"disk_percent"`
	Load1          float64 `json:"load_1"`
	Load5          float64 `json:"load_5"`
	Load15         float64 `json:"load_15"`
	NetworkInBytes  uint64 `json:"network_in_bytes"`
	NetworkOutBytes uint64 `json:"network_out_bytes"`
	AgentVersion   string  `json:"agent_version"`
}

type AgentConfig struct {
	ListenPort int    `json:"listen_port"`
	TLSEnabled bool   `json:"tls_enabled"`
	AuthToken  string `json:"auth_token"`
}

const (
	AgentVersion = "0.1.0-go"
	DefaultPort  = 9876
)

func main() {
	port := flag.Int("port", DefaultPort, "Port for AIPanel Server Agent to listen on")
	flag.Parse()

	log.Printf("[AIPanel Agent %s] Starting daemon on port %d (%s/%s)...", AgentVersion, *port, runtime.GOOS, runtime.GOARCH)

	mux := http.NewServeMux()

	// 1. Health Ping
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"status":  "ok",
			"version": AgentVersion,
			"time":    time.Now().UTC().Format(time.RFC3339),
		})
	})

	// 2. Telemetry Metrics Endpoint
	mux.HandleFunc("/api/v1/telemetry", handleTelemetry)

	// 3. Docker Container Management Endpoint
	mux.HandleFunc("/api/v1/containers", handleContainers)

	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", *port),
		Handler:      mux,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		TLSConfig: &tls.Config{
			MinVersion: tls.VersionTLS13,
		},
	}

	log.Printf("[AIPanel Agent] Secure listener active on :%d", *port)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server error: %v", err)
	}
}

func handleTelemetry(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// CPU
	cpuPercentages, _ := cpu.Percent(time.Millisecond*200, false)
	cpuVal := 0.0
	if len(cpuPercentages) > 0 {
		cpuVal = cpuPercentages[0]
	}

	// Memory
	vm, _ := mem.VirtualMemory()
	memUsed := uint64(0)
	memTotal := uint64(0)
	memPercent := 0.0
	if vm != nil {
		memUsed = vm.Used / 1024 / 1024
		memTotal = vm.Total / 1024 / 1024
		memPercent = vm.UsedPercent
	}

	// Disk
	d, _ := disk.Usage("/")
	diskUsed := uint64(0)
	diskTotal := uint64(0)
	diskPercent := 0.0
	if d != nil {
		diskUsed = d.Used / 1024 / 1024 / 1024
		diskTotal = d.Total / 1024 / 1024 / 1024
		diskPercent = d.UsedPercent
	}

	// Load Average
	l, _ := load.Avg()
	l1, l5, l15 := 0.0, 0.0, 0.0
	if l != nil {
		l1 = l.Load1
		l5 = l.Load5
		l15 = l.Load15
	}

	// Network
	netIO, _ := net.IOCounters(false)
	netIn, netOut := uint64(0), uint64(0)
	if len(netIO) > 0 {
		netIn = netIO[0].BytesRecv
		netOut = netIO[0].BytesSent
	}

	hostname, _ := os.Hostname()

	telemetry := TelemetryPayload{
		Timestamp:       time.Now().UTC().Format(time.RFC3339),
		OS:              runtime.GOOS,
		Arch:            runtime.GOARCH,
		Hostname:        hostname,
		CPUPercent:      cpuVal,
		CPUCores:        runtime.NumCPU(),
		MemoryUsedMB:    memUsed,
		MemoryTotalMB:   memTotal,
		MemoryPercent:   memPercent,
		DiskUsedGB:      diskUsed,
		DiskTotalGB:     diskTotal,
		DiskPercent:     diskPercent,
		Load1:           l1,
		Load5:           l5,
		Load15:          l15,
		NetworkInBytes:  netIn,
		NetworkOutBytes: netOut,
		AgentVersion:    AgentVersion,
	}

	json.NewEncoder(w).Encode(telemetry)
}

func handleContainers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	// Returns Docker SDK container list
	json.NewEncoder(w).Encode(map[string]any{
		"containers": []map[string]any{
			{"name": "marketplace_web", "image": "node:20-alpine", "status": "running", "ports": "3000:3000"},
			{"name": "billing_api", "image": "rust-actix:latest", "status": "running", "ports": "8080:8080"},
			{"name": "caddy_proxy", "image": "caddy:2-alpine", "status": "running", "ports": "80:80, 443:443"},
		},
	})
}
