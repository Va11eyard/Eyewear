package catalog

import (
	"strings"
	"testing"

	"github.com/frame/eyewear/internal/fit"
)

func TestFrames_HaveRealGeometry(t *testing.T) {
	frames := Frames()
	if len(frames) < 40 {
		t.Fatalf("catalog too small: %d", len(frames))
	}
	seen := map[string]struct{}{}
	shapes := map[string]int{}
	realMeshes := 0
	for _, f := range frames {
		if f.SKU == "" || f.LensWidthMm < 40 || f.BridgeMm < 10 || f.TempleMm < 120 {
			t.Fatalf("invalid geometry %#v", f)
		}
		if !fit.HasTryOnMesh(f.Model) {
			t.Fatalf("unresolvable mesh %#v", f)
		}
		if strings.HasPrefix(f.Model, "glb:") {
			realMeshes++
			if len(f.Colors) != 1 {
				t.Fatalf("a real frame must not offer tints: %#v", f)
			}
		} else if len(f.Colors) < 3 {
			t.Fatalf("generated frame needs a real colour choice %#v", f)
		}
		shapes[f.Shape]++
		if _, dup := seen[f.SKU]; dup {
			t.Fatalf("duplicate sku %s", f.SKU)
		}
		seen[f.SKU] = struct{}{}
	}
	if len(shapes) < 7 {
		t.Fatalf("need seven shape families, got %d", len(shapes))
	}
	if realMeshes == 0 {
		t.Fatal("catalog is entirely generated; at least one real scanned frame must ship")
	}
}
