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

// ShapeCall agrees the independent cues that reached the same class. The count
// is not a probability; it only says how much of the mesh backed the verdict.
func ShapeCall(idx map[int]Landmark, widthMm, heightMm float64, fromIris bool) (string, int) {
	shape := shapeFromRatio(widthMm, heightMm)
	agreed := 0
	fore, okF := span(idx, idxForeheadL, idxForeheadR)
	jaw, okJ := span(idx, idxJawL, idxJawR)
	cheek, okC := span(idx, idxLeftCheek, idxRightCheek)
	if okF && okJ && okC && cheek > 0 {
		shape = fromProportions(fore/cheek, jaw/cheek, widthMm, heightMm)
		agreed++
		if shape == shapeFromRatio(widthMm, heightMm) {
			agreed++
		}
	}
	if okF {
		agreed++
	}
	if okJ {
		agreed++
	}
	if fromIris {
		agreed++
	}
	if agreed > 5 {
		agreed = 5
	}
	return shape, agreed
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
	"round":   {"rect", "square", "browline", "cat"},
	"square":  {"round", "panto", "aviator", "cat"},
	"oval":    {"rect", "cat", "panto", "browline", "round", "aviator", "square"},
	"heart":   {"round", "panto", "cat", "aviator"},
	"diamond": {"cat", "browline", "round", "panto"},
	"oblong":  {"panto", "round", "aviator", "square"},
}
