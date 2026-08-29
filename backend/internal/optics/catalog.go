package optics

import (
	_ "embed"
	"encoding/json"
	"math"
	"sort"
	"strconv"
)

//go:embed odos_optics.json
var odosOpticsJSON []byte

type catalogRow struct {
	ID      int64    `json:"id"`
	Name    string   `json:"name"`
	Address string   `json:"address"`
	Phone   string   `json:"phone"`
	Lat     float64  `json:"lat"`
	Lng     float64  `json:"lng"`
	City    string   `json:"city"`
	Rating  *float64 `json:"rating"`
	URL     string   `json:"url"`
}

type Catalog struct {
	shops []Shop
}

func NewCatalog() *Catalog {
	var rows []catalogRow
	if err := json.Unmarshal(odosOpticsJSON, &rows); err != nil {
		return &Catalog{}
	}
	shops := make([]Shop, 0, len(rows))
	for _, row := range rows {
		rating := 0.0
		if row.Rating != nil {
			rating = *row.Rating
		}
		shops = append(shops, Shop{
			ID:      strconv.FormatInt(row.ID, 10),
			Name:    row.Name,
			Lat:     row.Lat,
			Lng:     row.Lng,
			Address: row.Address,
			Phone:   row.Phone,
			Rating:  rating,
			MapURL:  row.URL,
			Source:  "2gis",
		})
	}
	return &Catalog{shops: shops}
}

func (c *Catalog) Nearby(lat, lng float64) ([]Shop, error) {
	ranked := make([]Shop, len(c.shops))
	copy(ranked, c.shops)
	for i := range ranked {
		ranked[i].Km = math.Round(haversineKm(lat, lng, ranked[i].Lat, ranked[i].Lng)*10) / 10
	}
	sort.Slice(ranked, func(i, j int) bool {
		return ranked[i].Km < ranked[j].Km
	})
	if len(ranked) > 24 {
		ranked = ranked[:24]
	}
	return ranked, nil
}

func haversineKm(aLat, aLng, bLat, bLng float64) float64 {
	const r = 6371.0
	dLat := (bLat - aLat) * math.Pi / 180
	dLng := (bLng - aLng) * math.Pi / 180
	lat1 := aLat * math.Pi / 180
	lat2 := bLat * math.Pi / 180
	h := math.Sin(dLat/2)*math.Sin(dLat/2) + math.Cos(lat1)*math.Cos(lat2)*math.Sin(dLng/2)*math.Sin(dLng/2)
	return 2 * r * math.Asin(math.Min(1, math.Sqrt(h)))
}
