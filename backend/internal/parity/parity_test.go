package parity

import (
	"encoding/json"
	"os"
	"testing"

	"github.com/frame/eyewear/internal/catalog"
	"github.com/frame/eyewear/internal/fit"
)

type entry struct {
	Name       string         `json:"name"`
	Landmarks  []fit.Landmark `json:"landmarks"`
	Want       fit.Head       `json:"want"`
	WantSKUs   []string       `json:"wantSKUs"`
	WantDeltas []float64      `json:"wantDeltas"`
}

// TestCatalogueCopiesMatch guards the one place the catalogue is duplicated:
// the browser serves web/public/data/frames.json and the API embeds a copy.
func TestCatalogueCopiesMatch(t *testing.T) {
	web, err := os.ReadFile("../../../web/public/data/frames.json")
	if err != nil {
		t.Fatalf("web catalogue missing: %v", err)
	}
	api, err := os.ReadFile("../catalog/frames.json")
	if err != nil {
		t.Fatalf("api catalogue missing: %v", err)
	}
	if string(web) != string(api) {
		t.Fatal("catalogue copies drifted; run npm run sync:frames in web/")
	}
}

// fallback. Both languages read testdata/fit-parity.json, so changing the maths
// on one side fails a test instead of shipping two products that disagree.
func TestSharedFixture(t *testing.T) {
	b, err := os.ReadFile("../../../testdata/fit-parity.json")
	if err != nil {
		t.Fatalf("shared fixture missing: %v", err)
	}
	var doc struct {
		Cases []entry `json:"cases"`
	}
	if err := json.Unmarshal(b, &doc); err != nil {
		t.Fatalf("fixture unreadable: %v", err)
	}
	if len(doc.Cases) != 4 {
		t.Fatalf("expected 4 cases, got %d", len(doc.Cases))
	}
	frames := catalog.Frames()

	for _, c := range doc.Cases {
		head, err := fit.Measure(c.Landmarks)
		if err != nil {
			t.Fatalf("%s: measure: %v", c.Name, err)
		}
		if head.IPDMm != c.Want.IPDMm {
			t.Errorf("%s ipd got %v want %v", c.Name, head.IPDMm, c.Want.IPDMm)
		}
		if head.FaceWidthMm != c.Want.FaceWidthMm {
			t.Errorf("%s width got %v want %v", c.Name, head.FaceWidthMm, c.Want.FaceWidthMm)
		}
		if head.FaceHeightMm != c.Want.FaceHeightMm {
			t.Errorf("%s height got %v want %v", c.Name, head.FaceHeightMm, c.Want.FaceHeightMm)
		}
		if head.ShapeHint != c.Want.ShapeHint {
			t.Errorf("%s shape got %s want %s", c.Name, head.ShapeHint, c.Want.ShapeHint)
		}
		if head.ShapeAgreed != c.Want.ShapeAgreed {
			t.Errorf("%s agreed got %d want %d", c.Name, head.ShapeAgreed, c.Want.ShapeAgreed)
		}
		if head.SizeHint != c.Want.SizeHint {
			t.Errorf("%s size got %s want %s", c.Name, head.SizeHint, c.Want.SizeHint)
		}

		got := fit.Recommend(head, frames)
		if len(got) != len(c.WantSKUs) {
			t.Fatalf("%s suggestions got %d want %d", c.Name, len(got), len(c.WantSKUs))
		}
		for i, s := range got {
			if s.Frame.SKU != c.WantSKUs[i] {
				t.Errorf("%s rank %d got %s want %s", c.Name, i, s.Frame.SKU, c.WantSKUs[i])
			}
			if s.DeltaMm != c.WantDeltas[i] {
				t.Errorf("%s rank %d delta got %v want %v", c.Name, i, s.DeltaMm, c.WantDeltas[i])
			}
			if len(s.Reasons) < 2 || len(s.Reasons) > 3 {
				t.Errorf("%s rank %d reasons %d", c.Name, i, len(s.Reasons))
			}
		}
	}
}
