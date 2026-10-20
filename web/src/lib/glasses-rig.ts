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
  addBridge(group, frame.bridgeMm, h, depth, metal, rim);
  if (frame.shape === "browline") {
    addBrowBar(group, cx, w, h, rimW, depth, frame, rim);
  }
  if (metal) {
    addPads(group, cx, w, h, hardware);
  }
  addTemple(group, -cx - w / 2 - rimW * 0.2, -1, frame.templeMm, metal, rim, hardware);
  addTemple(group, cx + w / 2 + rimW * 0.2, 1, frame.templeMm, metal, rim, hardware);
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
  const bar = new THREE.Mesh(
    extrude(rimProfile(frame.shape, w, h, rimW, true), depth * 1.5),
    rim,
  );
  bar.position.set(-cx, 0, -depth * 0.5);
  bar.scale.y = 0.42;
  bar.position.y = h * 0.36;
  bar.userData.front = true;
  const mirror = bar.clone();
  mirror.position.x = cx;
  group.add(bar, mirror);
}

function addBridge(
  group: THREE.Group,
  gap: number,
  h: number,
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
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(Math.max(gap - 1, 6), depth * 0.55, depth * 0.85), rim);
  mesh.position.set(0, h * 0.18, -0.4);
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
  length: number,
  metal: boolean,
  rim: THREE.Material,
  hardware: THREE.Material,
) {
  const len = Math.min(length, 150);
  const radius = metal ? 1.05 : 2.15;
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(x, 1.2, 1),
    new THREE.Vector3(x + dir * 3, 3.5, -len * 0.28),
    new THREE.Vector3(x + dir * 4, 9, -len * 0.58),
    new THREE.Vector3(x + dir * 1.5, 18, -len * 0.88),
  ]);
  const temple = new THREE.Mesh(new THREE.TubeGeometry(path, 24, radius, 10, false), rim);
  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, metal ? 4.2 : 6.2, 12), hardware);
  hinge.rotation.x = Math.PI / 2;
  hinge.position.set(x, 1.4, 0.6);
  group.add(temple, hinge);
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
    metalness: metal ? 0.96 : 0.04,
    roughness: metal ? 0.12 : 0.28,
    clearcoat: metal ? 0.55 : 1,
    clearcoatRoughness: metal ? 0.12 : 0.18,
    sheen: metal ? 0 : 0.55,
    sheenRoughness: 0.4,
    sheenColor: new THREE.Color(rimColor(frame.color)),
    envMapIntensity: metal ? 1.6 : 0.85,
  });
}

function glassMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: 0xd7eaf5,
    metalness: 0,
    roughness: 0.02,
    transmission: 0.96,
    thickness: 1.8,
    ior: 1.52,
    transparent: true,
    opacity: 1,
    envMapIntensity: 1.8,
    specularIntensity: 1,
    iridescence: 0.12,
    iridescenceIOR: 1.3,
    attenuationColor: new THREE.Color(0x9ec4de),
    attenuationDistance: 8,
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
  for (let i = 0; i < 48; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? "rgba(28,16,8,0.55)" : "rgba(196,132,48,0.4)";
    ctx.beginPath();
    ctx.ellipse(Math.random() * 256, Math.random() * 256, 8 + Math.random() * 28, 4 + Math.random() * 16, Math.random(), 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.4, 2.4);
  return tex;
}

const RIM_COLORS: Record<string, number> = {
  black: 0x161310,
  gold: 0xc9a66b,
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
