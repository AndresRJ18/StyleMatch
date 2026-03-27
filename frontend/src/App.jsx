import { useState, useEffect, useRef } from "react";
import './styles.css';

const API_URL = "https://mub2c1l8gb.execute-api.us-east-1.amazonaws.com/prod/analizar";

const SOCIALS = {
  andres: { ig: "https://www.instagram.com/andresrodas.exe/", linkedin: "https://www.linkedin.com/in/andres-rodas-802309272/", github: "https://github.com/AndresRJ18" },
  chiara: { ig: "https://www.instagram.com/sunghoon_uvita/", linkedin: "https://www.linkedin.com/in/chiara-miranda-50007139b/" },
};

const FRASES_HOMBRE = [
  "El estilo es una forma de decir quién eres sin hablar.",
  "Vista bien. Piensa mejor.",
  "Tu outfit habla antes que tú.",
  "Lo clásico nunca pasa de moda.",
  "Menos es más. Pero bien elegido.",
  "Confianza se escribe con buen estilo.",
];
const FRASES_MUJER = [
  "La moda se desvanece, el estilo es eterno.",
  "Viste como si fuera tu mejor día.",
  "Elegancia es cuando el interior es tan bello como el exterior.",
  "Tu outfit, tu poder.",
  "Cada look cuenta una historia.",
  "Ser tú misma es la mejor tendencia.",
];

const EJEMPLOS_HOMBRE = [
  { label: "Streetwear" },
  { label: "Formal" },
  { label: "Casual" },
];
const EJEMPLOS_MUJER = [
  { label: "Vestido" },
  { label: "Casual" },
  { label: "Elegante" },
];

const IgIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);
const LiIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
);
const GhIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPrecio(precio, moneda) {
  if (!precio || precio === 0) return "Consultar";
  const symbols = { USD: "$", EUR: "€", GBP: "£", PEN: "S/" };
  const sym = symbols[moneda] || "$";
  return `${sym}${precio.toFixed(2)}`;
}

function StarRating({ rating }) {
  if (!rating) return null;
  const stars = Math.round(rating);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", marginBottom: "0.4rem" }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ fontSize: "0.65rem", color: s <= stars ? "#F5C518" : "rgba(128,128,128,0.3)" }}>★</span>
      ))}
      <span style={{ fontSize: "0.62rem", opacity: 0.5, marginLeft: "0.2rem" }}>{rating}</span>
    </div>
  );
}

// ─── RotatingPhrase — más grande, más brillante, text-shadow ─────────────────
function RotatingPhrase({ phrases, accentColor }) {
  const [idx,   setIdx]   = useState(0);
  const [fade,  setFade]  = useState(true);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const iv = setInterval(() => {
      setFade(false); setScale(0.97);
      setTimeout(() => {
        setIdx(i => (i + 1) % phrases.length);
        setFade(true); setScale(1.02);
        setTimeout(() => setScale(1), 400);
      }, 400);
    }, 10000);
    return () => clearInterval(iv);
  }, [phrases.length]);

  return (
    <div style={{ textAlign: "center", padding: "1.8rem 1rem", minHeight: 72, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "1.22rem",           // +15% vs 1.05rem
        fontStyle: "italic",
        fontWeight: 600,               // semibold
        color: accentColor,
        opacity: fade ? 0.92 : 0,      // más brillante
        transform: `scale(${scale})`,
        transition: "opacity 0.4s ease, transform 0.4s ease",
        maxWidth: 420,
        lineHeight: 1.5,
        textShadow: `0 0 20px ${accentColor}30, 0 1px 3px rgba(0,0,0,0.15)`,  // glow sutil
        letterSpacing: 0.3,
      }}>
        "{phrases[idx]}"
      </p>
    </div>
  );
}

function ContactModal({ onClose, theme }) {
  const isM    = theme === "mujer";
  const bg     = isM ? "#FAF8F4"                : "#1C1410";
  const text   = isM ? "#0D0A06"                : "#F5EFE8";
  const accent = isM ? "#C49E6C"                : "#C8A050";
  const border = isM ? "rgba(196,158,108,0.25)" : "rgba(200,160,80,0.18)";
  const radius = isM ? 20 : 4;
  const linkS  = { display: "flex", alignItems: "center", gap: "0.3rem", color: accent, textDecoration: "none", fontSize: "0.75rem" };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: bg, color: text, padding: "2.5rem", borderRadius: radius, border: `1px solid ${border}`, maxWidth: 420, width: "90%", animation: "fadeUp 0.4s ease" }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 700, fontStyle: isM ? "italic" : "normal", marginBottom: "0.5rem", textAlign: "center" }}>Contacto</h3>
        <p style={{ fontSize: "0.8rem", fontWeight: 300, opacity: 0.5, textAlign: "center", marginBottom: "2rem" }}>Creadores de ACstyles</p>
        <div style={{ marginBottom: "1.5rem", padding: "1.2rem", border: `1px solid ${border}`, borderRadius: isM ? 14 : 2 }}>
          <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.6rem" }}>Andres Rodas</h4>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <a href={SOCIALS.andres.ig}       target="_blank" rel="noopener noreferrer" style={linkS}><IgIcon size={15} color={accent}/> Instagram</a>
            <a href={SOCIALS.andres.linkedin}  target="_blank" rel="noopener noreferrer" style={linkS}><LiIcon size={15} color={accent}/> LinkedIn</a>
            <a href={SOCIALS.andres.github}    target="_blank" rel="noopener noreferrer" style={linkS}><GhIcon size={15} color={accent}/> GitHub</a>
          </div>
        </div>
        <div style={{ marginBottom: "2rem", padding: "1.2rem", border: `1px solid ${border}`, borderRadius: isM ? 14 : 2 }}>
          <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.6rem" }}>Chiara Miranda</h4>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <a href={SOCIALS.chiara.ig}        target="_blank" rel="noopener noreferrer" style={linkS}><IgIcon size={15} color={accent}/> Instagram</a>
            <a href={SOCIALS.chiara.linkedin}   target="_blank" rel="noopener noreferrer" style={linkS}><LiIcon size={15} color={accent}/> LinkedIn</a>
          </div>
        </div>
        <button onClick={onClose} style={{ width: "100%", padding: "0.8rem", fontFamily: "'Raleway'", fontSize: "0.7rem", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", background: accent, color: isM ? "#0D0A06" : "#0D0D0D", border: "none", borderRadius: isM ? 50 : 2, cursor: "pointer" }}>Cerrar</button>
      </div>
    </div>
  );
}

function Collage({ genero }) {
  const isM    = genero === "mujer";
  const border = isM ? "rgba(196,158,108,0.30)" : "rgba(200,160,80,0.18)";
  const radius = isM ? 14 : 2;
  const slots  = isM
    ? [
        { w:"55%", h:230, img:"/images/vestido-mujer.jpg",    t:0,   l:0 },
        { w:"40%", h:150, img:"/images/casual-mujer.jpg",     t:20,  l:"60%" },
        { w:"45%", h:170, img:"/images/elegante-mujer.jpg",   t:190, l:"50%" },
        { w:"45%", h:150, img:"/images/accesorios-mujer.jpg", t:255, l:0 },
      ]
    : [
        { w:"58%", h:240, img:"/images/street-hombre.jpg",   t:0,   l:0 },
        { w:"38%", h:155, img:"/images/formal-hombre.jpg",   t:25,  l:"62%" },
        { w:"44%", h:180, img:"/images/casual-hombre.jpg",   t:200, l:"56%" },
        { w:"52%", h:145, img:"/images/sneakers-hombre.jpg", t:265, l:0 },
      ];
  return (
    <div style={{ position: "relative", height: 430, width: "100%" }}>
      {slots.map((p, i) => (
        <div key={i} style={{ position: "absolute", width: p.w, height: p.h, top: p.t, left: p.l, border: `1px solid ${border}`, borderRadius: radius, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", animation: `fadeUp 0.6s ease ${i * 0.12}s both` }}>
          <img src={process.env.PUBLIC_URL + p.img} alt="Style" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }} onMouseEnter={e => e.target.style.transform="scale(1.05)"} onMouseLeave={e => e.target.style.transform="scale(1)"}/>
        </div>
      ))}
      {isM && Array.from({ length: 4 }, (_, i) => (
        <div key={`cr${i}`} style={{ position: "absolute", width: 20+i*12, height: 20+i*12, borderRadius: "50%", border: `1px solid rgba(196,158,108,0.25)`, right: `${8+i*8}%`, bottom: `${2+i*8}%`, opacity: 0.7, animation: `floatParticle${i%3} ${18+i*4}s ease-in-out ${-i*3}s infinite`, pointerEvents: "none", zIndex: 10 }}/>
      ))}
    </div>
  );
}

function SocialFooter({ color }) {
  const s     = 13;
  const linkS = { color, opacity: 0.4, display: "inline-flex", alignItems: "center", textDecoration: "none" };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.7rem", flexWrap: "wrap" }}>
      <a href={SOCIALS.andres.ig}       target="_blank" rel="noopener noreferrer" style={linkS}><IgIcon size={s} color={color}/></a>
      <a href={SOCIALS.chiara.ig}       target="_blank" rel="noopener noreferrer" style={linkS}><IgIcon size={s} color={color}/></a>
      <a href={SOCIALS.andres.linkedin}  target="_blank" rel="noopener noreferrer" style={linkS}><LiIcon size={s} color={color}/></a>
      <a href={SOCIALS.chiara.linkedin}  target="_blank" rel="noopener noreferrer" style={linkS}><LiIcon size={s} color={color}/></a>
      <a href={SOCIALS.andres.github}   target="_blank" rel="noopener noreferrer" style={linkS}><GhIcon size={s} color={color}/></a>
    </div>
  );
}

// ─── Loading overlay — solo foto + scanner + pasos (sin thumbnails) ───────────
function LoadingOverlay({ genero, preview }) {
  const [step, setStep] = useState(0);
  const steps = [
    "Subiendo imagen a S3...",
    "Rekognition analizando...",
    "Detectando tipo, color, estilo...",
    "Buscando en tiendas globales...",
    "Preparando resultados...",
  ];
  const isM    = genero === "mujer";
  const bg     = isM ? "rgba(250,248,244,0.97)" : "rgba(28,20,16,0.97)";
  const text   = isM ? "#0D0A06"                : "#F5EFE8";
  const accent = isM ? "#C49E6C"                : "#C8A050";

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => { i++; if (i < steps.length) setStep(i); else clearInterval(iv); }, 900);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: bg, backdropFilter: "blur(30px)" }}>

      {/* Foto del usuario con borde accent + scanner — SOLO esto, sin thumbnails */}
      {preview && (
        <div style={{ position: "relative", marginBottom: "2.5rem" }}>
          {/* Glow ring alrededor */}
          <div style={{ position: "absolute", inset: -4, borderRadius: 16, background: `${accent}20`, filter: "blur(12px)", zIndex: 0 }}/>
          <div
            className="scanner-container"
            style={{ width: 230, height: 290, borderRadius: 14, overflow: "hidden", border: `2px solid ${accent}`, color: accent, position: "relative", zIndex: 1, boxShadow: `0 0 40px ${accent}30` }}
          >
            <img src={preview} alt="Escaneando" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
            <div className="scanner-line"/>
            {/* Esquinas decorativas */}
            <div style={{ position: "absolute", top: 8, left: 8, width: 16, height: 16, borderTop: `2px solid ${accent}`, borderLeft: `2px solid ${accent}` }}/>
            <div style={{ position: "absolute", top: 8, right: 8, width: 16, height: 16, borderTop: `2px solid ${accent}`, borderRight: `2px solid ${accent}` }}/>
            <div style={{ position: "absolute", bottom: 8, left: 8, width: 16, height: 16, borderBottom: `2px solid ${accent}`, borderLeft: `2px solid ${accent}` }}/>
            <div style={{ position: "absolute", bottom: 8, right: 8, width: 16, height: 16, borderBottom: `2px solid ${accent}`, borderRight: `2px solid ${accent}` }}/>
          </div>
        </div>
      )}

      <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", letterSpacing: 4, color: accent, marginBottom: "2rem", textTransform: "uppercase", animation: "fadeUp 0.5s ease" }}>
        Analizando con IA...
      </p>

      <div style={{ width: 36, height: 36, border: "2px solid transparent", borderTopColor: accent, borderRightColor: `${accent}50`, borderRadius: "50%", animation: "spin 0.9s linear infinite", marginBottom: "2rem" }}/>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
        {steps.map((s, i) => (
          <div key={i} style={{ fontFamily: "'Raleway'", fontSize: "0.8rem", fontWeight: i === step ? 500 : 300, color: i === step ? accent : text, opacity: i < step ? 0.3 : i === step ? 1 : 0.15, transition: "all 0.5s", display: "flex", alignItems: "center", gap: "0.8rem" }}>
            <span style={{ fontSize: "0.6rem", minWidth: 10 }}>{i < step ? "✓" : i === step ? "◉" : "○"}</span>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tarjeta de producto ──────────────────────────────────────────────────────
function ProductCard({ t, isM, cBg, cBorder, r, aBg, accent }) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered]   = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: cBg,
        border: `1px solid ${hovered ? accent + "55" : cBorder}`,
        borderRadius: isM ? 20 : 4,
        overflow: "hidden",
        animation: "fadeUp 0.5s ease",
        display: "flex",
        flexDirection: "column",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 20px 50px rgba(0,0,0,0.22), 0 0 0 1px ${accent}18`
          : "0 3px 14px rgba(0,0,0,0.10)",
        transition: "transform 0.38s cubic-bezier(0.2,0.8,0.2,1), box-shadow 0.38s ease, border-color 0.38s ease",
      }}
    >
      {t.imagen && !imgError ? (
        <div style={{ width: "100%", height: 250, overflow: "hidden", flexShrink: 0 }}>
          <img src={t.imagen} alt={t.producto} onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.55s cubic-bezier(0.2,0.8,0.2,1)", transform: hovered ? "scale(1.07)" : "scale(1)" }}
          />
        </div>
      ) : (
        <div style={{ width: "100%", height: 140, display: "flex", alignItems: "center", justifyContent: "center", background: `${accent}08`, flexShrink: 0 }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.18 }}>
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </div>
      )}
      <div style={{ padding: "1.5rem 1.6rem", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.9rem" }}>
          <span style={{ fontFamily: "'Space Mono'", fontSize: "0.54rem", letterSpacing: 1, padding: "0.22rem 0.65rem", background: aBg, color: accent, borderRadius: isM ? 50 : 3 }}>{t.nombre}</span>
          <span style={{ fontFamily: "'Space Mono'", fontSize: "0.5rem", opacity: 0.28, letterSpacing: 1 }}>Envío global</span>
        </div>
        <h4 style={{ fontFamily: "'Cormorant Garamond'", fontSize: "1.12rem", fontWeight: 700, marginBottom: "0.55rem", lineHeight: 1.35, flex: 1 }}>
          {t.producto?.length > 65 ? t.producto.slice(0, 65) + "…" : t.producto}
        </h4>
        <StarRating rating={t.rating}/>
        {t.reviews && <p style={{ fontFamily: "'Space Mono'", fontSize: "0.54rem", opacity: 0.28, marginBottom: "0.55rem" }}>{t.reviews.toLocaleString()} reseñas</p>}
        <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: "1.75rem", fontWeight: 700, color: accent, marginBottom: "0.35rem", letterSpacing: "-0.01em" }}>
          {formatPrecio(t.precio, t.moneda)}
        </div>
        <p style={{ fontFamily: "'Space Mono'", fontSize: "0.52rem", opacity: 0.22, marginBottom: "1.3rem", letterSpacing: 0.5 }}>Tallas: {(t.tallas || []).join(" · ")}</p>
        <a href={t.link} target="_blank" rel="noopener noreferrer"
          style={{ display: "block", textAlign: "center", padding: "0.85rem", fontFamily: "'Raleway'", fontSize: "0.62rem", fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: isM ? "#0D0A06" : "#1C1410", background: accent, textDecoration: "none", borderRadius: isM ? 50 : 3, transition: "opacity 0.2s, transform 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "scale(0.98)"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1";    e.currentTarget.style.transform = "scale(1)"; }}
        >
          Ver en tienda →
        </a>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
function MainPage({ genero, onSwitch, onHome }) {
  const [preview,     setPreview]     = useState(null);
  const [base64,      setBase64]      = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [result,      setResult]      = useState(null);
  const [dragOver,    setDragOver]    = useState(false);
  const [showContact, setShowContact] = useState(false);
  const fileRef   = useRef(null);
  const resultRef = useRef(null);

  const isM    = genero === "mujer";
  const bg     = isM ? "#FAF8F4"                    : "#1C1410";
  const text   = isM ? "#0D0A06"                    : "#F0EDE8";
  const accent = isM ? "#C49E6C"                    : "#C8A050";
  const muted  = isM ? "#8A7A6A"                    : "#9A8878";
  const cBorder= isM ? "rgba(196,158,108,0.25)"     : "rgba(200,160,80,0.14)";
  const glass  = isM ? "rgba(250,248,244,0.94)"     : "rgba(22,16,10,0.93)";
  const r      = isM ? 16 : 2;
  const cBg    = isM ? "rgba(255,255,255,0.75)"     : "rgba(255,255,255,0.04)";
  const aBg    = isM ? "rgba(196,158,108,0.08)"     : "rgba(200,160,80,0.10)";
  const aBo    = isM ? "rgba(196,158,108,0.22)"     : "rgba(200,160,80,0.22)";

  const handleFile = f => {
    if (!f || !f.type.startsWith("image/")) return;
    const rd = new FileReader();
    rd.onload = e => { setPreview(e.target.result); setBase64(e.target.result.split(",")[1]); setResult(null); };
    rd.readAsDataURL(f);
  };

  const scan = async () => {
    if (!base64) return;
    setLoading(true);
    try {
      const res  = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imagen_base64: base64, genero }) });
      const data = await res.json();
      if (data.success) { setResult(data); setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 300); }
      else alert("Error: " + (data.error || "Fallo al procesar imagen"));
    } catch { alert("Error de conexión con AWS"); }
    setLoading(false);
  };

  const reset = () => {
    setPreview(null); setBase64(null); setResult(null);
    if (fileRef.current) fileRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const btnS = { fontFamily: "'Raleway'", fontSize: "0.65rem", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", padding: "0.5rem 1.2rem", border: `1px solid ${cBorder}`, background: "transparent", color: muted, cursor: "pointer", borderRadius: isM ? 50 : 2, transition: "all 0.3s" };

  return (
    <div style={{ minHeight: "100vh", background: bg, color: text, fontFamily: "'Raleway', sans-serif", position: "relative" }}>

      {/* Fondo dinámico */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: isM
          ? "radial-gradient(ellipse at 20% 20%, rgba(196,158,108,0.10) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(196,158,108,0.07) 0%, transparent 45%)"
          : "radial-gradient(ellipse at 15% 20%, rgba(140,90,40,0.14) 0%, transparent 50%), radial-gradient(ellipse at 85% 75%, rgba(200,160,80,0.09) 0%, transparent 50%)",
        animation: "bgDrift 25s ease-in-out infinite" }}/>

      {/* Decoraciones */}
      {isM ? (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
          {Array.from({ length: 14 }, (_, i) => (
            <div key={i} style={{
              position: "absolute",
              width: 6+(i%5)*10,
              height: 6+(i%5)*10,
              borderRadius: "50%",
              border: `1px solid ${i%2===0?"rgba(196,158,108,0.25)":"rgba(139,100,50,0.20)"}`,
              left: `${4+(i*6.8)%90}%`,
              top: `${4+(i*5.9)%90}%`,
              opacity: 0.6+(i%3)*0.2,
              animation: `floatParticle${i%3} ${18+i*2}s ease-in-out ${-i*3}s infinite`,
            }}/>
          ))}
        </div>
      ) : (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
          {Array.from({ length: 18 }, (_, i) => (
            <div key={i} style={{ position: "absolute", width: 3+(i%4)*2, height: 3+(i%4)*2, borderRadius: "50%", background: "rgba(200,160,80,0.45)", left: `${3+(i*5.6)%94}%`, top: `${3+(i*6.3)%94}%`, opacity: 0.14+(i%3)*0.06, animation: `floatParticle${i%3} ${14+i*1.5}s ease-in-out ${-i*2}s infinite` }}/>
          ))}
        </div>
      )}

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 2.5rem", background: glass, backdropFilter: "blur(20px)", borderBottom: `1px solid ${cBorder}`, overflow: "hidden" }}>
        {isM && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,rgba(139,100,50,0.7),#C49E6C,rgba(230,210,160,0.9),#C49E6C,rgba(139,100,50,0.7))", backgroundSize: "200% 100%", animation: "shimmer 4s ease-in-out infinite", pointerEvents: "none" }}/>}
        <div onClick={onHome} style={{ fontFamily: "'Tangerine', cursive", fontSize: "2.4rem", fontWeight: 700, letterSpacing: "0.05em", lineHeight: 1, color: accent, cursor: "pointer" }}>
          AC<span style={{ fontWeight: 400 }}>S</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => onSwitch(isM ? "hombre" : "mujer")} style={btnS} className="header-switch-btn">Ir a {isM ? "Hombre" : "Mujer"}</button>
          <button onClick={() => setShowContact(true)} style={btnS}>Contacto</button>
          <button onClick={onHome} style={btnS}>Inicio</button>
        </div>
      </header>

      {/* Hero asimétrico */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "4rem 2rem 2rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "3rem", alignItems: "flex-start" }}>

          {/* Columna izquierda — upload alineado con el bloque de título */}
          <div style={{ flex: "1.2 1 420px", animation: "fadeUp 0.7s ease both" }}>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", letterSpacing: 4, textTransform: "uppercase", color: accent, marginBottom: "1.2rem" }}>
              Fashion AI · Global
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.8rem,5.5vw,4.8rem)", fontWeight: 700, fontStyle: isM ? "italic" : "normal", lineHeight: 1, marginBottom: "1.5rem", letterSpacing: isM ? 1 : 3, whiteSpace: "pre-line" }}>
              {isM ? "DESCUBRE\nTU LOOK" : "IDENTIFICA\nTU ESTILO"}
            </h1>
            <p style={{ fontWeight: 200, fontSize: "0.95rem", lineHeight: 1.7, color: muted, marginBottom: "2rem", maxWidth: 420 }}>
              {isM ? "Sube una foto y nuestra IA identifica tu prenda y encuentra dónde comprarla en todo el mundo." : "Sube una foto. La IA detecta tipo, color y estilo — y encuentra dónde comprarlo globalmente."}
            </p>

            {/* Chips de ejemplos */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.8rem", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontFamily: "'Space Mono'", fontSize: "0.58rem", letterSpacing: 2, opacity: 0.4 }}>PRUEBA CON:</span>
              {(isM ? EJEMPLOS_MUJER : EJEMPLOS_HOMBRE).map((ej, i) => (
                <span key={i} style={{ fontFamily: "'Space Mono'", fontSize: "0.62rem", padding: "0.25rem 0.65rem", border: `1px solid ${cBorder}`, borderRadius: isM ? 50 : 2, color: muted, opacity: 0.7 }}>
                  {ej.label}
                </span>
              ))}
            </div>

            {/* Upload zone — alineado con márgenes del bloque título */}
            <div
              onClick={() => !loading && fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); if (!loading) handleFile(e.dataTransfer.files[0]); }}
              style={{
                border: `2px ${preview ? "solid" : "dashed"} ${dragOver ? accent : cBorder}`,
                borderRadius: r,
                padding: preview ? "1rem" : "3.5rem 2rem",
                textAlign: "center",
                cursor: loading ? "wait" : "pointer",
                transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
                background: dragOver ? `${accent}15` : isM ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.03)",
                backdropFilter: "blur(14px)",
                boxShadow: dragOver
                  ? `0 0 30px ${accent}25`
                  : isM ? "0 4px 24px rgba(224,96,142,0.14)" : "0 4px 24px rgba(0,0,0,0.12)",
                position: "relative",
                overflow: "hidden",
                // Alineado con el maxWidth del copy (420px max) pero full width de la columna
              }}
            >
              {/* Barra shimmer en mujer */}
              {isM && !preview && (
                <div style={{ position: "absolute", top: -2, left: -2, right: -2, height: 3, background: `linear-gradient(90deg,rgba(139,100,50,0.7),${accent},rgba(230,210,160,0.9),${accent},rgba(139,100,50,0.7))`, backgroundSize: "200% 100%", animation: "shimmer 3s ease-in-out infinite", borderRadius: `${r}px ${r}px 0 0`, boxShadow: `0 0 12px ${accent}60` }}/>
              )}
              {/* Borde dorado animado en hombre */}
              {!isM && !preview && (
                <div style={{ position: "absolute", top: -2, left: -2, right: -2, height: 2, background: `linear-gradient(90deg,transparent,#C8A050,#E8D5A3,#C8A050,transparent)`, backgroundSize: "200% 100%", animation: "shimmer 4s ease-in-out infinite" }}/>
              )}

              {preview ? (
                <img src={preview} alt="Preview" style={{ width: "100%", maxHeight: 370, objectFit: "contain", borderRadius: Math.max(r-4, 0) }}/>
              ) : (
                <div>
                  <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center" }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: "0.95rem", fontWeight: 300, marginBottom: "0.4rem" }}>Arrastra tu foto aquí</p>
                  <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.68rem", opacity: 0.35 }}>JPG · PNG · WEBP</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} disabled={loading}/>
            </div>

            {preview && !loading && (
              <button onClick={scan}
                style={{ width: "100%", padding: "1.15rem", marginTop: "1.2rem", fontFamily: "'Raleway'", fontSize: "0.78rem", fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", border: "none", background: accent, color: isM ? "#0D0A06" : "#0D0D0D", borderRadius: isM ? 50 : 2, cursor: "pointer", boxShadow: `0 8px 24px ${accent}40`, animation: "fadeUp 0.5s ease", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${accent}55`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 8px 24px ${accent}40`; }}
              >
                Analizar Look
              </button>
            )}
          </div>

          {/* Columna derecha: Collage + frase */}
          <div style={{ flex: "0.8 1 320px" }}>
            <Collage genero={genero}/>
            <RotatingPhrase phrases={isM ? FRASES_MUJER : FRASES_HOMBRE} accentColor={accent}/>
          </div>
        </div>
      </section>

      {/* ── Resultados ── */}
      <div ref={resultRef}>
        {result && (() => {
          const prendas   = result.prendas || [];
          const es_outfit = result.es_outfit || false;
          return (
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 2rem 3rem", animation: "fadeUp 0.8s ease", position: "relative", zIndex: 1 }}>

              {/* Foto + banner outfit — solo 1 vez */}
              <div style={{ marginBottom: "3rem" }}>
                <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", letterSpacing: 3, textTransform: "uppercase", color: accent, marginBottom: "1.5rem" }}>Resultado IA</p>

                {/* Banner outfit — sólido y prominente */}
                {es_outfit && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: "1.4rem",
                    padding: "1.1rem 1.6rem",
                    background: accent,
                    borderRadius: r,
                    marginBottom: "2rem",
                    boxShadow: `0 6px 24px ${accent}45`,
                  }}>
                    <span style={{ fontSize: "1.5rem", lineHeight: 1, flexShrink: 0 }}>✦</span>
                    <div>
                      <p style={{ fontFamily: "'Space Mono'", fontSize: "0.72rem", fontWeight: 700, letterSpacing: 3, color: isM ? "#0D0A06" : "#0D0D0D", marginBottom: "0.25rem" }}>
                        OUTFIT COMPLETO
                      </p>
                      <p style={{ fontFamily: "'Space Mono'", fontSize: "0.6rem", color: isM ? "#0D0A06" : "#0D0D0D", opacity: 0.65, letterSpacing: 1 }}>
                        {prendas.length} prendas detectadas · {prendas.map(p => p.tipo_es).join("  ·  ")}
                      </p>
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div style={{ flexShrink: 0 }}>
                    <p style={{ fontFamily: "'Space Mono'", fontSize: "0.58rem", letterSpacing: 2, opacity: 0.4, marginBottom: "0.6rem", textTransform: "uppercase" }}>Tu foto</p>
                    <div style={{ width: 200, height: 260, overflow: "hidden", border: `2px solid ${accent}`, borderRadius: r, boxShadow: `0 0 30px ${accent}20` }}>
                      <img src={preview} alt="Tu prenda" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                    </div>
                  </div>
                </div>
              </div>

              {/* Una sección por prenda */}
              {prendas.map((p, idx) => (
                <div key={idx}>
                  {/* Separador entre prendas */}
                  {idx > 0 && (
                    <div style={{ height: 1, background: cBorder, margin: "3.5rem 0 0" }}/>
                  )}

                  {/* Header numerado — solo en outfit mode */}
                  {es_outfit && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: "1.6rem",
                      padding: "1.3rem 1.8rem",
                      background: cBg,
                      border: `1px solid ${cBorder}`,
                      borderLeft: `4px solid ${accent}`,
                      borderRadius: r,
                      margin: idx > 0 ? "2rem 0 2.5rem" : "0 0 2.5rem",
                    }}>
                      <span style={{ fontFamily: "'Space Mono'", fontSize: "2.2rem", fontWeight: 700, color: accent, lineHeight: 1, opacity: 0.55, minWidth: 44, flexShrink: 0 }}>
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p style={{ fontFamily: "'Space Mono'", fontSize: "0.55rem", letterSpacing: 3, color: accent, opacity: 0.7, marginBottom: "0.3rem", textTransform: "uppercase" }}>Prenda detectada</p>
                        <p style={{ fontFamily: "'Cormorant Garamond'", fontSize: "1.55rem", fontWeight: 700, color: text, fontStyle: isM ? "italic" : "normal", lineHeight: 1.1 }}>
                          {p.tipo_es}{p.color !== "No detectado" ? ` ${p.color}` : ""}
                          {p.patron && (
                            <span style={{ fontSize: "1rem", fontWeight: 400, opacity: 0.65 }}>
                              {" · "}{p.patron}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Info de prenda */}
                  <div style={{ marginBottom: "3rem" }}>
                    {!es_outfit && (
                      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 700, fontStyle: isM ? "italic" : "normal", lineHeight: 1.1, marginBottom: "0.5rem" }}>
                        {p.tipo_es} {p.color !== "No detectado" ? p.color : ""}
                        {p.patron && <span style={{ fontSize: "60%", opacity: 0.7 }}> · {p.patron}</span>}
                      </h2>
                    )}
                    <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.75rem", opacity: 0.5, marginBottom: "1rem" }}>
                      Confianza: {p.confianza}% · {p.estilo}
                    </p>
                    {p.query_busqueda && (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.45rem 0.9rem", background: aBg, border: `1px solid ${aBo}`, borderRadius: isM ? 50 : 2, marginBottom: "1.2rem" }}>
                        <span style={{ fontFamily: "'Space Mono'", fontSize: "0.62rem", color: accent, fontStyle: "italic" }}>"{p.query_busqueda}"</span>
                      </div>
                    )}
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 700, color: accent, marginBottom: "1.2rem" }}>
                      ${p.precio_min} — ${p.precio_max}
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", fontWeight: 400, opacity: 0.45, marginLeft: "0.5rem" }}>USD estimado</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                      {(p.etiquetas || []).slice(0, 8).map((e, i) => (
                        <span key={i} style={{ fontFamily: "'Space Mono'", fontSize: "0.62rem", padding: "0.3rem 0.65rem", background: aBg, border: `1px solid ${aBo}`, color: accent, borderRadius: isM ? 50 : 2 }}>{e.nombre} {e.confianza}%</span>
                      ))}
                    </div>
                  </div>

                  {/* Tarjetas de detalle */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
                    {[
                      { l: "Prenda",   v: p.tipo_es },
                      { l: "Color",    v: p.color },
                      { l: "Patrón",   v: p.patron },
                      { l: "Material", v: p.material_estimado },
                      { l: "Tallas",   v: (p.tallas_disponibles || []).join(" · "), s: "Estimado" },
                      { l: "Estilo",   v: p.estilo },
                    ].filter(d => d.v && d.v !== "No detectado").map((d, i) => (
                      <div key={i} style={{ padding: "1.4rem", background: cBg, border: `1px solid ${cBorder}`, borderRadius: r, backdropFilter: "blur(10px)" }}>
                        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.58rem", letterSpacing: 2, textTransform: "uppercase", color: accent, marginBottom: "0.6rem" }}>{d.l}</div>
                        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: 700 }}>{d.v}</div>
                        {d.s && <div style={{ fontSize: "0.7rem", fontWeight: 300, opacity: 0.4, marginTop: "0.2rem" }}>{d.s}</div>}
                      </div>
                    ))}
                  </div>

                  {/* Cuándo usarlo — solo para 1ª prenda en outfit */}
                  {(!es_outfit || idx === 0) && (
                    <>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 700, fontStyle: isM ? "italic" : "normal", marginBottom: "1rem" }}>Cuándo usarlo</h3>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "3rem" }}>
                        {(p.ocasion || []).map((o, i) => (
                          <span key={i} style={{ fontSize: "0.8rem", padding: "0.5rem 1.2rem", border: `1px solid ${cBorder}`, borderRadius: isM ? 50 : 2, color: accent }}>{o}</span>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Tiendas de esta prenda */}
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 700, fontStyle: isM ? "italic" : "normal", marginBottom: "0.4rem" }}>
                    {es_outfit ? `Dónde comprar — ${p.tipo_es}` : "Dónde comprarlo"}
                  </h3>
                  <p style={{ fontFamily: "'Space Mono'", fontSize: "0.6rem", opacity: 0.4, marginBottom: "1.5rem" }}>Tiendas online · Envío internacional</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(295px, 1fr))", gap: "1.6rem", marginBottom: "3rem" }}>
                    {(p.tiendas || []).map((t, i) => (
                      <ProductCard key={`${t.nombre}-${i}`} t={t} isM={isM} cBg={cBg} cBorder={cBorder} r={r} aBg={aBg} accent={accent}/>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Nueva búsqueda */}
      {result && (
        <div style={{ textAlign: "center", padding: "2rem 0 3rem", position: "relative", zIndex: 1 }}>
          <button onClick={reset} style={{ fontFamily: "'Raleway'", fontSize: "0.8rem", fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", padding: "1.1rem 3rem", border: "none", background: accent, color: isM ? "#0D0A06" : "#0D0D0D", cursor: "pointer", borderRadius: isM ? 50 : 2, boxShadow: isM ? `0 4px 20px ${accent}40` : `0 4px 20px ${accent}40`, transition: "all 0.3s ease" }}>
            ↻ Nueva búsqueda
          </button>
        </div>
      )}

      {/* Footer */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "1.5rem 2rem 1rem", borderTop: `1px solid ${cBorder}` }}>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", letterSpacing: 2, opacity: 0.3, color: muted, marginBottom: "0.8rem" }}>
          Hecho por Andres &amp; Chiara · Powered by AWS Rekognition
        </p>
        <SocialFooter color={muted}/>
      </div>

      {showContact && <ContactModal onClose={() => setShowContact(false)} theme={genero}/>}
      {loading && <LoadingOverlay genero={genero} preview={preview}/>}
    </div>
  );
}

// ─── Landing page ─────────────────────────────────────────────────────────────
function Landing({ onEnter }) {
  const [hover,    setHover]    = useState(null);
  const [reveal,   setReveal]   = useState(null);
  const [leaving,  setLeaving]  = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 60);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const handleEnter = (g) => {
    setReveal(g);
    setTimeout(() => setLeaving(true), 300);
    setTimeout(() => onEnter(g), 500);
  };

  const revealColor = reveal === "hombre" ? "#C8A050" : reveal === "mujer" ? "#F0ECE4" : null;

  return (
    <div ref={scrollRef} style={{
      position: "fixed", inset: 0,
      zIndex: 100, fontFamily: "'Raleway', sans-serif",
      opacity: leaving ? 0 : 1, transition: "opacity 0.2s ease",
      overflowY: "auto", background: "#0D0D0D",
    }}>

      {/* Reveal radial — fixed para cubrir viewport sin importar el scroll */}
      {reveal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200, pointerEvents: "none",
          background: revealColor,
          animation: "revealExpand 0.45s cubic-bezier(0.2,0.8,0.2,1) forwards",
        }}/>
      )}

      {/* Hero — ocupa viewport completo */}
      <div style={{ position: "relative", height: "100vh" }}>

        {/* Navbar — fixed, solo logo, aparece al hacer scroll */}
        <nav style={{
          width: "100%", display: "flex", justifyContent: "flex-start",
          alignItems: "center", padding: "1.2rem 2.5rem", boxSizing: "border-box",
          background: "transparent",
          position: "fixed", top: 0, zIndex: 101,
          opacity: scrolled ? 0 : 1,
          pointerEvents: scrolled ? "none" : "auto",
          transition: "opacity 0.4s ease",
        }}>
          <a href="#top" onClick={e => { e.preventDefault(); scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }}
            style={{ textDecoration: "none", cursor: "pointer" }}>
            <span style={{
              fontFamily: "'Tangerine', cursive",
              fontSize: "3.5rem",
              letterSpacing: "0.05em",
              color: "#fff",
              fontWeight: 700,
              lineHeight: 1,
            }}>
              AC
            </span>
            <span style={{
              fontFamily: "'Tangerine', cursive",
              fontSize: "3.5rem",
              letterSpacing: "0.05em",
              color: "#fff",
              fontWeight: 400,
              lineHeight: 1,
            }}>
              S
            </span>
          </a>
        </nav>

        {/* Split principal — ocupa los 100vh completos */}
        <div className="landing-split" style={{ position: "absolute", inset: 0, display: "flex" }}>

        {/* ── HOMBRE ── */}
        <div
          onMouseEnter={() => setHover("h")}
          onMouseLeave={() => setHover(null)}
          onClick={() => handleEnter("hombre")}
          tabIndex={0}
          onKeyDown={e => (e.key === "Enter" || e.key === " ") && handleEnter("hombre")}
          style={{
            flex: hover === "h" ? 1.6 : hover === "m" ? 0.6 : 1,
            position: "relative",
            overflow: "hidden",
            cursor: "pointer",
            transition: "flex 0.5s cubic-bezier(0.2,0.8,0.2,1)",
            outline: "none",
          }}
        >
          {/* Foto editorial */}
          <img
            src={process.env.PUBLIC_URL + "/images/HOMBRE-LANDING.avif"}
            alt="Hombre"
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center top",
              transform: hover === "h" ? "scale(1.04)" : "scale(1)",
              transition: "transform 0.7s cubic-bezier(0.2,0.8,0.2,1)",
            }}
          />
          {/* Gradiente editorial — oscuro desde abajo */}
          <div style={{
            position: "absolute", inset: 0,
            background: hover === "h"
              ? "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.15) 100%)"
              : "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 55%, rgba(0,0,0,0.1) 100%)",
            transition: "background 0.5s ease",
          }}/>
          {/* Línea divisoria derecha */}
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.08)", zIndex: 2 }}/>
          {/* Contenido — anclado abajo a la izquierda */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 1, padding: "2.5rem 2.5rem 3rem", color: "#F0EDE8",
            transform: hover === "m" ? "scale(0.8)" : "scale(1)",
            transition: "transform 0.5s cubic-bezier(0.2,0.8,0.2,1)",
            transformOrigin: hover === "h" ? "bottom center" : "bottom left",
            textAlign: hover === "h" ? "center" : "left",
          }}>
            <p style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.65rem", letterSpacing: 5, textTransform: "uppercase",
              color: "#C8A050", marginBottom: "0.8rem",
              opacity: 1,
              transition: "opacity 0.4s",
            }}>
              Moda Masculina
            </p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.8rem,5.5vw,5rem)",
              fontWeight: 700, letterSpacing: hover === "h" ? "8px" : "5px",
              lineHeight: 1, marginBottom: "1rem",
              transition: "letter-spacing 0.5s ease",
            }}>
              HOMBRE
            </h2>
            <p style={{
              fontFamily: "'Raleway'",
              fontSize: "0.78rem",
              fontWeight: 300,
              lineHeight: 1.6,
              color: "rgba(240,237,232,0.75)",
              maxWidth: 320,
              margin: hover === "h" ? "0 auto 1.8rem" : "0 0 1.8rem",
              opacity: hover === "h" ? 1 : 0,
              transform: hover === "h" ? "translateY(0)" : "translateY(6px)",
              transition: "opacity 0.4s ease 0.05s, transform 0.4s ease 0.05s",
            }}>
              Sube tu foto · la IA detecta tu prenda y te dice dónde comprarla
            </p>
            <button style={{
              padding: "0.8rem 2rem",
              background: "transparent",
              color: "#F0EDE8",
              border: "1px solid rgba(240,237,232,0.5)",
              fontFamily: "'Raleway'", fontSize: "0.62rem",
              fontWeight: 600, letterSpacing: 3,
              textTransform: "uppercase", cursor: "pointer",
              opacity: hover === "h" ? 1 : 0,
              transform: hover === "h" ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
            }}>
              Entrar →
            </button>
          </div>
        </div>

        {/* ── MUJER ── */}
        <div
          onMouseEnter={() => setHover("m")}
          onMouseLeave={() => setHover(null)}
          onClick={() => handleEnter("mujer")}
          tabIndex={0}
          onKeyDown={e => (e.key === "Enter" || e.key === " ") && handleEnter("mujer")}
          style={{
            flex: hover === "m" ? 1.6 : hover === "h" ? 0.6 : 1,
            position: "relative",
            overflow: "hidden",
            cursor: "pointer",
            transition: "flex 0.5s cubic-bezier(0.2,0.8,0.2,1)",
            outline: "none",
          }}
        >
          {/* Foto editorial */}
          <img
            src={process.env.PUBLIC_URL + "/images/MUJER-LANDING.avif"}
            alt="Mujer"
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center top",
              transform: hover === "m" ? "scale(1.04)" : "scale(1)",
              transition: "transform 0.7s cubic-bezier(0.2,0.8,0.2,1)",
            }}
          />
          {/* Gradiente editorial */}
          <div style={{
            position: "absolute", inset: 0,
            background: hover === "m"
              ? "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.1) 100%)"
              : "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.05) 100%)",
            transition: "background 0.5s ease",
          }}/>
          {/* Contenido — anclado abajo a la izquierda */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 1, padding: "2.5rem 2.5rem 3rem", color: "#F0EDE8",
            transform: hover === "h" ? "scale(0.8)" : "scale(1)",
            transition: "transform 0.5s cubic-bezier(0.2,0.8,0.2,1)",
            transformOrigin: hover === "m" ? "bottom center" : "bottom left",
            textAlign: hover === "m" ? "center" : "left",
          }}>
            <p style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.65rem", letterSpacing: 5, textTransform: "uppercase",
              color: "#C49E6C", marginBottom: "0.8rem",
              opacity: 1,
              transition: "opacity 0.4s",
            }}>
              Moda Femenina
            </p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.8rem,5.5vw,5rem)",
              fontWeight: 600, fontStyle: "italic",
              letterSpacing: hover === "m" ? "5px" : "3px",
              lineHeight: 1, marginBottom: "1rem",
              transition: "letter-spacing 0.5s ease",
            }}>
              MUJER
            </h2>
            <p style={{
              fontFamily: "'Raleway'",
              fontSize: "0.78rem",
              fontWeight: 300,
              lineHeight: 1.6,
              color: "rgba(240,237,232,0.75)",
              maxWidth: 320,
              margin: hover === "m" ? "0 auto 1.8rem" : "0 0 1.8rem",
              opacity: hover === "m" ? 1 : 0,
              transform: hover === "m" ? "translateY(0)" : "translateY(6px)",
              transition: "opacity 0.4s ease 0.05s, transform 0.4s ease 0.05s",
            }}>
              Sube tu foto · la IA detecta tu prenda y te dice dónde comprarla
            </p>
            <button style={{
              padding: "0.8rem 2rem",
              background: "transparent",
              color: "#F0EDE8",
              border: "1px solid rgba(240,237,232,0.5)",
              fontFamily: "'Raleway'", fontSize: "0.62rem",
              fontWeight: 600, letterSpacing: 3,
              textTransform: "uppercase", cursor: "pointer",
              borderRadius: 0,
              opacity: hover === "m" ? 1 : 0,
              transform: hover === "m" ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
            }}>
              Entrar →
            </button>
          </div>
        </div>
      </div>

      </div>{/* end hero wrapper */}

      {/* ── Por qué StyleMatch ── */}
      <section id="porque" style={{ background: "#F2EAE0", padding: "5rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", letterSpacing: 4, textTransform: "uppercase", color: "#C49E6C", textAlign: "center", marginBottom: "0.8rem" }}>
            Por qué ACstyles
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, letterSpacing: 4, color: "#111", textAlign: "center", marginBottom: "4rem" }}>
            Ve. Sube. Compra.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
            {[
              {
                num: "01",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C49E6C" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>,
                title: "Sin palabras clave",
                desc: "No necesitas saber el nombre de la prenda. Solo sube una foto y la IA hace el resto.",
              },
              {
                num: "02",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C49E6C" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
                title: "Resultados en segundos",
                desc: "AWS Rekognition analiza tipo, color y estilo al instante. Miles de SKUs en un clic.",
              },
              {
                num: "03",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C49E6C" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
                title: "Tiendas globales",
                desc: "Encuentra exactamente dónde comprarlo en tiendas de todo el mundo, con envío internacional.",
              },
            ].map((b, i) => (
              <div key={i} style={{
                padding: "2.5rem 2rem",
                background: "#FAF5EE",
                borderRadius: 2,
                boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
                animation: `fadeUp 0.6s ease ${i * 0.15}s both`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "1.4rem" }}>
                  {b.icon}
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.58rem", letterSpacing: 3, color: "rgba(196,158,108,0.5)" }}>{b.num}</span>
                </div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 700, color: "#111", marginBottom: "0.8rem" }}>{b.title}</h3>
                <p style={{ fontWeight: 400, fontSize: "0.88rem", lineHeight: 1.75, color: "#666" }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section id="como-funciona" style={{ background: "#FAF5EE", padding: "5rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", letterSpacing: 4, textTransform: "uppercase", color: "#C49E6C", textAlign: "center", marginBottom: "0.8rem" }}>
            Cómo funciona
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 700, letterSpacing: 3, color: "#111", textAlign: "center", marginBottom: "4rem" }}>
            Tres pasos. Eso es todo.
          </h2>

          {/* Dos columnas: imagen + pasos */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3rem", alignItems: "flex-start" }}>

            {/* Columna izquierda — imagen con tracking frame */}
            <div style={{ flex: "1 1 320px", maxWidth: 460 }}>
              <div style={{
                position: "relative", width: "100%", height: 420,
                boxShadow: "0 0 40px rgba(196,158,108,0.12)",
              }}>
                <img
                  src={process.env.PUBLIC_URL + "/images/formal-hombre.jpg"}
                  alt="Análisis IA"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
                />

                {/* Scanner line animada */}
                <div className="scanner-line" style={{ color: "#C49E6C" }}/>

                {/* 4 esquineros */}
                <div style={{ position: "absolute", top: 12, left: 12, width: 20, height: 20, borderTop: "2px solid #C49E6C", borderLeft: "2px solid #C49E6C" }}/>
                <div style={{ position: "absolute", top: 12, right: 12, width: 20, height: 20, borderTop: "2px solid #C49E6C", borderRight: "2px solid #C49E6C" }}/>
                <div style={{ position: "absolute", bottom: 12, left: 12, width: 20, height: 20, borderBottom: "2px solid #C49E6C", borderLeft: "2px solid #C49E6C" }}/>
                <div style={{ position: "absolute", bottom: 12, right: 12, width: 20, height: 20, borderBottom: "2px solid #C49E6C", borderRight: "2px solid #C49E6C" }}/>

                {/* Label IA */}
                <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, textAlign: "center" }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", letterSpacing: 3, color: "#C49E6C", opacity: 0.6 }}>ANALIZANDO · IA</span>
                </div>
              </div>
            </div>

            {/* Columna derecha — pasos */}
            <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {[
                { step: "01", title: "Elige tu modo", desc: "Selecciona Hombre o Mujer para activar el tema y el catálogo correspondiente." },
                { step: "02", title: "Sube tu foto", desc: "Arrastra o selecciona cualquier foto de ropa — de Instagram, Pinterest, una tienda o tu galería." },
                { step: "03", title: "Descubre dónde comprarlo", desc: "La IA detecta la prenda y te devuelve tiendas globales donde encontrarla, con precios y links directos." },
              ].map((s, i) => (
                <div key={i} style={{
                  display: "flex", gap: "2rem", alignItems: "flex-start",
                  padding: "2rem",
                  background: "#F2EAE0",
                  borderRadius: 2,
                  animation: `fadeUp 0.6s ease ${i * 0.2}s both`,
                }}>
                  <span style={{ fontFamily: "'Space Mono'", fontSize: "2.5rem", fontWeight: 700, color: "rgba(196,158,108,0.35)", flexShrink: 0, lineHeight: 1 }}>{s.step}</span>
                  <div>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.35rem", fontWeight: 700, color: "#111", marginBottom: "0.5rem" }}>{s.title}</h3>
                    <p style={{ fontWeight: 400, fontSize: "0.88rem", lineHeight: 1.75, color: "#666" }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── Contacto ── */}
      <section id="contacto" style={{ background: "#F2EAE0", padding: "5rem 2rem" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", letterSpacing: 4, textTransform: "uppercase", color: "#C49E6C", marginBottom: "0.8rem" }}>
            Contacto
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 700, letterSpacing: 3, color: "#111", marginBottom: "1.2rem" }}>
            ¿Tienes preguntas?
          </h2>
          <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "0.9rem", fontWeight: 300, color: "#666", lineHeight: 1.8, marginBottom: "2.5rem" }}>
            Estamos construyendo algo distinto. Si quieres saber más, colaborar o simplemente saludar — escríbenos.
          </p>
          <a href="mailto:me@andresrodas.cloud"
            style={{
              display: "inline-block",
              fontFamily: "'Raleway', sans-serif", fontSize: "0.65rem", fontWeight: 600,
              letterSpacing: 3, textTransform: "uppercase",
              color: "#111", textDecoration: "none",
              padding: "0.9rem 2.5rem",
              background: "transparent",
              border: "1px solid rgba(0,0,0,0.25)",
              borderRadius: 1,
              transition: "background 0.2s, color 0.2s, borderColor 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#111"; e.currentTarget.style.color = "#F7F5F2"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#111"; }}
          >
            me@andresrodas.cloud
          </a>
          <div style={{ marginTop: "3rem", display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
            {[
              {
                label: "Andrés",
                href: "https://www.instagram.com/andresrodas.exe/",
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/></svg>,
              },
              {
                label: "Chiara",
                href: "https://www.instagram.com/sunghoon_uvita/",
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/></svg>,
              },
              {
                label: "Andrés",
                href: "https://www.linkedin.com/in/andres-rodas-802309272/",
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="8" y1="11" x2="8" y2="17"/><line x1="8" y1="7" x2="8" y2="8"/><path d="M12 17v-4a2 2 0 0 1 4 0v4"/><line x1="12" y1="11" x2="12" y2="17"/></svg>,
              },
            ].map(({ label, href, icon }, i) => (
              <a key={i} href={href} target="_blank" rel="noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  fontFamily: "'Space Mono', monospace", fontSize: "0.5rem", letterSpacing: 2,
                  color: "#666", textDecoration: "none", textTransform: "uppercase", transition: "color 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#C49E6C"}
                onMouseLeave={e => e.currentTarget.style.color = "#666"}
              >
                {icon}{label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer — fondo negro */}
      <footer style={{ background: "#0D0D0D", fontFamily: "'Raleway', sans-serif" }}>

        {/* Cuerpo principal */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "4rem 3rem 3rem", display: "flex", flexWrap: "wrap", gap: "3rem", justifyContent: "space-between" }}>

          {/* Columna 1 — Redes sociales */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", minWidth: 80 }}>
            {[
              {
                label: "Twitter / X",
                svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l16 16M4 20L20 4"/></svg>,
              },
              {
                label: "Instagram",
                svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/></svg>,
              },
              {
                label: "Pinterest",
                svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.428 1.808-2.428.852 0 1.265.64 1.265 1.408 0 .858-.548 2.143-.83 3.33-.236.995.499 1.806 1.476 1.806 1.772 0 2.982-2.3 2.982-5.022 0-2.07-1.39-3.72-3.96-3.72-2.894 0-4.713 2.163-4.713 4.608 0 .795.233 1.354.6 1.896.166.232.19.326.13.588-.043.184-.14.63-.18.807-.058.238-.232.325-.427.236-1.578-.648-2.316-2.384-2.316-4.334 0-3.236 2.762-7.212 8.24-7.212 4.478 0 7.354 3.3 7.354 6.842 0 4.73-2.614 8.268-6.464 8.268-1.302 0-2.526-.703-2.945-1.494l-.816 3.163c-.295 1.092-1.083 2.464-1.614 3.297.608.177 1.25.272 1.916.272 5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>,
              },
            ].map(({ label, svg }) => (
              <a key={label} href="#" aria-label={label}
                style={{ color: "rgba(240,237,232,0.5)", display: "inline-flex", transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#C49E6C"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(240,237,232,0.5)"}
              >
                {svg}
              </a>
            ))}
          </div>

          {/* Columna 2 — Links grandes sueltos */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", minWidth: 200 }}>
            {[
              { label: "PROBAR ACSTYLES", href: "#top" },
              { label: "CÓMO FUNCIONA", href: "#como-funciona" },
              { label: "SOBRE EL PROYECTO", href: "#porque" },
              { label: "TECNOLOGÍA IA", href: "#como-funciona" },
            ].map(({ label, href }) => (
              <a key={label} href={href}
                onClick={e => { e.preventDefault(); document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }); if (href === "#top") window.scrollTo({ top: 0, behavior: "smooth" }); }}
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontWeight: 600, color: "rgba(240,237,232,0.85)", textDecoration: "none", letterSpacing: 1, transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#C49E6C"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(240,237,232,0.85)"}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Columna 3 — Cómo Funciona */}
          <div style={{ minWidth: 180 }}>
            <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "rgba(240,237,232,0.9)", marginBottom: "1.2rem" }}>
              Cómo Funciona
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              {["¿Qué detecta la IA?", "¿Cómo uso la app?", "Privacidad de imágenes", "Preguntas frecuentes", "Comunícate con nosotros"].map(link => (
                <a key={link} href="#"
                  style={{ fontSize: "0.8rem", fontWeight: 400, color: "rgba(240,237,232,0.45)", textDecoration: "none", transition: "color 0.2s", lineHeight: 1.4 }}
                  onMouseEnter={e => e.currentTarget.style.color = "#F0EDE8"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(240,237,232,0.45)"}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Columna 4 — Acerca de StyleMatch */}
          <div style={{ minWidth: 160 }}>
            <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "rgba(240,237,232,0.9)", marginBottom: "1.2rem" }}>
              Acerca de ACstyles
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              {["El Proyecto", "AWS Rekognition", "Google Shopping", "Hecho en Perú"].map(link => (
                <a key={link} href="#"
                  style={{ fontSize: "0.8rem", fontWeight: 400, color: "rgba(240,237,232,0.45)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#F0EDE8"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(240,237,232,0.45)"}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Barra inferior */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{
          padding: "1.4rem 3rem",
          display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between",
          gap: "1rem", maxWidth: 1200, margin: "0 auto",
        }}>
          <span style={{ fontSize: "0.6rem", color: "rgba(240,237,232,0.4)", letterSpacing: 1, fontFamily: "'Space Mono', monospace" }}>
            © 2026 ACstyles · Todos los derechos reservados.
          </span>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            {["Términos y Condiciones", "Política de privacidad", "Factura Electrónica"].map(link => (
              <a key={link} href="#"
                style={{ fontSize: "0.6rem", color: "rgba(240,237,232,0.35)", textDecoration: "none", letterSpacing: 0.5, transition: "color 0.2s", fontFamily: "'Raleway', sans-serif" }}
                onMouseEnter={e => e.currentTarget.style.color = "#C49E6C"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(240,237,232,0.35)"}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
        </div>

      </footer>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("landing");
  if (page === "landing") return <Landing onEnter={g => setPage(g)}/>;
  return <MainPage genero={page} onSwitch={g => setPage(g)} onHome={() => setPage("landing")}/>;
}
