"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { type RigFrame } from "@/lib/glasses-rig";
import { instantiateGlasses } from "@/lib/try-on-model";
import { cacheGet, cacheSet, thumbKey } from "@/lib/thumb-cache";

const W = 320;
const H = 200;

let shared: { renderer: THREE.WebGLRenderer; pmrem: THREE.PMREMGenerator } | null = null;
let failed = false;

function ensure(): { renderer: THREE.WebGLRenderer; pmrem: THREE.PMREMGenerator } | null {
  if (typeof document === "undefined" || failed) {
    return null;
  }
  if (shared) {
    return shared;
  }
  try {
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(W, H, false);
    renderer.setPixelRatio(Math.min(2, typeof window === "undefined" ? 1 : window.devicePixelRatio));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setClearColor(0x000000, 0);
    shared = { renderer, pmrem: new THREE.PMREMGenerator(renderer) };
    return shared;
  } catch {
    failed = true;
    return null;
  }
}

/** One product shot of the exact mesh the try-on puts on a face. */
export async function renderThumb(frame: RigFrame, color: string): Promise<string | null> {
  const ctx = ensure();
  if (!ctx) {
    return null;
  }
  const scene = new THREE.Scene();
  const env = ctx.pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = env.texture;
  scene.environmentIntensity = 1.15;
  scene.add(new THREE.HemisphereLight(0xfff4e8, 0x1c1814, 0.55));
  const key = new THREE.DirectionalLight(0xfff7ef, 1.15);
  key.position.set(-70, -90, 240);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xcfe4ff, 0.65);
  rim.position.set(140, 40, 70);
  scene.add(rim);

  let group: THREE.Group;
  try {
    group = await instantiateGlasses({ ...frame, color });
  } catch {
    env.dispose();
    return null;
  }
  scene.add(group);

  const box = new THREE.Box3().setFromObject(group);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const half = Math.max(size.x, (size.y * W) / H) * 0.62 || 40;
  const depth = Math.max(400, size.z * 6);
  const cam = new THREE.OrthographicCamera(
    center.x - half,
    center.x + half,
    center.y + (half * H) / W,
    center.y - (half * H) / W,
    -depth,
    depth,
  );
  ctx.renderer.render(scene, cam);
  const url = ctx.renderer.domElement.toDataURL("image/png");
  env.dispose();
  return url;
}

export function FrameThumb({
  frame,
  color,
  className = "",
  label,
}: {
  frame: RigFrame & { sku: string };
  color?: string;
  className?: string;
  label?: string;
}) {
  const tint = color ?? frame.color;
  const key = thumbKey({ sku: frame.sku }, tint);
  const [src, setSrc] = useState<string | null>(() => cacheGet(key));

  useEffect(() => {
    let alive = true;
    void Promise.resolve(cacheGet(key))
      .then((hit) => hit ?? renderThumb(frame, tint))
      .then((url) => {
        if (!alive || !url) {
          return;
        }
        cacheSet(key, url);
        setSrc(url);
      });
    return () => {
      alive = false;
    };
  }, [frame, key, tint]);

  if (!src) {
    return (
      <div
        className={`flex items-center justify-center border border-line text-[10px] text-mute ${className}`}
        style={{ minHeight: 88 }}
      >
        <span className="measured">{label ?? `${frame.lensWidthMm}-${frame.bridgeMm}-${frame.templeMm}`}</span>
      </div>
    );
  }
  // Decorative product shot generated at runtime as a data URL, so it is a
  // background rather than an <img>: no alt text is meaningful and next/image
  // has nothing to optimise.
  return (
    <div
      aria-hidden="true"
      className={`aspect-[8/5] w-full bg-contain bg-center bg-no-repeat ${className}`}
      style={{ backgroundImage: `url(${src})` }}
    />
  );
}
