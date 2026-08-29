package catalog

import "github.com/frame/eyewear/internal/fit"

const khronos = "/models/sunglasses-khronos.glb"

var atelierColors = []string{"black", "gold", "tortoise", "burgundy", "silver", "horn"}

func Frames() []fit.Frame {
	return []fit.Frame{
		{SKU: "FR-RECT-50", Name: "Atelier Rect", Brand: "FRAME", Shape: "rect", Material: "acetate", Color: "black", LensWidthMm: 50, BridgeMm: 22, TempleMm: 150, Model: khronos, Colors: atelierColors},
		{SKU: "FR-OVAL-58", Name: "Atelier Oval", Brand: "FRAME", Shape: "oval", Material: "metal", Color: "gold", LensWidthMm: 58, BridgeMm: 14, TempleMm: 135, Model: khronos, Colors: atelierColors},
		{SKU: "FR-RECT-54", Name: "Atelier Link", Brand: "FRAME", Shape: "rect", Material: "combo", Color: "grey", LensWidthMm: 54, BridgeMm: 17, TempleMm: 138, Model: khronos, Colors: atelierColors},
		{SKU: "FR-OVAL-54", Name: "Atelier Tortoise", Brand: "FRAME", Shape: "oval", Material: "acetate", Color: "tortoise", LensWidthMm: 54, BridgeMm: 20, TempleMm: 145, Model: khronos, Colors: atelierColors},
		{SKU: "FR-ROUND-47", Name: "Atelier Round", Brand: "FRAME", Shape: "round", Material: "acetate", Color: "horn", LensWidthMm: 47, BridgeMm: 22, TempleMm: 145, Model: khronos, Colors: atelierColors},
		{SKU: "FR-ROUND-46", Name: "Atelier Circle", Brand: "FRAME", Shape: "round", Material: "acetate", Color: "black", LensWidthMm: 46, BridgeMm: 24, TempleMm: 145, Model: khronos, Colors: atelierColors},
		{SKU: "FR-RECT-51", Name: "Atelier Wire", Brand: "FRAME", Shape: "rect", Material: "metal", Color: "silver", LensWidthMm: 51, BridgeMm: 17, TempleMm: 135, Model: khronos, Colors: atelierColors},
		{SKU: "FR-CAT-52", Name: "Atelier Cat", Brand: "FRAME", Shape: "cat", Material: "acetate", Color: "burgundy", LensWidthMm: 52, BridgeMm: 17, TempleMm: 140, Model: khronos, Colors: atelierColors},
	}
}
