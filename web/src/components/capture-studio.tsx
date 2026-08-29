"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getOptics, postFit, type Head, type Match, type Shop } from "@/lib/api";
import { serializeLandmarks, type Point } from "@/lib/landmarks";
import { TryOnEngine } from "@/lib/try-on-engine";

const WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

type Status = "boot" | "live" | "busy" | "done" | "error";

const PREVIEW_FRAME = {
  sku: "PREVIEW",
  shape: "rect",
  color: "black",
  material: "acetate",
  lensWidthMm: 50,
  bridgeMm: 22,
  templeMm: 145,
  model: "/models/sunglasses-khronos.glb",
  colors: ["black", "gold", "tortoise", "burgundy", "silver", "horn"],
};

const ASTANA = { lat: 51.1605, lng: 71.4704 };

export function CaptureStudio() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<TryOnEngine | null>(null);
  const viewRef = useRef({ w: 1, h: 1, vw: 1, vh: 1 });
  const headRef = useRef<Head | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [status, setStatus] = useState<Status>("boot");
  const [message, setMessage] = useState("Включаем камеру");
  const [head, setHead] = useState<Head | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [picked, setPicked] = useState(0);
  const [tint, setTint] = useState<string | null>(null);
  const [view, setView] = useState({ w: 1, h: 1, vw: 1, vh: 1 });

  useEffect(() => {
    void loadShops().then(setShops);
  }, []);

  useEffect(() => {
    headRef.current = head;
  }, [head]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const engine = new TryOnEngine(canvas);
    engineRef.current = engine;
    engine.setFrame(PREVIEW_FRAME);
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    viewRef.current = view;
    engineRef.current?.resize(view.w, view.h);
  }, [view]);

  const current = matches[picked];
  const spec = current?.frame ?? PREVIEW_FRAME;
  const color = tint ?? spec.color;

  useEffect(() => {
    engineRef.current?.setFrame({
      shape: spec.shape,
      color,
      material: spec.material,
      lensWidthMm: spec.lensWidthMm,
      bridgeMm: spec.bridgeMm,
      templeMm: spec.templeMm ?? 145,
      model: spec.model,
    });
  }, [color, spec]);

  useEffect(() => {
    let stop = false;
    let release = () => {};
    void startCamera(videoRef, (next, note) => {
      if (stop) {
        return;
      }
      engineRef.current?.update(next, viewRef.current, headRef.current?.ipdMm);
      setPoints(next);
      if (note) {
        setMessage(note);
      }
      setStatus("live");
    }, (err) => {
      if (!stop) {
        setStatus("error");
        setMessage(err);
      }
    }).then((fn) => {
      if (stop) {
        fn();
        return;
      }
      release = fn;
    });
    return () => {
      stop = true;
      release();
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    const sync = () => {
      setView({
        w: video.clientWidth || 1,
        h: video.clientHeight || 1,
        vw: video.videoWidth || 1,
        vh: video.videoHeight || 1,
      });
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(video);
    video.addEventListener("loadedmetadata", sync);
    return () => {
      ro.disconnect();
      video.removeEventListener("loadedmetadata", sync);
    };
  }, []);

  const onCapture = useCallback(async () => {
    const video = videoRef.current;
    if (!video || points.length === 0) {
      setMessage("Лицо не видно — смотрите в камеру");
      return;
    }
    setStatus("busy");
    try {
      const shot = frameToJpeg(video);
      const result = await postFit(shot, serializeLandmarks(points));
      setHead(result.head);
      setMatches(result.matches);
      setPicked(0);
      setTint(null);
      setShops(await loadShops());
      setStatus("done");
      setMessage("Посадка посчитана по вашему кадру");
    } catch (e) {
      setStatus("live");
      setMessage(e instanceof Error ? mapErr(e.message) : "Не удалось посчитать посадку");
    }
  }, [points]);

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4.5rem)] max-w-3xl flex-col items-center gap-8 px-6 py-10">
      <section className="relative aspect-[3/4] w-full max-w-[28rem] overflow-hidden rounded-[1.75rem] bg-night shadow-[0_24px_60px_oklch(0.2_0.02_42/0.18)]">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          playsInline
          muted
          autoPlay
          aria-label="Живая камера для примерки оправы"
        />
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
          aria-hidden="true"
        />
        <p className="absolute inset-x-4 bottom-4 z-10 text-center text-sm text-paper" role="status">
          {message}
        </p>
      </section>
      <aside className="flex w-full max-w-lg flex-col items-stretch gap-6">
        <h1 className="text-center font-display text-4xl leading-none tracking-tight">Живая примерка</h1>
        <p className="text-center text-sm leading-relaxed text-mute">
          Живая 3D-оправа реального размера по IPD. Цвет можно сменить на лету.
        </p>
        <button
          type="button"
          onClick={() => void onCapture()}
          disabled={status === "busy" || status === "boot"}
          className="min-h-12 rounded-full bg-blood px-6 text-sm font-medium text-blood-fg disabled:opacity-50"
        >
          Снять мерки и подобрать оправы
        </button>
        {head ? <HeadCard head={head} /> : null}
        {matches.length > 0 ? (
          <MatchList
            matches={matches}
            picked={picked}
            onPick={(i) => {
              setPicked(i);
              setTint(null);
            }}
          />
        ) : null}
        <TintPicker
          colors={spec.colors ?? PREVIEW_FRAME.colors}
          value={color}
          onPick={setTint}
        />
        <ShopList shops={shops} />
      </aside>
    </div>
  );
}

function HeadCard({ head }: { head: Head }) {
  return (
    <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-line p-4 text-sm">
      <div>
        <dt className="text-mute">IPD</dt>
        <dd className="font-medium">{head.ipdMm} мм</dd>
      </div>
      <div>
        <dt className="text-mute">Ширина лица</dt>
        <dd className="font-medium">{head.faceWidthMm} мм</dd>
      </div>
      <div>
        <dt className="text-mute">Форма лица</dt>
        <dd className="font-medium">{shapeLabel(head.shapeHint)}</dd>
      </div>
      <div>
        <dt className="text-mute">Размер</dt>
        <dd className="font-medium">{head.sizeHint}</dd>
      </div>
    </dl>
  );
}

function TintPicker({
  colors,
  value,
  onPick,
}: {
  colors: string[];
  value: string;
  onPick: (id: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm text-mute">Цвет оправы</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Цвет оправы">
        {colors.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onPick(id)}
            className={`h-10 min-w-10 rounded-full border px-3 text-xs ${
              value === id ? "border-ink ring-2 ring-ink/30" : "border-line"
            }`}
            style={{ background: tintCss(id) }}
            aria-pressed={value === id}
            aria-label={id}
          />
        ))}
      </div>
    </div>
  );
}

function shapeLabel(hint: string): string {
  const map: Record<string, string> = {
    round: "круглое",
    square: "квадратное",
    oval: "овальное",
    heart: "сердцевидное",
    diamond: "ромбовидное",
    oblong: "вытянутое",
    rect: "вытянутое",
  };
  return map[hint] ?? hint;
}

function tintCss(id: string): string {
  const map: Record<string, string> = {
    black: "#161310",
    gold: "#c9a66b",
    silver: "#d0cbc3",
    tortoise: "#7a4a28",
    horn: "#4a3428",
    burgundy: "#6b1c28",
    grey: "#6e6b67",
  };
  return map[id] ?? "#161310";
}

function MatchList({
  matches,
  picked,
  onPick,
}: {
  matches: Match[];
  picked: number;
  onPick: (i: number) => void;
}) {
  return (
    <ul className="space-y-2">
      {matches.map((m, i) => (
        <li key={m.frame.sku}>
          <button
            type="button"
            onClick={() => onPick(i)}
            className={`flex w-full min-h-12 items-center justify-between rounded-2xl border px-4 py-3 text-left ${
              i === picked ? "border-ink bg-ink text-paper" : "border-line"
            }`}
          >
            <span>
              <span className="block text-sm font-medium">
                {m.frame.brand} {m.frame.name}
              </span>
              <span className="text-xs opacity-70">
                {m.frame.lensWidthMm}-{m.frame.bridgeMm}-{m.frame.templeMm}
              </span>
            </span>
            <span className="text-sm tabular-nums">{Math.round(m.score)}%</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function ShopList({ shops }: { shops: Shop[] }) {
  if (shops.length === 0) {
    return <p className="text-sm text-mute">Не удалось загрузить список оптик. Обновите страницу или разрешите геолокацию.</p>;
  }
  return (
    <ul className="space-y-3">
      {shops.map((s) => (
        <li key={s.id} className="rounded-2xl border border-line p-4">
          <p className="font-medium">{s.name}</p>
          <p className="text-sm text-mute">{s.address}</p>
          {s.km != null ? <p className="text-xs text-mute">{s.km.toFixed(1)} км</p> : null}
          {s.phone ? (
            <a className="mt-1 block text-sm underline" href={`tel:${s.phone}`}>
              {s.phone}
            </a>
          ) : null}
          {s.rating ? <p className="text-xs text-mute">Оценка {s.rating.toFixed(1)}</p> : null}
          <a
            className="mt-2 inline-block text-sm underline"
            href={s.mapUrl || `https://www.openstreetmap.org/?mlat=${s.lat}&mlon=${s.lng}#map=18/${s.lat}/${s.lng}`}
          >
            Открыть на карте
          </a>
        </li>
      ))}
    </ul>
  );
}

function mapErr(code: string): string {
  if (code === "no_face") {
    return "Лицо не найдено на кадре";
  }
  if (code === "invalid_image" || code === "image_too_large") {
    return "Кадр нельзя обработать";
  }
  return "Сервер посадки недоступен";
}

async function loadShops(): Promise<Shop[]> {
  const pos = (await readPosition()) ?? ASTANA;
  try {
    return await getOptics(pos.lat, pos.lng);
  } catch {
    return [];
  }
}

function readPosition(): Promise<{ lat: number; lng: number } | null> {
  if (!navigator.geolocation) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  });
}

function frameToJpeg(video: HTMLVideoElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 720;
  canvas.height = video.videoHeight || 960;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return "";
  }
  ctx.drawImage(video, 0, 0);
  return canvas.toDataURL("image/jpeg", 0.82);
}

type Landmarker = {
  detectForVideo: (
    video: HTMLVideoElement,
    ts: number,
  ) => { faceLandmarks?: { x: number; y: number; z: number }[][] };
  close?: () => void;
};

async function startCamera(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  onFace: (pts: Point[], note?: string) => void,
  onError: (msg: string) => void,
): Promise<() => void> {
  let stream: MediaStream | undefined;
  let landmarker: Landmarker | undefined;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 1280 } },
      audio: false,
    });
    const video = videoRef.current;
    if (!video) {
      stream.getTracks().forEach((t) => t.stop());
      return () => {};
    }
    video.srcObject = stream;
    video.playsInline = true;
    await video.play();
    await waitForFrame(video);
    landmarker = await createLandmarker();
    const stopPump = pumpVideo(video, landmarker, onFace);
    return () => {
      stopPump();
      landmarker?.close?.();
      stream?.getTracks().forEach((t) => t.stop());
    };
  } catch {
    stream?.getTracks().forEach((t) => t.stop());
    onError("Нет доступа к камере");
    return () => {};
  }
}

function pumpVideo(
  video: HTMLVideoElement,
  landmarker: Landmarker,
  onFace: (pts: Point[], note?: string) => void,
): () => void {
  let raf = 0;
  let live = true;
  let lastTime = -1;
  let lastTs = 0;
  const tick = () => {
    if (!live) {
      return;
    }
    raf = requestAnimationFrame(tick);
    if (video.readyState < 2 || video.videoWidth < 16) {
      return;
    }
    if (video.currentTime === lastTime) {
      return;
    }
    lastTime = video.currentTime;
    const ts = Math.max(lastTs + 1, performance.now());
    lastTs = ts;
    try {
      const result = landmarker.detectForVideo(video, ts);
      const face = result.faceLandmarks?.[0];
      if (face) {
        onFace(face, "Оправа на вашем лице — можно снять мерки");
      } else {
        onFace([], "Ищем лицо");
      }
    } catch {
      onFace([], "Калибруем камеру");
    }
  };
  raf = requestAnimationFrame(tick);
  return () => {
    live = false;
    cancelAnimationFrame(raf);
  };
}

function waitForFrame(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= 2 && video.videoWidth > 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const done = () => resolve();
    video.addEventListener("loadeddata", done, { once: true });
  });
}

async function createLandmarker(): Promise<Landmarker> {
  const vision = await import("@mediapipe/tasks-vision");
  const files = await vision.FilesetResolver.forVisionTasks(WASM);
  return vision.FaceLandmarker.createFromOptions(files, {
    baseOptions: { modelAssetPath: MODEL, delegate: "CPU" },
    runningMode: "VIDEO",
    numFaces: 1,
    outputFacialTransformationMatrixes: true,
  });
}
