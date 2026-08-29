import { useState, useEffect, useCallback } from "react"

/* ═══════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════ */
type Screen =
  | "home" | "upload" | "scan" | "visualizer"
  | "optics" | "matching" | "results"
  | "compare" | "tryon" | "store" | "booking" | "confirm"
  | "designs" | "tech"

type Shape     = "round" | "oval" | "square" | "rect" | "cat"
type Size      = "sm" | "md" | "lg"
type Thickness = "thin" | "medium" | "thick"
type Material  = "metal" | "acetate" | "combo"
type StylePref = "minimal" | "classic" | "modern" | "bold"

interface Cfg {
  shape: Shape; size: Size; thickness: Thickness
  color: string; colorName: string
  material: Material; stylePref: StylePref
}

/* ═══════════════════════════════════════════════════════
   PHOTOS
═══════════════════════════════════════════════════════ */
const P = {
  hero:  "https://images.unsplash.com/photo-1619896382906-4f4681290afc?w=1100&h=1400&fit=crop&crop=top&auto=format",
  hero2: "https://images.unsplash.com/photo-1750390200217-628bdc2d7651?w=900&h=1100&fit=crop&auto=format",
  user:  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop&crop=top&auto=format",
  g1: "https://images.unsplash.com/photo-1686165863154-b8f9d69add82?w=540&h=340&fit=crop&auto=format",
  g2: "https://images.unsplash.com/photo-1686165862816-ed104011f9a9?w=540&h=340&fit=crop&auto=format",
  g3: "https://images.unsplash.com/photo-1591843336309-cbf414ad7978?w=540&h=340&fit=crop&auto=format",
  g4: "https://images.unsplash.com/photo-1601459451069-bdd47ed9e142?w=540&h=340&fit=crop&auto=format",
  g5: "https://images.unsplash.com/photo-1755719401852-da7e4c8a7fc8?w=540&h=340&fit=crop&auto=format",
  g6: "https://images.unsplash.com/photo-1614715838608-dd527c46231d?w=540&h=340&fit=crop&auto=format",
}

/* ═══════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════ */
const COLORS: [string,string][] = [
  ["#1B1C1E","Чёрный"],["#C9C5BC","Прозрачный"],["#7A4A28","Черепаховый"],
  ["#173060","Тёмно-синий"],["#6A7178","Серый"],["#5C3D1E","Коричневый"],["#8B2020","Красный"],
]

const OPTICS = [
  { id:1, name:"Optic Center",  area:"Алматы, Бостандыкский р-н", dist:"1,2 км", count:328, rating:4.8, hours:"10:00–21:00", addr:"ул. Достык, 138" },
  { id:2, name:"Vision Studio", area:"Алматы, Медеуский р-н",     dist:"2,8 км", count:214, rating:4.6, hours:"09:00–20:00", addr:"пр. Аль-Фараби, 77" },
  { id:3, name:"Optika Plus",   area:"Алматы, Алмалинский р-н",   dist:"4,1 км", count:186, rating:4.5, hours:"10:00–20:00", addr:"ул. Панфилова, 52" },
]

const RESULTS = [
  { id:1, name:"Rectangle Pro", brand:"Silhouette", desc:"Чёрная прямоугольная оправа", price:89000, avail:"В наличии",  match:96, img:P.g1, shape:"rect"   as Shape, breakdown:{shape:98,color:100,size:94,material:91} },
  { id:2, name:"Slim Metal",    brand:"Lindberg",   desc:"Тонкая металлическая оправа", price:72000, avail:"В наличии",  match:91, img:P.g3, shape:"rect"   as Shape, breakdown:{shape:94,color:89, size:93,material:91} },
  { id:3, name:"Urban Black",   brand:"Mykita",     desc:"Чёрная ацетатная оправа",     price:65000, avail:"Под заказ", match:87, img:P.g5, shape:"square" as Shape, breakdown:{shape:88,color:95, size:86,material:82} },
  { id:4, name:"Classic Round", brand:"Ray-Ban",    desc:"Тонкая круглая оправа",        price:58000, avail:"В наличии",  match:84, img:P.g2, shape:"round"  as Shape, breakdown:{shape:80,color:90, size:86,material:84} },
  { id:5, name:"Cat Luxe",      brand:"Tom Ford",   desc:"Ацетат кошачий глаз",          price:95000, avail:"В наличии",  match:79, img:P.g6, shape:"cat"    as Shape, breakdown:{shape:74,color:88, size:82,material:78} },
  { id:6, name:"Geo Square",    brand:"Mykita",     desc:"Квадратная матовая оправа",    price:68000, avail:"Под заказ", match:76, img:P.g4, shape:"square" as Shape, breakdown:{shape:78,color:78, size:76,material:74} },
]

const DEFAULT_CFG: Cfg = {
  shape:"rect", size:"md", thickness:"medium",
  color:"#1B1C1E", colorName:"Чёрный",
  material:"acetate", stylePref:"minimal",
}

/* ═══════════════════════════════════════════════════════
   GLASSES SVG
═══════════════════════════════════════════════════════ */
function Glasses({ cfg, style: sx }: { cfg: Cfg; style?: React.CSSProperties }) {
  const sc   = cfg.size === "sm" ? 0.82 : cfg.size === "lg" ? 1.18 : 1
  const tMult = cfg.thickness === "thin" ? 0.5 : cfg.thickness === "thick" ? 1.8 : 1
  const baseSW = cfg.material === "metal" ? 1.6 : 2.5
  const sw   = baseSW * tMult
  const col  = cfg.color
  const clear = col === "#C9C5BC"
  const fillOp = clear ? 0.12 : 0.68
  const CY = 84; const lx = 160; const rx = 400

  const LensPath = (cx: number) => {
    switch (cfg.shape) {
      case "round":  return <ellipse cx={cx} cy={CY} rx={68*sc} ry={62*sc}/>
      case "oval":   return <ellipse cx={cx} cy={CY} rx={82*sc} ry={50*sc}/>
      case "rect":   return <rect x={cx-82*sc} y={CY-38*sc} width={164*sc} height={76*sc} rx={6}/>
      case "cat": {
        const w=80*sc,h=56*sc
        return <path d={`M${cx-w} ${CY+h*.5}Q${cx-w*1.06} ${CY-h*.52} ${cx-6*sc} ${CY-h}Q${cx+w*.88} ${CY-h*.88} ${cx+w} ${CY+h*.46}Q${cx+w*.22} ${CY+h*.9} ${cx-w} ${CY+h*.5}Z`}/>
      }
      default: return <rect x={cx-76*sc} y={CY-48*sc} width={152*sc} height={96*sc} rx={13}/>
    }
  }

  return (
    <svg viewBox="0 0 560 168" style={{
      position:"absolute", top:"31%", left:"10%", width:"80%",
      pointerEvents:"none",
      filter:"drop-shadow(0 4px 16px rgba(0,0,0,0.36)) drop-shadow(0 1px 4px rgba(0,0,0,0.18))",
      transition:"all 0.35s cubic-bezier(0.22,1,0.36,1)",
      ...sx,
    }}>
      <defs>
        <linearGradient id="shine" x1="0%" y1="0%" x2="60%" y2="100%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.36)"/>
          <stop offset="60%"  stopColor="rgba(255,255,255,0.06)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </linearGradient>
        <linearGradient id="rimG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={col} stopOpacity="1"/>
          <stop offset="100%" stopColor={col} stopOpacity="0.72"/>
        </linearGradient>
      </defs>
      <g stroke="url(#rimG)" strokeWidth={sw} fill={col} fillOpacity={fillOp} strokeLinejoin="round">{LensPath(lx)}</g>
      <g stroke="url(#rimG)" strokeWidth={sw} fill={col} fillOpacity={fillOp} strokeLinejoin="round">{LensPath(rx)}</g>
      <g fill="url(#shine)" fillOpacity={0.7} stroke="none">{LensPath(lx)}</g>
      <g fill="url(#shine)" fillOpacity={0.7} stroke="none">{LensPath(rx)}</g>
      <path d={`M${lx+64*sc} ${CY-6}Q280 ${CY-22} ${rx-64*sc} ${CY-6}`}
        fill="none" stroke={col} strokeWidth={sw} strokeLinecap="round"/>
      <line x1={lx-66*sc} y1={CY} x2={2}   y2={CY+10} stroke={col} strokeWidth={sw} strokeLinecap="round"/>
      <line x1={rx+66*sc} y1={CY} x2={558}  y2={CY+10} stroke={col} strokeWidth={sw} strokeLinecap="round"/>
      {cfg.material === "metal" && <>
        <ellipse cx={lx+36*sc} cy={CY+28*sc} rx={3.5} ry={5} fill={col} fillOpacity={0.5}/>
        <ellipse cx={rx-36*sc} cy={CY+28*sc} rx={3.5} ry={5} fill={col} fillOpacity={0.5}/>
      </>}
      {clear && <g fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={0.8}>{LensPath(lx)}{LensPath(rx)}</g>}
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════
   SHARED ATOMS
═══════════════════════════════════════════════════════ */
const Arrow = ({ col="currentColor" }: { col?:string }) => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M2.5 7.5h10M9 3.5l4 4-4 4" stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const Tick = ({ col="currentColor", size=14 }: { col?:string; size?:number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <path d="M2 7l3.5 3.5 6.5-7" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const ShapeIco = ({ s, inv }: { s:string; inv?:boolean }) => {
  const c = inv ? "#fff" : "#16181B"
  return (
    <svg width="32" height="32" viewBox="0 0 32 32">
      {s==="round"  && <ellipse cx="16" cy="16" rx="11" ry="11" fill="none" stroke={c} strokeWidth="1.8"/>}
      {s==="oval"   && <ellipse cx="16" cy="16" rx="14" ry="9"  fill="none" stroke={c} strokeWidth="1.8"/>}
      {s==="square" && <rect x="4" y="4" width="24" height="24" rx="5"      fill="none" stroke={c} strokeWidth="1.8"/>}
      {s==="rect"   && <rect x="2" y="8" width="28" height="16" rx="4"      fill="none" stroke={c} strokeWidth="1.8"/>}
      {s==="cat"    && <path d="M3 21 Q1 10 14 6 Q25 3 29 21 Q21 28 3 21Z" fill="none" stroke={c} strokeWidth="1.8"/>}
    </svg>
  )
}

function StarRating({ val }: { val: number }) {
  return (
    <span style={{ display:"inline-flex", gap:2, alignItems:"center" }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12">
          <path d="M6 1l1.3 3.5H11L8.3 7l1 3.5L6 8.5 2.7 10.5l1-3.5L1 4.5h3.7z"
            fill={i <= Math.round(val) ? "#F5A623" : "#E0DEDA"}/>
        </svg>
      ))}
      <span style={{ fontSize:12, color:"var(--sub)", marginLeft:3 }}>{val}</span>
    </span>
  )
}

function Nav({ onNav }: { onNav:(s:Screen)=>void }) {
  return (
    <div className="nav-bar">
      <div className="nav-inner">
        <button className="nav-wordmark" onClick={() => onNav("home")}>FRAME</button>
        <nav style={{ display:"flex", gap:28 }}>
          <span className="nav-link" onClick={() => onNav("home")}>Главная</span>
          <span className="nav-link" onClick={() => onNav("upload")}>Создать</span>
          <span className="nav-link" onClick={() => onNav("designs")}>Мои дизайны</span>
          <span className="nav-link" onClick={() => onNav("optics")}>Оптики</span>
          <span className="nav-link" onClick={() => onNav("tech")}>Как это работает</span>
        </nav>
        <button className="btn btn-ring" style={{ padding:"8px 20px", fontSize:13 }}
          onClick={() => onNav("designs")}>Профиль</button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SCREEN 1 — HOME
═══════════════════════════════════════════════════════ */
function Home({ onNav }: { onNav:(s:Screen)=>void }) {
  return (
    <div style={{ background:"var(--bg)" }}>
      <Nav onNav={onNav}/>

      {/* Hero */}
      <section style={{ display:"flex", minHeight:"100vh", paddingTop:60 }}>
        {/* Text */}
        <div style={{ flex:"0 0 48%", display:"flex", flexDirection:"column", justifyContent:"center",
          padding:"64px 56px 64px 64px", maxWidth:700 }}>
          <div className="tag tag-blue" style={{ marginBottom:32, width:"fit-content" }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:"var(--accent)",display:"block" }} className="blink"/>
            Цифровой конструктор оправ
          </div>

          <h1 className="serif" style={{ fontSize:"clamp(52px,5.6vw,82px)", lineHeight:1.02,
            letterSpacing:"-0.035em", marginBottom:28 }}>
            Создайте очки,<br/>которые вам<br/>
            <em style={{ fontStyle:"italic", color:"var(--sub)" }}>нравятся</em>
          </h1>

          <p style={{ fontSize:18, lineHeight:1.75, color:"var(--sub)", maxWidth:440, marginBottom:14 }}>
            Настройте оправу под свой стиль, а мы найдём похожую модель в выбранной оптике.
          </p>

          <div style={{ display:"flex", gap:16, marginBottom:52 }}>
            <button className="btn btn-fill" style={{ fontSize:15, padding:"15px 32px" }}
              onClick={() => onNav("upload")}>
              Создать свои очки <Arrow/>
            </button>
            <button className="btn btn-ring" style={{ fontSize:14, padding:"14px 28px" }}
              onClick={() => onNav("tech")}>
              Как это работает
            </button>
          </div>

          {/* Mini flow */}
          <div style={{ display:"flex", alignItems:"center", gap:0,
            padding:"18px 24px", background:"var(--surface)", borderRadius:16,
            border:"1px solid var(--hairline)", marginBottom:48 }}>
            {["Ваш дизайн","Поиск в каталоге","Реальная оправа"].map((s,i)=>(
              <div key={s} style={{ display:"flex", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"0 16px" }}>
                  <div style={{ width:7,height:7,borderRadius:"50%",
                    background:i===0?"var(--text)":i===1?"var(--accent)":"var(--green)",flexShrink:0 }}/>
                  <span style={{ fontSize:12, fontWeight:600 }}>{s}</span>
                </div>
                {i<2 && <span style={{ color:"var(--sub)", fontSize:14 }}>→</span>}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display:"flex", gap:0, paddingTop:32, borderTop:"1px solid var(--hairline)" }}>
            {[["3 оптики","Алматы, в будущем больше"],["2 400+","моделей в каталогах"],["96%","точность совпадения"]].map(([n,l],i)=>(
              <div key={l} style={{ flex:1, paddingRight:i<2?32:0,
                borderRight:i<2?"1px solid var(--hairline)":"none", marginRight:i<2?32:0 }}>
                <div className="serif" style={{ fontSize:26, letterSpacing:"-0.025em", marginBottom:4 }}>{n}</div>
                <div style={{ fontSize:11, color:"var(--sub)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: flush image */}
        <div style={{ flex:1, position:"relative", overflow:"hidden" }}>
          <img src={P.hero} alt="Девушка в стильных очках"
            style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top", display:"block" }}/>
          <div style={{ position:"absolute", inset:0,
            background:"linear-gradient(90deg, var(--bg) 0%, transparent 10%)" }}/>
          {/* Glass card — design concept */}
          <div className="glass float" style={{ position:"absolute", bottom:64, left:36, borderRadius:20,
            padding:"20px 26px", minWidth:250, boxShadow:"0 28px 70px rgba(22,24,27,0.14)" }}>
            <div className="label" style={{ marginBottom:14 }}>Ваш дизайн</div>
            {[["Форма","Прямоугольная"],["Материал","Ацетат"],["Цвет","Чёрный"],["Оптика","Optic Center"]].map(([k,v])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between", gap:28, marginBottom:9 }}>
                <span style={{ fontSize:13, color:"var(--sub)" }}>{k}</span>
                <span style={{ fontSize:13, fontWeight:600 }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop:14, borderTop:"1px solid var(--hairline)", paddingTop:14,
              display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:11, color:"var(--sub)" }}>Лучшее совпадение</span>
              <span style={{ fontSize:15, fontWeight:700, color:"var(--green)" }}>96%</span>
            </div>
          </div>
          <div className="glass" style={{ position:"absolute", top:32, right:32, borderRadius:99,
            padding:"10px 18px", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ width:8,height:8,borderRadius:"50%",background:"var(--green)",display:"block" }} className="blink"/>
            <span style={{ fontSize:12, fontWeight:600 }}>Ваш дизайн → Реальный товар</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background:"var(--surface)", borderTop:"1px solid var(--hairline)" }}>
        <div style={{ maxWidth:1240, margin:"0 auto", padding:"80px 48px" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div className="label" style={{ marginBottom:14 }}>Принцип работы</div>
            <h2 className="serif" style={{ fontSize:"clamp(28px,3.2vw,46px)", letterSpacing:"-0.025em", lineHeight:1.08 }}>
              Создайте очки в цифровом мире.<br/>
              <em className="serif" style={{ fontStyle:"italic", color:"var(--sub)" }}>Найдите их в реальном.</em>
            </h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20 }}>
            {[
              { n:"01", t:"Сфотографируйтесь",    d:"Загрузите фото или сделайте снимок — создадим вашу визуализацию.", col:"#6AC3EC" },
              { n:"02", t:"Создайте свою оправу",  d:"Выберите форму, цвет, материал — прямо на своём лице.", col:"#30966A" },
              { n:"03", t:"Выберите оптику",       d:"Укажите удобную оптику в Алматы — поищем в её каталоге.", col:"#9B6AC3" },
              { n:"04", t:"Найдём похожие",        d:"AI найдёт наиболее близкие модели и покажет процент совпадения.", col:"#EC9B6A" },
            ].map(f=>(
              <div key={f.t} className="card" style={{ padding:"28px 24px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:18 }}>
                  <div style={{ width:36, height:4, borderRadius:99, background:f.col }}/>
                  <span className="serif" style={{ fontSize:32, color:"var(--accent-bg)", letterSpacing:"-0.04em" }}>{f.n}</span>
                </div>
                <h3 style={{ fontSize:15, fontWeight:700, letterSpacing:"-0.018em", marginBottom:10 }}>{f.t}</h3>
                <p style={{ fontSize:13, lineHeight:1.7, color:"var(--sub)" }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial */}
      <section>
        <div style={{ maxWidth:1240, margin:"0 auto", padding:"96px 48px",
          display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"center" }}>
          <div>
            <div className="label" style={{ marginBottom:20 }}>Концепция</div>
            <h2 className="serif" style={{ fontSize:"clamp(30px,3.5vw,52px)", letterSpacing:"-0.03em",
              lineHeight:1.06, marginBottom:28 }}>
              Ваш идеальный<br/>дизайн — в реальном<br/>
              <em style={{ fontStyle:"italic", color:"var(--sub)" }}>каталоге</em>
            </h2>
            <p style={{ fontSize:16, lineHeight:1.8, color:"var(--sub)", maxWidth:400, marginBottom:40 }}>
              Настройте оправу до мельчайших деталей. Наш алгоритм найдёт максимально похожую реальную модель в выбранной оптике — с ценой, наличием и возможностью примерки.
            </p>
            <button className="btn btn-fill" onClick={() => onNav("upload")}>Начать создание <Arrow/></button>
          </div>
          <div style={{ position:"relative" }}>
            <div style={{ borderRadius:"var(--r-xl)", overflow:"hidden", background:"#dddbd8" }}>
              <img src={P.hero2} alt="Девушка в очках"
                style={{ width:"100%", height:500, objectFit:"cover", display:"block" }}/>
            </div>
            <div className="glass" style={{ position:"absolute", bottom:28, left:-20, borderRadius:16,
              padding:"16px 22px", boxShadow:"0 16px 44px rgba(22,24,27,0.10)" }}>
              <div className="label" style={{ marginBottom:10 }}>Найдено в каталоге</div>
              {[["Rectangle Pro","96%","var(--green)"],["Slim Metal","91%","var(--green)"],["Urban Black","87%","var(--accent)"]].map(([n,p,c])=>(
                <div key={n} style={{ display:"flex", justifyContent:"space-between", gap:24, marginBottom:7 }}>
                  <span style={{ fontSize:12, color:"var(--sub)" }}>{n}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:c as string }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dark CTA */}
      <section style={{ background:"var(--dark-bg)", padding:"72px 48px" }}>
        <div style={{ maxWidth:1240, margin:"0 auto", display:"flex",
          alignItems:"center", justifyContent:"space-between", gap:48, flexWrap:"wrap" }}>
          <div>
            <h2 className="serif" style={{ fontSize:"clamp(26px,2.8vw,44px)", color:"#fff",
              letterSpacing:"-0.025em", marginBottom:12 }}>
              Создайте свою первую оправу
            </h2>
            <p style={{ color:"rgba(255,255,255,0.42)", fontSize:16 }}>
              Займёт около 3 минут. Примерка — бесплатно.
            </p>
          </div>
          <button className="btn btn-accent" style={{ fontSize:16, padding:"16px 36px", flexShrink:0 }}
            onClick={() => onNav("upload")}>
            Создать очки <Arrow/>
          </button>
        </div>
      </section>

      <footer style={{ borderTop:"1px solid var(--hairline)", padding:"32px 48px" }}>
        <div style={{ maxWidth:1240, margin:"0 auto", display:"flex",
          justifyContent:"space-between", alignItems:"center" }}>
          <span className="serif" style={{ fontSize:17, letterSpacing:"-0.04em" }}>FRAME</span>
          <span style={{ fontSize:13, color:"var(--sub)" }}>Создано в цифровом. Найдено в реальном.</span>
          <span style={{ fontSize:12, color:"var(--sub)" }}>© 2025 FRAME</span>
        </div>
      </footer>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SCREEN 2 — UPLOAD / HEAD CAPTURE
═══════════════════════════════════════════════════════ */
function Upload({ onNav }: { onNav:(s:Screen)=>void }) {
  const [done, setDone] = useState(false)
  const go = () => { setDone(true); setTimeout(() => onNav("scan"), 900) }
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Nav onNav={onNav}/>
      <div style={{ maxWidth:760, margin:"0 auto", padding:"120px 48px 80px" }}>
        <div className="tag tag-blue" style={{ marginBottom:24, display:"inline-flex" }}>Шаг 1 из 4</div>
        <h1 className="serif" style={{ fontSize:"clamp(38px,4.5vw,60px)", letterSpacing:"-0.03em",
          lineHeight:1.06, marginBottom:20 }}>
          Начнём с вашего лица
        </h1>
        <p style={{ fontSize:17, lineHeight:1.7, color:"var(--sub)", maxWidth:500, marginBottom:52 }}>
          Сделайте несколько фотографий, чтобы создать персональную визуализацию.
        </p>

        {/* Three pose guides */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:36 }}>
          {[["Прямо","😐"],["Слегка влево","😶"],["Слегка вправо","🙂"]].map(([label,ico],i)=>(
            <div key={label} className="card" style={{ padding:"24px 16px", textAlign:"center", cursor:"default" }}>
              <div style={{ width:60, height:60, borderRadius:"50%", background:"var(--bg)",
                margin:"0 auto 12px", fontSize:28, display:"flex", alignItems:"center", justifyContent:"center",
                border:`2px solid ${i===0?"var(--text)":"var(--hairline2)"}` }}>
                {ico}
              </div>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:4 }}>{label}</div>
              <div style={{ width:16, height:2, borderRadius:99, background:i===0?"var(--text)":"var(--hairline2)", margin:"0 auto" }}/>
            </div>
          ))}
        </div>

        {/* Drop / upload zone */}
        <div className={`drop-zone ${done?"done":""}`}
          style={{ padding:"64px 40px", marginBottom:32, textAlign:"center" }}
          onClick={go}>
          {done ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
              <div style={{ width:64,height:64,borderRadius:"50%",background:"var(--green)",
                display:"flex",alignItems:"center",justifyContent:"center" }}>
                <Tick col="#fff" size={28}/>
              </div>
              <p style={{ fontSize:16, fontWeight:600, color:"var(--green)" }}>Готово!</p>
              <p style={{ fontSize:13, color:"var(--sub)" }}>Создаём вашу визуализацию…</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
              <div style={{ width:72, height:72, borderRadius:"50%", background:"var(--accent-bg)",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M4 11a4 4 0 014-4h2l2-3h8l2 3h2a4 4 0 014 4v13a4 4 0 01-4 4H8a4 4 0 01-4-4V11z"
                    stroke="#6AC3EC" strokeWidth="1.8"/>
                  <circle cx="16" cy="18" r="5" stroke="#6AC3EC" strokeWidth="1.8"/>
                </svg>
              </div>
              <h3 style={{ fontSize:20, fontWeight:600, letterSpacing:"-0.02em" }}>Сфотографируйтесь</h3>
              <p style={{ fontSize:14, color:"var(--sub)" }}>Нажмите или перетащите фото</p>
              <div style={{ display:"flex", gap:10, marginTop:4 }}>
                <button className="btn btn-fill" style={{ fontSize:14 }} onClick={e=>{e.stopPropagation();go()}}>
                  Продолжить
                </button>
                <button className="btn btn-ring" style={{ fontSize:14 }} onClick={e=>{e.stopPropagation();go()}}>
                  Загрузить фотографии
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
          {[["👁️","Смотрите прямо в камеру"],["💡","Хорошее освещение"],["🕶️","Уберите очки"]].map(([e,t])=>(
            <div key={t} className="card" style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:10, textAlign:"left", cursor:"default" }}>
              <span style={{ fontSize:20 }}>{e}</span>
              <span style={{ fontSize:13, color:"var(--sub)", lineHeight:1.45 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SCREEN 3 — SCAN / 3D MODEL CREATION
═══════════════════════════════════════════════════════ */
function Scan({ onNav }: { onNav:(s:Screen)=>void }) {
  const [step, setStep] = useState(0)
  const [pct, setPct]   = useState(0)
  const STEPS = ["Анализ фотографий","Создание модели","Калибровка"]

  useEffect(() => {
    const ts = [
      setTimeout(() => { setStep(1); setPct(36) }, 1000),
      setTimeout(() => { setStep(2); setPct(72) }, 2200),
      setTimeout(() => { setStep(3); setPct(100)}, 3400),
      setTimeout(() => onNav("visualizer"), 4400),
    ]
    return () => ts.forEach(clearTimeout)
  }, [onNav])

  return (
    <div style={{ height:"100vh", background:"var(--dark-bg)", display:"flex",
      alignItems:"center", justifyContent:"center", flexDirection:"column", gap:40 }}>
      {/* Portrait with scan animation */}
      <div style={{ position:"relative", width:320, height:400, borderRadius:"var(--r-lg)", overflow:"hidden", background:"#181A1C" }}>
        <img src={P.user} alt="Анализ" style={{ width:"100%", height:"100%",
          objectFit:"cover", objectPosition:"center top", filter:"brightness(0.75) saturate(0.6)" }}/>
        <div style={{ position:"absolute", inset:0 }}>
          <div style={{ position:"absolute", left:0, right:0, height:2,
            background:"linear-gradient(90deg,transparent,var(--accent),transparent)",
            boxShadow:"0 0 24px 10px rgba(106,195,236,0.4)",
            animation:"scanV 2.4s ease-in-out infinite" }}/>
          <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.18 }}>
            {[20,40,60,80].map(p=>(
              <g key={p}>
                <line x1="0%" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke="#6AC3EC" strokeWidth="0.6" strokeDasharray="4 10"/>
                <line x1={`${p}%`} y1="0%" x2={`${p}%`} y2="100%" stroke="#6AC3EC" strokeWidth="0.6" strokeDasharray="4 10"/>
              </g>
            ))}
          </svg>
          {/* Corner frames */}
          {[["0%","0%"],["0%","auto"],["auto","0%"],["auto","auto"]].map(([t,b],i)=>(
            <div key={i} style={{ position:"absolute", top:t==="0%"?12:"auto", bottom:b==="auto"?"auto":12,
              left:i%2===0?12:"auto", right:i%2===1?12:"auto",
              width:24, height:24,
              borderTop:t==="0%"?"2px solid var(--accent)":"none",
              borderBottom:t!=="0%"?"2px solid var(--accent)":"none",
              borderLeft:i%2===0?"2px solid var(--accent)":"none",
              borderRight:i%2===1?"2px solid var(--accent)":"none" }}/>
          ))}
        </div>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"24px 20px 20px",
          background:"linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.55)" }}>{STEPS[Math.max(0,step-1)]}</span>
            <span style={{ fontSize:12, fontWeight:700, color:"var(--accent)" }}>{pct}%</span>
          </div>
          <div className="track" style={{ background:"rgba(255,255,255,0.12)" }}>
            <div className="fill" style={{ width:`${pct}%` }}/>
          </div>
        </div>
      </div>

      <div style={{ textAlign:"center" }}>
        <h2 className="serif" style={{ fontSize:28, color:"#fff", letterSpacing:"-0.025em", marginBottom:10 }}>
          Создаём вашу визуализацию
        </h2>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {STEPS.map((s,i)=>(
            <div key={s} style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"center",
              opacity: i<step ? 1 : 0.25, transition:"opacity 0.5s" }}>
              <div style={{ width:18, height:18, borderRadius:"50%", flexShrink:0,
                background: i<step ? "var(--green)" : "rgba(255,255,255,0.12)",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                {i<step && <Tick col="#fff" size={10}/>}
              </div>
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.7)" }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SCREEN 4 — VISUALIZER + CUSTOMIZATION (HERO)
═══════════════════════════════════════════════════════ */
type Angle = "front" | "left" | "right"

function Visualizer({ onNav, cfg, set }: { onNav:(s:Screen)=>void; cfg:Cfg; set:(c:Cfg)=>void }) {
  const [angle, setAngle] = useState<Angle>("front")
  const [saved, setSaved] = useState(false)
  const up = (p: Partial<Cfg>) => set({ ...cfg, ...p })

  const SHAPES: [Shape,string][] = [["round","Круглая"],["oval","Овальная"],["square","Квадратная"],["rect","Прямоугольная"],["cat","Кошачий глаз"]]
  const MATS:   [Material,string][] = [["metal","Металл"],["acetate","Ацетат"],["combo","Комбинированный"]]

  const angleTransform: Record<Angle, string> = {
    front: "none",
    left:  "perspective(900px) rotateY(-14deg) translateX(16px)",
    right: "perspective(900px) rotateY(14deg) translateX(-16px)",
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  return (
    <div style={{ height:"100vh", background:"#0D0F11", display:"flex", overflow:"hidden" }}>
      {/* Left: portrait */}
      <div style={{ flex:1, position:"relative", overflow:"hidden",
        display:"flex", alignItems:"center", justifyContent:"center" }}>
        {/* Angle tabs */}
        <div style={{ position:"absolute", top:32, left:"50%", transform:"translateX(-50%)", zIndex:10,
          display:"flex", gap:0, background:"rgba(255,255,255,0.08)", borderRadius:99,
          border:"1px solid rgba(255,255,255,0.12)", backdropFilter:"blur(16px)", padding:4 }}>
          {(["front","left","right"] as Angle[]).map((a,i)=>(
            <button key={a} onClick={()=>setAngle(a)}
              style={{ padding:"7px 22px", borderRadius:99, border:"none", cursor:"pointer",
                fontSize:12, fontWeight:600,
                background: angle===a ? "#fff" : "transparent",
                color: angle===a ? "#16181B" : "rgba(255,255,255,0.5)",
                transition:"all 0.22s ease" }}>
              {["Спереди","Слева","Справа"][i]}
            </button>
          ))}
        </div>

        {/* Portrait + glasses */}
        <div style={{ position:"relative", width:420, height:560,
          borderRadius:"var(--r-xl)", overflow:"hidden",
          boxShadow:"0 32px 80px rgba(0,0,0,0.5)",
          transition:"transform 0.4s cubic-bezier(0.22,1,0.36,1)",
          transform: angleTransform[angle] }}>
          <img src={P.user} alt="Визуализация" style={{ width:"100%", height:"100%",
            objectFit:"cover", objectPosition:"center top",
            filter:"brightness(0.86) contrast(1.06) saturate(0.92)" }}/>
          <Glasses cfg={cfg}/>
          <div style={{ position:"absolute", inset:0,
            background:"radial-gradient(ellipse at center, transparent 55%, rgba(13,15,17,0.5) 100%)" }}/>
        </div>

        {/* Model name badge */}
        <div style={{ position:"absolute", bottom:32, left:"50%", transform:"translateX(-50%)",
          display:"flex", alignItems:"center", gap:12 }}>
          {saved ? (
            <div className="glass" style={{ borderRadius:99, padding:"10px 20px",
              display:"flex", alignItems:"center", gap:8 }}>
              <Tick col="var(--green)" size={14}/>
              <span style={{ fontSize:13, fontWeight:600 }}>Дизайн сохранён — Моя оправа #01</span>
            </div>
          ) : (
            <button className="btn-ghost" style={{ borderRadius:12, fontSize:12 }} onClick={handleSave}>
              Сохранить дизайн
            </button>
          )}
        </div>

        {/* Live badge */}
        <div style={{ position:"absolute", top:32, right:32 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6,
            background:"rgba(255,255,255,0.08)", borderRadius:99, padding:"7px 14px",
            border:"1px solid rgba(255,255,255,0.12)" }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:"var(--accent)",display:"block" }} className="blink"/>
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.6)", fontWeight:600 }}>Обновляется в реальном времени</span>
          </div>
        </div>
      </div>

      {/* Right: customization panel */}
      <div style={{ width:360, height:"100vh", background:"rgba(14,16,18,0.96)",
        borderLeft:"1px solid rgba(255,255,255,0.07)",
        overflowY:"auto", scrollbarWidth:"none", padding:"32px 24px 120px" }}>
        <div style={{ padding:"48px 0 20px" }}>
          <div className="tag tag-blue" style={{ marginBottom:16, fontSize:10 }}>Шаг 2 из 4</div>
          <h2 className="serif" style={{ fontSize:26, letterSpacing:"-0.025em", color:"#fff", marginBottom:6 }}>Создайте свою оправу</h2>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.38)" }}>Изменения отображаются мгновенно</p>
        </div>

        {/* Форма */}
        <div style={{ marginBottom:28 }}>
          <div className="label" style={{ marginBottom:12, color:"rgba(255,255,255,0.35)" }}>Форма</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {SHAPES.map(([id,lb])=>(
              <button key={id}
                style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6,
                  padding:"11px 9px", borderRadius:12, minWidth:58, cursor:"pointer",
                  border:`1.5px solid ${cfg.shape===id ? "#fff" : "rgba(255,255,255,0.12)"}`,
                  background: cfg.shape===id ? "#fff" : "rgba(255,255,255,0.04)",
                  transition:"all 0.18s ease" }}
                onClick={()=>up({shape:id})}>
                <ShapeIco s={id} inv={cfg.shape!==id}/>
                <span style={{ fontSize:10, fontWeight:500,
                  color:cfg.shape===id?"#16181B":"rgba(255,255,255,0.5)" }}>{lb.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Размер */}
        <div style={{ marginBottom:28 }}>
          <div className="label" style={{ marginBottom:12, color:"rgba(255,255,255,0.35)" }}>Размер</div>
          <div style={{ display:"flex", gap:8 }}>
            {([["sm","Малый"],["md","Средний"],["lg","Большой"]] as [Size,string][]).map(([id,lb])=>(
              <DarkChip key={id} label={lb} sel={cfg.size===id} onClick={()=>up({size:id})}/>
            ))}
          </div>
        </div>

        {/* Толщина */}
        <div style={{ marginBottom:28 }}>
          <div className="label" style={{ marginBottom:12, color:"rgba(255,255,255,0.35)" }}>Толщина</div>
          <div style={{ display:"flex", gap:8 }}>
            {([["thin","Тонкая"],["medium","Средняя"],["thick","Массивная"]] as [Thickness,string][]).map(([id,lb])=>(
              <DarkChip key={id} label={lb} sel={cfg.thickness===id} onClick={()=>up({thickness:id})}/>
            ))}
          </div>
        </div>

        {/* Цвет */}
        <div style={{ marginBottom:28 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
            <span className="label" style={{ color:"rgba(255,255,255,0.35)" }}>Цвет</span>
            <span style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.55)" }}>{cfg.colorName}</span>
          </div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {COLORS.map(([hex,name])=>(
              <button key={hex} title={name}
                style={{ width:28, height:28, borderRadius:"50%", cursor:"pointer",
                  background: hex==="#C9C5BC"?"linear-gradient(135deg,#E0DDD8,#BDBAB4)":hex,
                  border:`2px solid ${cfg.color===hex?"#fff":"transparent"}`,
                  outline: cfg.color===hex ? "2px solid rgba(255,255,255,0.3)" : "none",
                  outlineOffset:3, transition:"all 0.2s" }}
                onClick={()=>up({color:hex,colorName:name})}/>
            ))}
          </div>
        </div>

        {/* Материал */}
        <div style={{ marginBottom:28 }}>
          <div className="label" style={{ marginBottom:12, color:"rgba(255,255,255,0.35)" }}>Материал</div>
          <div style={{ display:"flex", gap:8 }}>
            {MATS.map(([id,lb])=>(
              <DarkChip key={id} label={lb} sel={cfg.material===id} onClick={()=>up({material:id})}/>
            ))}
          </div>
        </div>

        {/* Стиль */}
        <div style={{ marginBottom:36 }}>
          <div className="label" style={{ marginBottom:12, color:"rgba(255,255,255,0.35)" }}>Стиль</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {([["minimal","Минимализм"],["classic","Классика"],["modern","Современный"],["bold","Акцентный"]] as [StylePref,string][]).map(([id,lb])=>(
              <DarkChip key={id} label={lb} sel={cfg.stylePref===id} onClick={()=>up({stylePref:id})}/>
            ))}
          </div>
        </div>

        {/* Summary + CTA */}
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:24 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:20 }}>
            {[["Форма", cfg.shape === "round" ? "Круглая" : cfg.shape === "oval" ? "Овальная" : cfg.shape === "square" ? "Квадратная" : cfg.shape === "rect" ? "Прямоугольная" : "Кошачий глаз"],
              ["Цвет", cfg.colorName],
              ["Толщина", cfg.thickness === "thin" ? "Тонкая" : cfg.thickness === "thick" ? "Массивная" : "Средняя"],
              ["Материал", cfg.material === "metal" ? "Металл" : cfg.material === "acetate" ? "Ацетат" : "Комбо"]].map(([k,v])=>(
              <div key={k} style={{ background:"rgba(255,255,255,0.04)", borderRadius:10, padding:"10px 12px" }}>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", fontWeight:700, letterSpacing:"0.06em", marginBottom:4 }}>{k.toUpperCase()}</div>
                <div style={{ fontSize:13, fontWeight:600, color:"#fff" }}>{v}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-accent" style={{ width:"100%", justifyContent:"center", fontSize:14, padding:"14px" }}
            onClick={() => onNav("optics")}>
            Найти похожие в оптике <Arrow/>
          </button>
          <button className="btn-ghost" style={{ width:"100%", justifyContent:"center", display:"flex",
            alignItems:"center", marginTop:10, borderRadius:12, padding:"11px" }}
            onClick={handleSave}>
            Сохранить дизайн
          </button>
        </div>
      </div>
    </div>
  )
}

/* dark chip helper used inside Visualizer */
function DarkChip({ label, sel, onClick }: { label:string; sel:boolean; onClick:()=>void }) {
  return (
    <button onClick={onClick}
      style={{ fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:500, whiteSpace:"nowrap",
        padding:"8px 16px", borderRadius:10, cursor:"pointer", transition:"all 0.18s ease",
        border:`1px solid ${sel ? "#fff" : "rgba(255,255,255,0.14)"}`,
        background: sel ? "#fff" : "rgba(255,255,255,0.04)",
        color: sel ? "#16181B" : "rgba(255,255,255,0.55)" }}>
      {label}
    </button>
  )
}

/* ═══════════════════════════════════════════════════════
   SCREEN 5 — OPTICAL CENTER SELECTION
═══════════════════════════════════════════════════════ */
function Optics({ onNav, onSelectOptic }:
  { onNav:(s:Screen)=>void; onSelectOptic:(o:typeof OPTICS[0])=>void }) {
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Nav onNav={onNav}/>
      <div style={{ maxWidth:1000, margin:"0 auto", padding:"100px 48px 80px" }}>
        <div className="tag tag-blue" style={{ marginBottom:24, display:"inline-flex" }}>Шаг 3 из 4</div>
        <h1 className="serif" style={{ fontSize:"clamp(36px,4vw,58px)", letterSpacing:"-0.03em",
          lineHeight:1.07, marginBottom:20 }}>
          Где хотите найти<br/>свою оправу?
        </h1>
        <p style={{ fontSize:17, lineHeight:1.7, color:"var(--sub)", maxWidth:500, marginBottom:52 }}>
          Мы найдём ближайшие совпадения среди доступных моделей выбранной оптики.
        </p>

        {/* Map placeholder */}
        <div style={{ height:240, borderRadius:"var(--r-xl)", overflow:"hidden",
          background:"linear-gradient(135deg, #dae4d0, #c8d9c6)", marginBottom:40, position:"relative",
          border:"1px solid var(--hairline)" }}>
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
            flexDirection:"column", gap:8 }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" fill="rgba(48,150,106,0.2)" stroke="var(--green)" strokeWidth="1.5"/>
              <circle cx="20" cy="20" r="6" fill="var(--green)"/>
            </svg>
            <span style={{ fontSize:13, color:"var(--sub)", fontWeight:500 }}>Алматы, Казахстан</span>
          </div>
          {/* Fake pins */}
          {[[30,40],[55,55],[70,38]].map(([x,y],i)=>(
            <div key={i} style={{ position:"absolute", left:`${x}%`, top:`${y}%`,
              width:14, height:14, borderRadius:"50%", background:"var(--accent)",
              border:"2px solid #fff", boxShadow:"0 2px 6px rgba(0,0,0,0.2)",
              transform:"translate(-50%,-50%)" }}/>
          ))}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {OPTICS.map((o,i)=>(
            <div key={o.id} className="card card-hover" style={{ padding:"28px 32px",
              display:"flex", justifyContent:"space-between", alignItems:"center", gap:32, cursor:"pointer" }}
              onClick={()=>{onSelectOptic(o);onNav("matching")}}>
              <div style={{ display:"flex", gap:20, alignItems:"center" }}>
                <div style={{ width:52, height:52, borderRadius:14, flexShrink:0,
                  background: i===0 ? "var(--text)" : "var(--bg)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  border: i===0 ? "none" : "1px solid var(--hairline2)" }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <rect x="2" y="7" width="18" height="10" rx="3.5"
                      stroke={i===0?"#fff":"var(--sub)"} strokeWidth="1.5"/>
                    <ellipse cx="8" cy="12" rx="2.5" ry="2" stroke={i===0?"#fff":"var(--sub)"} strokeWidth="1.2"/>
                    <ellipse cx="14" cy="12" rx="2.5" ry="2" stroke={i===0?"#fff":"var(--sub)"} strokeWidth="1.2"/>
                  </svg>
                </div>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                    <h3 style={{ fontSize:17, fontWeight:700, letterSpacing:"-0.02em" }}>{o.name}</h3>
                    {i===0 && <span className="tag tag-green" style={{ fontSize:9 }}>Ближайшая</span>}
                  </div>
                  <div style={{ fontSize:13, color:"var(--sub)", marginBottom:6 }}>{o.area}</div>
                  <StarRating val={o.rating}/>
                </div>
              </div>
              <div style={{ display:"flex", gap:32, alignItems:"center", flexShrink:0 }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:16, fontWeight:700, letterSpacing:"-0.02em" }}>{o.dist}</div>
                  <div style={{ fontSize:11, color:"var(--sub)" }}>расстояние</div>
                </div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:16, fontWeight:700, letterSpacing:"-0.02em" }}>{o.count}</div>
                  <div style={{ fontSize:11, color:"var(--sub)" }}>моделей</div>
                </div>
                <button className="btn btn-fill" style={{ fontSize:14, padding:"12px 24px" }}
                  onClick={e=>{e.stopPropagation();onSelectOptic(o);onNav("matching")}}>
                  Выбрать
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SCREEN 6 — CATALOG MATCHING ANIMATION
═══════════════════════════════════════════════════════ */
function Matching({ onNav, optic }: { onNav:(s:Screen)=>void; optic:typeof OPTICS[0] }) {
  const [step, setStep] = useState(0)
  const [pct, setPct]   = useState(0)
  const CATS = ["Форма","Цвет","Размер","Материал","Стиль"]

  useEffect(() => {
    const ts = [
      setTimeout(() => { setStep(1); setPct(20) }, 700),
      setTimeout(() => { setStep(2); setPct(40) }, 1400),
      setTimeout(() => { setStep(3); setPct(62) }, 2100),
      setTimeout(() => { setStep(4); setPct(80) }, 2800),
      setTimeout(() => { setStep(5); setPct(100)}, 3500),
      setTimeout(() => onNav("results"), 4400),
    ]
    return () => ts.forEach(clearTimeout)
  }, [onNav])

  return (
    <div style={{ height:"100vh", background:"var(--dark-bg)", display:"flex",
      alignItems:"center", justifyContent:"center" }}>
      <div style={{ maxWidth:600, width:"100%", padding:"0 48px", textAlign:"center" }}>
        <div className="tag tag-blue" style={{ marginBottom:28, display:"inline-flex" }}>
          <span style={{ width:6,height:6,borderRadius:"50%",background:"var(--accent)",display:"block" }} className="blink"/>
          Анализ каталога
        </div>
        <h1 className="serif" style={{ fontSize:"clamp(32px,4vw,56px)", letterSpacing:"-0.03em",
          color:"#fff", lineHeight:1.06, marginBottom:16 }}>
          Ищем похожие оправы
        </h1>
        <p style={{ fontSize:16, color:"rgba(255,255,255,0.42)", marginBottom:48 }}>
          Сравниваем ваш дизайн с моделями<br/>из каталога {optic.name} ({optic.count} моделей)
        </p>

        {/* Flow diagram */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:16, marginBottom:48 }}>
          <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:12, padding:"16px 20px",
            border:"1px solid rgba(255,255,255,0.12)" }}>
            <div style={{ fontSize:24 }}>🎨</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginTop:4, fontWeight:600 }}>Ваш дизайн</div>
          </div>
          <div style={{ fontSize:20, color:"var(--accent)" }}>↓</div>
          <div style={{ background:"rgba(106,195,236,0.15)", borderRadius:12, padding:"16px 20px",
            border:"1px solid rgba(106,195,236,0.3)" }}>
            <div style={{ fontSize:24 }}>🧠</div>
            <div style={{ fontSize:11, color:"var(--accent)", marginTop:4, fontWeight:600 }}>AI-анализ</div>
          </div>
          <div style={{ fontSize:20, color:"var(--green)" }}>↓</div>
          <div style={{ background:"rgba(48,150,106,0.15)", borderRadius:12, padding:"16px 20px",
            border:"1px solid rgba(48,150,106,0.3)" }}>
            <div style={{ fontSize:24 }}>🎯</div>
            <div style={{ fontSize:11, color:"var(--green)", marginTop:4, fontWeight:600 }}>Совпадения</div>
          </div>
        </div>

        {/* Category bars */}
        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:36 }}>
          {CATS.map((c,i)=>(
            <div key={c} style={{ display:"flex", alignItems:"center", gap:12,
              opacity:i<step?1:0.2, transition:"opacity 0.4s ease" }}>
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.55)", width:72, textAlign:"left" }}>{c}</span>
              <div className="track" style={{ flex:1, background:"rgba(255,255,255,0.1)" }}>
                <div className="fill" style={{ width: i<step ? `${75+i*4}%`:"0%",
                  transition:"width 0.8s cubic-bezier(0.22,1,0.36,1)" }}/>
              </div>
              <span style={{ fontSize:12, fontWeight:700, color:"var(--accent)", width:36, textAlign:"right" }}>
                {i<step ? `${75+i*4}%` : "–"}
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.4)" }}>Прогресс</span>
            <span style={{ fontSize:13, fontWeight:700, color:"var(--accent)" }}>{pct}%</span>
          </div>
          <div className="track" style={{ background:"rgba(255,255,255,0.1)" }}>
            <div className="fill" style={{ width:`${pct}%` }}/>
          </div>
        </div>

        {step >= 5 && (
          <div className="fade-up" style={{ padding:"16px 24px", background:"rgba(48,150,106,0.2)",
            borderRadius:12, border:"1px solid rgba(48,150,106,0.4)" }}>
            <div style={{ fontSize:16, fontWeight:700, color:"var(--green)" }}>
              Найдено 12 подходящих моделей
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SCREEN 7 — MATCHING RESULTS
═══════════════════════════════════════════════════════ */
function Results({ onNav, cfg, optic, onSelectResult }:
  { onNav:(s:Screen)=>void; cfg:Cfg; optic:typeof OPTICS[0]; onSelectResult:(r:typeof RESULTS[0])=>void }) {
  const [expanded, setExpanded] = useState<number|null>(null)
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Nav onNav={onNav}/>
      <div style={{ maxWidth:1240, margin:"0 auto", padding:"88px 48px 80px" }}>

        <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:40, alignItems:"end", marginBottom:48 }}>
          <div>
            <div className="tag tag-green" style={{ marginBottom:20 }}>
              <Tick col="var(--green)" size={12}/>
              {optic.name} · {optic.count} моделей проверено
            </div>
            <h1 className="serif" style={{ fontSize:"clamp(32px,4vw,56px)", letterSpacing:"-0.03em",
              lineHeight:1.06, marginBottom:16 }}>
              Мы нашли похожие оправы
            </h1>
            <p style={{ fontSize:17, color:"var(--sub)" }}>
              Лучшие совпадения из каталога {optic.name}.
            </p>
          </div>
          {/* Your design thumb */}
          <div className="card" style={{ padding:"20px 24px", cursor:"default", flexShrink:0, minWidth:200 }}>
            <div className="label" style={{ marginBottom:12 }}>Ваш дизайн</div>
            {[["Форма", cfg.shape==="round"?"Круглая":cfg.shape==="oval"?"Овальная":cfg.shape==="square"?"Квадратная":cfg.shape==="rect"?"Прямоугольная":"Кошачий глаз"],
              ["Цвет", cfg.colorName],
              ["Материал", cfg.material==="metal"?"Металл":cfg.material==="acetate"?"Ацетат":"Комбо"]].map(([k,v])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between", gap:16, marginBottom:7 }}>
                <span style={{ fontSize:12, color:"var(--sub)" }}>{k}</span>
                <span style={{ fontSize:12, fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
          {RESULTS.map(r=>(
            <div key={r.id}>
              <div className="card card-hover" style={{ overflow:"hidden", cursor:"pointer" }}
                onClick={()=>{onSelectResult(r);onNav("compare")}}>
                <div style={{ position:"relative", height:220, background:"#EDEBE8" }}>
                  <img src={r.img} alt={r.name}
                    style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
                  <div style={{ position:"absolute", top:14, left:14 }}>
                    <div style={{ background: r.match>=90?"var(--green)":r.match>=80?"var(--accent)":"var(--sub)",
                      color:"#fff", borderRadius:99, padding:"5px 12px", fontSize:11, fontWeight:700 }}>
                      {r.match}% совпадение
                    </div>
                  </div>
                  <div style={{ position:"absolute", top:14, right:14,
                    background:"rgba(255,255,255,0.9)", borderRadius:99, padding:"4px 10px", fontSize:10, fontWeight:600, color:"var(--sub)" }}>
                    {r.brand}
                  </div>
                </div>
                <div style={{ padding:"20px 24px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <div>
                      <h3 style={{ fontSize:15, fontWeight:700, letterSpacing:"-0.02em", marginBottom:3 }}>{r.name}</h3>
                      <span style={{ fontSize:12, color:"var(--sub)" }}>{r.desc}</span>
                    </div>
                    <span className="serif" style={{ fontSize:18, letterSpacing:"-0.02em", whiteSpace:"nowrap" }}>
                      ₸{r.price.toLocaleString("ru-RU")}
                    </span>
                  </div>
                  {/* Match breakdown - expandable */}
                  <button style={{ display:"flex", justifyContent:"space-between", width:"100%",
                    background:"none", border:"none", cursor:"pointer", padding:"8px 0",
                    borderTop:"1px solid var(--hairline)" }}
                    onClick={e=>{e.stopPropagation();setExpanded(expanded===r.id?null:r.id)}}>
                    <span style={{ fontSize:11, color:"var(--sub)", fontWeight:600 }}>Разбивка совпадения</span>
                    <span style={{ fontSize:11, color:"var(--sub)" }}>{expanded===r.id?"▲":"▼"}</span>
                  </button>
                  {expanded===r.id && (
                    <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:8 }}>
                      {(Object.entries(r.breakdown) as [string,number][]).map(([k,v])=>(
                        <div key={k} style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontSize:11, color:"var(--sub)", width:64, textTransform:"capitalize" }}>
                            {k==="shape"?"Форма":k==="color"?"Цвет":k==="size"?"Размер":"Материал"}
                          </span>
                          <div className="track" style={{ flex:1 }}>
                            <div className="fill" style={{ width:`${v}%` }}/>
                          </div>
                          <span style={{ fontSize:11, fontWeight:700, color:"var(--green)", width:32, textAlign:"right" }}>{v}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display:"flex", gap:8, marginTop:12 }}>
                    <span style={{ fontSize:12, fontWeight:600,
                      color: r.avail==="В наличии" ? "var(--green)" : "var(--sub)",
                      background: r.avail==="В наличии" ? "var(--green-bg)" : "var(--bg)",
                      padding:"4px 10px", borderRadius:99 }}>{r.avail}</span>
                    <button className="btn btn-ring" style={{ flex:1, justifyContent:"center", fontSize:12, padding:"8px" }}
                      onClick={e=>{e.stopPropagation();onSelectResult(r);onNav("compare")}}>
                      Подробнее
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SCREEN 8 — COMPARE DESIGN vs REAL FRAME
═══════════════════════════════════════════════════════ */
function Compare({ onNav, cfg, result }: { onNav:(s:Screen)=>void; cfg:Cfg; result:typeof RESULTS[0] }) {
  const matchCfg: Cfg = { ...cfg, shape: result.shape }
  return (
    <div style={{ height:"100vh", background:"#0D0F11", display:"flex", overflow:"hidden" }}>
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Header */}
        <div style={{ padding:"24px 40px", borderBottom:"1px solid rgba(255,255,255,0.07)",
          display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <button style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)",
            cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", gap:8 }}
            onClick={()=>onNav("results")}>
            ← Назад к результатам
          </button>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em",
              color:"rgba(255,255,255,0.35)", textTransform:"uppercase", marginBottom:4 }}>Сравнение</div>
            <div className="serif" style={{ fontSize:24, color:"#fff", letterSpacing:"-0.025em" }}>
              {result.match}% совпадение
            </div>
          </div>
          <button className="btn btn-accent" style={{ fontSize:14 }} onClick={()=>onNav("tryon")}>
            Примерить реальную <Arrow/>
          </button>
        </div>

        {/* Split view */}
        <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1fr", overflow:"hidden" }}>
          {/* Left: Your design */}
          <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center",
            borderRight:"1px solid rgba(255,255,255,0.07)", background:"#111316" }}>
            <div style={{ position:"absolute", top:20, left:"50%", transform:"translateX(-50%)",
              background:"rgba(255,255,255,0.08)", borderRadius:99, padding:"7px 18px",
              border:"1px solid rgba(255,255,255,0.12)" }}>
              <span style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.8)" }}>Ваш дизайн</span>
            </div>
            <div style={{ position:"relative", width:320, height:430, borderRadius:"var(--r-xl)",
              overflow:"hidden", boxShadow:"0 24px 60px rgba(0,0,0,0.4)" }}>
              <img src={P.user} alt="Ваш дизайн" style={{ width:"100%", height:"100%",
                objectFit:"cover", objectPosition:"center top", filter:"brightness(0.85) saturate(0.9)" }}/>
              <Glasses cfg={cfg}/>
            </div>
            <div style={{ position:"absolute", bottom:24, left:"50%", transform:"translateX(-50%)",
              display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center" }}>
              {[cfg.colorName, cfg.shape==="rect"?"Прямоугольная":cfg.shape==="round"?"Круглая":"Овальная",
                cfg.thickness==="thin"?"Тонкая":"Средняя",
                cfg.material==="metal"?"Металл":"Ацетат"].map(t=>(
                <span key={t} style={{ fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:99,
                  background:"rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.7)" }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Right: Real frame */}
          <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center", background:"#0D0F11" }}>
            <div style={{ position:"absolute", top:20, left:"50%", transform:"translateX(-50%)",
              background:"rgba(48,150,106,0.2)", borderRadius:99, padding:"7px 18px",
              border:"1px solid rgba(48,150,106,0.4)" }}>
              <span style={{ fontSize:12, fontWeight:700, color:"var(--green)" }}>Реальная оправа</span>
            </div>
            <div style={{ position:"relative", width:320, height:430, borderRadius:"var(--r-xl)",
              overflow:"hidden", boxShadow:"0 24px 60px rgba(0,0,0,0.4)" }}>
              <img src={P.user} alt="Реальная оправа" style={{ width:"100%", height:"100%",
                objectFit:"cover", objectPosition:"center top", filter:"brightness(0.85) saturate(0.9)" }}/>
              <Glasses cfg={matchCfg}/>
            </div>
            <div style={{ position:"absolute", bottom:24, left:"50%", transform:"translateX(-50%)",
              display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center" }}>
              {[result.name, result.brand, `₸${result.price.toLocaleString("ru-RU")}`, result.avail].map(t=>(
                <span key={t} style={{ fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:99,
                  background: result.avail===t ? "rgba(48,150,106,0.25)" : "rgba(255,255,255,0.12)",
                  color: result.avail===t ? "var(--green)" : "rgba(255,255,255,0.7)" }}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Match breakdown bar */}
        <div style={{ padding:"16px 40px", borderTop:"1px solid rgba(255,255,255,0.07)",
          display:"flex", gap:28, alignItems:"center", flexShrink:0 }}>
          {(Object.entries(result.breakdown) as [string,number][]).map(([k,v])=>(
            <div key={k} style={{ display:"flex", flex:1, flexDirection:"column", gap:6 }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)", fontWeight:600 }}>
                  {k==="shape"?"Форма":k==="color"?"Цвет":k==="size"?"Размер":"Материал"}
                </span>
                <span style={{ fontSize:11, fontWeight:700, color:"var(--green)" }}>{v}%</span>
              </div>
              <div className="track" style={{ background:"rgba(255,255,255,0.08)" }}>
                <div className="fill" style={{ width:`${v}%` }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SCREEN 9 — VIRTUAL TRY-ON (real product)
═══════════════════════════════════════════════════════ */
function TryOn({ onNav, result, optic }:
  { onNav:(s:Screen)=>void; result:typeof RESULTS[0]; optic:typeof OPTICS[0] }) {
  const tryCfg: Cfg = { ...DEFAULT_CFG, color:"#1B1C1E", colorName:"Чёрный", shape:result.shape }
  return (
    <div style={{ height:"100vh", background:"#0D0E10", display:"flex", overflow:"hidden" }}>
      <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 340px",
        maxWidth:1280, margin:"0 auto", width:"100%", padding:"72px 40px 40px", gap:32, alignItems:"center" }}>

        {/* Portrait */}
        <div style={{ position:"relative", borderRadius:"var(--r-xl)", overflow:"hidden",
          background:"#181A1C", height:"calc(100vh - 120px)", maxHeight:740 }}>
          <img src={P.user} alt="Примерка" style={{ width:"100%", height:"100%",
            objectFit:"cover", objectPosition:"center top",
            filter:"brightness(0.84) contrast(1.08) saturate(0.94)" }}/>
          <Glasses cfg={tryCfg}/>
          <div style={{ position:"absolute", inset:0,
            background:"radial-gradient(ellipse at center, transparent 50%, rgba(13,14,16,0.55) 100%)" }}/>
          <div style={{ position:"absolute", top:24, left:24 }}>
            <div className="glass" style={{ borderRadius:99, padding:"8px 16px" }}>
              <span style={{ fontSize:11, fontWeight:700 }}>Реальная оправа из каталога</span>
            </div>
          </div>
          <div style={{ position:"absolute", bottom:28, left:28, right:28,
            display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
            <div>
              <div className="serif" style={{ fontSize:22, color:"#fff", letterSpacing:"-0.025em" }}>{result.name}</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.5)", marginTop:4 }}>
                {result.brand} · ₸{result.price.toLocaleString("ru-RU")}
              </div>
            </div>
            <div style={{ background:"var(--green)", borderRadius:99, padding:"7px 16px",
              fontSize:13, fontWeight:700, color:"#fff" }}>
              {result.match}% совпадение
            </div>
          </div>
        </div>

        {/* Panel */}
        <div className="glass-dark" style={{ borderRadius:"var(--r-lg)", padding:"32px 28px", color:"#fff" }}>
          <div className="tag tag-blue" style={{ marginBottom:20, fontSize:10 }}>Примерьте реальную оправу</div>
          <h2 className="serif" style={{ fontSize:26, letterSpacing:"-0.025em", marginBottom:6 }}>{result.name}</h2>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.42)", marginBottom:24 }}>
            {result.brand} · {result.desc}
          </p>

          {[["Цена",`₸${result.price.toLocaleString("ru-RU")}`],
            ["Наличие",result.avail],
            ["Оптика",optic.name],
            ["Адрес",optic.addr],
            ["Режим",optic.hours]].map(([k,v])=>(
            <div key={k} style={{ display:"flex", justifyContent:"space-between",
              padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.42)" }}>{k}</span>
              <span style={{ fontSize:13, fontWeight:600,
                color: k==="Наличие" && v==="В наличии" ? "var(--green)" : "#fff" }}>{v}</span>
            </div>
          ))}

          {/* Why this match */}
          <div style={{ marginTop:20, marginBottom:24, padding:"14px 16px",
            background:"rgba(48,150,106,0.12)", borderRadius:12, border:"1px solid rgba(48,150,106,0.25)" }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.06em", color:"var(--green)",
              marginBottom:10, textTransform:"uppercase" }}>Почему эта оправа подходит?</div>
            {["Форма совпадает","Цвет — 100%","Подходящий размер","Близкий материал"].map(t=>(
              <div key={t} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:7 }}>
                <Tick col="var(--green)" size={12}/>
                <span style={{ fontSize:13, color:"rgba(255,255,255,0.65)" }}>{t}</span>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <button className="btn btn-accent" style={{ width:"100%", justifyContent:"center", fontSize:14, padding:"14px" }}
              onClick={()=>onNav("store")}>
              Записаться на примерку <Arrow/>
            </button>
            <button className="btn-ghost" style={{ width:"100%", justifyContent:"center", display:"flex",
              alignItems:"center", borderRadius:12, padding:"11px" }}
              onClick={()=>onNav("results")}>
              Посмотреть другие модели
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SCREEN 10 — OPTICAL CENTER DETAILS
═══════════════════════════════════════════════════════ */
function Store({ onNav, optic, result }:
  { onNav:(s:Screen)=>void; optic:typeof OPTICS[0]; result:typeof RESULTS[0] }) {
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Nav onNav={onNav}/>
      <div style={{ maxWidth:900, margin:"0 auto", padding:"100px 48px 80px" }}>
        <button style={{ background:"none", border:"none", color:"var(--sub)", cursor:"pointer",
          fontSize:13, display:"flex", alignItems:"center", gap:6, marginBottom:36 }}
          onClick={()=>onNav("tryon")}>
          ← Вернуться
        </button>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:40, alignItems:"start" }}>
          <div>
            <div className="tag tag-green" style={{ marginBottom:24 }}>Оправа доступна для примерки</div>
            <h1 className="serif" style={{ fontSize:"clamp(32px,4vw,52px)", letterSpacing:"-0.03em",
              lineHeight:1.07, marginBottom:8 }}>
              {optic.name}
            </h1>
            <p style={{ fontSize:16, color:"var(--sub)", marginBottom:36 }}>{optic.area}</p>

            {/* Map placeholder */}
            <div style={{ height:220, borderRadius:"var(--r-lg)", overflow:"hidden",
              background:"linear-gradient(135deg, #dae4d0, #c8d9c6)",
              marginBottom:32, border:"1px solid var(--hairline)", position:"relative",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ width:40, height:40, borderRadius:"50%", background:"rgba(48,150,106,0.25)",
                  border:"2px solid var(--green)", margin:"0 auto 8px",
                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <div style={{ width:12, height:12, borderRadius:"50%", background:"var(--green)" }}/>
                </div>
                <div style={{ fontSize:13, fontWeight:600 }}>{optic.addr}</div>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              {[["📍 Адрес",optic.addr],["⏰ Сегодня",optic.hours],
                ["📞 Телефон","+7 700 000 0000"],["🚗 Добраться",`${optic.dist} от вас`]].map(([k,v])=>(
                <div key={k} className="card" style={{ padding:"16px 20px", cursor:"default" }}>
                  <div style={{ fontSize:12, color:"var(--sub)", marginBottom:4 }}>{k}</div>
                  <div style={{ fontSize:14, fontWeight:600 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking card */}
          <div className="card" style={{ padding:"28px", position:"sticky", top:80, cursor:"default" }}>
            <div className="label" style={{ marginBottom:20 }}>Ваша оправа</div>
            <div style={{ background:"var(--bg)", borderRadius:12, overflow:"hidden", marginBottom:16 }}>
              <img src={result.img} alt={result.name} style={{ width:"100%", height:140, objectFit:"cover" }}/>
            </div>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>{result.name}</div>
              <div style={{ fontSize:13, color:"var(--sub)", marginBottom:8 }}>{result.desc}</div>
              <div className="serif" style={{ fontSize:24, letterSpacing:"-0.02em" }}>
                ₸{result.price.toLocaleString("ru-RU")}
              </div>
            </div>
            <div style={{ padding:"12px 0", borderTop:"1px solid var(--hairline)", marginBottom:20 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"var(--green)",
                display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:6,height:6,borderRadius:"50%",background:"var(--green)" }}/>
                {result.avail}
              </div>
            </div>
            <button className="btn btn-fill" style={{ width:"100%", justifyContent:"center", fontSize:15, padding:"15px", marginBottom:10 }}
              onClick={()=>onNav("booking")}>
              Забронировать примерку <Arrow/>
            </button>
            <button className="btn btn-ring" style={{ width:"100%", justifyContent:"center", fontSize:13 }}>
              Построить маршрут
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SCREEN 11 — BOOKING
═══════════════════════════════════════════════════════ */
function Booking({ onNav, optic, result }:
  { onNav:(s:Screen)=>void; optic:typeof OPTICS[0]; result:typeof RESULTS[0] }) {
  const [selectedTime, setSelectedTime] = useState("")
  const TIMES = ["10:00","11:30","13:00","14:30","16:00","17:30","18:30","19:00"]
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Nav onNav={onNav}/>
      <div style={{ maxWidth:700, margin:"0 auto", padding:"100px 48px 80px" }}>
        <div className="tag tag-blue" style={{ marginBottom:24 }}>Запись на примерку</div>
        <h1 className="serif" style={{ fontSize:"clamp(34px,4vw,54px)", letterSpacing:"-0.03em",
          lineHeight:1.06, marginBottom:20 }}>
          Выберите удобное время
        </h1>
        <p style={{ fontSize:16, color:"var(--sub)", marginBottom:44 }}>
          {optic.name} · {optic.addr}
        </p>

        {/* Booking card */}
        <div className="card" style={{ padding:"28px", marginBottom:28, cursor:"default",
          display:"flex", gap:20, alignItems:"center" }}>
          <div style={{ width:70, height:70, borderRadius:12, overflow:"hidden", flexShrink:0, background:"#EDEBE8" }}>
            <img src={result.img} alt={result.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
          </div>
          <div>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:3 }}>{result.name}</div>
            <div style={{ fontSize:13, color:"var(--sub)", marginBottom:6 }}>{result.brand} · {result.desc}</div>
            <div className="serif" style={{ fontSize:20, letterSpacing:"-0.02em" }}>
              ₸{result.price.toLocaleString("ru-RU")}
            </div>
          </div>
        </div>

        {/* Date — today only for MVP */}
        <div style={{ marginBottom:28 }}>
          <div className="label" style={{ marginBottom:12 }}>Дата</div>
          <div className="card" style={{ padding:"14px 18px", display:"flex", justifyContent:"space-between",
            cursor:"default", alignItems:"center" }}>
            <span style={{ fontWeight:600 }}>Сегодня</span>
            <span style={{ fontSize:13, color:"var(--sub)" }}>{new Date().toLocaleDateString("ru-RU",{weekday:"long",day:"numeric",month:"long"})}</span>
          </div>
        </div>

        {/* Time slots */}
        <div style={{ marginBottom:40 }}>
          <div className="label" style={{ marginBottom:14 }}>Время</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
            {TIMES.map(t=>(
              <button key={t} className={`chip ${selectedTime===t?"sel":""}`} onClick={()=>setSelectedTime(t)}>{t}</button>
            ))}
          </div>
        </div>

        <button className="btn btn-fill" style={{ width:"100%", justifyContent:"center",
          fontSize:15, padding:"16px", opacity:selectedTime?1:0.4 }}
          onClick={()=>{ if(selectedTime) onNav("confirm") }}>
          Подтвердить запись <Arrow/>
        </button>
        {!selectedTime && (
          <p style={{ fontSize:12, color:"var(--sub)", textAlign:"center", marginTop:10 }}>
            Выберите удобное время
          </p>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SCREEN 12 — CONFIRMATION
═══════════════════════════════════════════════════════ */
function Confirm({ onNav, optic, result }:
  { onNav:(s:Screen)=>void; optic:typeof OPTICS[0]; result:typeof RESULTS[0] }) {
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ maxWidth:560, width:"100%", padding:"80px 48px", textAlign:"center" }}>
        <div style={{ width:80, height:80, borderRadius:"50%", background:"var(--green)",
          display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 32px" }}>
          <Tick col="#fff" size={36}/>
        </div>
        <h1 className="serif" style={{ fontSize:"clamp(32px,4vw,52px)", letterSpacing:"-0.03em",
          lineHeight:1.06, marginBottom:16 }}>
          Примерка забронирована
        </h1>
        <p style={{ fontSize:16, color:"var(--sub)", marginBottom:44 }}>
          Мы пришлём напоминание за час.
        </p>

        <div className="card" style={{ padding:"32px", cursor:"default", marginBottom:32, textAlign:"left" }}>
          <div style={{ display:"flex", gap:20, alignItems:"center", marginBottom:24,
            paddingBottom:20, borderBottom:"1px solid var(--hairline)" }}>
            <div style={{ width:64, height:64, borderRadius:12, overflow:"hidden", flexShrink:0, background:"#EDEBE8" }}>
              <img src={result.img} alt={result.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
            </div>
            <div>
              <div style={{ fontSize:16, fontWeight:700, marginBottom:3 }}>{result.name}</div>
              <div style={{ fontSize:13, color:"var(--sub)" }}>{result.brand} · {result.desc}</div>
            </div>
          </div>
          {[["Оптика",optic.name],["Адрес",optic.addr],
            ["Дата","Сегодня, 18:30"],["Телефон","+7 700 000 0000"]].map(([k,v])=>(
            <div key={k} style={{ display:"flex", justifyContent:"space-between",
              padding:"11px 0", borderBottom:"1px solid var(--hairline)" }}>
              <span style={{ fontSize:14, color:"var(--sub)" }}>{k}</span>
              <span style={{ fontSize:14, fontWeight:600 }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <button className="btn btn-fill" style={{ width:"100%", justifyContent:"center", fontSize:15, padding:"15px" }}>
            Добавить в календарь
          </button>
          <button className="btn btn-ring" style={{ width:"100%", justifyContent:"center", fontSize:14 }}
            onClick={()=>onNav("designs")}>
            Вернуться к моим дизайнам
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SCREEN 13 — MY DESIGNS
═══════════════════════════════════════════════════════ */
function Designs({ onNav, cfg }: { onNav:(s:Screen)=>void; cfg:Cfg }) {
  const SAVED = [
    { n:"Моя оправа #01", shape:"Прямоугольная", color:"Чёрный", mat:"Ацетат", date:"Сегодня", cfg, active:true },
    { n:"Моя оправа #02", shape:"Круглая",       color:"Черепаховый", mat:"Ацетат", date:"Вчера", cfg:{...cfg,shape:"round"as Shape,color:"#7A4A28",colorName:"Черепаховый"} as Cfg, active:false },
  ]
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Nav onNav={onNav}/>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"88px 48px 80px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:48 }}>
          <div>
            <div className="tag tag-blue" style={{ marginBottom:20 }}>Сохранённые дизайны</div>
            <h1 className="serif" style={{ fontSize:"clamp(30px,3.5vw,52px)", letterSpacing:"-0.028em", lineHeight:1.07 }}>
              Мои дизайны
            </h1>
          </div>
          <button className="btn btn-fill" style={{ fontSize:14, padding:"12px 24px" }}
            onClick={()=>onNav("upload")}>
            + Создать новый
          </button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
          {SAVED.map((d,i)=>(
            <div key={d.n} className="card card-hover" style={{ overflow:"hidden", cursor:"pointer" }}
              onClick={()=>onNav("visualizer")}>
              {/* Design preview */}
              <div style={{ height:200, background:"#E0DEDA", position:"relative" }}>
                <img src={P.user} alt={d.n} style={{ width:"100%", height:"100%",
                  objectFit:"cover", objectPosition:"center top", filter:"brightness(0.85)" }}/>
                <Glasses cfg={d.cfg}/>
                {d.active && (
                  <div style={{ position:"absolute", top:12, left:12 }}>
                    <div className="tag tag-blue" style={{ fontSize:9 }}>Текущий</div>
                  </div>
                )}
              </div>
              <div style={{ padding:"20px 22px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                  <h3 style={{ fontSize:15, fontWeight:700, letterSpacing:"-0.018em" }}>{d.n}</h3>
                  <span style={{ fontSize:12, color:"var(--sub)" }}>{d.date}</span>
                </div>
                <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
                  {[d.shape,d.color,d.mat].map(t=>(
                    <span key={t} style={{ fontSize:11, padding:"3px 9px", borderRadius:99,
                      background:"var(--bg)", border:"1px solid var(--hairline2)", color:"var(--sub)" }}>{t}</span>
                  ))}
                </div>
                <button className="btn btn-ring" style={{ width:"100%", justifyContent:"center", fontSize:13 }}
                  onClick={e=>{e.stopPropagation();onNav("optics")}}>
                  Найти в оптике <Arrow/>
                </button>
              </div>
            </div>
          ))}

          {/* Empty slot */}
          <div className="card" style={{ display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", padding:"40px 24px", cursor:"pointer", border:"2px dashed var(--hairline2)",
            background:"transparent", minHeight:300 }}
            onClick={()=>onNav("upload")}>
            <div style={{ width:52, height:52, borderRadius:"50%", background:"var(--bg)",
              display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16,
              border:"1px solid var(--hairline2)" }}>
              <span style={{ fontSize:24 }}>+</span>
            </div>
            <div style={{ fontSize:14, fontWeight:600, color:"var(--sub)", marginBottom:6 }}>Создать новый дизайн</div>
            <div style={{ fontSize:12, color:"var(--sub)", textAlign:"center" }}>
              Загрузите фото и<br/>настройте оправу
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SCREEN 14 — HOW IT WORKS / TECH
═══════════════════════════════════════════════════════ */
function Tech({ onNav }: { onNav:(s:Screen)=>void }) {
  const STEPS = [
    { n:"01", ico:"📸", t:"Сфотографируйтесь", d:"Загрузите фото или сделайте снимок. Мы создадим вашу визуализацию." },
    { n:"02", ico:"🎨", t:"Создайте оправу",   d:"Форма, толщина, цвет, материал — всё это отображается на вашем лице в реальном времени." },
    { n:"03", ico:"🏪", t:"Выберите оптику",   d:"Укажите удобную оптику рядом. Мы подключились к их реальному каталогу." },
    { n:"04", ico:"🧠", t:"AI-поиск",          d:"Алгоритм сравнивает ваш дизайн с сотнями моделей и находит наиболее похожие." },
    { n:"05", ico:"🎯", t:"Совпадение",        d:"Увидите каждую модель с % совпадения по форме, цвету, размеру и материалу." },
    { n:"06", ico:"✅", t:"Примерьте в жизни", d:"Запишитесь на примерку в выбранную оптику. Оправа уже ждёт вас." },
  ]

  return (
    <div style={{ background:"var(--bg)" }}>
      <Nav onNav={onNav}/>

      <section style={{ background:"var(--dark-bg)", padding:"120px 48px 100px", textAlign:"center" }}>
        <div style={{ maxWidth:720, margin:"0 auto" }}>
          <div className="tag tag-blue" style={{ marginBottom:28, display:"inline-flex" }}>Как это работает</div>
          <h1 className="serif" style={{ fontSize:"clamp(38px,5vw,72px)", letterSpacing:"-0.032em",
            color:"#fff", lineHeight:1.02, marginBottom:28 }}>
            Создано в цифровом.<br/>
            <em style={{ fontStyle:"italic", color:"rgba(255,255,255,0.28)" }}>Найдено в реальном.</em>
          </h1>
          <p style={{ fontSize:18, lineHeight:1.8, color:"rgba(255,255,255,0.44)", maxWidth:500, margin:"0 auto" }}>
            FRAME — это мост между вашим идеальным дизайном очков и реальным товаром в ближайшей оптике.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section style={{ maxWidth:1200, margin:"0 auto", padding:"88px 48px" }}>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <div className="label" style={{ marginBottom:14 }}>Процесс</div>
          <h2 className="serif" style={{ fontSize:"clamp(28px,3vw,46px)", letterSpacing:"-0.025em", lineHeight:1.08 }}>
            6 шагов от идеи до примерки
          </h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
          {STEPS.map(s=>(
            <div key={s.n} className="card" style={{ padding:"28px 24px", cursor:"default" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
                <span style={{ fontSize:40 }}>{s.ico}</span>
                <span className="serif" style={{ fontSize:32, color:"var(--accent-bg)", letterSpacing:"-0.04em" }}>{s.n}</span>
              </div>
              <h3 style={{ fontSize:15, fontWeight:700, letterSpacing:"-0.018em", marginBottom:10 }}>{s.t}</h3>
              <p style={{ fontSize:13, color:"var(--sub)", lineHeight:1.68 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* B2B2C model */}
      <section style={{ background:"var(--surface)", padding:"88px 48px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <div className="label" style={{ marginBottom:14 }}>Бизнес-модель</div>
            <h2 className="serif" style={{ fontSize:"clamp(26px,3vw,44px)", letterSpacing:"-0.025em", lineHeight:1.08 }}>
              Для пользователей — бесплатно.<br/>Для оптик — новые клиенты.
            </h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr auto 1fr", gap:0,
            alignItems:"center", justifyContent:"center" }}>
            {[
              { ico:"👤", t:"Покупатель", pts:["Бесплатная визуализация","Персональный дизайн","Поиск в каталогах","Запись на примерку"] },
              null,
              { ico:"🖥️", t:"FRAME", pts:["Платформа персонализации","AI-совпадение","Генерация лидов","Управление записями"] },
              null,
              { ico:"🏪", t:"Оптика", pts:["Каталог моделей","Информация о наличии","Контакты","Новые клиенты"] },
            ].map((item,i)=>{
              if (!item) return (
                <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"0 20px", gap:8 }}>
                  <Arrow/>
                  <span style={{ fontSize:11, color:"var(--sub)", fontWeight:600 }}>
                    {i===1 ? "Трафик" : "Лиды"}
                  </span>
                </div>
              )
              return (
                <div key={item.t} className="card" style={{ padding:"28px 24px", cursor:"default" }}>
                  <div style={{ fontSize:36, marginBottom:14 }}>{item.ico}</div>
                  <h3 style={{ fontSize:16, fontWeight:700, marginBottom:14 }}>{item.t}</h3>
                  {item.pts.map(p=>(
                    <div key={p} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8 }}>
                      <div style={{ width:4, height:4, borderRadius:"50%", background:"var(--accent)", flexShrink:0 }}/>
                      <span style={{ fontSize:12, color:"var(--sub)" }}>{p}</span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Future medtech — subtle */}
      <section style={{ maxWidth:900, margin:"0 auto", padding:"64px 48px", textAlign:"center" }}>
        <div className="card" style={{ padding:"40px 48px", cursor:"default",
          background:"linear-gradient(135deg, var(--surface), var(--accent-bg))" }}>
          <div className="label" style={{ marginBottom:16 }}>Персонализация может стать ещё точнее</div>
          <p style={{ fontSize:16, color:"var(--sub)", lineHeight:1.75, maxWidth:500, margin:"0 auto 20px" }}>
            В будущем подбор может учитывать дополнительные параметры зрения, рецепт и индивидуальные параметры посадки.
          </p>
          <p style={{ fontSize:11, color:"var(--sub)", maxWidth:400, margin:"0 auto" }}>
            Медицинские функции требуют отдельной клинической валидации и интеграции с соответствующими специалистами.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:"64px 48px", textAlign:"center" }}>
        <div style={{ maxWidth:500, margin:"0 auto" }}>
          <h2 className="serif" style={{ fontSize:"clamp(28px,3vw,44px)", letterSpacing:"-0.025em", marginBottom:24, lineHeight:1.08 }}>
            Попробуйте прямо сейчас
          </h2>
          <button className="btn btn-fill" style={{ fontSize:16, padding:"16px 36px" }}
            onClick={() => onNav("upload")}>
            Создать свои очки <Arrow/>
          </button>
        </div>
      </section>

      <footer style={{ borderTop:"1px solid var(--hairline)", padding:"32px 48px" }}>
        <div style={{ maxWidth:1240, margin:"0 auto", display:"flex",
          justifyContent:"space-between", alignItems:"center" }}>
          <span className="serif" style={{ fontSize:17, letterSpacing:"-0.04em" }}>FRAME</span>
          <span style={{ fontSize:13, color:"var(--sub)" }}>Создано в цифровом. Найдено в реальном.</span>
          <span style={{ fontSize:12, color:"var(--sub)" }}>© 2025 FRAME</span>
        </div>
      </footer>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════════ */
const ALL: Screen[] = [
  "home","upload","scan","visualizer",
  "optics","matching","results",
  "compare","tryon","store","booking","confirm",
  "designs","tech",
]

export default function App() {
  const [screen,       setScreen]       = useState<Screen>("home")
  const [cfg,          setCfg]          = useState<Cfg>(DEFAULT_CFG)
  const [selectedOptic,setSelectedOptic]= useState(OPTICS[0])
  const [selectedResult,setSelectedResult]=useState(RESULTS[0])

  const go = useCallback((s: Screen) => {
    setScreen(s)
    requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>(".screen.active").forEach(el => { el.scrollTop = 0 })
    })
  }, [])

  return (
    <div style={{ position:"relative", width:"100%", height:"100vh", overflow:"hidden" }}>
      {ALL.map(s => (
        <div key={s} className={`screen ${screen===s?"active":""}`}>
          {s==="home"      && <Home        onNav={go}/>}
          {s==="upload"    && <Upload      onNav={go}/>}
          {s==="scan"      && <Scan        onNav={go}/>}
          {s==="visualizer"&& <Visualizer  onNav={go} cfg={cfg} set={setCfg}/>}
          {s==="optics"    && <Optics      onNav={go} onSelectOptic={setSelectedOptic}/>}
          {s==="matching"  && <Matching    onNav={go} optic={selectedOptic}/>}
          {s==="results"   && <Results     onNav={go} cfg={cfg} optic={selectedOptic} onSelectResult={setSelectedResult}/>}
          {s==="compare"   && <Compare     onNav={go} cfg={cfg} result={selectedResult}/>}
          {s==="tryon"     && <TryOn       onNav={go} result={selectedResult} optic={selectedOptic}/>}
          {s==="store"     && <Store       onNav={go} optic={selectedOptic} result={selectedResult}/>}
          {s==="booking"   && <Booking     onNav={go} optic={selectedOptic} result={selectedResult}/>}
          {s==="confirm"   && <Confirm     onNav={go} optic={selectedOptic} result={selectedResult}/>}
          {s==="designs"   && <Designs     onNav={go} cfg={cfg}/>}
          {s==="tech"      && <Tech        onNav={go}/>}
        </div>
      ))}
    </div>
  )
}
