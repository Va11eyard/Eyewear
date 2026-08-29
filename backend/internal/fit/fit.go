package fit

import (
	"errors"
	"math"
	"sort"
)

const (
	idxLeftInner  = 133
	idxRightInner = 362
	idxLeftCheek  = 234
	idxRightCheek = 454
	idxChin       = 152
	idxForehead   = 10
	idxLeftIris     = 468
	idxLeftIrisRim  = 469
	meanAdultIPDMm  = 63.0
	irisDiameterMm  = 11.7
)

var (
	ErrNoFace         = errors.New("no face detected")
	ErrInvalidImage   = errors.New("invalid image")
	ErrImageTooLarge  = errors.New("image too large")
	ErrMissingCoords  = errors.New("missing coordinates")
	ErrInvalidCoords  = errors.New("invalid coordinates")
	MaxImageBytes     = 8 << 20
)

type Landmark struct {
	Index int     `json:"index"`
	X     float64 `json:"x"`
	Y     float64 `json:"y"`
	Z     float64 `json:"z"`
}

type Head struct {
	IPDMm        float64 `json:"ipdMm"`
	FaceWidthMm  float64 `json:"faceWidthMm"`
	FaceHeightMm float64 `json:"faceHeightMm"`
	ShapeHint    string  `json:"shapeHint"`
	SizeHint     string  `json:"sizeHint"`
}

type Frame struct {
	SKU         string  `json:"sku"`
	Name        string  `json:"name"`
	Brand       string  `json:"brand"`
	Shape       string  `json:"shape"`
	Material    string  `json:"material"`
	Color       string  `json:"color"`
	LensWidthMm float64 `json:"lensWidthMm"`
	BridgeMm    float64 `json:"bridgeMm"`
	TempleMm    float64  `json:"templeMm"`
	Model       string   `json:"model"`
	Colors      []string `json:"colors"`
}

type Breakdown struct {
	Shape     float64 `json:"shape"`
	Size      float64 `json:"size"`
	Geometry  float64 `json:"geometry"`
	Material  float64 `json:"material"`
}

type Match struct {
	Frame      Frame     `json:"frame"`
	Score      float64   `json:"score"`
	Breakdown  Breakdown `json:"breakdown"`
}

func byIndex(points []Landmark) map[int]Landmark {
	out := make(map[int]Landmark, len(points))
	for _, p := range points {
		out[p.Index] = p
	}
	return out
}

func dist(a, b Landmark) float64 {
	dx := a.X - b.X
	dy := a.Y - b.Y
	return math.Hypot(dx, dy)
}

func Measure(points []Landmark) (Head, error) {
	if len(points) == 0 {
		return Head{}, ErrNoFace
	}
	idx := byIndex(points)
	left, okL := idx[idxLeftInner]
	right, okR := idx[idxRightInner]
	if !okL || !okR {
		return Head{}, ErrNoFace
	}
	ipdN := dist(left, right)
	if ipdN < 0.02 {
		return Head{}, ErrNoFace
	}
	mmPer := scaleMm(idx, ipdN)
	faceW := faceWidthNorm(idx, ipdN)
	faceH := faceHeightNorm(idx, ipdN)
	head := Head{
		IPDMm:        round1(ipdN * mmPer),
		FaceWidthMm:  round1(faceW * mmPer),
		FaceHeightMm: round1(faceH * mmPer),
	}
	head.ShapeHint = classifyFace(idx, head.FaceWidthMm, head.FaceHeightMm)
	head.SizeHint = sizeFromWidth(head.FaceWidthMm)
	return head, nil
}

func scaleMm(idx map[int]Landmark, ipdN float64) float64 {
	mmPer := meanAdultIPDMm / ipdN
	center, okC := idx[idxLeftIris]
	rim, okR := idx[idxLeftIrisRim]
	if okC && okR {
		diameter := dist(center, rim) * 2
		if diameter > 0.002 {
			candidate := irisDiameterMm / diameter
			est := ipdN * candidate
			if est >= 48 && est <= 78 {
				return candidate
			}
		}
	}
	return mmPer
}

func faceWidthNorm(idx map[int]Landmark, ipdN float64) float64 {
	lc, okL := idx[idxLeftCheek]
	rc, okR := idx[idxRightCheek]
	if okL && okR {
		return dist(lc, rc)
	}
	return ipdN * 2.2
}

func faceHeightNorm(idx map[int]Landmark, ipdN float64) float64 {
	fh, okF := idx[idxForehead]
	ch, okC := idx[idxChin]
	if okF && okC {
		return dist(fh, ch)
	}
	return ipdN * 2.8
}

func shapeFromRatio(w, h float64) string {
	if h <= 0 {
		return "oval"
	}
	r := w / h
	switch {
	case r >= 0.95:
		return "round"
	case r <= 0.72:
		return "rect"
	default:
		return "oval"
	}
}

func sizeFromWidth(faceMm float64) string {
	switch {
	case faceMm < 125:
		return "sm"
	case faceMm > 145:
		return "lg"
	default:
		return "md"
	}
}

func round1(v float64) float64 {
	return math.Round(v*10) / 10
}

func targetLens(head Head) float64 {
	base := head.FaceWidthMm * 0.38
	if head.SizeHint == "sm" {
		return math.Min(base, 50)
	}
	if head.SizeHint == "lg" {
		return math.Max(base, 56)
	}
	return base
}

func ScoreFrame(head Head, frame Frame) Match {
	want := targetLens(head)
	size := clamp(100-math.Abs(frame.LensWidthMm-want)*6, 0, 100)
	geo := clamp(100-math.Abs(frame.BridgeMm-18)*4, 0, 100)
	shape := pairShapeScore(head.ShapeHint, frame.Shape)
	mat := 82.0
	score := round1(shape*0.34 + size*0.40 + geo*0.26)
	return Match{
		Frame:     frame,
		Score:     score,
		Breakdown: Breakdown{Shape: round1(shape), Size: round1(size), Geometry: round1(geo), Material: mat},
	}
}

func clamp(v, lo, hi float64) float64 {
	return math.Min(hi, math.Max(lo, v))
}

func Rank(head Head, frames []Frame) []Match {
	out := make([]Match, 0, len(frames))
	for _, f := range frames {
		out = append(out, ScoreFrame(head, f))
	}
	sort.Slice(out, func(i, j int) bool {
		return out[i].Score > out[j].Score
	})
	return out
}
