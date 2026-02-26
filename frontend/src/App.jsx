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
  { label: "Streetwear", emoji: "🧥" },
  { label: "Formal",     emoji: "👔" },
  { label: "Casual",     emoji: "👕" },
];
const EJEMPLOS_MUJER = [
  { label: "Vestido",  emoji: "👗" },
  { label: "Casual",   emoji: "👚" },
  { label: "Elegante", emoji: "✨" },
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
  const bg     = isM ? "#FFF0F5" : "#0D0D0D";
  const text   = isM ? "#2D1F2B" : "#F0EDE8";
  const accent = isM ? "#D4638F" : "#C49E6C";
  const border = isM ? "#F0C6D4" : "rgba(255,255,255,0.1)";
  const radius = isM ? 20 : 4;
  const linkS  = { display: "flex", alignItems: "center", gap: "0.3rem", color: accent, textDecoration: "none", fontSize: "0.75rem" };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: bg, color: text, padding: "2.5rem", borderRadius: radius, border: `1px solid ${border}`, maxWidth: 420, width: "90%", animation: "fadeUp 0.4s ease" }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 700, fontStyle: isM ? "italic" : "normal", marginBottom: "0.5rem", textAlign: "center" }}>Contacto</h3>
        <p style={{ fontSize: "0.8rem", fontWeight: 300, opacity: 0.5, textAlign: "center", marginBottom: "2rem" }}>Creadores de StyleMatch</p>
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
        <button onClick={onClose} style={{ width: "100%", padding: "0.8rem", fontFamily: "'Montserrat'", fontSize: "0.7rem", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", background: accent, color: isM ? "#fff" : "#0D0D0D", border: "none", borderRadius: isM ? 50 : 2, cursor: "pointer" }}>Cerrar</button>
      </div>
    </div>
  );
}

function Collage({ genero }) {
  const isM    = genero === "mujer";
  const border = isM ? "#F0C6D4" : "rgba(255,255,255,0.1)";
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
      {isM && ["✿","❀","✾","❁","✿"].map((f, i) => (
        <div key={`cf${i}`} style={{ position: "absolute", fontSize: `${16+i*3}px`, right: `${5+i*10}%`, bottom: `${-2+i*6}%`, color: i%2===0?"#E8A0BB":"#D4638F", opacity: 0.18+i*0.03, animation: `floatFlower ${16+i*3}s ease-in-out ${-i*2}s infinite`, pointerEvents: "none", zIndex: 10 }}>{f}</div>
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
  const accent = isM ? "#D4638F" : "#C49E6C";
  const text   = isM ? "#2D1F2B" : "#F0EDE8";
  const bg     = isM ? "rgba(255,240,245,0.97)" : "rgba(13,13,13,0.97)";

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

      <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: "0.7rem", letterSpacing: 4, color: accent, marginBottom: "2rem", textTransform: "uppercase", animation: "fadeUp 0.5s ease" }}>
        Analizando con IA...
      </p>

      <div style={{ width: 36, height: 36, border: "2px solid transparent", borderTopColor: accent, borderRightColor: `${accent}50`, borderRadius: "50%", animation: "spin 0.9s linear infinite", marginBottom: "2rem" }}/>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
        {steps.map((s, i) => (
          <div key={i} style={{ fontFamily: "'Montserrat'", fontSize: "0.8rem", fontWeight: i === step ? 500 : 300, color: i === step ? accent : text, opacity: i < step ? 0.3 : i === step ? 1 : 0.15, transition: "all 0.5s", display: "flex", alignItems: "center", gap: "0.8rem" }}>
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
  return (
    <div style={{ background: cBg, border: `1px solid ${cBorder}`, borderRadius: r, overflow: "hidden", backdropFilter: "blur(6px)", animation: "fadeUp 0.5s ease", display: "flex", flexDirection: "column" }}>
      {t.imagen && !imgError ? (
        <div style={{ width: "100%", height: 200, overflow: "hidden", flexShrink: 0 }}>
          <img src={t.imagen} alt={t.producto} onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
            onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
            onMouseLeave={e => e.target.style.transform = "scale(1)"}
          />
        </div>
      ) : (
        <div style={{ width: "100%", height: 100, display: "flex", alignItems: "center", justifyContent: "center", background: `${accent}08`, flexShrink: 0 }}>
          <span style={{ fontSize: "2rem", opacity: 0.25 }}>🛍️</span>
        </div>
      )}
      <div style={{ padding: "1.2rem", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
          <span style={{ fontFamily: "'Courier Prime'", fontSize: "0.58rem", padding: "0.15rem 0.5rem", background: aBg, color: accent, borderRadius: isM ? 50 : 2 }}>🌐 {t.nombre}</span>
          <span style={{ fontFamily: "'Courier Prime'", fontSize: "0.55rem", opacity: 0.35 }}>Envío global</span>
        </div>
        <h4 style={{ fontFamily: "'Cormorant Garamond'", fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem", lineHeight: 1.3, flex: 1 }}>
          {t.producto?.length > 65 ? t.producto.slice(0, 65) + "…" : t.producto}
        </h4>
        <StarRating rating={t.rating}/>
        {t.reviews && <p style={{ fontFamily: "'Courier Prime'", fontSize: "0.58rem", opacity: 0.35, marginBottom: "0.5rem" }}>{t.reviews.toLocaleString()} reseñas</p>}
        <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: "1.5rem", fontWeight: 700, color: accent, marginBottom: "0.3rem" }}>
          {formatPrecio(t.precio, t.moneda)}
        </div>
        <p style={{ fontFamily: "'Courier Prime'", fontSize: "0.58rem", opacity: 0.3, marginBottom: "1rem" }}>Tallas: {(t.tallas || []).join(" · ")}</p>
        <a href={t.link} target="_blank" rel="noopener noreferrer"
          style={{ display: "block", textAlign: "center", padding: "0.7rem", fontFamily: "'Montserrat'", fontSize: "0.65rem", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: isM ? "#fff" : "#0D0D0D", background: accent, textDecoration: "none", borderRadius: isM ? 50 : 2, transition: "opacity 0.2s" }}
          onMouseEnter={e => e.target.style.opacity = "0.85"}
          onMouseLeave={e => e.target.style.opacity = "1"}
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
  const bg     = isM ? "#FFF0F5"               : "#0D0D0D";
  const text   = isM ? "#2D1F2B"               : "#F0EDE8";
  const accent = isM ? "#D4638F"               : "#C49E6C";
  const muted  = isM ? "#9C7A8E"               : "#8A8680";
  const cBorder= isM ? "#F0C6D4"               : "rgba(255,255,255,0.08)";
  const glass  = isM ? "rgba(255,240,245,0.92)": "rgba(13,13,13,0.9)";
  const r      = isM ? 16 : 2;
  const cBg    = isM ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.03)";
  const aBg    = isM ? "rgba(212,99,143,0.08)" : "rgba(196,158,108,0.1)";
  const aBo    = isM ? "rgba(212,99,143,0.15)" : "rgba(196,158,108,0.2)";

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

  const btnS = { fontFamily: "'Montserrat'", fontSize: "0.65rem", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", padding: "0.5rem 1.2rem", border: `1px solid ${cBorder}`, background: "transparent", color: muted, cursor: "pointer", borderRadius: isM ? 50 : 2, transition: "all 0.3s" };

  return (
    <div style={{ minHeight: "100vh", background: bg, color: text, fontFamily: "'Montserrat', sans-serif", position: "relative" }}>

      {/* Fondo dinámico */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: isM
          ? "radial-gradient(circle at 20% 25%,rgba(212,99,143,0.1) 0%,transparent 40%),radial-gradient(circle at 80% 55%,rgba(255,182,210,0.12) 0%,transparent 45%)"
          : "radial-gradient(ellipse at 15% 20%,rgba(196,158,108,0.06) 0%,transparent 50%),radial-gradient(ellipse at 85% 75%,rgba(196,158,108,0.04) 0%,transparent 50%)",
        animation: "bgDrift 25s ease-in-out infinite" }}/>

      {/* Decoraciones */}
      {isM ? (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
          {["✿","❀","✾","❁","✿","❀","✾","❁","✿","❀","✾","❁","✿","❀","❁","✿","✾","❀"].map((f,i) => (
            <div key={i} style={{ position: "absolute", fontSize: `${14+(i%5)*5}px`, left: `${3+(i*5.3)%94}%`, top: `${3+(i*7.1)%94}%`, opacity: 0.12+(i%4)*0.04, color: i%3===0?"#F0A6C2":i%3===1?"#D4638F":"#E8A0BB", animation: `floatFlower ${16+i*1.5}s ease-in-out ${-i*2.5}s infinite`, transform: `rotate(${i*43}deg)` }}>{f}</div>
          ))}
        </div>
      ) : (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
          {Array.from({ length: 18 }, (_, i) => (
            <div key={i} style={{ position: "absolute", width: 3+(i%4)*2, height: 3+(i%4)*2, borderRadius: "50%", background: "rgba(196,158,108,0.5)", left: `${3+(i*5.6)%94}%`, top: `${3+(i*6.3)%94}%`, opacity: 0.18+(i%3)*0.08, animation: `floatParticle${i%3} ${14+i*1.5}s ease-in-out ${-i*2}s infinite` }}/>
          ))}
        </div>
      )}

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 2.5rem", background: glass, backdropFilter: "blur(20px)", borderBottom: `1px solid ${cBorder}` }}>
        <div onClick={onHome} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: accent, cursor: "pointer", fontStyle: isM ? "italic" : "normal" }}>
          Style<span style={{ fontWeight: 300 }}>Match</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => onSwitch(isM ? "hombre" : "mujer")} style={btnS}>Ir a {isM ? "Hombre" : "Mujer"}</button>
          <button onClick={() => setShowContact(true)} style={btnS}>Contacto</button>
          <button onClick={onHome} style={btnS}>Inicio</button>
        </div>
      </header>

      {/* Hero asimétrico */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "4rem 2rem 2rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "3rem", alignItems: "flex-start" }}>

          {/* Columna izquierda — upload alineado con el bloque de título */}
          <div style={{ flex: "1.2 1 420px", animation: "fadeUp 0.7s ease both" }}>
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: "0.65rem", letterSpacing: 4, textTransform: "uppercase", color: accent, marginBottom: "1.2rem" }}>
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
              <span style={{ fontFamily: "'Courier Prime'", fontSize: "0.58rem", letterSpacing: 2, opacity: 0.4 }}>PRUEBA CON:</span>
              {(isM ? EJEMPLOS_MUJER : EJEMPLOS_HOMBRE).map((ej, i) => (
                <span key={i} style={{ fontFamily: "'Courier Prime'", fontSize: "0.62rem", padding: "0.25rem 0.65rem", border: `1px solid ${cBorder}`, borderRadius: isM ? 50 : 2, color: muted, opacity: 0.7 }}>
                  {ej.emoji} {ej.label}
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
                background: dragOver ? `${accent}15` : isM ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.03)",
                backdropFilter: "blur(14px)",
                boxShadow: dragOver
                  ? `0 0 30px ${accent}25`
                  : isM ? "0 4px 24px rgba(212,99,143,0.06)" : "0 4px 24px rgba(0,0,0,0.12)",
                position: "relative",
                overflow: "hidden",
                // Alineado con el maxWidth del copy (420px max) pero full width de la columna
              }}
            >
              {/* Barra shimmer en mujer */}
              {isM && !preview && (
                <div style={{ position: "absolute", top: -2, left: -2, right: -2, height: 3, background: `linear-gradient(90deg,transparent,${accent},#F8D0DE,${accent},transparent)`, backgroundSize: "200% 100%", animation: "shimmer 3s ease-in-out infinite", borderRadius: `${r}px ${r}px 0 0` }}/>
              )}
              {/* Borde dorado animado en hombre */}
              {!isM && !preview && (
                <div style={{ position: "absolute", top: -2, left: -2, right: -2, height: 2, background: `linear-gradient(90deg,transparent,#C49E6C,#E8D5A3,#C49E6C,transparent)`, backgroundSize: "200% 100%", animation: "shimmer 4s ease-in-out infinite" }}/>
              )}

              {preview ? (
                <img src={preview} alt="Preview" style={{ width: "100%", maxHeight: 370, objectFit: "contain", borderRadius: Math.max(r-4, 0) }}/>
              ) : (
                <div>
                  <div style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.3 }}>{isM ? "✨" : "📷"}</div>
                  <p style={{ fontSize: "0.95rem", fontWeight: 300, marginBottom: "0.4rem" }}>Arrastra tu foto aquí</p>
                  <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: "0.68rem", opacity: 0.35 }}>JPG · PNG · WEBP</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} disabled={loading}/>
            </div>

            {preview && !loading && (
              <button onClick={scan}
                style={{ width: "100%", padding: "1.15rem", marginTop: "1.2rem", fontFamily: "'Montserrat'", fontSize: "0.78rem", fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", border: "none", background: accent, color: isM ? "#fff" : "#0D0D0D", borderRadius: isM ? 50 : 2, cursor: "pointer", boxShadow: `0 8px 24px ${accent}40`, animation: "fadeUp 0.5s ease", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${accent}55`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 8px 24px ${accent}40`; }}
              >
                {isM ? "✨ Analizar Look" : "⚡ Analizar Look"}
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
          const p       = result.prenda;
          const tiendas = result.tiendas || [];
          return (
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 2rem 3rem", animation: "fadeUp 0.8s ease", position: "relative", zIndex: 1 }}>

              {/* Comparación foto + info */}
              <div style={{ marginBottom: "3rem" }}>
                <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: "0.65rem", letterSpacing: 3, textTransform: "uppercase", color: accent, marginBottom: "1.5rem" }}>Resultado IA</p>
                <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div style={{ flexShrink: 0 }}>
                    <p style={{ fontFamily: "'Courier Prime'", fontSize: "0.58rem", letterSpacing: 2, opacity: 0.4, marginBottom: "0.6rem", textTransform: "uppercase" }}>Tu foto</p>
                    <div style={{ width: 200, height: 260, overflow: "hidden", border: `2px solid ${accent}`, borderRadius: r, boxShadow: `0 0 30px ${accent}20` }}>
                      <img src={preview} alt="Tu prenda" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 700, fontStyle: isM ? "italic" : "normal", lineHeight: 1.1, marginBottom: "0.5rem" }}>
                      {p.tipo_es} {p.color !== "No detectado" ? p.color : ""}
                    </h2>
                    <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: "0.75rem", opacity: 0.5, marginBottom: "1rem" }}>
                      Confianza: {p.confianza}% · {p.estilo}
                    </p>
                    {p.query_busqueda && (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.45rem 0.9rem", background: aBg, border: `1px solid ${aBo}`, borderRadius: isM ? 50 : 2, marginBottom: "1.2rem" }}>
                        <span style={{ fontSize: "0.75rem" }}>🔍</span>
                        <span style={{ fontFamily: "'Courier Prime'", fontSize: "0.62rem", color: accent, fontStyle: "italic" }}>"{p.query_busqueda}"</span>
                      </div>
                    )}
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 700, color: accent, marginBottom: "1.2rem" }}>
                      ${p.precio_min} — ${p.precio_max}
                      <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: "0.62rem", fontWeight: 400, opacity: 0.45, marginLeft: "0.5rem" }}>USD estimado</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                      {(p.etiquetas || []).slice(0, 8).map((e, i) => (
                        <span key={i} style={{ fontFamily: "'Courier Prime'", fontSize: "0.62rem", padding: "0.3rem 0.65rem", background: aBg, border: `1px solid ${aBo}`, color: accent, borderRadius: isM ? 50 : 2 }}>{e.nombre} {e.confianza}%</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tarjetas de detalle */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
                {[
                  { l: "Prenda",   v: p.tipo_es },
                  { l: "Color",    v: p.color },
                  { l: "Material", v: p.material_estimado },
                  { l: "Tallas",   v: (p.tallas_disponibles || []).join(" · "), s: "Estimado" },
                  { l: "Estilo",   v: p.estilo },
                ].filter(d => d.v && d.v !== "No detectado").map((d, i) => (
                  <div key={i} style={{ padding: "1.4rem", background: cBg, border: `1px solid ${cBorder}`, borderRadius: r, backdropFilter: "blur(10px)" }}>
                    <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: "0.58rem", letterSpacing: 2, textTransform: "uppercase", color: accent, marginBottom: "0.6rem" }}>{d.l}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: 700 }}>{d.v}</div>
                    {d.s && <div style={{ fontSize: "0.7rem", fontWeight: 300, opacity: 0.4, marginTop: "0.2rem" }}>{d.s}</div>}
                  </div>
                ))}
              </div>

              {/* Cuándo usarlo */}
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 700, fontStyle: isM ? "italic" : "normal", marginBottom: "1rem" }}>Cuándo usarlo</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "3rem" }}>
                {(p.ocasion || []).map((o, i) => (
                  <span key={i} style={{ fontSize: "0.8rem", padding: "0.5rem 1.2rem", border: `1px solid ${cBorder}`, borderRadius: isM ? 50 : 2, color: accent }}>{o}</span>
                ))}
              </div>

              {/* Tiendas — solo online, sin sección "Looks similares" redundante */}
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 700, fontStyle: isM ? "italic" : "normal", marginBottom: "0.4rem" }}>Dónde comprarlo</h3>
              <p style={{ fontFamily: "'Courier Prime'", fontSize: "0.6rem", opacity: 0.4, marginBottom: "1.5rem" }}>Tiendas online · Envío internacional</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.2rem" }}>
                {tiendas.map((t, i) => (
                  <ProductCard key={`${t.nombre}-${i}`} t={t} isM={isM} cBg={cBg} cBorder={cBorder} r={r} aBg={aBg} accent={accent}/>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Nueva búsqueda */}
      {result && (
        <div style={{ textAlign: "center", padding: "2rem 0 3rem", position: "relative", zIndex: 1 }}>
          <button onClick={reset} style={{ fontFamily: "'Montserrat'", fontSize: "0.8rem", fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", padding: "1.1rem 3rem", border: "none", background: accent, color: isM ? "#fff" : "#0D0D0D", cursor: "pointer", borderRadius: isM ? 50 : 2, boxShadow: isM ? "0 4px 20px rgba(212,99,143,0.3)" : "0 4px 20px rgba(196,158,108,0.3)", transition: "all 0.3s ease" }}>
            ↻ Nueva búsqueda
          </button>
        </div>
      )}

      {/* Footer */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "1.5rem 2rem 1rem", borderTop: `1px solid ${cBorder}` }}>
        <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: "0.6rem", letterSpacing: 2, opacity: 0.3, color: muted, marginBottom: "0.8rem" }}>
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
  const [reveal,   setReveal]   = useState(null);   // "hombre" | "mujer" — estado del reveal radial
  const [leaving,  setLeaving]  = useState(false);

  const handleEnter = (g) => {
    setReveal(g);
    // Secuencia: reveal expand (350ms) → fade-out (150ms) → navegar
    setTimeout(() => setLeaving(true), 300);
    setTimeout(() => onEnter(g), 500);
  };

  const revealColor = reveal === "hombre" ? "#C49E6C" : reveal === "mujer" ? "#D4638F" : null;

  return (
    <div style={{
      position: "fixed", inset: 0, display: "flex", flexDirection: "column",
      zIndex: 100, fontFamily: "'Montserrat', sans-serif",
      opacity: leaving ? 0 : 1, transition: "opacity 0.2s ease",
    }}>

      {/* Capa de reveal radial — aparece al click */}
      {reveal && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 200, pointerEvents: "none",
          background: revealColor,
          animation: "revealExpand 0.45s cubic-bezier(0.2,0.8,0.2,1) forwards",
        }}/>
      )}

      {/* Logo header */}
      <div style={{ width: "100%", textAlign: "center", padding: "1.3rem 0", background: "#0D0D0D", borderBottom: "1px solid rgba(255,255,255,0.06)", zIndex: 101, flexShrink: 0 }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 300, color: "rgba(240,237,232,0.85)", letterSpacing: 8, textTransform: "uppercase" }}>
          Style<span style={{ fontWeight: 700, color: "#C49E6C" }}>Match</span>
        </span>
        <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: "0.52rem", letterSpacing: 4, color: "rgba(255,255,255,0.22)", marginTop: "0.25rem" }}>
          AI · FASHION · GLOBAL
        </p>
      </div>

      {/* Split principal */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── HOMBRE ── */}
        <div
          onMouseEnter={() => setHover("h")}
          onMouseLeave={() => setHover(null)}
          onClick={() => handleEnter("hombre")}
          tabIndex={0}
          onKeyDown={e => (e.key === "Enter" || e.key === " ") && handleEnter("hombre")}
          style={{
            flex: hover === "h" ? 1.6 : hover === "m" ? 0.6 : 1,
            background: "#0D0D0D",
            color: "#F0EDE8",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "flex 0.45s cubic-bezier(0.2,0.8,0.2,1)",
            position: "relative",
            overflow: "hidden",
            outline: "none",
          }}
        >
          {/* Fondo radial que brilla más en hover */}
          <div style={{
            position: "absolute", inset: 0,
            background: hover === "h"
              ? "radial-gradient(ellipse at 50% 50%,rgba(196,158,108,0.18) 0%,transparent 65%)"
              : "radial-gradient(ellipse at 30% 40%,rgba(196,158,108,0.08) 0%,transparent 60%)",
            transition: "background 0.5s ease",
            animation: "bgDrift 18s ease-in-out infinite",
          }}/>

          {/* Partículas doradas — +20% densidad, más visibles en hover */}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
            {Array.from({ length: 22 }, (_, i) => (
              <div key={i} style={{
                position: "absolute",
                width: 2+(i%5)*2,
                height: 2+(i%5)*2,
                borderRadius: "50%",
                background: i % 4 === 0 ? "rgba(232,213,163,0.9)" : "rgba(196,158,108,0.7)",
                left: `${5+(i*4.3)%90}%`,
                top: `${5+(i*4.7)%90}%`,
                opacity: hover === "h" ? (0.35+(i%4)*0.12) : (0.2+(i%3)*0.07),
                transition: "opacity 0.5s ease",
                animation: `floatParticle${i%3} ${13+i*1.3}s ease-in-out ${-i*1.8}s infinite`,
                boxShadow: i % 5 === 0 ? "0 0 6px rgba(196,158,108,0.6)" : "none",
              }}/>
            ))}
          </div>

          {/* Contenido — centrado verticalmente con padding consistente */}
          <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "2rem 2.5rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: "0.65rem", letterSpacing: 5, textTransform: "uppercase", opacity: hover === "h" ? 0.6 : 0.4, marginBottom: "1.4rem", transition: "opacity 0.4s" }}>
              Moda Masculina
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem,5vw,4.5rem)", fontWeight: 700, letterSpacing: 6, marginBottom: "1.2rem", transition: "letter-spacing 0.4s ease", letterSpacing: hover === "h" ? "8px" : "6px" }}>
              HOMBRE
            </h2>
            <p style={{ fontWeight: 200, fontSize: "0.85rem", opacity: 0.45, marginBottom: "2.8rem", maxWidth: 220, lineHeight: 1.75, textAlign: "center" }}>
              Estilo editorial.<br/>Identifica y encuentra<br/>dónde comprarlo.
            </p>
            <button
              style={{ padding: "0.9rem 2.5rem", background: "#C49E6C", color: "#0D0D0D", border: "none", fontFamily: "'Montserrat'", fontSize: "0.7rem", fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", cursor: "pointer", transition: "transform 0.2s ease, box-shadow 0.2s ease", transform: hover === "h" ? "translateY(-3px)" : "translateY(0)", boxShadow: hover === "h" ? "0 8px 24px rgba(196,158,108,0.5)" : "0 2px 8px rgba(196,158,108,0.2)" }}
            >
              Entrar →
            </button>
          </div>

          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.06)" }}/>
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
            background: "#FFF0F5",
            color: "#2D1F2B",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "flex 0.45s cubic-bezier(0.2,0.8,0.2,1)",
            position: "relative",
            overflow: "hidden",
            outline: "none",
          }}
        >
          {/* Fondo que brilla más en hover */}
          <div style={{
            position: "absolute", inset: 0,
            background: hover === "m"
              ? "radial-gradient(circle at 50% 45%,rgba(212,99,143,0.22) 0%,transparent 55%),radial-gradient(circle at 25% 75%,rgba(255,182,210,0.25) 0%,transparent 45%)"
              : "radial-gradient(circle at 50% 30%,rgba(212,99,143,0.12) 0%,transparent 50%),radial-gradient(circle at 30% 70%,rgba(255,182,210,0.15) 0%,transparent 45%)",
            transition: "background 0.5s ease",
            animation: "bgDrift 22s ease-in-out infinite reverse",
          }}/>

          {/* Flores — +40% densidad, más brillantes en hover */}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
            {["✿","❀","✾","❁","✿","❀","✾","❁","✿","❀","✾","❁","✿","❀","❁","✿","✾","❀","✿","❁"].map((f, i) => (
              <div key={i} style={{
                position: "absolute",
                fontSize: `${13+(i%6)*5}px`,
                left: `${4+(i*4.8)%92}%`,
                top: `${4+(i*5.3)%92}%`,
                opacity: hover === "m" ? (0.22+(i%5)*0.07) : (0.13+(i%4)*0.04),
                color: i%3===0?"#F0A6C2":i%3===1?"#D4638F":"#E8A0BB",
                animation: `floatFlower ${14+i*1.4}s ease-in-out ${-i*2.2}s infinite`,
                transform: `rotate(${i*37}deg)`,
                transition: "opacity 0.5s ease",
                textShadow: hover === "m" && i % 3 === 0 ? "0 0 8px rgba(212,99,143,0.4)" : "none",
              }}>{f}</div>
            ))}
          </div>

          {/* Contenido — misma estructura que Hombre para alineamiento visual */}
          <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "2rem 2.5rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: "0.65rem", letterSpacing: 5, textTransform: "uppercase", opacity: hover === "m" ? 0.6 : 0.4, marginBottom: "1.4rem", transition: "opacity 0.4s" }}>
              Moda Femenina
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem,5vw,4.5rem)", fontWeight: 600, fontStyle: "italic", letterSpacing: hover === "m" ? "5px" : "3px", marginBottom: "1.2rem", transition: "letter-spacing 0.4s ease" }}>
              MUJER
            </h2>
            <p style={{ fontWeight: 200, fontSize: "0.85rem", opacity: 0.45, marginBottom: "2.8rem", maxWidth: 220, lineHeight: 1.75, textAlign: "center" }}>
              Elegancia y estilo.<br/>Descubre tu look y<br/>encuéntralo online.
            </p>
            <button
              style={{ padding: "0.9rem 2.5rem", background: "#D4638F", color: "#fff", border: "none", fontFamily: "'Montserrat'", fontSize: "0.7rem", fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", cursor: "pointer", borderRadius: 50, transition: "transform 0.2s ease, box-shadow 0.2s ease", transform: hover === "m" ? "translateY(-3px)" : "translateY(0)", boxShadow: hover === "m" ? "0 8px 24px rgba(212,99,143,0.5)" : "0 2px 8px rgba(212,99,143,0.2)" }}
            >
              Entrar →
            </button>
          </div>
        </div>
      </div>

      {/* Footer landing */}
      <div style={{ width: "100%", textAlign: "center", padding: "0.8rem", background: "#0D0D0D", fontFamily: "'Courier Prime', monospace", fontSize: "0.52rem", letterSpacing: 3, color: "rgba(240,237,232,0.28)", display: "flex", alignItems: "center", justifyContent: "center", gap: "1.2rem", flexShrink: 0 }}>
        <span>Hecho por Andres &amp; Chiara</span>
        <span style={{ opacity: 0.3 }}>·</span>
        <span>Powered by AWS Rekognition</span>
        <span style={{ opacity: 0.3 }}>·</span>
        <span>Google Shopping API</span>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("landing");
  if (page === "landing") return <Landing onEnter={g => setPage(g)}/>;
  return <MainPage genero={page} onSwitch={g => setPage(g)} onHome={() => setPage("landing")}/>;
}
