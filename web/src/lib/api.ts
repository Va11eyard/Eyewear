export type Head = {
  ipdMm: number;
  faceWidthMm: number;
  faceHeightMm: number;
  shapeHint: string;
  sizeHint: string;
};

export type Match = {
  frame: {
    sku: string;
    name: string;
    brand: string;
    shape: string;
    material: string;
    color: string;
    lensWidthMm: number;
    bridgeMm: number;
    templeMm: number;
    model?: string;
    colors?: string[];
  };
  score: number;
  breakdown: { shape: number; size: number; geometry: number; material: number };
};

export type Shop = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  hours?: string;
  phone?: string;
  rating?: number;
  mapUrl?: string;
  km?: number;
  source: string;
};

export function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9000";
}

export async function postFit(imageBase64: string, landmarks: unknown): Promise<{ head: Head; matches: Match[] }> {
  const res = await fetch(`${apiBase()}/v1/fit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64, landmarks }),
  });
  const body = await res.json() as { error?: string; head: Head; matches: Match[] };
  if (!res.ok) {
    throw new Error(body.error ?? "fit_failed");
  }
  return body;
}

export async function getOptics(lat: number, lng: number): Promise<Shop[]> {
  const res = await fetch(`${apiBase()}/v1/optics?lat=${lat}&lng=${lng}`);
  const body = await res.json() as { error?: string; shops: Shop[] };
  if (!res.ok) {
    throw new Error(body.error ?? "optics_failed");
  }
  return body.shops ?? [];
}
