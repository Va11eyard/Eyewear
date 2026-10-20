package fit

import (
	"fmt"
	"sort"
)

type Suggestion struct {
	Frame   Frame    `json:"frame"`
	DeltaMm float64  `json:"deltaMm"`
	Band    float64  `json:"band"`
	Reasons []string `json:"reasons"`
	Shape   string   `json:"shape"`
}

var shapeRU = map[string]string{
	"round": "круглые", "panto": "панто", "rect": "прямоугольные",
	"square": "квадратные", "cat": "кошачий глаз", "browline": "броулайны",
	"aviator": "авиаторы",
}

var faceRU = map[string]string{
	"oval": "овальному лицу", "round": "круглому лицу", "square": "квадратному лицу",
	"heart": "сердцевидному лицу", "diamond": "ромбовидному лицу", "oblong": "вытянутому лицу",
}

type cand struct {
	frame Frame
	delta float64
}

func Recommend(head Head, frames []Frame) []Suggestion {
	return RecommendExcluding(head, frames, nil, 3)
}

func RecommendExcluding(head Head, frames []Frame, exclude []string, limit int) []Suggestion {
	if limit <= 0 {
		limit = 3
	}
	skip := map[string]bool{}
	for _, sku := range exclude {
		skip[sku] = true
	}
	agreed := head.ShapeAgreed
	sizeOnly := head.ShapeHint == "unknown" || agreed < 3
	band := ConfidenceBand(agreed).Pct
	target := TargetFrontWidthMm(head)

	var ranked []cand
	for _, f := range frames {
		if skip[f.SKU] {
			continue
		}
		d := FitDeltaMm(head, f)
		if !FitsWidth(d) {
			continue
		}
		ranked = append(ranked, cand{f, d})
	}
	sort.SliceStable(ranked, func(i, j int) bool {
		si, sj := rankScore(ranked[i], head, sizeOnly), rankScore(ranked[j], head, sizeOnly)
		if si != sj {
			return si > sj
		}
		di, dj := abs(ranked[i].delta), abs(ranked[j].delta)
		if di != dj {
			return di < dj
		}
		return ranked[i].frame.SKU < ranked[j].frame.SKU
	})

	var out []Suggestion
	used := map[string]bool{}
	for _, c := range ranked {
		if used[c.frame.Shape] {
			continue
		}
		used[c.frame.Shape] = true
		out = append(out, suggest(c.frame, c.delta, head, band, sizeOnly, target))
		if len(out) == limit {
			return out
		}
	}
	for _, c := range ranked {
		if len(out) == limit {
			break
		}
		dup := false
		for _, s := range out {
			if s.Frame.SKU == c.frame.SKU {
				dup = true
			}
		}
		if !dup {
			out = append(out, suggest(c.frame, c.delta, head, band, sizeOnly, target))
		}
	}
	return out
}

func rankScore(c cand, head Head, sizeOnly bool) float64 {
	width := 100 - abs(c.delta)*8
	if sizeOnly {
		return width
	}
	return pairShapeScore(head.ShapeHint, c.frame.Shape)*0.5 + width*0.5
}

func suggest(f Frame, delta float64, head Head, band float64, sizeOnly bool, target float64) Suggestion {
	gap := fmt.Sprintf("%v", delta)
	if delta > 0 {
		gap = "+" + gap
	}
	reasons := []string{fmt.Sprintf(
		"Ширина оправы %v мм против %v мм на вашем лице, разница %s мм",
		TotalFrontWidthMm(f), target, gap,
	)}
	if !sizeOnly {
		ru, ok := shapeRU[f.Shape]
		if !ok {
			ru = f.Shape
		}
		face, ok := faceRU[head.ShapeHint]
		if !ok {
			face = "вашему лицу"
		}
		reasons = append(reasons, fmt.Sprintf("Форма %s взята как контраст к %s", ru, face))
	}
	if f.BridgeMm <= 21 {
		reasons = append(reasons, fmt.Sprintf("Мост %v мм ложится на переносицу без давления", f.BridgeMm))
	} else {
		reasons = append(reasons, fmt.Sprintf("Дужка %v мм", f.TempleMm))
	}
	return Suggestion{Frame: f, DeltaMm: delta, Band: band, Reasons: reasons, Shape: f.Shape}
}

func abs(v float64) float64 {
	if v < 0 {
		return -v
	}
	return v
}
