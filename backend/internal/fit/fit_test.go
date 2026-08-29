package fit

import (
	"bytes"
	"testing"
)

func faceLandmarks() []Landmark {
	return []Landmark{
		{Index: 133, X: 0.38, Y: 0.42},
		{Index: 362, X: 0.62, Y: 0.42},
		{Index: 234, X: 0.22, Y: 0.52},
		{Index: 454, X: 0.78, Y: 0.52},
		{Index: 10, X: 0.50, Y: 0.18},
		{Index: 152, X: 0.50, Y: 0.88},
		{Index: 468, X: 0.36, Y: 0.42},
		{Index: 469, X: 0.382, Y: 0.42},
	}
}

func TestMeasure_EmptyLandmarks(t *testing.T) {
	_, err := Measure(nil)
	if err != ErrNoFace {
		t.Fatalf("got %v want ErrNoFace", err)
	}
}

func TestMeasure_MissingEyeCorners(t *testing.T) {
	_, err := Measure([]Landmark{{Index: 1, X: 0.1, Y: 0.1}})
	if err != ErrNoFace {
		t.Fatalf("got %v want ErrNoFace", err)
	}
}

func TestMeasure_TinyIPDTreatedAsNoFace(t *testing.T) {
	_, err := Measure([]Landmark{
		{Index: 133, X: 0.5, Y: 0.5},
		{Index: 362, X: 0.501, Y: 0.5},
	})
	if err != ErrNoFace {
		t.Fatalf("got %v want ErrNoFace", err)
	}
}

func TestMeasure_ReturnsHeadParameters(t *testing.T) {
	h, err := Measure(faceLandmarks())
	if err != nil {
		t.Fatal(err)
	}
	if h.IPDMm <= 0 || h.FaceWidthMm <= 0 || h.FaceHeightMm <= 0 {
		t.Fatalf("expected positive mm values %#v", h)
	}
	if h.ShapeHint == "" || h.SizeHint == "" {
		t.Fatalf("expected hints %#v", h)
	}
}

func TestValidateImage_RejectsEmptyAndGarbage(t *testing.T) {
	if err := ValidateImage(nil); err != ErrInvalidImage {
		t.Fatalf("empty: %v", err)
	}
	if err := ValidateImage([]byte("not-an-image")); err != ErrInvalidImage {
		t.Fatalf("garbage: %v", err)
	}
}

func TestValidateImage_RejectsOversized(t *testing.T) {
	data := bytes.Repeat([]byte{0xff, 0xd8, 0xff, 0x00}, (MaxImageBytes/4)+4)
	if err := ValidateImage(data); err != ErrImageTooLarge {
		t.Fatalf("got %v want ErrImageTooLarge", err)
	}
}

func TestValidateImage_AcceptsJPEGAndPNG(t *testing.T) {
	jpeg := []byte{0xff, 0xd8, 0xff, 0xe0, 0x00}
	png := []byte{0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00}
	if err := ValidateImage(jpeg); err != nil {
		t.Fatal(err)
	}
	if err := ValidateImage(png); err != nil {
		t.Fatal(err)
	}
}

func TestRank_EmptyCatalog(t *testing.T) {
	h, err := Measure(faceLandmarks())
	if err != nil {
		t.Fatal(err)
	}
	if got := Rank(h, nil); len(got) != 0 {
		t.Fatalf("expected no matches, got %d", len(got))
	}
}

func TestRank_PrefersGeometryFit(t *testing.T) {
	h, err := Measure(faceLandmarks())
	if err != nil {
		t.Fatal(err)
	}
	closeFit := Frame{SKU: "A", Name: "Close", Shape: h.ShapeHint, LensWidthMm: targetLens(h), BridgeMm: 18}
	farFit := Frame{SKU: "B", Name: "Far", Shape: "cat", LensWidthMm: 40, BridgeMm: 28}
	got := Rank(h, []Frame{farFit, closeFit})
	if len(got) != 2 {
		t.Fatalf("len %d", len(got))
	}
	if got[0].Frame.SKU != "A" {
		t.Fatalf("expected closer frame first, got %s score=%v vs %v", got[0].Frame.SKU, got[0].Score, got[1].Score)
	}
	if got[0].Breakdown.Shape == 0 || got[0].Breakdown.Size == 0 {
		t.Fatalf("missing breakdown %#v", got[0].Breakdown)
	}
	contrast := ScoreFrame(h, Frame{SKU: "C", Shape: "cat", LensWidthMm: targetLens(h), BridgeMm: 18})
	if contrast.Breakdown.Shape < 80 {
		t.Fatalf("optician pairing should still score listed shapes, got %v", contrast.Breakdown.Shape)
	}
}

func TestShapeAndSizeHints(t *testing.T) {
	if shapeFromRatio(140, 140) != "round" {
		t.Fatal("square-ish face should hint round")
	}
	if shapeFromRatio(100, 160) != "rect" {
		t.Fatal("long face should hint rect")
	}
	if sizeFromWidth(110) != "sm" || sizeFromWidth(160) != "lg" {
		t.Fatal("size bands")
	}
	if sizeFromWidth(130) != "md" {
		t.Fatal("md band")
	}
	if shapeFromRatio(120, 140) != "oval" {
		t.Fatal("oval hint")
	}
	if shapeFromRatio(10, 0) != "oval" {
		t.Fatal("zero height")
	}
	if pairShapeScore("round", "rect") != 96 {
		t.Fatal("round faces want angular frames")
	}
	if pairShapeScore("round", "round") >= pairShapeScore("round", "rect") {
		t.Fatal("same-shape pairing is not physiognomy")
	}
}

func TestMeasure_MeanScaleWithoutIris(t *testing.T) {
	h, err := Measure([]Landmark{
		{Index: 133, X: 0.40, Y: 0.40},
		{Index: 362, X: 0.63, Y: 0.40},
	})
	if err != nil {
		t.Fatal(err)
	}
	if h.IPDMm != 63 {
		t.Fatalf("mean-scale IPD got %v", h.IPDMm)
	}
}

func TestMeasure_IrisScaleInsideHumanRange(t *testing.T) {
	h, err := Measure([]Landmark{
		{Index: 133, X: 0.38, Y: 0.42},
		{Index: 362, X: 0.62, Y: 0.42},
		{Index: 468, X: 0.36, Y: 0.42},
		{Index: 469, X: 0.380, Y: 0.42},
	})
	if err != nil {
		t.Fatal(err)
	}
	if h.IPDMm == 63 {
		t.Fatal("iris scale should leave the population mean")
	}
	if h.IPDMm < 48 || h.IPDMm > 78 {
		t.Fatalf("ipd out of range %v", h.IPDMm)
	}
}

func TestMeasure_IrisOutOfRangeFallsBack(t *testing.T) {
	h, err := Measure([]Landmark{
		{Index: 133, X: 0.38, Y: 0.42},
		{Index: 362, X: 0.62, Y: 0.42},
		{Index: 468, X: 0.36, Y: 0.42},
		{Index: 469, X: 0.361, Y: 0.42},
	})
	if err != nil {
		t.Fatal(err)
	}
	if h.IPDMm != 63 {
		t.Fatalf("expected fallback 63, got %v", h.IPDMm)
	}
}

func TestShapeSizeBoundaries(t *testing.T) {
	if shapeFromRatio(0.95, 1) != "round" || shapeFromRatio(0.94, 1) != "oval" {
		t.Fatal("round boundary")
	}
	if shapeFromRatio(0.72, 1) != "rect" || shapeFromRatio(0.73, 1) != "oval" {
		t.Fatal("rect boundary")
	}
	if sizeFromWidth(124.9) != "sm" || sizeFromWidth(125) != "md" {
		t.Fatal("sm boundary")
	}
	if sizeFromWidth(145) != "md" || sizeFromWidth(145.1) != "lg" {
		t.Fatal("lg boundary")
	}
}

func TestIPDBoundary(t *testing.T) {
	_, err := Measure([]Landmark{
		{Index: 133, X: 0.50, Y: 0.50},
		{Index: 362, X: 0.52, Y: 0.50},
	})
	if err != nil {
		t.Fatal(err)
	}
	_, err = Measure([]Landmark{
		{Index: 133, X: 0.50, Y: 0.50},
		{Index: 362, X: 0.519, Y: 0.50},
	})
	if err != ErrNoFace {
		t.Fatalf("just under 0.02 should be no face, got %v", err)
	}
}

func TestScoreWeights(t *testing.T) {
	head := Head{FaceWidthMm: 130, ShapeHint: "round", SizeHint: "md"}
	m := ScoreFrame(head, Frame{Shape: "rect", LensWidthMm: targetLens(head), BridgeMm: 18})
	if m.Breakdown.Shape != 96 || m.Breakdown.Material != 82 {
		t.Fatalf("%#v", m.Breakdown)
	}
	if m.Score != 98.6 {
		t.Fatalf("perfect score %v", m.Score)
	}
	low := ScoreFrame(head, Frame{Shape: "round", LensWidthMm: 40, BridgeMm: 30})
	if low.Score >= m.Score {
		t.Fatal("mismatch should score lower")
	}
}

func TestClassifyHeartAndDiamond(t *testing.T) {
	idx := byIndex([]Landmark{
		{Index: 54, X: 0.18, Y: 0.28},
		{Index: 284, X: 0.82, Y: 0.28},
		{Index: 234, X: 0.28, Y: 0.48},
		{Index: 454, X: 0.72, Y: 0.48},
		{Index: 172, X: 0.38, Y: 0.78},
		{Index: 397, X: 0.62, Y: 0.78},
	})
	if classifyFace(idx, 130, 150) != "heart" {
		t.Fatalf("got %s", classifyFace(idx, 130, 150))
	}
	wideCheek := byIndex([]Landmark{
		{Index: 54, X: 0.32, Y: 0.28},
		{Index: 284, X: 0.68, Y: 0.28},
		{Index: 234, X: 0.18, Y: 0.48},
		{Index: 454, X: 0.82, Y: 0.48},
		{Index: 172, X: 0.36, Y: 0.78},
		{Index: 397, X: 0.64, Y: 0.78},
	})
	if classifyFace(wideCheek, 120, 150) != "diamond" {
		t.Fatalf("got %s", classifyFace(wideCheek, 120, 150))
	}
}

func TestMeasure_FallbacksWithoutCheeks(t *testing.T) {
	h, err := Measure([]Landmark{
		{Index: 133, X: 0.40, Y: 0.40},
		{Index: 362, X: 0.60, Y: 0.40},
	})
	if err != nil {
		t.Fatal(err)
	}
	if h.FaceWidthMm != 138.6 {
		t.Fatalf("width fallback got %v", h.FaceWidthMm)
	}
	if h.FaceHeightMm != 176.4 {
		t.Fatalf("height fallback got %v", h.FaceHeightMm)
	}
}

func TestFromProportionsBands(t *testing.T) {
	if fromProportions(0.95, 0.95, 140, 140) != "square" {
		t.Fatal("equal thirds should read square")
	}
	if fromProportions(0.8, 0.95, 140, 140) != "round" {
		t.Fatal("softer forehead should read round")
	}
	if fromProportions(1, 1, 100, 160) != "oblong" {
		t.Fatal("long face")
	}
	if pairShapeScore("square", "rect") != 46 {
		t.Fatal("unlisted pairing")
	}
	if pairShapeScore("oval", "hex") != 78 {
		t.Fatal("oval is versatile")
	}
}
