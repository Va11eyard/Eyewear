package fit

const (
	idxForeheadL = 54
	idxForeheadR = 284
	idxJawL      = 172
	idxJawR      = 397
)

func classifyFace(idx map[int]Landmark, widthMm, heightMm float64) string {
	fallback := shapeFromRatio(widthMm, heightMm)
	fore, okF := span(idx, idxForeheadL, idxForeheadR)
	jaw, okJ := span(idx, idxJawL, idxJawR)
	cheek, okC := span(idx, idxLeftCheek, idxRightCheek)
	if !okF || !okJ || !okC || cheek <= 0 {
		return fallback
	}
	return fromProportions(fore/cheek, jaw/cheek, widthMm, heightMm)
}

func span(idx map[int]Landmark, a, b int) (float64, bool) {
	la, okA := idx[a]
	lb, okB := idx[b]
	if !okA || !okB {
		return 0, false
	}
	return dist(la, lb), true
}

func fromProportions(foreCheek, jawCheek, widthMm, heightMm float64) string {
	wh := 0.0
	if heightMm > 0 {
		wh = widthMm / heightMm
	}
	if foreCheek > 1.12 && jawCheek < 0.86 {
		return "heart"
	}
	if foreCheek < 0.9 && jawCheek < 0.86 {
		return "diamond"
	}
	if wh >= 0.95 && jawCheek >= 0.9 {
		if foreCheek >= 0.92 {
			return "square"
		}
		return "round"
	}
	if wh <= 0.72 {
		return "oblong"
	}
	return "oval"
}

func pairShapeScore(face, frame string) float64 {
	if face == "rect" {
		face = "oblong"
	}
	ranked := bestFrames[face]
	for i, shape := range ranked {
		if shape == frame {
			if i == 0 {
				return 96
			}
			return 84
		}
	}
	if face == "oval" {
		return 78
	}
	return 46
}

var bestFrames = map[string][]string{
	"round":   {"rect", "square", "cat"},
	"square":  {"round", "oval", "cat"},
	"oval":    {"rect", "cat", "square", "round", "oval"},
	"heart":   {"oval", "round", "cat"},
	"diamond": {"oval", "cat", "round"},
	"oblong":  {"round", "oval", "cat"},
}
