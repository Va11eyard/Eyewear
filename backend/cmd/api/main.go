package main

import (
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/frame/eyewear/internal/httpapi"
)

func main() {
	addr := os.Getenv("ADDR")
	if addr == "" {
		addr = ":9000"
	}
	origins := strings.Split(os.Getenv("ALLOWED_ORIGINS"), ",")
	srv := &http.Server{
		Addr:              addr,
		Handler:           httpapi.New(nil, origins).Handler(),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       20 * time.Second,
		WriteTimeout:      25 * time.Second,
		MaxHeaderBytes:    1 << 16,
	}
	log.Print("api listening")
	log.Fatal(srv.ListenAndServe())
}
