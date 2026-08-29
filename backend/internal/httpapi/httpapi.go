package httpapi

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"

	"github.com/frame/eyewear/internal/catalog"
	"github.com/frame/eyewear/internal/fit"
	"github.com/frame/eyewear/internal/optics"
)

type Server struct {
	Finder  optics.Finder
	Frames  []fit.Frame
	Origins []string
}

func New(finder optics.Finder, origins []string) *Server {
	if finder == nil {
		finder = optics.NewCatalog()
	}
	cleaned := make([]string, 0, len(origins))
	for _, o := range origins {
		o = strings.TrimSpace(o)
		if o != "" {
			cleaned = append(cleaned, o)
		}
	}
	if len(cleaned) == 0 {
		cleaned = []string{"http://localhost:3200"}
	}
	return &Server{Finder: finder, Frames: catalog.Frames(), Origins: cleaned}
}

func (s *Server) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /v1/fit", s.handleFit)
	mux.HandleFunc("GET /v1/optics", s.handleOptics)
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		s.writeHeaders(w, r)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		mux.ServeHTTP(w, r)
	})
}

func (s *Server) writeHeaders(w http.ResponseWriter, r *http.Request) {
	origin := r.Header.Get("Origin")
	if allowOrigin(s.Origins, origin) {
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Vary", "Origin")
	}
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
	w.Header().Set("X-Frame-Options", "DENY")
}

func allowOrigin(list []string, origin string) bool {
	for _, o := range list {
		if o == origin {
			return true
		}
	}
	return false
}

type fitReq struct {
	ImageBase64 string          `json:"imageBase64"`
	Landmarks   []fit.Landmark  `json:"landmarks"`
}

type fitResp struct {
	Head    fit.Head     `json:"head"`
	Matches []fit.Match  `json:"matches"`
}

type errResp struct {
	Error string `json:"error"`
}

func (s *Server) handleFit(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, int64(fit.MaxImageBytes)+1<<20)
	defer r.Body.Close()
	raw, err := io.ReadAll(r.Body)
	if err != nil {
		writeErr(w, http.StatusBadRequest, "invalid_body")
		return
	}
	var req fitReq
	if err := json.Unmarshal(raw, &req); err != nil {
		writeErr(w, http.StatusBadRequest, "invalid_json")
		return
	}
	img, err := decodeImage(req.ImageBase64)
	if err != nil {
		writeErr(w, http.StatusBadRequest, "invalid_image")
		return
	}
	if err := fit.ValidateImage(img); err != nil {
		writeFitImageErr(w, err)
		return
	}
	head, err := fit.Measure(req.Landmarks)
	if err != nil {
		writeErr(w, http.StatusBadRequest, "no_face")
		return
	}
	writeJSON(w, http.StatusOK, fitResp{Head: head, Matches: fit.Rank(head, s.Frames)})
}

func decodeImage(b64 string) ([]byte, error) {
	s := strings.TrimSpace(b64)
	if i := strings.Index(s, ","); i >= 0 && strings.Contains(s[:i], "base64") {
		s = s[i+1:]
	}
	if s == "" {
		return nil, errors.New("empty")
	}
	return base64.StdEncoding.DecodeString(s)
}

func writeFitImageErr(w http.ResponseWriter, err error) {
	if errors.Is(err, fit.ErrImageTooLarge) {
		writeErr(w, http.StatusRequestEntityTooLarge, "image_too_large")
		return
	}
	writeErr(w, http.StatusBadRequest, "invalid_image")
}

func (s *Server) handleOptics(w http.ResponseWriter, r *http.Request) {
	lat, lng, err := optics.ParseCoords(r.URL.Query().Get("lat"), r.URL.Query().Get("lng"))
	if err != nil {
		writeErr(w, http.StatusBadRequest, "invalid_location")
		return
	}
	shops, err := s.Finder.Nearby(lat, lng)
	if err != nil {
		writeErr(w, http.StatusBadGateway, "map_unavailable")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"shops": shops})
}

func writeErr(w http.ResponseWriter, status int, code string) {
	writeJSON(w, status, errResp{Error: code})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
