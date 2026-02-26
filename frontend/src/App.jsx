import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const IgIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);
const LiIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
);
const GhIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
);

function RotatingPhrase({ phrases, accentColor }) {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  useEffect(() => {
    const iv = setInterval(() => { setFade(false); setTimeout(() => { setIdx(i => (i + 1) % phrases.length); setFade(true); }, 400); }, 10000);
    return () => clearInterval(iv);
  }, [phrases.length]);
  return (
    <div style={{ textAlign: "center", padding: "1.5rem 1rem", minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontStyle: "italic", fontWeight: 400, color: accentColor, opacity: fade ? 0.7 : 0, transition: "opacity 0.4s ease", maxWidth: 400, lineHeight: 1.5 }}>
        "{phrases[idx]}"
      </p>
    </div>
  );
}

function ContactModal({ onClose, theme }) {
  const isM = theme === "mujer";
  const bg = isM ? "#FFF0F5" : "#0D0D0D";
  const text = isM ? "#2D1F2B" : "#F0EDE8";
  const accent = isM ? "#D4638F" : "#C49E6C";
  const border = isM ? "#F0C6D4" : "rgba(255,255,255,0.1)";
  const radius = isM ? 20 : 4;
  const linkS = { display: "flex", alignItems: "center", gap: "0.3rem", color: accent, textDecoration: "none", fontSize: "0.75rem", transition: "opacity 0.3s" };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: bg, color: text, padding: "2.5rem", borderRadius: radius, border: `1px solid ${border}`, maxWidth: 420, width: "90%", animation: "fadeUp 0.4s ease" }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 700, fontStyle: isM ? "italic" : "normal", marginBottom: "0.5rem", textAlign: "center" }}>Contacto</h3>
        <p style={{ fontSize: "0.8rem", fontWeight: 300, opacity: 0.5, textAlign: "center", marginBottom: "2rem" }}>Creadores de StyleMatch</p>

        <div style={{ marginBottom: "1.5rem", padding: "1.2rem", border: `1px solid ${border}`, borderRadius: isM ? 14 : 2 }}>
          <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.6rem" }}>Andres Rodas</h4>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <a href={SOCIALS.andres.ig} target="_blank" rel="noopener noreferrer" style={linkS}><IgIcon size={15} color={accent}/> Instagram</a>
            <a href={SOCIALS.andres.linkedin} target="_blank" rel="noopener noreferrer" style={linkS}><LiIcon size={15} color={accent}/> LinkedIn</a>
            <a href={SOCIALS.andres.github} target="_blank" rel="noopener noreferrer" style={linkS}><GhIcon size={15} color={accent}/> GitHub</a>
          </div>
        </div>

        <div style={{ marginBottom: "2rem", padding: "1.2rem", border: `1px solid ${border}`, borderRadius: isM ? 14 : 2 }}>
          <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.6rem" }}>Chiara Miranda</h4>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <a href={SOCIALS.chiara.ig} target="_blank" rel="noopener noreferrer" style={linkS}><IgIcon size={15} color={accent}/> Instagram</a>
            <a href={SOCIALS.chiara.linkedin} target="_blank" rel="noopener noreferrer" style={linkS}><LiIcon size={15} color={accent}/> LinkedIn</a>
          </div>
        </div>

        <button onClick={onClose} style={{ width: "100%", padding: "0.8rem", fontFamily: "'Montserrat'", fontSize: "0.7rem", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", background: accent, color: isM ? "#fff" : "#0D0D0D", border: "none", borderRadius: isM ? 50 : 2, cursor: "pointer" }}>Cerrar</button>
      </div>
    </div>
  );
}

function Collage({ genero }) {
  const isM = genero === "mujer";
  const border = isM ? "#F0C6D4" : "rgba(255,255,255,0.1)";
  const radius = isM ? 14 : 2;
  const slots = isM
    ? [
        { w:"55%",h:240,img:"/images/vestido-mujer.jpg",t:0,l:0 },
        { w:"40%",h:160,img:"/images/casual-mujer.jpg",t:20,l:"60%" },
        { w:"45%",h:180,img:"/images/elegante-mujer.jpg",t:200,l:"50%" },
        { w:"45%",h:150,img:"/images/accesorios-mujer.jpg",t:260,l:0 },
      ]
    : [
        { w:"60%",h:250,img:"/images/street-hombre.jpg",t:0,l:0 },
        { w:"35%",h:160,img:"/images/formal-hombre.jpg",t:30,l:"65%" },
        { w:"45%",h:190,img:"/images/casual-hombre.jpg",t:210,l:"55%" },
        { w:"50%",h:140,img:"/images/sneakers-hombre.jpg",t:270,l:0 },
      ];

  return (
    <div style={{ position: "relative", height: 450, width: "100%", maxWidth: 500, margin: "0 auto" }}>
      {slots.map((p, i) => (
        <motion.div 
          key={i} 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
          style={{ position: "absolute", width: p.w, height: p.h, top: p.t, left: p.l, border: `1px solid ${border}`, borderRadius: radius, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
        >
          <motion.img 
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
            src={process.env.PUBLIC_URL + p.img} 
            alt="Style Inspiration" 
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} 
          />
        </motion.div>
      ))}
      {isM && ["✿","❀","✾","❁","✿"].map((f, i) => (
        <div key={`cf${i}`} style={{ position: "absolute", fontSize: `${16+i*3}px`, right: `${5+i*10}%`, bottom: `${-2+i*6}%`, color: i%2===0?"#E8A0BB":"#D4638F", opacity: 0.18+i*0.03, animation: `floatFlower ${16+i*3}s ease-in-out ${-i*2}s infinite`, pointerEvents: "none", zIndex: 10 }}>{f}</div>
      ))}
    </div>
  );
}

function SocialFooter({ color }) {
  const s = 13;
  const linkS = { color, opacity: 0.4, transition: "opacity 0.3", display: "inline-flex", alignItems: "center", gap: "0.25rem", textDecoration: "none", fontSize: "0.5rem", fontFamily: "'Courier Prime', monospace", letterSpacing: 1 };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.7rem", flexWrap: "wrap" }}>
      <a href={SOCIALS.andres.ig} target="_blank" rel="noopener noreferrer" style={linkS}><IgIcon size={s} color={color}/></a>
      <a href={SOCIALS.chiara.ig} target="_blank" rel="noopener noreferrer" style={linkS}><IgIcon size={s} color={color}/></a>
      <a href={SOCIALS.andres.linkedin} target="_blank" rel="noopener noreferrer" style={linkS}><LiIcon size={s} color={color}/></a>
      <a href={SOCIALS.chiara.linkedin} target="_blank" rel="noopener noreferrer" style={linkS}><LiIcon size={s} color={color}/></a>
      <a href={SOCIALS.andres.github} target="_blank" rel="noopener noreferrer" style={linkS}><GhIcon size={s} color={color}/></a>
    </div>
  );
}

function LoadingSteps({ genero, step }) {
  const steps=["Subiendo imagen a S3...","Rekognition analizando...","Detectando tipo, color, estilo...","Buscando tiendas en Lima...","Preparando resultados..."];
  const isM=genero==="mujer"; 
  const accent=isM?"#D4638F":"#C49E6C"; 
  const text=isM?"#2D1F2B":"#F0EDE8";

  return (
    <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem", padding: "1rem", background: isM ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.05)", borderRadius: isM ? 16 : 4, backdropFilter: "blur(10px)" }}>
      {steps.map((s, i) => (
        <div key={i} style={{ fontFamily: "'Montserrat'", fontSize: "0.75rem", fontWeight: 300, color: i === step ? accent : text, opacity: i < step ? 0.3 : i === step ? 1 : 0.15, transition: "all 0.5s", display: "flex", alignItems: "center", gap: "0.7rem" }}>
          <span style={{ fontSize: "0.6rem" }}>{i < step ? "✓" : i === step ? "◉" : "○"}</span>{s}
        </div>
      ))}
    </div>
  );
}

function MainPage({ genero, onSwitch, onHome }) {
  const [preview, setPreview] = useState(null);
  const [base64, setBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [filter, setFilter] = useState("todas");
  const [showContact, setShowContact] = useState(false);
  const fileRef = useRef(null);
  const resultRef = useRef(null);

  const isM = genero === "mujer";
  const bg = isM ? "#FFF0F5" : "#0D0D0D";
  const text = isM ? "#2D1F2B" : "#F0EDE8";
  const accent = isM ? "#D4638F" : "#C49E6C";
  const muted = isM ? "#9C7A8E" : "#8A8680";
  const cBorder = isM ? "#F0C6D4" : "rgba(255,255,255,0.08)";
  const glass = isM ? "rgba(255,240,245,0.92)" : "rgba(13,13,13,0.9)";
  const r = isM ? 16 : 2;
  const cBg = isM ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.03)";
  const aBg = isM ? "rgba(212,99,143,0.08)" : "rgba(196,158,108,0.1)";
  const aBo = isM ? "rgba(212,99,143,0.15)" : "rgba(196,158,108,0.2)";

  const handleFile = f => { 
    if (!f||!f.type.startsWith("image/")) return; 
    const rd = new FileReader(); 
    rd.onload = e => { 
      setPreview(e.target.result); 
      setBase64(e.target.result.split(",")[1]); 
      setResult(null); // Limpiar resultado previo si sube otra
    }; 
    rd.readAsDataURL(f); 
  };

  const scan = async () => { 
    if (!base64) return; 
    setLoading(true); 
    setLoadStep(0);
    
    // Simulador de pasos para UI
    const stepInterval = setInterval(() => {
        setLoadStep(prev => (prev < 4 ? prev + 1 : prev));
    }, 1200);

    try { 
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagen_base64: base64, genero })
      }); 
      const data = await res.json(); 
      if (data.success) {
        setResult(data);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
      } else {
        alert("Error: " + (data.error || "Fallo al procesar imagen")); 
      }
    } catch {
      alert("Error de conexión con AWS");
    } 
    
    clearInterval(stepInterval);
    setLoading(false); 
  };

  const reset = () => { setPreview(null); setBase64(null); setResult(null); setFilter("todas"); if(fileRef.current)fileRef.current.value=""; window.scrollTo({top:0,behavior:"smooth"}); };

  const btnS = { fontFamily:"'Montserrat'",fontSize:"0.65rem",fontWeight:600,letterSpacing:2,textTransform:"uppercase",padding:"0.5rem 1.2rem",border:`1px solid ${cBorder}`,background:"transparent",color:muted,cursor:"pointer",borderRadius:isM?50:2,transition:"all 0.3s" };

  return (
    <div style={{ minHeight:"100vh", background:bg, color:text, fontFamily:"'Montserrat', sans-serif", position:"relative" }}>
      {/* Dynamic BG */}
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:0, background:isM?"radial-gradient(circle at 20% 25%,rgba(212,99,143,0.1) 0%,transparent 40%),radial-gradient(circle at 80% 55%,rgba(255,182,210,0.12) 0%,transparent 45%),radial-gradient(circle at 45% 85%,rgba(212,99,143,0.07) 0%,transparent 40%)":"radial-gradient(ellipse at 15% 20%,rgba(196,158,108,0.06) 0%,transparent 50%),radial-gradient(ellipse at 85% 75%,rgba(196,158,108,0.04) 0%,transparent 50%)", animation:"bgDrift 25s ease-in-out infinite" }}/>

      {/* Header */}
      <header style={{ position:"sticky",top:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1rem 2.5rem",background:glass,backdropFilter:"blur(20px)",borderBottom:`1px solid ${cBorder}` }}>
        <div onClick={onHome} style={{ fontFamily:"'Cormorant Garamond', serif",fontSize:"1.2rem",fontWeight:700,letterSpacing:4,textTransform:"uppercase",color:accent,cursor:"pointer",fontStyle:isM?"italic":"normal" }}>Style<span style={{fontWeight:300}}>Match</span></div>
        <div style={{display:"flex",gap:"0.5rem"}}>
          <button onClick={()=>onSwitch(isM?"hombre":"mujer")} style={btnS}>Ir a {isM?"Hombre":"Mujer"}</button>
          <button onClick={()=>setShowContact(true)} style={btnS}>Contacto</button>
          <button onClick={onHome} style={btnS}>Inicio</button>
        </div>
      </header>

      {/* Hero Section - Asymmetrical Design */}
      <section style={{position:"relative",zIndex:1,maxWidth:1200,margin:"0 auto",padding:"4rem 2rem 2rem"}}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4rem", alignItems: "center" }}>
          
          {/* Left Side: Typography & Upload (Larger ratio) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }}
            style={{ flex: "1.2 1 450px" }}
          >
            <p style={{fontFamily:"'Courier Prime', monospace",fontSize:"0.65rem",letterSpacing:4,textTransform:"uppercase",color:accent,marginBottom:"1.2rem"}}>Fashion Finder · Lima</p>
            <h1 style={{ fontFamily:"'Cormorant Garamond', serif",fontSize:"clamp(3rem,6vw,5rem)",fontWeight:700,fontStyle:isM?"italic":"normal",lineHeight:1,marginBottom:"1.5rem",letterSpacing:isM?1:3,whiteSpace:"pre-line" }}>{isM?"DESCUBRE\nTU LOOK":"IDENTIFICA\nTU ESTILO"}</h1>
            <p style={{fontWeight:200,fontSize:"1rem",lineHeight:1.7,color:muted,marginBottom:"2.5rem",maxWidth:450}}>{isM?"Sube una foto y deja que nuestra IA descubra cada detalle de tu outfit.":"Sube una foto. Nuestra IA detecta tipo, color, material y estilo."}</p>

            {/* Glassmorphism Upload Zone */}
            <div onClick={()=> !loading && fileRef.current?.click()} onDragOver={e=>{e.preventDefault();setDragOver(true)}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault();setDragOver(false); !loading && handleFile(e.dataTransfer.files[0])}}
              style={{ 
                border: `2px ${preview?"solid":"dashed"} ${dragOver?accent:cBorder}`,
                borderRadius: r,
                padding: preview ? "1rem" : "4rem 2rem",
                textAlign: "center",
                cursor: loading ? "wait" : "pointer",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                background: dragOver ? `${accent}15` : isM ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.03)",
                backdropFilter: "blur(12px)",
                boxShadow: dragOver ? `0 0 30px ${accent}20` : "0 8px 32px 0 rgba(0,0,0,0.05)",
                position: "relative",
                overflow: "hidden" 
              }}>
              
              {isM && !preview && <div style={{position:"absolute",top:-2,left:-2,right:-2,height:3,background:`linear-gradient(90deg,${accent},#F8D0DE,${accent})`,backgroundSize:"200% 100%",animation:"shimmer 3s ease-in-out infinite",borderRadius:`${r}px ${r}px 0 0`}}/>}
              
              {preview ? (
                <div className={loading ? "scanner-container" : ""} style={{ position: "relative", width: "100%", color: accent }}>
                  <img src={preview} alt="Preview" style={{width:"100%",maxHeight:380,objectFit:"contain",borderRadius:Math.max(r-4,0), opacity: loading ? 0.6 : 1, transition: "opacity 0.3s"}}/>
                  {/* Escáner IA activado durante el loading */}
                  {loading && <div className="scanner-line" />}
                </div>
              ) : (
                <motion.div whileHover={{ scale: 1.02 }}>
                  <div style={{fontSize:"3rem",marginBottom:"1rem",opacity:0.4}}>{isM?"✨":"📷"}</div>
                  <p style={{fontSize:"1.1rem",fontWeight:400,marginBottom:"0.5rem"}}>Arrastra tu foto aquí</p>
                  <p style={{fontFamily:"'Courier Prime', monospace",fontSize:"0.75rem",opacity:0.4}}>JPG, PNG</p>
                </motion.div>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])} disabled={loading}/>
            </div>

            {preview && !loading && !result && (
              <motion.button 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                onClick={scan} 
                style={{ width:"100%",padding:"1.2rem",marginTop:"1.5rem",fontFamily:"'Montserrat'",fontSize:"0.8rem",fontWeight:600,letterSpacing:3,textTransform:"uppercase",border:"none",background:accent,color:isM?"#fff":"#0D0D0D",borderRadius:isM?50:2,cursor:"pointer",boxShadow:`0 10px 25px ${accent}40` }}
              >
                {isM?"✨ Escanear Prenda":"⚡ Analizar Look"}
              </motion.button>
            )}

            {/* Inline Loading Steps (Reemplaza el Overlay bloqueante) */}
            {loading && <LoadingSteps genero={genero} step={loadStep} />}

          </motion.div>

          {/* Right Side: Dynamic Collage (Smaller ratio) */}
          <div style={{ flex: "0.8 1 350px", position: "relative" }}>
            <Collage genero={genero}/>
            <RotatingPhrase phrases={isM?FRASES_MUJER:FRASES_HOMBRE} accentColor={accent}/>
          </div>
        </div>
      </section>

      {/* Results */}
      <div ref={resultRef}>
        {result&&(()=>{
          const p=result.prenda; const tiendas=(result.tiendas||[]).filter(t=>filter==="todas"||t.tipo===filter);
          return (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{maxWidth:1100,margin:"0 auto",padding:"2rem 2rem 3rem",position:"relative",zIndex:1}}>
              <div style={{display:"flex",gap:"2.5rem",alignItems:"flex-start",marginBottom:"3rem",flexWrap:"wrap"}}>
                <div style={{flexShrink:0,width:260,height:330,overflow:"hidden",border:`1px solid ${cBorder}`,borderRadius:r, boxShadow: "0 10px 30px rgba(0,0,0,0.08)"}}><img src={preview} alt="Prenda" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>
                <div style={{flex:1,minWidth:280}}>
                  <p style={{fontFamily:"'Courier Prime', monospace",fontSize:"0.65rem",letterSpacing:3,textTransform:"uppercase",color:accent,marginBottom:"0.8rem"}}>Resultado IA</p>
                  <h2 style={{fontFamily:"'Cormorant Garamond', serif",fontSize:"clamp(2rem,4vw,3.2rem)",fontWeight:700,fontStyle:isM?"italic":"normal",lineHeight:1.1,marginBottom:"0.5rem"}}>{p.tipo_es} {p.color!=="No detectado"?p.color:""}</h2>
                  <p style={{fontFamily:"'Courier Prime', monospace",fontSize:"0.75rem",opacity:0.5,marginBottom:"0.8rem"}}>Confianza: {p.confianza}% · {p.estilo}</p>
                  <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:"1.8rem",fontWeight:700,color:accent,marginBottom:"1.2rem"}}>S/ {p.precio_min} — {p.precio_max} <span style={{fontFamily:"'Courier Prime', monospace",fontSize:"0.65rem",fontWeight:400,opacity:0.5}}>rango estimado en Lima</span></div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
                    {(p.etiquetas||[]).slice(0,8).map((e,i)=>(<span key={i} style={{fontFamily:"'Courier Prime'",fontSize:"0.65rem",padding:"0.35rem 0.7rem",background:aBg,border:`1px solid ${aBo}`,color:accent,borderRadius:isM?50:2}}>{e.nombre} {e.confianza}%</span>))}
                  </div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(170px, 1fr))",gap:"1rem",marginBottom:"3rem"}}>
                {[{l:"Prenda",v:p.tipo_es},{l:"Color",v:p.color},{l:"Material",v:p.material_estimado},{l:"Tallas",v:(p.tallas_disponibles||[]).join(" · "),s:"Estimado"},{l:"Estilo",v:p.estilo}].filter(d=>d.v&&d.v!=="No detectado").map((d,i)=>(
                  <div key={i} style={{padding:"1.6rem",background:cBg,border:`1px solid ${cBorder}`,borderRadius:r, backdropFilter: "blur(10px)"}}>
                    <div style={{fontFamily:"'Courier Prime', monospace",fontSize:"0.6rem",letterSpacing:2,textTransform:"uppercase",color:accent,marginBottom:"0.7rem"}}>{d.l}</div>
                    <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:"1.3rem",fontWeight:700}}>{d.v}</div>
                    {d.s&&<div style={{fontSize:"0.75rem",fontWeight:300,opacity:0.4,marginTop:"0.3rem"}}>{d.s}</div>}
                  </div>
                ))}
              </div>
              <h3 style={{fontFamily:"'Cormorant Garamond', serif",fontSize:"1.5rem",fontWeight:700,fontStyle:isM?"italic":"normal",marginBottom:"1rem"}}>Cuándo usarlo</h3>
              <div style={{display:"flex",flexWrap:"wrap",gap:"0.5rem",marginBottom:"3rem"}}>{(p.ocasion||[]).map((o,i)=>(<span key={i} style={{fontSize:"0.8rem",padding:"0.5rem 1.2rem",border:`1px solid ${cBorder}`,borderRadius:isM?50:2,color:accent}}>{o}</span>))}</div>
              
              <h3 style={{fontFamily:"'Cormorant Garamond', serif",fontSize:"1.5rem",fontWeight:700,fontStyle:isM?"italic":"normal",marginBottom:"1rem"}}>{isM?"Dónde encontrarlo":"Dónde comprarlo"} en Lima</h3>
              <div style={{display:"flex",gap:"0.4rem",marginBottom:"1.5rem"}}>
                {["todas","fisica","online"].map(f=>(<button key={f} onClick={()=>setFilter(f)} style={{fontFamily:"'Montserrat'",fontSize:"0.7rem",fontWeight:600,letterSpacing:1,textTransform:"uppercase",padding:"0.5rem 1.3rem",border:`1px solid ${filter===f?accent:cBorder}`,background:filter===f?accent:"transparent",color:filter===f?(isM?"#fff":"#0D0D0D"):accent,borderRadius:isM?50:2,cursor:"pointer", transition: "all 0.3s"}}>{f==="todas"?"Todas":f==="fisica"?"📍 Físicas":"🌐 Online"}</button>))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(270px, 1fr))",gap:"1.2rem"}}>
                <AnimatePresence>
                  {tiendas.map((t,i)=>(
                    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} key={i} style={{padding:"1.5rem",background:cBg,border:`1px solid ${cBorder}`,borderRadius:r, backdropFilter: "blur(5px)"}}>
                      <span style={{fontFamily:"'Courier Prime'",fontSize:"0.6rem",padding:"0.2rem 0.5rem",background:aBg,color:accent,borderRadius:isM?50:2}}>{t.tipo==="fisica"?"📍 Física":"🌐 Online"}</span>
                      <h4 style={{fontFamily:"'Cormorant Garamond'",fontSize:"1.15rem",fontWeight:700,marginTop:"0.7rem"}}>{t.nombre}</h4>
                      <p style={{fontSize:"0.8rem",fontWeight:300,opacity:0.6,margin:"0.3rem 0 0.7rem",lineHeight:1.4}}>{t.producto}</p>
                      <div style={{fontFamily:"'Cormorant Garamond'",fontSize:"1.3rem",fontWeight:700,color:accent,marginBottom:"0.4rem"}}>{t.precio>0?`S/ ${t.precio.toFixed(2)}`:"Consultar"}</div>
                      <p style={{fontSize:"0.73rem",opacity:0.5,marginBottom:"0.2rem"}}>📍 {t.ubicacion||"Lima"}</p>
                      <p style={{fontFamily:"'Courier Prime'",fontSize:"0.63rem",opacity:0.4,marginBottom:"0.9rem"}}>Tallas: {(t.tallas||[]).join(" · ")}</p>
                      <a href={t.link} target="_blank" rel="noopener noreferrer" style={{fontSize:"0.7rem",fontWeight:600,letterSpacing:2,textTransform:"uppercase",color:accent,textDecoration:"none"}}>Ver en tienda →</a>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })()}
      </div>

      {result&&<div style={{textAlign:"center",padding:"2rem 0 3rem",position:"relative",zIndex:1}}><button onClick={reset} style={{fontFamily:"'Montserrat'",fontSize:"0.8rem",fontWeight:600,letterSpacing:3,textTransform:"uppercase",padding:"1.1rem 3rem",border:"none",background:accent,color:isM?"#fff":"#0D0D0D",cursor:"pointer",borderRadius:isM?50:2,boxShadow:isM?"0 4px 20px rgba(212,99,143,0.3)":"0 4px 20px rgba(196,158,108,0.3)",transition:"all 0.3s ease"}}>↻ Nueva búsqueda</button></div>}

      {/* Footer */}
      <div style={{position:"relative",zIndex:1,textAlign:"center",padding:"1.5rem 2rem 1rem", borderTop: `1px solid ${cBorder}`}}>
        <p style={{fontFamily:"'Courier Prime', monospace",fontSize:"0.6rem",letterSpacing:2,opacity:0.3,color:muted,marginBottom:"0.8rem"}}>Hecho por Andres & Chiara · Powered by AWS</p>
        <SocialFooter color={muted}/>
      </div>

      {showContact&&<ContactModal onClose={()=>setShowContact(false)} theme={genero}/>}
    </div>
  );
}

function Landing({ onEnter }) {
  const [hover,setHover]=useState(null);
  return (
    <div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",zIndex:100,fontFamily:"'Montserrat', sans-serif"}}>
      <div style={{width:"100%",textAlign:"center",padding:"1.3rem 0",background:"#0D0D0D",borderBottom:"1px solid rgba(255,255,255,0.06)",zIndex:101}}>
        <span style={{fontFamily:"'Cormorant Garamond', serif",fontSize:"1.5rem",fontWeight:300,color:"rgba(240,237,232,0.85)",letterSpacing:8,textTransform:"uppercase"}}>Style<span style={{fontWeight:700,color:"#C49E6C"}}>Match</span></span>
      </div>

      <div style={{flex:1,display:"flex"}}>
        <div onMouseEnter={()=>setHover("h")} onMouseLeave={()=>setHover(null)} onClick={()=>onEnter("hombre")}
          style={{flex:hover==="h"?1.5:hover==="m"?0.7:1,background:"#0D0D0D",color:"#F0EDE8",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"flex 0.7s cubic-bezier(0.4,0,0.2,1)",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 40%,rgba(196,158,108,0.08) 0%,transparent 60%)",animation:"bgDrift 18s ease-in-out infinite"}}/>
          <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
            {Array.from({length:14},(_,i)=>(<div key={i} style={{position:"absolute",width:3+(i%4)*2,height:3+(i%4)*2,borderRadius:"50%",background:"rgba(196,158,108,0.5)",left:`${8+(i*6.5)%84}%`,top:`${8+(i*7.2)%84}%`,opacity:0.2+(i%3)*0.08,animation:`floatParticle${i%3} ${14+i*1.5}s ease-in-out ${-i*2}s infinite`}}/>))}
          </div>
          <div style={{position:"relative",zIndex:1,textAlign:"center",padding:"2rem"}}>
            <p style={{fontFamily:"'Courier Prime', monospace",fontSize:"0.65rem",letterSpacing:5,textTransform:"uppercase",opacity:0.4,marginBottom:"1.5rem"}}>Moda Masculina</p>
            <h2 style={{fontFamily:"'Cormorant Garamond', serif",fontSize:"clamp(2.5rem,5vw,4.5rem)",fontWeight:700,letterSpacing:6,marginBottom:"1rem"}}>HOMBRE</h2>
            <p style={{fontWeight:200,fontSize:"0.85rem",opacity:0.45,marginBottom:"2.5rem",maxWidth:230}}>Estilo editorial.<br/>Identifica y encuentra.</p>
            <button style={{padding:"0.9rem 2.5rem",background:"#C49E6C",color:"#0D0D0D",border:"none",fontFamily:"'Montserrat'",fontSize:"0.7rem",fontWeight:600,letterSpacing:3,textTransform:"uppercase",cursor:"pointer"}}>Entrar →</button>
          </div>
          <div style={{position:"absolute",right:0,top:0,bottom:0,width:1,background:"rgba(255,255,255,0.06)"}}/>
        </div>

        <div onMouseEnter={()=>setHover("m")} onMouseLeave={()=>setHover(null)} onClick={()=>onEnter("mujer")}
          style={{flex:hover==="m"?1.5:hover==="h"?0.7:1,background:"#FFF0F5",color:"#2D1F2B",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"flex 0.7s cubic-bezier(0.4,0,0.2,1)",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 50% 30%,rgba(212,99,143,0.12) 0%,transparent 50%),radial-gradient(circle at 30% 70%,rgba(255,182,210,0.15) 0%,transparent 45%)",animation:"bgDrift 22s ease-in-out infinite reverse"}}/>
          <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
            {["✿","❀","✾","❁","✿","❀","✾","❁","✿","❀","✾","❁","✿","❀"].map((f,i)=>(<div key={i} style={{position:"absolute",fontSize:`${14+(i%5)*5}px`,left:`${5+(i*6.8)%90}%`,top:`${5+(i*7.5)%90}%`,opacity:0.13+(i%4)*0.04,color:i%3===0?"#F0A6C2":i%3===1?"#D4638F":"#E8A0BB",animation:`floatFlower ${16+i*1.8}s ease-in-out ${-i*2.5}s infinite`,transform:`rotate(${i*43}deg)`}}>{f}</div>))}
          </div>
          <div style={{position:"relative",zIndex:1,textAlign:"center",padding:"2rem"}}>
            <p style={{fontFamily:"'Courier Prime', monospace",fontSize:"0.65rem",letterSpacing:5,textTransform:"uppercase",opacity:0.4,marginBottom:"1.5rem"}}>Moda Femenina</p>
            <h2 style={{fontFamily:"'Cormorant Garamond', serif",fontSize:"clamp(2.5rem,5vw,4.5rem)",fontWeight:600,fontStyle:"italic",letterSpacing:3,marginBottom:"1rem"}}>MUJER</h2>
            <p style={{fontWeight:200,fontSize:"0.85rem",opacity:0.45,marginBottom:"2.5rem",maxWidth:230}}>Elegancia y estilo.<br/>Descubre tu look.</p>
            <button style={{padding:"0.9rem 2.5rem",background:"#D4638F",color:"#fff",border:"none",fontFamily:"'Montserrat'",fontSize:"0.7rem",fontWeight:600,letterSpacing:3,textTransform:"uppercase",cursor:"pointer",borderRadius:50}}>Entrar →</button>
          </div>
        </div>
      </div>

      <div style={{width:"100%",textAlign:"center",padding:"0.7rem",background:"#0D0D0D",fontFamily:"'Courier Prime', monospace",fontSize:"0.55rem",letterSpacing:3,color:"rgba(240,237,232,0.35)"}}>Hecho por Andres & Chiara</div>
    </div>
  );
}

export default function App() {
  const [page,setPage]=useState("landing");
  if(page==="landing") return <Landing onEnter={g=>setPage(g)}/>;
  return <MainPage genero={page} onSwitch={g=>setPage(g)} onHome={()=>setPage("landing")}/>;
}