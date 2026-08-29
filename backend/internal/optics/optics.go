package optics

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/frame/eyewear/internal/fit"
)

type Shop struct {
	ID      string  `json:"id"`
	Name    string  `json:"name"`
	Lat     float64 `json:"lat"`
	Lng     float64 `json:"lng"`
	Address string  `json:"address"`
	Hours   string  `json:"hours,omitempty"`
	Phone   string  `json:"phone,omitempty"`
	Rating  float64 `json:"rating,omitempty"`
	MapURL  string  `json:"mapUrl,omitempty"`
	Km      float64 `json:"km,omitempty"`
	Source  string  `json:"source"`
}

type Finder interface {
	Nearby(lat, lng float64) ([]Shop, error)
}

func ParseCoords(latS, lngS string) (float64, float64, error) {
	if strings.TrimSpace(latS) == "" || strings.TrimSpace(lngS) == "" {
		return 0, 0, fit.ErrMissingCoords
	}
	lat, err := strconv.ParseFloat(latS, 64)
	if err != nil {
		return 0, 0, fit.ErrInvalidCoords
	}
	lng, err := strconv.ParseFloat(lngS, 64)
	if err != nil {
		return 0, 0, fit.ErrInvalidCoords
	}
	if lat < -90 || lat > 90 || lng < -180 || lng > 180 {
		return 0, 0, fit.ErrInvalidCoords
	}
	return lat, lng, nil
}

type Overpass struct {
	Client  *http.Client
	BaseURL string
}

func NewOverpass() *Overpass {
	return &Overpass{
		Client:  &http.Client{Timeout: 12 * time.Second},
		BaseURL: "https://overpass-api.de/api/interpreter",
	}
}

func (o *Overpass) Nearby(lat, lng float64) ([]Shop, error) {
	q := fmt.Sprintf(`[out:json][timeout:10];(node["shop"="optician"](around:4000,%f,%f);way["shop"="optician"](around:4000,%f,%f););out center tags 30;`, lat, lng, lat, lng)
	form := url.Values{}
	form.Set("data", q)
	req, err := http.NewRequest(http.MethodPost, o.BaseURL, strings.NewReader(form.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("User-Agent", "FRAME-eyewear/1.0 (fit-matching; contact=local-dev)")
	resp, err := o.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(io.LimitReader(resp.Body, 2<<20))
	if err != nil {
		return nil, err
	}
	if resp.StatusCode < 200 || resp.StatusCode > 299 {
		return nil, fmt.Errorf("map lookup failed")
	}
	return parseOverpass(body)
}

type overpassDoc struct {
	Elements []overpassEl `json:"elements"`
}

type overpassEl struct {
	ID     int64             `json:"id"`
	Lat    float64           `json:"lat"`
	Lon    float64           `json:"lon"`
	Center *overpassCenter   `json:"center"`
	Tags   map[string]string `json:"tags"`
}

type overpassCenter struct {
	Lat float64 `json:"lat"`
	Lon float64 `json:"lon"`
}

func parseOverpass(body []byte) ([]Shop, error) {
	var doc overpassDoc
	if err := json.Unmarshal(body, &doc); err != nil {
		return nil, err
	}
	out := make([]Shop, 0, len(doc.Elements))
	for _, el := range doc.Elements {
		shop, ok := shopFromEl(el)
		if !ok {
			continue
		}
		out = append(out, shop)
	}
	return out, nil
}

func shopFromEl(el overpassEl) (Shop, bool) {
	lat, lng := el.Lat, el.Lon
	if el.Center != nil {
		if lat == 0 {
			lat = el.Center.Lat
		}
		if lng == 0 {
			lng = el.Center.Lon
		}
	}
	if lat == 0 && lng == 0 {
		return Shop{}, false
	}
	tags := el.Tags
	if tags == nil {
		tags = map[string]string{}
	}
	name := strings.TrimSpace(tags["name"])
	if name == "" {
		name = "Optical shop"
	}
	addr := joinAddr(tags)
	return Shop{
		ID:      strconv.FormatInt(el.ID, 10),
		Name:    name,
		Lat:     lat,
		Lng:     lng,
		Address: addr,
		Hours:   tags["opening_hours"],
		Source:  "openstreetmap",
	}, true
}

func joinAddr(tags map[string]string) string {
	parts := make([]string, 0, 3)
	for _, k := range []string{"addr:street", "addr:housenumber", "addr:city"} {
		if v := strings.TrimSpace(tags[k]); v != "" {
			parts = append(parts, v)
		}
	}
	return strings.Join(parts, " ")
}
