package optics

import "testing"

func TestCatalog_LoadsODOSShops(t *testing.T) {
	c := NewCatalog()
	if len(c.shops) < 300 {
		t.Fatalf("expected ODOS catalog, got %d", len(c.shops))
	}
}

func TestCatalog_RanksAstanaNearestFirst(t *testing.T) {
	c := NewCatalog()
	shops, err := c.Nearby(51.128, 71.430)
	if err != nil {
		t.Fatal(err)
	}
	if len(shops) == 0 || shops[0].Km > shops[len(shops)-1].Km {
		t.Fatalf("expected distance sort %#v", shops[:1])
	}
	if shops[0].Source != "2gis" || shops[0].Address == "" {
		t.Fatalf("missing ODOS fields %#v", shops[0])
	}
	found := false
	for _, s := range c.shops {
		if s.ID == "70000001110585290" && s.Name == "77" {
			found = true
			break
		}
	}
	if !found {
		t.Fatal("expected first ODOS shop 77")
	}
}

func TestHaversineZero(t *testing.T) {
	if haversineKm(51.1, 71.4, 51.1, 71.4) > 0.01 {
		t.Fatal("same point should be ~0")
	}
}
