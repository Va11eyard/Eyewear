import * as THREE from "three";
import {
  depthMm,
  eyeCenterX,
  lensHeightMm,
  lensProfile,
  rimProfile,
  rimWidthMm,
} from "@/lib/frame-shapes";

export type RigFrame = {
  shape: string;
  color: string;
  material: string;
  lensWidthMm: number;
  bridgeMm: number;
  templeMm: number;
  model?: string;
  colors?: string[];
};

export function buildGlassesRig(frame: RigFrame): THREE.Group {
  const metal = frame.material === "metal";
  const rim = rimMaterial(frame);
  const glass = glassMaterial();
  const hardware = hardwareMaterial();
  const w = frame.lensWidthMm;
  const h = lensHeightMm(frame.shape, w);
  const rimW = rimWidthMm(frame.material);
  const depth = depthMm(frame.material);
  const cx = eyeCenterX(w, frame.bridgeMm);
  const group = new THREE.Group();
  addEye(group, -cx, w, h, rimW, depth, frame.shape, rim, glass, true);
  addEye(group, cx, w, h, rimW, depth, frame.shape, rim, glass, false);
  addBridge(group, frame.bridgeMm, h, rimW, depth, metal, rim);
  if (frame.shape === "browline") {
    addBrowBar(group, cx, w, h, rimW, depth, frame, rim);
  }
  if (metal) {
    addPads(group, cx, w, h, hardware);
  }
  addTemple(group, -cx - w / 2 - rimW * 0.2, -1, h, frame.templeMm, metal, rim, hardware);
  addTemple(group, cx + w / 2 + rimW * 0.2, 1, h, frame.templeMm, metal, rim, hardware);
  wrapFront(group, metal ? 260 : 220);
  group.rotation.x = 0.06;
  return group;
}

function addEye(
  group: THREE.Group,
  x: number,
  w: number,
  h: number,
  rimW: number,
  depth: number,
  shape: string,
  rim: THREE.Material,
  glass: THREE.Material,
  left: boolean,
) {
  const rimMesh = new THREE.Mesh(extrude(rimProfile(shape, w, h, rimW, left), depth), rim);
  rimMesh.position.set(x, 0, -depth * 0.35);
  rimMesh.userData.front = true;
  const lens = new THREE.Mesh(extrude(lensProfile(shape, w * 0.96, h * 0.94, left), 1.1), glass);
  lens.position.set(x, 0, 0.35);
  lens.userData.front = true;
  group.add(rimMesh, lens);
}

/** Browline reads as a heavy upper bar with a thin lower rim, so the bar is its own mesh. */
function addBrowBar(
  group: THREE.Group,
  cx: number,
  w: number,
  h: number,
  rimW: number,
  depth: number,
  frame: RigFrame,
  rim: THREE.Material,
) {
  const barH = h * 0.3;
  const bar = new THREE.Mesh(
    extrude(lensProfile("rect", w + rimW * 2, barH, true), depth * 1.35),
    rim,
  );
  bar.position.set(-cx, h / 2 + rimW * 0.45 - barH / 2, -depth * 0.45);
  bar.userData.front = true;
  const mirror = bar.clone();
  mirror.position.x = cx;
  group.add(bar, mirror);
}

function addBridge(
  group: THREE.Group,
  gap: number,
  h: number,
  rimW: number,
  depth: number,
  metal: boolean,
  rim: THREE.Material,
) {
  if (metal) {
    const geo = new THREE.TorusGeometry(Math.max(gap * 0.42, 5), depth * 0.22, 10, 24, Math.PI);
    const mesh = new THREE.Mesh(geo, rim);
    mesh.rotation.set(Math.PI / 2, 0, 0);
    mesh.position.set(0, h * 0.12, 0);
    mesh.userData.front = true;
    group.add(mesh);
    return;
  }
  // An acetate bridge is a solid saddle that carries the rim's own thickness,
  // not a strut. A thin box here reads instantly as a synthetic model.
  const wB = gap + rimW * 1.2;
  const hB = h * 0.26;
  const mesh = new THREE.Mesh(extrude(lensProfile("rect", wB, hB, true), depth), rim);
  mesh.position.set(0, h / 2 + rimW * 0.3 - hB / 2, -depth * 0.35);
  mesh.userData.front = true;
  group.add(mesh);
}

function addPads(group: THREE.Group, cx: number, w: number, h: number, mat: THREE.Material) {
  const silicone = new THREE.MeshPhysicalMaterial({
    color: 0xe6e1d8,
    roughness: 0.62,
    metalness: 0,
    sheen: 0.2,
  });
  [-1, 1].forEach((side) => {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 6.5, 8), mat);
    arm.rotation.z = side * 0.55;
    arm.position.set(side * (cx - w * 0.28), -h * 0.18, 2.2);
    const pad = new THREE.Mesh(new THREE.SphereGeometry(2.15, 12, 10), silicone);
    pad.scale.set(1, 0.72, 0.55);
    pad.position.set(side * (cx - w * 0.22), -h * 0.28, 3.4);
    group.add(arm, pad);
  });
}

function addTemple(
  group: THREE.Group,
  x: number,
  dir: number,
  h: number,
  length: number,
  metal: boolean,
  rim: THREE.Material,
  hardware: THREE.Material,
) {
  const len = Math.min(length, 150);
  // A real temple runs back roughly level with the rim and only drops in the
  // last quarter, where it hooks over the ear. Rising along the way reads as
  // antennae, which is the fastest tell that a frame is synthetic.
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(x, h * 0.26, 0.6),
    new THREE.Vector3(x + dir * 1.2, h * 0.2, -len * 0.3),
    new THREE.Vector3(x + dir * 2.4, h * 0.1, -len * 0.62),
    new THREE.Vector3(x + dir * 3.6, -h * 0.08, -len * 0.86),
    new THREE.Vector3(x + dir * 4.2, -h * 0.42, -len * 0.98),
  ]);
  const temple = new THREE.Mesh(metal ? wireTemple(path) : flatTemple(path), rim);
  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, metal ? 4.2 : 6.2, 12), hardware);
  hinge.rotation.x = Math.PI / 2;
  hinge.position.set(x, h * 0.26, 0.4);
  group.add(temple, hinge);
}

/** Acetate temples are a flat band about 4 by 2 mm, not a rod. */
function flatTemple(path: THREE.Curve<THREE.Vector3>): THREE.ExtrudeGeometry {
  const w = 3.9;
  const t = 1.9;
  const r = 0.75;
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -t / 2);
  s.lineTo(w / 2 - r, -t / 2);
  s.quadraticCurveTo(w / 2, -t / 2, w / 2, -t / 2 + r);
  s.lineTo(w / 2, t / 2 - r);
  s.quadraticCurveTo(w / 2, t / 2, w / 2 - r, t / 2);
  s.lineTo(-w / 2 + r, t / 2);
  s.quadraticCurveTo(-w / 2, t / 2, -w / 2, t / 2 - r);
  s.lineTo(-w / 2, -t / 2 + r);
  s.quadraticCurveTo(-w / 2, -t / 2, -w / 2 + r, -t / 2);
  return new THREE.ExtrudeGeometry(s, { extrudePath: path, steps: 64, bevelEnabled: false });
}

function wireTemple(path: THREE.Curve<THREE.Vector3>): THREE.TubeGeometry {
  return new THREE.TubeGeometry(path as THREE.CatmullRomCurve3, 48, 1.05, 10, false);
}

function wrapFront(group: THREE.Group, radius: number) {
  group.updateMatrixWorld(true);
  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.userData.front || !mesh.geometry?.attributes.position) {
      return;
    }
    mesh.updateMatrix();
    const pos = mesh.geometry.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i += 1) {
      v.fromBufferAttribute(pos, i);
      v.applyMatrix4(mesh.matrix);
      pos.setZ(i, pos.getZ(i) + (v.x * v.x) / (2 * radius));
    }
    pos.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
  });
}

function extrude(shape: THREE.Shape, depth: number): THREE.ExtrudeGeometry {
  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.55,
    bevelSize: 0.4,
    bevelSegments: 3,
    curveSegments: 36,
  });
}

function rimMaterial(frame: RigFrame): THREE.MeshPhysicalMaterial {
  const metal = frame.material === "metal";
  const map = acetateMap(frame.color);
  return new THREE.MeshPhysicalMaterial({
    color: map ? 0xffffff : rimColor(frame.color),
    map,
    metalness: metal ? 0.98 : 0.04,
    roughness: metal ? 0.17 : 0.28,
    clearcoat: metal ? 0.55 : 1,
    clearcoatRoughness: metal ? 0.12 : 0.18,
    sheen: metal ? 0 : 0.55,
    sheenRoughness: 0.4,
    sheenColor: new THREE.Color(rimColor(frame.color)),
    envMapIntensity: metal ? 2.0 : 0.9,
  });
}

function glassMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.02,
    transparent: true,
    opacity: 0.14,
    ior: 1.52,
    envMapIntensity: 2.6,
    specularIntensity: 1,
    side: THREE.DoubleSide,
  });
}

function hardwareMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: 0xb9b4ac,
    metalness: 0.95,
    roughness: 0.22,
    envMapIntensity: 1.4,
  });
}

function acetateMap(color: string): THREE.CanvasTexture | null {
  if (typeof document === "undefined" || (color !== "tortoise" && color !== "horn")) {
    return null;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }
  ctx.fillStyle = color === "horn" ? "#3a2a1c" : "#5c3318";
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 26; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? "rgba(22,12,5,0.72)" : "rgba(214,150,62,0.55)";
    ctx.beginPath();
    ctx.ellipse(Math.random() * 256, Math.random() * 256, 18 + Math.random() * 46, 7 + Math.random() * 24, Math.random(), 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1.15, 1.15);
  return tex;
}

const RIM_COLORS: Record<string, number> = {
  black: 0x161310,
  gold: 0xe3b56b,
  silver: 0xd0cbc3,
  gunmetal: 0x4a5058,
  tortoise: 0x7a4a28,
  horn: 0x4a3428,
  burgundy: 0x6b1c28,
  grey: 0x6e6b67,
  clear: 0xe0dacc,
  crystal: 0xb8b2a8,
  olive: 0x5a5c38,
};

function rimColor(color: string): number {
  return RIM_COLORS[color] ?? 0x161310;
}
