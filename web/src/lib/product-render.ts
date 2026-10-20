import * as THREE from "three";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { publicAsset } from "@/lib/public-asset";

/**
 * One WebGL context and one environment, shared by catalogue thumbnails, the
 * frame picker and the render lab. A glossy acetate frame is almost entirely a
 * reflection story, so the environment matters more than the geometry, and
 * building it per call would leak GPU memory on a catalogue page.
 */
type Studio = {
  renderer: THREE.WebGLRenderer;
  pmrem: THREE.PMREMGenerator;
  env: THREE.Texture | null;
  envKey: string;
};

let studio: Studio | null = null;
let unsupported = false;

export function studioSupported(): boolean {
  return !unsupported && typeof document !== "undefined";
}

function baseRenderer(): Studio | null {
  if (studio) {
    return studio;
  }
  if (!studioSupported()) {
    return null;
  }
  try {
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);
    studio = { renderer, pmrem: new THREE.PMREMGenerator(renderer), env: null, envKey: "" };
    return studio;
  } catch {
    unsupported = true;
    return null;
  }
}

export async function loadEnvironment(hdrPath: string): Promise<THREE.Texture | null> {
  const s = baseRenderer();
  if (!s) {
    return null;
  }
  const key = hdrPath;
  if (s.env && s.envKey === key) {
    return s.env;
  }
  try {
    const hdr = await new RGBELoader().loadAsync(publicAsset(hdrPath));
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    const env = s.pmrem.fromEquirectangular(hdr).texture;
    hdr.dispose();
    s.env?.dispose();
    s.env = env;
    s.envKey = key;
    return env;
  } catch {
    const fallback = s.pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    s.env?.dispose();
    s.env = fallback;
    s.envKey = "room";
    return fallback;
  }
}

export type ShotOptions = {
  width: number;
  height: number;
  env?: string;
  /** Fraction of the frame the object should fill. */
  fill?: number;
  /** Yaw and pitch in degrees, for a three-quarter product view. */
  yaw?: number;
  pitch?: number;
};

/** Renders a group to a PNG data URL, framing it from its own bounds. */
export async function renderProductShot(group: THREE.Group, opts: ShotOptions): Promise<string | null> {
  const s = baseRenderer();
  if (!s) {
    return null;
  }
  const env = opts.env ? await loadEnvironment(opts.env) : s.env ?? roomEnvironment(s);
  const scene = new THREE.Scene();
  scene.environment = env;
  scene.environmentIntensity = 1.25;

  const key = new THREE.DirectionalLight(0xfff6ea, 0.9);
  key.position.set(-120, -140, 260);
  const rim = new THREE.DirectionalLight(0xdce9ff, 0.55);
  rim.position.set(180, 60, 90);
  scene.add(key, rim);
  scene.add(new THREE.HemisphereLight(0xfff4e8, 0x241f1a, 0.35));

  scene.add(group);

  // The rig is authored in the XY plane facing +Z, so the camera has to sit on
  // the Z axis. Looking along the plane instead renders every frame edge-on.
  group.rotation.set(
    ((opts.pitch ?? 6) * Math.PI) / 180,
    ((opts.yaw ?? -22) * Math.PI) / 180,
    0,
  );
  group.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(group);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  group.position.sub(center);
  scene.updateMatrixWorld(true);

  const fill = opts.fill ?? 0.72;
  const half = Math.max(size.x, (size.y * opts.width) / opts.height) * fill || 40;
  const depth = Math.max(900, size.z * 10);
  const cam = new THREE.OrthographicCamera(
    -half,
    half,
    (half * opts.height) / opts.width,
    (-half * opts.height) / opts.width,
    1,
    depth * 2,
  );
  cam.position.set(0, 0, depth);
  cam.lookAt(0, 0, 0);

  s.renderer.setSize(opts.width, opts.height, false);
  s.renderer.render(scene, cam);
  const url = s.renderer.domElement.toDataURL("image/png");
  scene.remove(group);
  return url;
}

function roomEnvironment(s: Studio): THREE.Texture {
  if (!s.env || s.envKey !== "room") {
    s.env?.dispose();
    s.env = s.pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    s.envKey = "room";
  }
  return s.env;
}
