package catalog

import (
	_ "embed"
	"encoding/json"
	"fmt"

	"github.com/frame/eyewear/internal/fit"
)

// The catalogue is data, shared byte for byte with the TypeScript side. The
// parity test in internal/fit fails the build if the two copies drift.
//
//go:embed frames.json
var embedded []byte

type record struct {
	SKU         string   `json:"sku"`
	Name        string   `json:"name"`
	Shape       string   `json:"shape"`
	Material    string   `json:"material"`
	Color       string   `json:"color"`
	ColorRu     string   `json:"colorRu"`
	LensWidthMm float64  `json:"lensWidthMm"`
	BridgeMm    float64  `json:"bridgeMm"`
	TempleMm    float64  `json:"templeMm"`
	WeightG     float64  `json:"weightG"`
	PriceTenge  float64  `json:"priceTenge"`
	Mesh        string   `json:"mesh"`
	Colors      []string `json:"colors"`
}

type document struct {
	Version int      `json:"version"`
	Frames  []record `json:"frames"`
}

func Frames() []fit.Frame {
	frames, err := Load(embedded)
	if err != nil {
		panic("catalog/frames.json: " + err.Error())
	}
	return frames
}

func Load(b []byte) ([]fit.Frame, error) {
	var doc document
	if err := json.Unmarshal(b, &doc); err != nil {
		return nil, fmt.Errorf("parse: %w", err)
	}
	if len(doc.Frames) < 40 {
		return nil, fmt.Errorf("need at least 40 models, got %d", len(doc.Frames))
	}
	out := make([]fit.Frame, 0, len(doc.Frames))
	seen := map[string]bool{}
	for _, r := range doc.Frames {
		if r.SKU == "" || seen[r.SKU] {
			return nil, fmt.Errorf("sku empty or duplicated: %q", r.SKU)
		}
		seen[r.SKU] = true
		if r.LensWidthMm < 40 || r.LensWidthMm > 62 {
			return nil, fmt.Errorf("%s: lensWidthMm %v out of range", r.SKU, r.LensWidthMm)
		}
		if r.BridgeMm < 12 || r.BridgeMm > 24 {
			return nil, fmt.Errorf("%s: bridgeMm %v out of range", r.SKU, r.BridgeMm)
		}
		if r.TempleMm < 120 || r.TempleMm > 155 {
			return nil, fmt.Errorf("%s: templeMm %v out of range", r.SKU, r.TempleMm)
		}
		if !fit.HasTryOnMesh(r.Mesh) {
			return nil, fmt.Errorf("%s: mesh %q is not loadable by the try-on renderer", r.SKU, r.Mesh)
		}
		if r.ColorRu == "" || len(r.Colors) == 0 {
			return nil, fmt.Errorf("%s: colour must carry a name and options", r.SKU)
		}
		out = append(out, fit.Frame{
			SKU: r.SKU, Name: r.Name, Brand: "FRAME", Shape: r.Shape, Material: r.Material,
			Color: r.Color, ColorRu: r.ColorRu, LensWidthMm: r.LensWidthMm, BridgeMm: r.BridgeMm,
			TempleMm: r.TempleMm, WeightG: r.WeightG, PriceTenge: r.PriceTenge,
			Model: r.Mesh, Colors: r.Colors,
		})
	}
	return out, nil
}
