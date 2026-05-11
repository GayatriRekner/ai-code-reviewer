import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";

/* ─── GLOBAL STYLES ─────────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #04040c;
      --glass: rgba(255,255,255,0.03);
      --glass-mid: rgba(255,255,255,0.06);
      --glass-hi: rgba(255,255,255,0.10);
      --border: rgba(255,255,255,0.06);
      --border-hi: rgba(255,255,255,0.13);
      --accent: #7c6bff;
      --accent-light: #a99bff;
      --teal: #4fd9c5;
      --rose: #ff6b8a;
      --amber: #ffb347;
      --text: #eeedf8;
      --text-sub: rgba(238,237,248,0.5);
      --text-dim: rgba(238,237,248,0.2);
      --font-head: 'Syne', sans-serif;
      --font-body: 'Plus Jakarta Sans', sans-serif;
      --font-mono: 'DM Mono', monospace;
    }

    html { scroll-behavior: smooth; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-body);
      min-height: 100vh;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
      cursor: none;
    }
    input, button, textarea { font-family: var(--font-body); }

    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(124,107,255,0.3); border-radius: 3px; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(28px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes spinReverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
    @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
    @keyframes aurora1 {
      0%,100% { transform: translate(0,0) scale(1); }
      33%      { transform: translate(80px,-60px) scale(1.15); }
      66%      { transform: translate(-50px,80px) scale(0.9); }
    }
    @keyframes aurora2 {
      0%,100% { transform: translate(0,0) scale(1); }
      40%      { transform: translate(-100px,60px) scale(1.2); }
      70%      { transform: translate(60px,-80px) scale(0.85); }
    }
    @keyframes aurora3 {
      0%,100% { transform: translate(0,0) scale(1.1); }
      50%      { transform: translate(70px,50px) scale(0.9); }
    }
    @keyframes float {
      0%,100% { transform: translateY(0px) rotate(0deg); }
      50%      { transform: translateY(-12px) rotate(3deg); }
    }
    @keyframes particleRise {
      0%   { transform: translateY(0) translateX(0) scale(0); opacity: 0; }
      10%  { opacity: 1; }
      90%  { opacity: 0.6; }
      100% { transform: translateY(-110vh) translateX(var(--dx)) scale(1); opacity: 0; }
    }
    @keyframes shimmerSlide {
      0%   { background-position: -400% center; }
      100% { background-position: 400% center; }
    }
    @keyframes borderFlow {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes pulseGlow {
      0%,100% { opacity: 0.6; transform: scale(1); }
      50%      { opacity: 1;   transform: scale(1.08); }
    }
    @keyframes lineGrow {
      from { width: 0; opacity: 0; }
      to   { width: 100%; opacity: 1; }
    }
    @keyframes cardSlideIn {
      from { opacity: 0; transform: translateY(32px) rotateX(6deg); }
      to   { opacity: 1; transform: translateY(0) rotateX(0deg); }
    }

    .shimmer-text {
      background: linear-gradient(90deg,
        rgba(238,237,248,0.5) 0%,
        rgba(238,237,248,1) 30%,
        rgba(169,155,255,1) 50%,
        rgba(238,237,248,1) 70%,
        rgba(238,237,248,0.5) 100%);
      background-size: 300% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmerSlide 4s linear infinite;
    }

    .glass-card {
      background: rgba(255,255,255,0.028);
      backdrop-filter: blur(28px) saturate(180%);
      -webkit-backdrop-filter: blur(28px) saturate(180%);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      transition: border-color 0.35s, box-shadow 0.35s;
    }
    .glass-card:hover {
      border-color: rgba(124,107,255,0.28);
      box-shadow: 0 12px 70px rgba(0,0,0,0.55), 0 0 0 1px rgba(124,107,255,0.08) inset;
    }

    .cursor-dot {
      width: 8px; height: 8px;
      background: var(--accent);
      border-radius: 50%;
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      mix-blend-mode: screen;
      transition: transform 0.1s;
    }
    .cursor-ring {
      width: 38px; height: 38px;
      border: 1.5px solid rgba(124,107,255,0.45);
      border-radius: 50%;
      position: fixed;
      pointer-events: none;
      z-index: 9998;
      transition: width 0.3s ease, height 0.3s ease, border-color 0.3s ease;
    }
    .cursor-ring.large {
      width: 60px; height: 60px;
      border-color: rgba(124,107,255,0.85);
    }

    input::placeholder { color: var(--text-dim); }
    input:focus { outline: none; }
  `}</style>
);

/* ─── CUSTOM CURSOR ─────────────────────────────────────────────────────── */
const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const mouse = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const rafRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX - 4 + "px";
        dotRef.current.style.top = e.clientY - 4 + "px";
      }
      const isHover = !!e.target.closest("button,a,[data-hover]");
      ringRef.current?.classList.toggle("large", isHover);
    };
    const tick = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.11;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.11;
      if (ringRef.current) {
        ringRef.current.style.left = ring.current.x - 19 + "px";
        ringRef.current.style.top = ring.current.y - 19 + "px";
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    document.addEventListener("mousemove", onMove);
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
};

/* ─── AURORA BACKGROUND ─────────────────────────────────────────────────── */
const Aurora = () => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      pointerEvents: "none",
      zIndex: 0,
      overflow: "hidden",
    }}
  >
    {[
      {
        c: "#7c6bff",
        x: "8%",
        y: "10%",
        s: 750,
        a: "aurora1 18s ease-in-out infinite",
      },
      {
        c: "#4fd9c5",
        x: "62%",
        y: "55%",
        s: 650,
        a: "aurora2 22s ease-in-out infinite",
      },
      {
        c: "#ff6b8a",
        x: "78%",
        y: "3%",
        s: 520,
        a: "aurora3 15s ease-in-out infinite",
      },
      {
        c: "#ffb347",
        x: "25%",
        y: "72%",
        s: 430,
        a: "aurora1 20s ease-in-out infinite reverse",
      },
    ].map((b, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: b.x,
          top: b.y,
          width: b.s,
          height: b.s,
          borderRadius: "50%",
          background: b.c,
          filter: "blur(140px)",
          opacity: 0.052,
          animation: b.a,
        }}
      />
    ))}
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.016) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.016) 1px, transparent 1px)`,
        backgroundSize: "58px 58px",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at 50% 50%, transparent 35%, #04040c 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.032'/%3E%3C/svg%3E")`,
      }}
    />
  </div>
);

/* ─── PARTICLES ─────────────────────────────────────────────────────────── */
const Particles = () => {
  const items = useRef(
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 2.5 + 0.8,
      delay: Math.random() * 14,
      duration: Math.random() * 14 + 10,
      dx: (Math.random() - 0.5) * 130,
      color: ["#7c6bff", "#4fd9c5", "#ff6b8a", "#ffb347", "#fff"][
        Math.floor(Math.random() * 5)
      ],
    })),
  ).current;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      {items.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            bottom: -10,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.color,
            opacity: 0,
            "--dx": `${p.dx}px`,
            animation: `particleRise ${p.duration}s ${p.delay}s ease-in-out infinite`,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
};

/* ─── ANIMATED NUMBER ───────────────────────────────────────────────────── */
const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  useEffect(() => {
    const start = prevRef.current,
      end = value,
      diff = end - start;
    if (!diff) return;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / 700, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + diff * e));
      if (p < 1) requestAnimationFrame(tick);
      else prevRef.current = end;
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span>{display}</span>;
};

/* ─── TYPING PLACEHOLDER ────────────────────────────────────────────────── */
const useTyping = (phrases) => {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const cur = phrases[phase % phrases.length];
    const t = setTimeout(
      () => {
        if (!del) {
          if (text.length < cur.length) setText(cur.slice(0, text.length + 1));
          else setTimeout(() => setDel(true), 1800);
        } else {
          if (text.length > 0) setText(text.slice(0, -1));
          else {
            setDel(false);
            setPhase((p) => p + 1);
          }
        }
      },
      del ? 32 : 62,
    );
    return () => clearTimeout(t);
  }, [text, del, phase, phrases]);
  return text;
};

/* ─── SCORE RING ─────────────────────────────────────────────────────────── */
const ScoreRing = ({ score = 82, size = 56 }) => {
  const [anim, setAnim] = useState(0);
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const color = score >= 80 ? "#4fd9c5" : score >= 60 ? "#7c6bff" : "#ff6b8a";
  useEffect(() => {
    const t = setTimeout(() => setAnim(score), 120);
    return () => clearTimeout(t);
  }, [score]);
  const dash = (anim / 100) * circ;
  return (
    <div
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={4.5}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={4.5}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          style={{
            transition: "stroke-dasharray 1.2s cubic-bezier(0.22,1,0.36,1)",
            filter: `drop-shadow(0 0 5px ${color})`,
          }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color,
            fontFamily: "var(--font-mono)",
            lineHeight: 1,
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontSize: 7,
            color: "var(--text-dim)",
            letterSpacing: "0.1em",
            marginTop: 2,
          }}
        >
          SCORE
        </span>
      </div>
    </div>
  );
};

/* ─── LOADING STATE ──────────────────────────────────────────────────────── */
const LoadingState = () => {
  const steps = [
    "Cloning repository",
    "Parsing file tree",
    "Running AI analysis",
    "Generating report",
  ];
  const [active, setActive] = useState(0);
  useEffect(() => {
    const iv = setInterval(
      () => setActive((a) => (a + 1) % steps.length),
      1500,
    );
    return () => clearInterval(iv);
  }, []);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "80px 20px",
        gap: 36,
        animation: "fadeIn 0.4s ease both",
      }}
    >
      {/* Triple orbit */}
      <div style={{ position: "relative", width: 108, height: 108 }}>
        {[
          { s: 108, c: "#7c6bff", d: "2.2s", fwd: true },
          { s: 76, c: "#4fd9c5", d: "1.6s", fwd: false },
          { s: 44, c: "#ff6b8a", d: "1.1s", fwd: true },
        ].map((ring, i) => {
          const off = (108 - ring.s) / 2;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: off,
                left: off,
                width: ring.s,
                height: ring.s,
                borderRadius: "50%",
                border: "2px solid transparent",
                borderTopColor: ring.c,
                animation: `${ring.fwd ? "spin" : "spinReverse"} ${ring.d} linear infinite`,
                boxShadow: `0 0 18px ${ring.c}44`,
              }}
            />
          );
        })}
        <div
          style={{
            position: "absolute",
            top: 44,
            left: 44,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#7c6bff",
            boxShadow: "0 0 24px rgba(124,107,255,0.9)",
            animation: "pulseGlow 1.5s ease-in-out infinite",
          }}
        />
      </div>
      {/* Steps list */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          width: "100%",
          maxWidth: 340,
        }}
      >
        {steps.map((step, i) => (
          <div
            key={step}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "11px 18px",
              borderRadius: 13,
              background:
                i === active ? "rgba(124,107,255,0.09)" : "transparent",
              border: `1px solid ${i === active ? "rgba(124,107,255,0.28)" : "transparent"}`,
              transition: "all 0.4s ease",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                flexShrink: 0,
                background:
                  i < active
                    ? "#4fd9c5"
                    : i === active
                      ? "#7c6bff"
                      : "rgba(255,255,255,0.1)",
                boxShadow:
                  i === active
                    ? "0 0 14px rgba(124,107,255,0.9)"
                    : i < active
                      ? "0 0 8px rgba(79,217,197,0.7)"
                      : "none",
                transition: "all 0.4s ease",
              }}
            />
            <span
              style={{
                fontSize: 13,
                fontFamily: "var(--font-mono)",
                color:
                  i === active
                    ? "var(--accent-light)"
                    : i < active
                      ? "var(--teal)"
                      : "var(--text-dim)",
                transition: "color 0.4s ease",
              }}
            >
              {i < active ? "✓ " : ""}
              {step}
              {i === active && (
                <span style={{ animation: "blink 0.75s step-end infinite" }}>
                  _
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── EMPTY STATE ────────────────────────────────────────────────────────── */
const EmptyState = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "80px 20px",
      gap: 24,
      animation: "fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both",
    }}
  >
    <div
      style={{
        width: 96,
        height: 96,
        borderRadius: 28,
        fontSize: 40,
        background: "rgba(124,107,255,0.06)",
        border: "1px solid rgba(124,107,255,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "float 4s ease-in-out infinite",
        boxShadow: "0 0 40px rgba(124,107,255,0.1)",
      }}
    >
      ⌬
    </div>
    <div style={{ textAlign: "center", maxWidth: 360 }}>
      <h3
        style={{
          fontFamily: "var(--font-head)",
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        Ready to analyze
      </h3>
      <p style={{ fontSize: 14, color: "var(--text-sub)", lineHeight: 1.75 }}>
        Enter any public GitHub repository above and get a comprehensive
        AI-powered review in seconds.
      </p>
    </div>
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      {[
        "🐛 Bug Detection",
        "⚡ Performance",
        "🔒 Security",
        "✨ Improvements",
        "📊 Code Quality",
      ].map((tag) => (
        <span
          key={tag}
          style={{
            padding: "5px 13px",
            borderRadius: 100,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            fontSize: 12,
            color: "var(--text-sub)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  </div>
);

/* ─── REVIEW ITEM ────────────────────────────────────────────────────────── */
const ReviewItem = ({ text, color, delay = 0 }) => (
  <li
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
      padding: "9px 0",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      listStyle: "none",
      animation: `fadeUp 0.45s ${delay}s cubic-bezier(0.22,1,0.36,1) both`,
    }}
  >
    <span
      style={{
        flexShrink: 0,
        width: 5,
        height: 5,
        borderRadius: "50%",
        background: color,
        marginTop: 7,
        boxShadow: `0 0 7px ${color}99`,
      }}
    />
    <span style={{ fontSize: 13, color: "var(--text-sub)", lineHeight: 1.65 }}>
      {text}
    </span>
  </li>
);

/* ─── SECTION BLOCK ──────────────────────────────────────────────────────── */
const SectionBlock = ({ icon, label, items, color, emptyMsg, delay = 0 }) => (
  <div
    style={{
      background: "rgba(255,255,255,0.022)",
      backdropFilter: "blur(14px)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderTop: `2px solid ${color}`,
      borderRadius: "0 0 14px 14px",
      padding: "16px",
      animation: `fadeUp 0.5s ${delay}s cubic-bezier(0.22,1,0.36,1) both`,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            fontSize: 12,
            color,
            background: `${color}14`,
            border: `1px solid ${color}24`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "var(--font-head)",
            color: "var(--text)",
          }}
        >
          {label}
        </span>
      </div>
      {items.length > 0 && (
        <span
          style={{
            padding: "2px 8px",
            borderRadius: 100,
            background: `${color}12`,
            fontSize: 11,
            color,
            fontFamily: "var(--font-mono)",
          }}
        >
          {items.length}
        </span>
      )}
    </div>
    {items.length === 0 ? (
      <p
        style={{
          fontSize: 12,
          color: "var(--text-dim)",
          fontStyle: "italic",
          paddingLeft: 4,
        }}
      >
        {emptyMsg}
      </p>
    ) : (
      <ul style={{ padding: 0, margin: 0 }}>
        {items.map((t, i) => (
          <ReviewItem key={i} text={t} color={color} delay={delay + i * 0.04} />
        ))}
      </ul>
    )}
  </div>
);

/* ─── TILT CARD (3-D hover) ──────────────────────────────────────────────── */
const TiltCard = ({ children, style, className }) => {
  const ref = useRef(null);
  const raf = useRef(null);

  const onMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const rx =
      ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -5;
    const ry =
      ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 5;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      if (!ref.current) return;
      ref.current.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.012)`;
      const glare = ref.current.querySelector(".glare");
      if (glare) {
        const gx = ((e.clientX - rect.left) / rect.width) * 100;
        const gy = ((e.clientY - rect.top) / rect.height) * 100;
        glare.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.07) 0%, transparent 55%)`;
      }
    });
  }, []);

  const onLeave = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (!ref.current) return;
    ref.current.style.transform =
      "perspective(1100px) rotateX(0) rotateY(0) scale(1)";
    const glare = ref.current.querySelector(".glare");
    if (glare) glare.style.background = "transparent";
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        transformStyle: "preserve-3d",
        transition: "transform 0.45s cubic-bezier(0.22,1,0.36,1)",
        ...style,
      }}
    >
      <div
        className="glare"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          pointerEvents: "none",
          zIndex: 2,
          transition: "background 0.15s",
        }}
      />
      {children}
    </div>
  );
};

/* ─── REVIEW CARD ────────────────────────────────────────────────────────── */
const ReviewCard = ({ review, index }) => {
  const [expanded, setExpanded] = useState(true);
  const [activeFile, setActiveFile] = useState(null);
  const bugs = review.review?.bugs || [];
  const improvements = review.review?.improvements || [];
  const quality = review.review?.code_quality || [];
  const perFile = review.review?.per_file || [];
  const files = review.files ? review.files.split(",").filter(Boolean) : [];
  const score = Math.min(
    100,
    Math.max(20, 100 - bugs.length * 7 + improvements.length * 2),
  );
  const repoName =
    review.repo_url?.replace(/^https?:\/\/(www\.)?github\.com\//, "") ||
    review.repo_url;

  return (
    <TiltCard
      className="glass-card"
      style={{
        position: "relative",
        overflow: "hidden",
        marginBottom: 18,
        animation: `cardSlideIn 0.65s ${index * 0.1}s cubic-bezier(0.22,1,0.36,1) both`,
      }}
    >
      {/* Rainbow top line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background:
            "linear-gradient(90deg, transparent 0%, #7c6bff 30%, #4fd9c5 60%, #ff6b8a 85%, transparent 100%)",
          animation: "lineGrow 0.9s ease both",
        }}
      />

      {/* Header */}
      <div
        data-hover
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: "18px 22px",
          cursor: "pointer",
          borderBottom: expanded ? "1px solid rgba(255,255,255,0.05)" : "none",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: 13,
            fontSize: 20,
            background:
              "linear-gradient(135deg, rgba(124,107,255,0.18), rgba(79,217,197,0.12))",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ⌬
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 14,
              fontWeight: 500,
              color: "var(--accent-light)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {repoName}
          </p>
          <p
            style={{
              fontSize: 11,
              color: "var(--text-dim)",
              marginTop: 3,
              fontFamily: "var(--font-mono)",
            }}
          >
            {files.length} file{files.length !== 1 ? "s" : ""} analyzed
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          {bugs.length > 0 && (
            <span
              style={{
                padding: "3px 9px",
                borderRadius: 100,
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                background: "rgba(255,107,138,0.1)",
                border: "1px solid rgba(255,107,138,0.22)",
                color: "#ff6b8a",
              }}
            >
              {bugs.length} issues
            </span>
          )}
          {improvements.length > 0 && (
            <span
              style={{
                padding: "3px 9px",
                borderRadius: 100,
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                background: "rgba(79,217,197,0.1)",
                border: "1px solid rgba(79,217,197,0.22)",
                color: "#4fd9c5",
              }}
            >
              +{improvements.length}
            </span>
          )}
          <ScoreRing score={score} size={54} />
          <span
            style={{
              color: "var(--text-dim)",
              fontSize: 16,
              lineHeight: 1,
              display: "inline-block",
              transform: expanded ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 0.38s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            ⌄
          </span>
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div style={{ padding: "20px 22px 24px" }}>
          {/* ── PER FILE BREAKDOWN ── */}
          {perFile.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.1em",
                  color: "var(--text-dim)",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                Per File Review
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {perFile.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: `1px solid ${activeFile === i ? "rgba(124,107,255,0.35)" : "rgba(255,255,255,0.06)"}`,
                      borderRadius: 12,
                      overflow: "hidden",
                      transition: "border-color 0.25s",
                    }}
                  >
                    {/* File header */}
                    <div
                      onClick={() => setActiveFile(activeFile === i ? null : i)}
                      style={{
                        padding: "10px 14px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontFamily: "var(--font-mono)",
                          color: "var(--accent-light)",
                        }}
                      >
                        {f.path}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          alignItems: "center",
                        }}
                      >
                        {f.bugs.length > 0 && (
                          <span
                            style={{
                              fontSize: 10,
                              color: "#ff6b8a",
                              fontFamily: "var(--font-mono)",
                              background: "rgba(255,107,138,0.1)",
                              padding: "2px 7px",
                              borderRadius: 100,
                            }}
                          >
                            {f.bugs.length} bugs
                          </span>
                        )}
                        {f.improvements.length > 0 && (
                          <span
                            style={{
                              fontSize: 10,
                              color: "#4fd9c5",
                              fontFamily: "var(--font-mono)",
                              background: "rgba(79,217,197,0.1)",
                              padding: "2px 7px",
                              borderRadius: 100,
                            }}
                          >
                            {f.improvements.length} tips
                          </span>
                        )}
                        <span
                          style={{
                            color: "var(--text-dim)",
                            fontSize: 12,
                            transform:
                              activeFile === i ? "rotate(180deg)" : "none",
                            transition: "transform 0.3s",
                          }}
                        >
                          ⌄
                        </span>
                      </div>
                    </div>

                    {/* File detail */}
                    {activeFile === i && (
                      <div
                        style={{
                          padding: "0 14px 14px",
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <SectionBlock
                          icon="⚠"
                          label="Bugs"
                          items={f.bugs}
                          color="#ff6b8a"
                          emptyMsg="No bugs ✓"
                          delay={0}
                        />
                        <SectionBlock
                          icon="↑"
                          label="Improvements"
                          items={f.improvements}
                          color="#4fd9c5"
                          emptyMsg="Nothing to add"
                          delay={0.05}
                        />
                        <SectionBlock
                          icon="◈"
                          label="Quality"
                          items={f.code_quality}
                          color="#7c6bff"
                          emptyMsg="Looks good"
                          delay={0.1}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {files.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.1em",
                  color: "var(--text-dim)",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                Files Analyzed
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {files.map((f, i) => (
                  <span
                    key={i}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      color: "var(--text-sub)",
                      animation: `fadeUp 0.4s ${i * 0.03}s both`,
                    }}
                  >
                    {f.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 14,
            }}
          >
            <SectionBlock
              icon="⚠"
              label="Problems"
              items={bugs}
              color="#ff6b8a"
              emptyMsg="No issues detected ✓"
              delay={0}
            />
            <SectionBlock
              icon="↑"
              label="Improvements"
              items={improvements}
              color="#4fd9c5"
              emptyMsg="Nothing to suggest"
              delay={0.06}
            />
            <SectionBlock
              icon="◈"
              label="Code Quality"
              items={quality}
              color="#7c6bff"
              emptyMsg="No notes"
              delay={0.12}
            />
          </div>
        </div>
      )}
    </TiltCard>
  );
};

/* ─── APP ────────────────────────────────────────────────────────────────── */
function App() {
  const [reviews, setReviews] = useState([]);
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const placeholder = useTyping([
    "facebook/react",
    "vercel/next.js",
    "microsoft/vscode",
    "owner/your-repo",
  ]);

  const fetchReviews = () => {
    axios
      .get("http://127.0.0.1:8000/api/v1/auth/reviews")
      .then((res) => setReviews(res.data))
      .catch((err) => console.error(err));
  };
  useEffect(() => {
    fetchReviews();
  }, []);

  const handleAnalyze = async () => {
    if (!repoUrl || loading) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/v1/auth/repo?repo_url=${encodeURIComponent(repoUrl)}`,
      );
      if (res.data.cached) {
        setReviews((prev) => [
          {
            id: Date.now(),
            repo_url: repoUrl,
            files: res.data.files_analyzed.join(","),
            review: res.data.review,
          },
          ...prev,
        ]);
        setLoading(false);
        setRepoUrl("");
        return;
      }
      const jobId = res.data.job_id;
      const iv = setInterval(async () => {
        try {
          const jr = await axios.get(
            `http://127.0.0.1:8000/api/v1/auth/job/${jobId}`,
          );
          if (jr.data.status === "completed") {
            clearInterval(iv);
            const r = jr.data.result;
            setReviews((prev) => [
              {
                id: Date.now(),
                repo_url: repoUrl,
                files: r.files_analyzed.join(","),
                review: r.review,
              },
              ...prev,
            ]);
            setLoading(false);
            setRepoUrl("");
          }
        } catch {
          clearInterval(iv);
          setLoading(false);
        }
      }, 2000);
    } catch {
      alert("Error analyzing repo");
      setLoading(false);
    }
  };

  const totalFiles = reviews.reduce(
    (a, r) => a + (r.files ? r.files.split(",").filter(Boolean).length : 0),
    0,
  );
  const totalIssues = reviews.reduce(
    (a, r) => a + (r.review?.bugs?.length || 0),
    0,
  );
  const totalFixes = reviews.reduce(
    (a, r) => a + (r.review?.improvements?.length || 0),
    0,
  );

  return (
    <>
      <GlobalStyles />
      <CustomCursor />
      <Aurora />
      <Particles />

      <div style={{ position: "relative", zIndex: 2, minHeight: "100vh" }}>
        {/* ── NAV ── */}
        <nav
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            backdropFilter: "blur(36px) saturate(200%)",
            WebkitBackdropFilter: "blur(36px) saturate(200%)",
            background: "rgba(4,4,12,0.72)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            padding: "0 36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 58,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 9,
                fontSize: 14,
                color: "#fff",
                fontWeight: 800,
                background: "linear-gradient(135deg, #7c6bff, #4fd9c5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 22px rgba(124,107,255,0.5)",
              }}
            >
              ⌬
            </div>
            <span
              style={{
                fontFamily: "var(--font-head)",
                fontWeight: 800,
                fontSize: 15,
                letterSpacing: "-0.02em",
              }}
            >
              CodeReview<span style={{ color: "var(--accent)" }}>.ai</span>
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                borderRadius: 100,
                background: "rgba(79,217,197,0.07)",
                border: "1px solid rgba(79,217,197,0.18)",
                fontSize: 11,
                color: "#4fd9c5",
                fontFamily: "var(--font-mono)",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#4fd9c5",
                  display: "inline-block",
                  boxShadow: "0 0 8px #4fd9c5",
                  animation: "blink 2s ease-in-out infinite",
                }}
              />
              LIVE
            </span>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: 100,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: 11,
                color: "var(--text-sub)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {reviews.length} reviews
            </span>
          </div>
        </nav>

        {/* ── HERO ── */}
        <div style={{ textAlign: "center", padding: "84px 32px 60px" }}>
          {/* Pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 16px",
              borderRadius: 100,
              marginBottom: 34,
              background: "rgba(124,107,255,0.07)",
              border: "1px solid rgba(124,107,255,0.22)",
              animation: "fadeUp 0.6s 0.1s cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--accent)",
                display: "inline-block",
                boxShadow: "0 0 8px var(--accent)",
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: "var(--accent-light)",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.1em",
              }}
            >
              AI-POWERED · REAL-TIME · DEEP ANALYSIS
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "var(--font-head)",
              fontWeight: 800,
              lineHeight: 1.06,
              letterSpacing: "-0.035em",
              fontSize: "clamp(40px, 6vw, 72px)",
              marginBottom: 22,
              animation: "fadeUp 0s 0.2s cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            <span className="shimmer-text">Code Review,</span>
            <br />
            <span
              style={{
                background:
                  "linear-gradient(135deg, #7c6bff 0%, #4fd9c5 50%, #ff6b8a 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "borderFlow 4s linear infinite",
              }}
            >
              Reimagined.
            </span>
          </h1>

          <p
            style={{
              fontSize: 16,
              color: "var(--text-sub)",
              maxWidth: 480,
              margin: "0 auto 52px",
              lineHeight: 1.78,
              animation: "fadeUp 0.7s 0.3s cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            Point to any GitHub repository and get an instant, deep AI-powered
            analysis of bugs, improvements, and code quality.
          </p>

          {/* ── INPUT ── */}
          <div
            style={{
              maxWidth: 610,
              margin: "0 auto 52px",
              position: "relative",
              animation: "fadeUp 0.7s 0.4s cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            {/* Glow halo */}
            <div
              style={{
                position: "absolute",
                inset: -2,
                borderRadius: 20,
                zIndex: -1,
                background: focused
                  ? "linear-gradient(135deg, rgba(124,107,255,0.55), rgba(79,217,197,0.35), rgba(255,107,138,0.3))"
                  : "transparent",
                filter: "blur(10px)",
                opacity: 0.65,
                transition: "background 0.45s ease",
              }}
            />
            <div
              style={{
                display: "flex",
                background: "rgba(255,255,255,0.038)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: `1px solid ${focused ? "rgba(124,107,255,0.48)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 17,
                overflow: "hidden",
                transition: "border-color 0.35s, box-shadow 0.35s",
                boxShadow: focused
                  ? "0 0 0 4px rgba(124,107,255,0.09), 0 24px 70px rgba(0,0,0,0.45)"
                  : "0 10px 50px rgba(0,0,0,0.35)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 20,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    color: "rgba(255,255,255,0.28)",
                  }}
                >
                  github.com/
                </span>
              </div>
              <input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                  flex: 1,
                  padding: "16px 12px",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: 14,
                  color: "var(--text)",
                  fontFamily: "var(--font-mono)",
                }}
              />
              <button
                data-hover
                onClick={handleAnalyze}
                disabled={loading || !repoUrl}
                style={{
                  padding: "14px 28px",
                  margin: "7px",
                  background:
                    !repoUrl || loading
                      ? "rgba(255,255,255,0.05)"
                      : "linear-gradient(135deg, #7c6bff, #5a4fcf)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  color: !repoUrl ? "var(--text-dim)" : "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading || !repoUrl ? "not-allowed" : "pointer",
                  transition: "all 0.28s",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow:
                    repoUrl && !loading
                      ? "0 4px 22px rgba(124,107,255,0.4)"
                      : "none",
                }}
              >
                {loading ? (
                  <>
                    <div
                      style={{
                        width: 13,
                        height: 13,
                        borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.25)",
                        borderTopColor: "#fff",
                        animation: "spin 0.75s linear infinite",
                      }}
                    />
                    Analyzing
                  </>
                ) : (
                  "Analyze →"
                )}
              </button>
            </div>
          </div>

          {/* ── STATS ── */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              animation: "fadeUp 0.7s 0.5s cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            {[
              { label: "Reviews", value: reviews.length, color: "#7c6bff" },
              { label: "Files Scanned", value: totalFiles, color: "#4fd9c5" },
              { label: "Issues Found", value: totalIssues, color: "#ff6b8a" },
              { label: "Improvements", value: totalFixes, color: "#ffb347" },
            ].map(({ label, value, color }, i, arr) => (
              <div
                key={label}
                style={{
                  padding: "18px 36px",
                  textAlign: "center",
                  borderRight:
                    i < arr.length - 1
                      ? "1px solid rgba(255,255,255,0.06)"
                      : "none",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 28,
                    fontWeight: 600,
                    color,
                    lineHeight: 1,
                    textShadow: `0 0 24px ${color}55`,
                  }}
                >
                  <AnimatedNumber value={value} />
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--text-dim)",
                    marginTop: 6,
                    letterSpacing: "0.04em",
                  }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 32px" }}>
          <div
            style={{
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
            }}
          />
        </div>

        {/* ── REVIEWS LIST ── */}
        <div
          style={{
            maxWidth: 920,
            margin: "0 auto",
            padding: "36px 32px 100px",
          }}
        >
          {reviews.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
                animation: "fadeIn 0.5s ease both",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-head)",
                  fontSize: 16,
                  fontWeight: 700,
                }}
              >
                Review History
              </h2>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-dim)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {reviews.length} result{reviews.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
          {loading && <LoadingState />}
          {!loading && reviews.length === 0 && <EmptyState />}
          {reviews.map((r, i) => (
            <ReviewCard key={r.id || i} review={r} index={i} />
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
