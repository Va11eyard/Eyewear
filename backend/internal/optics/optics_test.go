package optics

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestParseCoords_Missing(t *testing.T) {
	if _, _, err := ParseCoords("", "76.9"); err == nil {
		t.Fatal("expected error")
	}
	if _, _, err := ParseCoords("43.2", ""); err == nil {
		t.Fatal("expected error")
	}
}

func TestParseCoords_Invalid(t *testing.T) {
	if _, _, err := ParseCoords("abc", "1"); err == nil {
		t.Fatal("expected error")
	}
	if _, _, err := ParseCoords("91", "0"); err == nil {
		t.Fatal("expected out of range")
	}
}

func TestParseCoords_Valid(t *testing.T) {
	lat, lng, err := ParseCoords("43.238", "76.889")
	if err != nil {
		t.Fatal(err)
	}
	if lat < 43 || lng < 76 {
		t.Fatalf("parsed %v %v", lat, lng)
	}
}

func TestParseOverpass_UsesLiveTags(t *testing.T) {
	body := []byte(`{"elements":[{"id":1,"lat":43.2,"lon":76.9,"tags":{"name":"Lens House","addr:street":"Abay","opening_hours":"Mo-Fr 10:00-19:00"}}]}`)
	shops, err := parseOverpass(body)
	if err != nil {
		t.Fatal(err)
	}
	if len(shops) != 1 || shops[0].Name != "Lens House" || shops[0].Source != "openstreetmap" {
		t.Fatalf("%#v", shops)
	}
}

func TestNearby_UsesOverpassPayload(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Errorf("method %s", r.Method)
		}
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"elements":[{"id":11,"lat":51.5,"lon":-0.12,"tags":{"name":"City Optic","addr:city":"London"}}]}`))
	}))
	defer ts.Close()
	o := &Overpass{Client: ts.Client(), BaseURL: ts.URL}
	shops, err := o.Nearby(51.5, -0.12)
	if err != nil {
		t.Fatal(err)
	}
	if len(shops) != 1 || shops[0].Name != "City Optic" {
		t.Fatalf("%#v", shops)
	}
}

func TestNearby_NonOK(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusTooManyRequests)
	}))
	defer ts.Close()
	o := &Overpass{Client: ts.Client(), BaseURL: ts.URL}
	if _, err := o.Nearby(1, 1); err == nil {
		t.Fatal("expected error")
	}
}

func TestShopFromWayCenter(t *testing.T) {
	body := []byte(`{"elements":[{"id":4,"lat":0,"lon":0,"center":{"lat":40.4,"lon":49.8},"tags":{"name":"Baku Lens"}}]}`)
	shops, err := parseOverpass(body)
	if err != nil {
		t.Fatal(err)
	}
	if len(shops) != 1 || shops[0].Lat < 40 {
		t.Fatalf("%#v", shops)
	}
}

func TestParseOverpass_SkipsZeroCoord(t *testing.T) {
	body := []byte(`{"elements":[{"id":2,"lat":0,"lon":0,"tags":{"name":"Ghost"}}]}`)
	shops, err := parseOverpass(body)
	if err != nil {
		t.Fatal(err)
	}
	if len(shops) != 0 {
		t.Fatalf("expected skip, got %#v", shops)
	}
}

func TestParseOverpass_UnnamedAndBadJSON(t *testing.T) {
	body := []byte(`{"elements":[{"id":8,"lat":1,"lon":2,"tags":{}}]}`)
	shops, err := parseOverpass(body)
	if err != nil || len(shops) != 1 || shops[0].Name != "Optical shop" {
		t.Fatalf("%v %#v", err, shops)
	}
	if _, err := parseOverpass([]byte("{")); err == nil {
		t.Fatal("expected json error")
	}
}

func TestParseCoords_BadLng(t *testing.T) {
	if _, _, err := ParseCoords("10", "xyz"); err == nil {
		t.Fatal("expected error")
	}
	if _, _, err := ParseCoords("10", "181"); err == nil {
		t.Fatal("expected range error")
	}
}

func TestNewOverpass(t *testing.T) {
	if NewOverpass().BaseURL == "" {
		t.Fatal("missing url")
	}
}

func TestNearby_BadJSON(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{`))
	}))
	defer ts.Close()
	o := &Overpass{Client: ts.Client(), BaseURL: ts.URL}
	if _, err := o.Nearby(1, 2); err == nil {
		t.Fatal("expected error")
	}
}
