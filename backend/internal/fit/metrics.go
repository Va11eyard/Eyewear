package fit

import (
	"math"
	"strings"
)

const (
	// TempleAllowanceMm keeps a comfortable frame from reading as too wide:
	// the front sits outside the bizygomatic measurement we can actually see.
	TempleAllowanceMm = 5.0
	WidthToleranceMm  = 6.0
	endPieceMm        = 12.0
)

// HasTryOnMesh reports whether a mesh id points at geometry the try-on renderer
// can actually load: the parametric rig, a shipped GLB, or the Apache-2.0
// FaceFilter sample.
func HasTryOnMesh(model string) bool {
	for _, prefix := range []string{"rig:", "glb:", "jeeliz:"} {
		if strings.HasPrefix(model, prefix) {
			return true
		}
	}
	return strings.HasSuffix(model, ".glb")
}

func TotalFrontWidthMm(f Frame) float64 {
	return f.LensWidthMm*2 + f.BridgeMm + 2*endPieceMm
}

func TargetFrontWidthMm(head Head) float64 {
	return round1(head.FaceWidthMm + TempleAllowanceMm)
}

func FitDeltaMm(head Head, f Frame) float64 {
	return round1(TotalFrontWidthMm(f) - TargetFrontWidthMm(head))
}

func FitsWidth(deltaMm float64) bool {
	return math.Abs(deltaMm) <= WidthToleranceMm
}

// Band is a count of agreeing cues, not a probability. The UI must not render
// it as one.
type Band struct {
	Label string  `json:"label"`
	Pct   float64 `json:"pct"`
}

func ConfidenceBand(agreed int) Band {
	switch {
	case agreed >= 5:
		return Band{"уверенно", 96}
	case agreed == 4:
		return Band{"уверенно", 88}
	case agreed == 3:
		return Band{"ориентировочно", 66}
	case agreed == 2:
		return Band{"слабо", 42}
	case agreed == 1:
		return Band{"слабо", 20}
	}
	return Band{"нет данных", 0}
}
