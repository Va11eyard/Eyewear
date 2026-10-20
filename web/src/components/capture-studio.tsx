"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getOptics, postFit, type Head, type Match, type Shop } from "@/lib/api";
import { faceReady, measureLocked, nextLiveStatus, studioNote } from "@/lib/capture-readiness";
import { FramePicker } from "@/components/frame-picker";
import { serializeLandmarks, type Point } from "@/lib/landmarks";
import { TryOnEngine } from "@/lib/try-on-engine";
import { KZ_CITIES, headPacket, sizeCode, whatsappHref } from "@/lib/visit-packet";

const WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

type Status = "boot" | "live" | "busy" | "done" | "error";

const PREVIEW_FRAME = {
  sku: "PREVIEW",
  name: "Прямоугольник 50",
  brand: "FRAME",
  shape: "rect",
  color: "black",
  material: "acetate",
  lensWidthMm: 50,
  bridgeMm: 22,
  templeMm: 145,
  model: "jeeliz:optical",
  colors: ["black", "gold", "tortoise", "burgundy", "silver", "horn"],
};

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
  const [cityId, setCityId] = useState("");
  const [geo, setGeo] = useState<"seek" | "gps" | "pick">("seek");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void (async () => {
      const pos = await readPosition();
      if (pos) {
        setGeo("gps");
        setShops(await fetchShops(pos.lat, pos.lng));
        return;
      }
      setGeo("pick");
    })();
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
  const ready = faceReady(points);
  const liveNote = studioNote(status, points, message);
  const packet = headPacket(head, spec);

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
    void startCamera(videoRef, (next) => {
      if (stop) {
        return;
      }
      engineRef.current?.update(next, viewRef.current, headRef.current?.ipdMm);
      setPoints(next);
      setStatus((prev) => nextLiveStatus(prev));
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

  const onCity = useCallback(async (id: string) => {
    setCityId(id);
    const city = KZ_CITIES.find((c) => c.id === id);
    if (!city) {
      setShops([]);
      return;
    }
    setShops(await fetchShops(city.lat, city.lng));
  }, []);

  const onCapture = useCallback(async () => {
    if (!faceReady(points)) {
      setMessage("Смотрите в камеру: лицо целиком в кадре, свет спереди");
      return;
    }
    const video = videoRef.current;
    if (!video) {
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
      setStatus("done");
      setMessage("Посадка посчитана по вашему кадру");
    } catch (e) {
      setStatus("live");
      setMessage(e instanceof Error ? mapErr(e.message) : "Не удалось посчитать посадку");
    }
  }, [points]);

  const onCopy = useCallback(async () => {
    if (!packet) {
      return;
    }
    try {
      await navigator.clipboard.writeText(packet);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, [packet]);

  return (
    <CaptureShell
      videoRef={videoRef}
      canvasRef={canvasRef}
      liveNote={liveNote}
      measureDisabled={measureLocked(ready, status)}
      onCapture={() => void onCapture()}
      head={head}
      size={sizeCode(spec)}
      packet={packet}
      copied={copied}
      onCopy={() => void onCopy()}
      matches={matches}
      picked={picked}
      onPick={(i) => {
        setPicked(i);
        setTint(null);
      }}
      colors={spec.colors ?? PREVIEW_FRAME.colors}
      color={color}
      onTint={setTint}
      geo={geo}
      cityId={cityId}
      onCity={(id) => void onCity(id)}
      shops={shops}
    />
  );
}

function CaptureShell({
  videoRef,
  canvasRef,
  liveNote,
  measureDisabled,
  onCapture,
  head,
  size,
  packet,
  copied,
  onCopy,
  matches,
  picked,
  onPick,
  colors,
  color,
  onTint,
  geo,
  cityId,
  onCity,
  shops,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  liveNote: string;
  measureDisabled: boolean;
  onCapture: () => void;
  head: Head | null;
  size: string;
  packet: string;
  copied: boolean;
  onCopy: () => void;
  matches: Match[];
  picked: number;
  onPick: (i: number) => void;
  colors: string[];
  color: string;
  onTint: (id: string) => void;
  geo: "seek" | "gps" | "pick";
  cityId: string;
  onCity: (id: string) => void;
  shops: Shop[];
}) {
  return (
    <div className="mx-auto grid max-w-[1280px] gap-x-12 gap-y-10 px-6 py-8 md:px-10 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <section className="relative h-[54dvh] w-full overflow-hidden border border-night bg-night lg:h-[calc(100dvh-19rem)]">
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
            {liveNote}
          </p>
        </section>
        <button
          type="button"
          onClick={onCapture}
          disabled={measureDisabled}
          className="mt-4 min-h-12 w-full bg-ink px-8 text-[12.5px] font-medium uppercase tracking-[0.11em] text-paper transition-colors hover:bg-oxblood disabled:opacity-40"
        >
          Снять мерки и подобрать оправы
        </button>
        <FramePicker
          matches={matches}
          picked={picked}
          onPick={onPick}
          colors={colors}
          color={color}
          onTint={onTint}
        />
      </div>
      <aside className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-[30px] leading-tight">Живая примерка</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-mute">
            Оправа стоит на кадре с вашей камеры и масштабируется по межзрачковому. Список слева
            переключает модели сразу, без прокрутки
          </p>
        </div>
        {head ? <HeadCard head={head} size={size} /> : null}
        {packet ? (
          <VisitCard
            packet={packet}
            copied={copied}
            onCopy={onCopy}
            onShare={() => void navigator.share?.({ text: packet })}
          />
        ) : null}
        <CityField geo={geo} cityId={cityId} onCity={onCity} />
        <ShopList shops={shops} packet={packet} />
      </aside>
    </div>
  );
}

function HeadCard({ head, size }: { head: Head; size: string }) {
  return (
    <dl className="grid grid-cols-2 gap-3 border border-line p-4 text-sm">
      <div>
        <dt className="text-mute">IPD (оценка)</dt>
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
        <dt className="text-mute">Типоразмер</dt>
        <dd className="font-medium">{size}</dd>
      </div>
      <p className="col-span-2 text-xs leading-relaxed text-mute">
        Это оценка по камере, не рецепт и не замена приёма у офтальмолога Наличие оправы уточните в салоне
      </p>
    </dl>
  );
}

function VisitCard({
  packet,
  copied,
  onCopy,
  onShare,
}: {
  packet: string;
  copied: boolean;
  onCopy: () => void;
  onShare: () => void;
}) {
  return (
    <div className="border border-line p-4">
      <p className="text-sm font-medium">Пакет для салона</p>
      <pre className="mt-2 whitespace-pre-wrap font-sans text-xs leading-relaxed text-mute">{packet}</pre>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={onCopy} className="min-h-10 border border-line px-5 text-[12px] uppercase tracking-[0.11em]">
          {copied ? "Скопировано" : "Скопировать"}
        </button>
        {typeof navigator !== "undefined" && "share" in navigator ? (
          <button type="button" onClick={onShare} className="min-h-10 border border-line px-5 text-[12px] uppercase tracking-[0.11em]">
            Поделиться
          </button>
        ) : null}
      </div>
    </div>
  );
}

function CityField({
  geo,
  cityId,
  onCity,
}: {
  geo: "seek" | "gps" | "pick";
  cityId: string;
  onCity: (id: string) => void;
}) {
  if (geo === "gps") {
    return <p className="text-sm text-mute">Оптики рядом по вашей геолокации</p>;
  }
  if (geo === "seek") {
    return <p className="text-sm text-mute">Спрашиваем геолокацию, чтобы найти салоны рядом</p>;
  }
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="text-mute">Город для поиска оптик</span>
      <select
        className="min-h-12 border border-line bg-paper px-3"
        value={cityId}
        onChange={(e) => onCity(e.target.value)}
      >
        <option value="">Выберите город, Астану сами не подставляем</option>
        {KZ_CITIES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
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


function ShopList({ shops, packet }: { shops: Shop[]; packet: string }) {
  if (shops.length === 0) {
    return (
      <p className="text-sm text-mute">
        Список салонов появится после геолокации или выбора города Магазины не выдумываем
      </p>
    );
  }
  return (
    <ul className="space-y-3">
      {shops.map((s) => (
        <li key={s.id} className="border border-line p-4">
          <p className="font-medium">{s.name}</p>
          <p className="text-sm text-mute">{s.address}</p>
          {s.km != null ? <p className="text-xs text-mute">{s.km.toFixed(1)} км</p> : null}
          {s.phone ? (
            <a className="mt-1 block text-sm underline" href={`tel:${s.phone}`}>
              {s.phone}
            </a>
          ) : null}
          {s.rating ? <p className="text-xs text-mute">Оценка {s.rating.toFixed(1)}</p> : null}
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            <a
              className="underline"
              href={s.mapUrl || `https://www.openstreetmap.org/?mlat=${s.lat}&mlon=${s.lng}#map=18/${s.lat}/${s.lng}`}
            >
              Открыть в 2GIS
            </a>
            {s.phone && packet ? (
              <a className="underline" href={whatsappHref(s.phone, packet)}>
                Написать в WhatsApp
              </a>
            ) : null}
          </div>
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
  return "Не удалось посчитать посадку";
}

async function fetchShops(lat: number, lng: number): Promise<Shop[]> {
  try {
    return await getOptics(lat, lng);
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
  onFace: (pts: Point[]) => void,
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
  onFace: (pts: Point[]) => void,
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
      onFace(face ?? []);
    } catch {
      onFace([]);
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
