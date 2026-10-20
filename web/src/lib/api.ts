import { LEGACY_FRAMES } from "@/lib/frames";
import { decodeImage, measure, rank, validateImage, type Head, type Landmark, type Match } from "@/lib/fit-engine";
import { nearbyOptics, type Shop } from "@/lib/optics-local";

export type { Head, Match, Shop };

/**
 * null means compute on-device. The literal value "origin" means call the
 * same-origin /v1 routes, which is how the combined Docker image reaches its
 * own Go API through Caddy. An empty variable is genuinely unset, so the two
 * cases can no longer be confused.
 */
export function apiBase(): string | null {
  const v = process.env.NEXT_PUBLIC_API_URL;
  if (!v) {
    return null;
  }
  return v === "origin" ? "" : v;
}

function asLandmarks(landmarks: unknown): Landmark[] {
  if (!Array.isArray(landmarks)) {
    return [];
  }
  return landmarks.map((row) => {
    const p = row as { index?: number; x?: number; y?: number; z?: number };
    return { index: p.index ?? 0, x: p.x ?? 0, y: p.y ?? 0, z: p.z ?? 0 };
  });
}

async function remoteFit(
  imageBase64: string,
  landmarks: unknown,
  base: string,
): Promise<{ head: Head; matches: Match[] }> {
  const res = await fetch(`${base}/v1/fit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64, landmarks }),
  });
  const body = (await res.json()) as { error?: string; head: Head; matches: Match[] };
  if (!res.ok) {
    throw new Error(body.error ?? "fit_failed");
  }
  return body;
}

export async function postFit(imageBase64: string, landmarks: unknown): Promise<{ head: Head; matches: Match[] }> {
  const base = apiBase();
  if (base !== null) {
    return remoteFit(imageBase64, landmarks, base);
  }
  const img = decodeImage(imageBase64);
  validateImage(img);
  const head = measure(asLandmarks(landmarks));
  return { head, matches: rank(head, LEGACY_FRAMES) };
}

export async function getOptics(lat: number, lng: number): Promise<Shop[]> {
  const base = apiBase();
  if (base !== null) {
    const res = await fetch(`${base}/v1/optics?lat=${lat}&lng=${lng}`);
    const body = (await res.json()) as { error?: string; shops: Shop[] };
    if (!res.ok) {
      throw new Error(body.error ?? "optics_failed");
    }
    return body.shops ?? [];
  }
  return nearbyOptics(lat, lng);
}
