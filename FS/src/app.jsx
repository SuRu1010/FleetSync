// src/app.jsx
// ─────────────────────────────────────────────────────────────
// FleetSync — High-End Landing Page
// Stack: React 18 + Tailwind CSS 3 + Framer Motion 11
// Theme: Electric Purple
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";

// ════════════════════════════════════════════════════════════
// SHARED TOKENS — Electric Purple theme
// ════════════════════════════════════════════════════════════
const NEON = "#BF00FF";   // electric purple
const ELEC = "#00D4FF";   // cyan accent
const RED = "#FF2244";
const PURPLE_DIM = "rgba(191,0,255,";  // helper prefix

const EASE_OUT_QUINT = [0.22, 1, 0.36, 1];

// ════════════════════════════════════════════════════════════
// VEHICLE HEALTH UTILITIES
// ════════════════════════════════════════════════════════════
function calcHealth(kmSinceService, serviceInterval) {
  return Math.max(0, Math.round(100 - (kmSinceService / serviceInterval) * 100));
}
function healthColor(pct) {
  if (pct >= 70) return NEON;
  if (pct >= 40) return ELEC;
  if (pct >= 15) return "#FF8C00";
  return RED;
}
function healthLabel(pct) {
  if (pct >= 70) return "GOOD";
  if (pct >= 40) return "FAIR";
  if (pct >= 15) return "WARN";
  return "CRITICAL";
}

const INITIAL_VEHICLES = [
  { id: 1, plate: "ABC-123", driver: "Suryansh Singh", kmSinceService: 520, serviceInterval: 10000, totalKm: 52340 },
  { id: 2, plate: "XYZ-789", driver: "Yashash Mathur", kmSinceService: 6100, serviceInterval: 10000, totalKm: 88200 },
  { id: 3, plate: "FLT-444", driver: "Utkarsh Gupta", kmSinceService: 7200, serviceInterval: 10000, totalKm: 34720 },
  { id: 4, plate: "CRIT-99", driver: "Avyam Srivastava", kmSinceService: 9800, serviceInterval: 10000, totalKm: 12900 },
];

// ════════════════════════════════════════════════════════════
// MODAL WRAPPER
// ════════════════════════════════════════════════════════════
function Modal({ open, onClose, children, wide = false }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: "rgba(6,6,8,0.88)", backdropFilter: "blur(12px)" }}
            onClick={onClose}
          />
          <motion.div
            className={`relative z-10 w-full ${wide ? "max-w-2xl" : "max-w-md"}`}
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ duration: 0.3, ease: EASE_OUT_QUINT }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ════════════════════════════════════════════════════════════
// MODAL SHELL
// ════════════════════════════════════════════════════════════
function ModalShell({ title, subtitle, accentColor = NEON, onClose, children }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: "#0a0a0d",
        border: `1px solid rgba(255,255,255,0.07)`,
        boxShadow: `0 0 0 1px ${accentColor}18, 0 40px 80px rgba(0,0,0,0.6)`,
      }}
    >
      <div style={{ height: 2, background: `linear-gradient(90deg, ${accentColor}, ${ELEC})` }} />
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="relative p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-5 h-[2px]" style={{ background: accentColor }} />
              <span className="text-[9px] font-bold tracking-[0.45em] uppercase" style={{ color: accentColor, fontFamily: "'Space Mono', monospace" }}>
                {subtitle}
              </span>
            </div>
            <h2 className="text-white leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: "0.06em" }}>
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 border transition-colors"
            style={{ borderColor: "rgba(255,255,255,0.08)", color: "#444" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = `${accentColor}55`}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MODAL INPUT
// ════════════════════════════════════════════════════════════
function ModalInput({ label, type = "text", value, onChange, placeholder, required, options, min, step }) {
  const [focused, setFocused] = useState(false);
  const base = {
    width: "100%",
    background: "#060608",
    border: `1px solid ${focused ? `${NEON}50` : "rgba(255,255,255,0.07)"}`,
    color: "#fff",
    fontFamily: "'Syne', sans-serif",
    fontSize: 14,
    padding: "11px 14px",
    outline: "none",
    transition: "border-color 0.2s",
    boxShadow: focused ? `0 0 0 3px ${NEON}0c` : "none",
  };
  return (
    <div>
      <label className="block mb-2 text-[10px] tracking-[0.35em] uppercase" style={{ color: "#3a3a3a", fontFamily: "'Space Mono', monospace" }}>{label}</label>
      {options ? (
        <select value={value} onChange={onChange} required={required} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{ ...base, color: value ? "#fff" : "#444" }}>
          <option value="" disabled style={{ background: "#060608" }}>Select…</option>
          {options.map(o => <option key={o} value={o} style={{ background: "#060608" }}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} min={min} step={step} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={base} />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MODAL BUTTON
// ════════════════════════════════════════════════════════════
function ModalButton({ children, onClick, type = "button", variant = "yellow" }) {
  const [hov, setHov] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.97 }}
      onMouseMove={e => { const r = ref.current.getBoundingClientRect(); setPos({ x: e.clientX - r.left, y: e.clientY - r.top }); }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={`btn-${variant} relative overflow-hidden w-full py-4 text-xs tracking-[0.12em]`}
      style={{ borderRadius: 0 }}
    >
      <span className="absolute inset-0 pointer-events-none" style={{ background: hov ? `radial-gradient(circle 110px at ${pos.x}px ${pos.y}px, ${PURPLE_DIM}0.35) 0%, transparent 70%)` : "transparent", opacity: hov ? 1 : 0, transition: "opacity 0.25s" }} />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

// ════════════════════════════════════════════════════════════
// SUCCESS STATE
// ════════════════════════════════════════════════════════════
function SuccessState({ title, message, onClose }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 15, delay: 0.1 }}
        className="w-16 h-16 mx-auto mb-6 flex items-center justify-center" style={{ background: `${NEON}15`, border: `1px solid ${NEON}40` }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={NEON} strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
      </motion.div>
      <h3 className="text-white mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: "0.06em" }}>{title}</h3>
      <p className="text-[#444] text-sm leading-relaxed mb-8" style={{ fontFamily: "'Syne', sans-serif" }}>{message}</p>
      <ModalButton onClick={onClose} variant="yellow">Close</ModalButton>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════
// DEPLOY / SIGNUP MODAL
// ════════════════════════════════════════════════════════════
function DeployModal({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", role: "", fleet: "", password: "" });
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const reset = () => { setStep(1); setDone(false); setForm({ name: "", email: "", company: "", role: "", fleet: "", password: "" }); };
  const handleClose = () => { onClose(); setTimeout(reset, 300); };
  const handleNext = e => { e.preventDefault(); if (step < 2) setStep(2); else setDone(true); };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalShell title={done ? "DEPLOYED." : "DEPLOY FLEETSYNC"} subtitle={done ? "You're live" : `Step ${step} of 2`} onClose={handleClose}>
        {done ? (
          <SuccessState title="YOU'RE LIVE." message="Check your inbox for login credentials. Your 14-day trial starts now — no credit card required." onClose={handleClose} />
        ) : (
          <>
            <div className="flex gap-1.5 mb-8">
              {[1, 2].map(s => (
                <div key={s} style={{ flex: 1, height: 2, background: s <= step ? NEON : "rgba(255,255,255,0.07)", transition: "background 0.4s" }} />
              ))}
            </div>
            <form onSubmit={handleNext} className="flex flex-col gap-5">
              {step === 1 ? (
                <>
                  <ModalInput label="Full Name" value={form.name} onChange={set("name")} placeholder="Jane Smith" required />
                  <ModalInput label="Work Email" type="email" value={form.email} onChange={set("email")} placeholder="jane@company.com" required />
                  <ModalInput label="Password" type="password" value={form.password} onChange={set("password")} placeholder="Min. 8 characters" required />
                </>
              ) : (
                <>
                  <ModalInput label="Company Name" value={form.company} onChange={set("company")} placeholder="Acme Logistics" required />
                  <ModalInput label="Your Role" value={form.role} onChange={set("role")} options={["Fleet Manager", "Operations Director", "Admin", "Owner", "Other"]} required />
                  <ModalInput label="Fleet Size" value={form.fleet} onChange={set("fleet")} options={["1–10 vehicles", "11–50 vehicles", "51–200 vehicles", "201–500 vehicles", "500+ vehicles"]} required />
                </>
              )}
              <div className="pt-2">
                <ModalButton type="submit" variant="yellow">{step === 1 ? "Continue →" : "Deploy FleetSync →"}</ModalButton>
              </div>
            </form>
            <p className="mt-5 text-center text-[9px] tracking-[0.25em] uppercase" style={{ color: "#272727", fontFamily: "'Space Mono', monospace" }}>14-day free trial · No credit card required</p>
          </>
        )}
      </ModalShell>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════
// SIGN IN MODAL
// ════════════════════════════════════════════════════════════
function SignInModal({ open, onClose, onSwitchToSignup }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const reset = () => { setDone(false); setLoading(false); setForm({ email: "", password: "" }); };
  const handleClose = () => { onClose(); setTimeout(reset, 300); };
  const handleSubmit = e => { e.preventDefault(); setLoading(true); setTimeout(() => { setLoading(false); setDone(true); }, 1200); };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalShell title="SIGN IN" subtitle="Fleet operators" accentColor={ELEC} onClose={handleClose}>
        {done ? (
          <SuccessState title="WELCOME BACK." message="Redirecting you to your fleet dashboard…" onClose={handleClose} />
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <ModalInput label="Work Email" type="email" value={form.email} onChange={set("email")} placeholder="jane@company.com" required />
            <ModalInput label="Password" type="password" value={form.password} onChange={set("password")} placeholder="Your password" required />
            <div className="flex justify-end">
              <button type="button" className="text-[10px] tracking-[0.2em] uppercase transition-colors"
                style={{ color: "#333", fontFamily: "'Space Mono', monospace", background: "none", border: "none", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.color = ELEC} onMouseLeave={e => e.currentTarget.style.color = "#333"}>
                Forgot password?
              </button>
            </div>
            <div className="pt-1">
              <ModalButton type="submit" variant="outline">{loading ? "Authenticating…" : "Sign In →"}</ModalButton>
            </div>
            <p className="text-center text-[11px]" style={{ color: "#333", fontFamily: "'Syne', sans-serif" }}>
              No account?{" "}
              <button type="button" onClick={() => { handleClose(); setTimeout(onSwitchToSignup, 300); }}
                style={{ color: NEON, background: "none", border: "none", cursor: "pointer", fontFamily: "'Syne', sans-serif", fontSize: "inherit" }}>
                Deploy FleetSync →
              </button>
            </p>
          </form>
        )}
      </ModalShell>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════
// DEMO MODAL
// ════════════════════════════════════════════════════════════
function DemoModal({ open, onClose }) {
  const [tab, setTab] = useState("video");
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", fleet: "", time: "" });
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const reset = () => { setDone(false); setTab("video"); setForm({ name: "", email: "", company: "", fleet: "", time: "" }); };
  const handleClose = () => { onClose(); setTimeout(reset, 300); };
  const handleSubmit = e => { e.preventDefault(); setDone(true); };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalShell title={tab === "video" ? "WATCH DEMO" : "BOOK A DEMO"} subtitle="See FleetSync in action" accentColor={ELEC} onClose={handleClose}>
        {done ? (
          <SuccessState title="DEMO BOOKED." message="A FleetSync specialist will confirm your slot within 2 hours. Check your email for the calendar invite." onClose={handleClose} />
        ) : (
          <>
            <div className="flex gap-0 mb-8 border" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              {[["video", "Watch Now"], ["book", "Book Live"]].map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)} className="flex-1 py-3 text-[10px] tracking-[0.3em] uppercase transition-all"
                  style={{ fontFamily: "'Space Mono', monospace", background: tab === id ? `${ELEC}12` : "transparent", color: tab === id ? ELEC : "#333", borderBottom: tab === id ? `2px solid ${ELEC}` : "2px solid transparent", border: "none", cursor: "pointer" }}>
                  {label}
                </button>
              ))}
            </div>
            {tab === "video" ? (
              <div>
                <div className="relative mb-6 flex items-center justify-center" style={{ aspectRatio: "16/9", background: "#060608", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div className="absolute inset-0 grid-bg opacity-40" />
                  <div className="absolute bottom-0 left-0 right-0 flex items-end gap-[2px] px-3 pb-3 h-10">
                    {Array.from({ length: 60 }).map((_, i) => (
                      <motion.div key={i} animate={{ height: [`${8 + Math.random() * 22}px`, `${8 + Math.random() * 22}px`] }} transition={{ duration: 0.6 + Math.random() * 0.6, repeat: Infinity, repeatType: "reverse" }} style={{ flex: 1, background: `${ELEC}30`, minWidth: 2 }} />
                    ))}
                  </div>
                  <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} className="relative z-10 flex items-center justify-center w-16 h-16 border" style={{ background: `${ELEC}15`, borderColor: `${ELEC}50` }} onClick={() => { }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={ELEC} stroke="none"><polygon points="5,3 19,12 5,21" /></svg>
                  </motion.button>
                  <div className="absolute bottom-3 right-3 text-[9px] px-2 py-1 tracking-widest" style={{ background: "#060608", color: "#333", fontFamily: "'Space Mono', monospace", border: "1px solid rgba(255,255,255,0.06)" }}>3:42</div>
                </div>
                <div className="flex flex-col gap-3">
                  {["Fleet Overview & Dashboard", "Vehicle Health Monitoring", "Driver Analytics & Safety"].map((chapter, i) => (
                    <button key={chapter} className="flex items-center gap-3 px-4 py-3 text-left border transition-colors" style={{ borderColor: "rgba(255,255,255,0.05)", background: "transparent", cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = `${ELEC}30`} onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"}>
                      <span style={{ color: ELEC, fontFamily: "'Space Mono', monospace", fontSize: 10 }}>{["0:00", "1:20", "2:35"][i]}</span>
                      <span style={{ color: "#555", fontFamily: "'Syne', sans-serif", fontSize: 13, flex: 1 }}>{chapter}</span>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2"><polygon points="5,3 19,12 5,21" /></svg>
                    </button>
                  ))}
                </div>
                <div className="mt-6">
                  <ModalButton variant="outline" onClick={() => setTab("book")}>Book a Live Demo Instead →</ModalButton>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <ModalInput label="Full Name" value={form.name} onChange={set("name")} placeholder="Jane Smith" required />
                <ModalInput label="Work Email" type="email" value={form.email} onChange={set("email")} placeholder="jane@company.com" required />
                <ModalInput label="Company" value={form.company} onChange={set("company")} placeholder="Acme Logistics" required />
                <ModalInput label="Fleet Size" value={form.fleet} onChange={set("fleet")} options={["1–10 vehicles", "11–50 vehicles", "51–200 vehicles", "500+ vehicles"]} required />
                <ModalInput label="Preferred Time" value={form.time} onChange={set("time")} options={["Morning (9am–12pm)", "Afternoon (12pm–3pm)", "Late Afternoon (3pm–6pm)"]} required />
                <div className="pt-1"><ModalButton type="submit" variant="yellow">Book Demo →</ModalButton></div>
              </form>
            )}
          </>
        )}
      </ModalShell>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════
// EXPLORE MODAL — role breakdown
// ════════════════════════════════════════════════════════════
function ExploreModal({ open, onClose, onDeploy }) {
  const roles = [
    { label: "Admin", color: RED, desc: "Full platform access. Manage users, billing, global settings, and audit logs. The control tower.", capabilities: ["User management", "Billing & subscriptions", "Security audit logs", "Platform configuration"] },
    { label: "Fleet Manager", color: ELEC, desc: "Owns the day-to-day operation. Tracks every vehicle, assigns drivers, and acts on maintenance alerts.", capabilities: ["Live fleet dashboard", "Maintenance scheduling", "Driver assignment", "Health alerts"] },
    { label: "Driver", color: NEON, desc: "Focused view: their vehicle, their trips, their logs. Clean mobile interface — no noise.", capabilities: ["Odometer logging", "Trip reports", "Vehicle health", "Service history"] },
  ];
  return (
    <Modal open={open} onClose={onClose}>
      <ModalShell title="THE SYSTEM" subtitle="Role-based access" accentColor={NEON} onClose={onClose}>
        <div className="flex flex-col gap-4 mb-6 max-h-[50vh] overflow-y-auto pr-2" style={{ scrollbarWidth: "thin", scrollbarColor: `${NEON}30 transparent` }}>
          {roles.map(r => (
            <div key={r.label} className="p-5 border" style={{ borderColor: `${r.color}25`, background: `${r.color}06` }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: r.color }} />
                <span className="text-[10px] font-bold tracking-[0.35em] uppercase" style={{ color: r.color, fontFamily: "'Space Mono', monospace" }}>{r.label}</span>
              </div>
              <p className="text-[#444] text-[13px] leading-relaxed mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>{r.desc}</p>
              <div className="flex flex-wrap gap-2">
                {r.capabilities.map(c => (
                  <span key={c} className="px-2 py-1 text-[9px] tracking-[0.2em] uppercase" style={{ color: "#333", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "'Space Mono', monospace" }}>{c}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <ModalButton variant="yellow" onClick={() => { onClose(); setTimeout(onDeploy, 300); }}>Deploy FleetSync →</ModalButton>
      </ModalShell>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════
// VEHICLE HEALTH MODAL — full health dashboard
// ════════════════════════════════════════════════════════════
function VehicleHealthModal({ open, onClose, vehicles, onMarkServiced }) {
  const avgHealth = Math.round(vehicles.reduce((s, v) => s + calcHealth(v.kmSinceService, v.serviceInterval), 0) / vehicles.length);
  const criticalCount = vehicles.filter(v => calcHealth(v.kmSinceService, v.serviceInterval) < 15).length;

  return (
    <Modal open={open} onClose={onClose} wide>
      <ModalShell title="VEHICLE HEALTH" subtitle="Live fleet diagnostics" accentColor={NEON} onClose={onClose}>
        {/* Summary bar */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Fleet Health", value: `${avgHealth}%`, color: healthColor(avgHealth) },
            { label: "Vehicles", value: vehicles.length, color: ELEC },
            { label: "Critical", value: criticalCount, color: criticalCount > 0 ? RED : NEON },
          ].map(s => (
            <div key={s.label} className="p-4 border text-center" style={{ borderColor: `${s.color}20`, background: `${s.color}06` }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: s.color, letterSpacing: "0.06em" }}>{s.value}</div>
              <div className="text-[9px] tracking-[0.25em] uppercase mt-1" style={{ color: "#333", fontFamily: "'Space Mono', monospace" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Vehicle list */}
        <div className="flex flex-col gap-3 mb-6 max-h-72 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: `${NEON}30 transparent` }}>
          {vehicles.map(v => {
            const health = calcHealth(v.kmSinceService, v.serviceInterval);
            const color = healthColor(health);
            const remaining = v.serviceInterval - v.kmSinceService;
            return (
              <div key={v.id} className="p-4 border" style={{ borderColor: `${color}20`, background: "#060608" }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-white font-bold" style={{ fontFamily: "'Space Mono', monospace", fontSize: 13 }}>{v.plate}</span>
                      <span className="px-2 py-0.5 text-[9px] tracking-[0.2em] uppercase" style={{ color, border: `1px solid ${color}40`, fontFamily: "'Space Mono', monospace", background: `${color}08` }}>{healthLabel(health)}</span>
                    </div>
                    <div className="text-[11px]" style={{ color: "#444", fontFamily: "'Syne', sans-serif" }}>Driver: {v.driver}</div>
                  </div>
                  <div className="text-right">
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color, letterSpacing: "0.06em" }}>{health}%</div>
                    <div className="text-[10px]" style={{ color: "#333", fontFamily: "'Space Mono', monospace" }}>{remaining.toLocaleString()} km left</div>
                  </div>
                </div>
                {/* Health bar */}
                <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${health}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}66` }} />
                </div>
                {/* Stats row */}
                <div className="flex gap-4 text-[10px]" style={{ color: "#2a2a2a", fontFamily: "'Space Mono', monospace" }}>
                  <span>Total KM: {v.totalKm.toLocaleString()}</span>
                  <span>Since Service: {v.kmSinceService.toLocaleString()}</span>
                </div>
                {health < 15 && (
                  <button onClick={() => onMarkServiced(v.id)} className="mt-3 w-full py-2 text-[10px] tracking-[0.25em] uppercase transition-all"
                    style={{ background: `${RED}12`, border: `1px solid ${RED}40`, color: RED, fontFamily: "'Space Mono', monospace", cursor: "pointer" }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${RED}20`; }} onMouseLeave={e => { e.currentTarget.style.background = `${RED}12`; }}>
                    ✓ Mark as Serviced → Reset KM
                  </button>
                )}
                {health >= 15 && health < 40 && (
                  <button onClick={() => onMarkServiced(v.id)} className="mt-3 w-full py-2 text-[10px] tracking-[0.25em] uppercase transition-all"
                    style={{ background: "transparent", border: `1px solid rgba(255,255,255,0.08)`, color: "#333", fontFamily: "'Space Mono', monospace", cursor: "pointer" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${NEON}40`; e.currentTarget.style.color = NEON; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#333"; }}>
                    Mark as Serviced → Reset KM
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {criticalCount > 0 && (
          <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.6, repeat: Infinity }}
            className="px-4 py-3 text-[10px] flex items-center gap-2 tracking-[0.2em] mb-4"
            style={{ background: "rgba(255,34,68,0.05)", border: "1px solid rgba(255,34,68,0.3)", color: RED, fontFamily: "'Space Mono', monospace" }}>
            ● {criticalCount} VEHICLE{criticalCount > 1 ? "S" : ""} REQUIRE IMMEDIATE SERVICE
          </motion.div>
        )}
        <ModalButton variant="yellow" onClick={onClose}>Close Dashboard</ModalButton>
      </ModalShell>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════
// TRIP LOG MODAL — driver KM entry
// ════════════════════════════════════════════════════════════
function TripLogModal({ open, onClose, vehicles, onLogTrip }) {
  const [form, setForm] = useState({ vehicleId: "", km: "", notes: "" });
  const [done, setDone] = useState(false);
  const [loggedVehicle, setLoggedVehicle] = useState(null);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const reset = () => { setDone(false); setForm({ vehicleId: "", km: "", notes: "" }); setLoggedVehicle(null); };
  const handleClose = () => { onClose(); setTimeout(reset, 300); };

  const handleSubmit = e => {
    e.preventDefault();
    const km = parseInt(form.km, 10);
    if (!km || km <= 0) return;
    const v = vehicles.find(v => v.id === parseInt(form.vehicleId));
    onLogTrip(parseInt(form.vehicleId), km);
    setLoggedVehicle({ ...v, tripKm: km });
    setDone(true);
  };

  const selectedVehicle = vehicles.find(v => v.id === parseInt(form.vehicleId));

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalShell title="LOG TRIP KM" subtitle="Driver odometer entry" accentColor={NEON} onClose={handleClose}>
        {done && loggedVehicle ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 15, delay: 0.1 }}
              className="w-16 h-16 mx-auto mb-5 flex items-center justify-center" style={{ background: `${NEON}15`, border: `1px solid ${NEON}40` }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={NEON} strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
            </motion.div>
            <h3 className="text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: "0.06em" }}>TRIP LOGGED.</h3>
            <p className="text-[#444] text-sm mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              <span style={{ color: "#888" }}>{loggedVehicle.plate}</span> — <span style={{ color: NEON }}>{loggedVehicle.tripKm.toLocaleString()} km</span> added
            </p>
            {/* Updated health preview */}
            {(() => {
              const newKm = loggedVehicle.kmSinceService + loggedVehicle.tripKm;
              const newHealth = calcHealth(newKm, loggedVehicle.serviceInterval);
              const color = healthColor(newHealth);
              return (
                <div className="mt-5 p-4 border text-center" style={{ borderColor: `${color}25`, background: `${color}06` }}>
                  <div className="text-[9px] tracking-[0.3em] uppercase mb-2" style={{ color: "#333", fontFamily: "'Space Mono', monospace" }}>Updated Vehicle Health</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color, letterSpacing: "0.06em" }}>{newHealth}%</div>
                  <div className="h-1.5 rounded-full overflow-hidden mt-2" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="h-full rounded-full" style={{ width: `${newHealth}%`, background: color, boxShadow: `0 0 8px ${color}66`, transition: "width 0.8s ease" }} />
                  </div>
                  {newHealth < 15 && (
                    <p className="mt-3 text-[11px]" style={{ color: RED, fontFamily: "'Syne', sans-serif" }}>⚠ Service overdue — notify your fleet manager immediately.</p>
                  )}
                  {newHealth >= 15 && newHealth < 40 && (
                    <p className="mt-3 text-[11px]" style={{ color: "#FF8C00", fontFamily: "'Syne', sans-serif" }}>Schedule service soon.</p>
                  )}
                </div>
              );
            })()}
            <div className="mt-6 flex gap-3">
              <button onClick={() => { reset(); }} className="flex-1 py-3 text-[10px] tracking-[0.25em] uppercase transition-all"
                style={{ background: "transparent", border: `1px solid ${NEON}30`, color: NEON, fontFamily: "'Space Mono', monospace", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = `${NEON}0c`} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                Log Another Trip
              </button>
              <button onClick={handleClose} className="flex-1 py-3 text-[10px] tracking-[0.25em] uppercase transition-all"
                style={{ background: `${NEON}15`, border: `1px solid ${NEON}40`, color: NEON, fontFamily: "'Space Mono', monospace", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = `${NEON}25`} onMouseLeave={e => e.currentTarget.style.background = `${NEON}15`}>
                Done
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            <p className="text-[#444] text-[13px] leading-relaxed mb-7" style={{ fontFamily: "'Syne', sans-serif" }}>
              Enter your trip distance after each journey. Health scores update instantly so the fleet manager always has accurate data.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block mb-2 text-[10px] tracking-[0.35em] uppercase" style={{ color: "#3a3a3a", fontFamily: "'Space Mono', monospace" }}>Select Vehicle</label>
                <select value={form.vehicleId} onChange={set("vehicleId")} required
                  style={{ width: "100%", background: "#060608", border: `1px solid rgba(255,255,255,0.07)`, color: form.vehicleId ? "#fff" : "#444", fontFamily: "'Syne', sans-serif", fontSize: 14, padding: "11px 14px", outline: "none" }}>
                  <option value="" disabled style={{ background: "#060608" }}>Select vehicle…</option>
                  {vehicles.map(v => {
                    const h = calcHealth(v.kmSinceService, v.serviceInterval);
                    return <option key={v.id} value={v.id} style={{ background: "#060608" }}>{v.plate} — {v.driver} [{healthLabel(h)} {h}%]</option>;
                  })}
                </select>
              </div>

              {selectedVehicle && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-3 border"
                  style={{ borderColor: `${healthColor(calcHealth(selectedVehicle.kmSinceService, selectedVehicle.serviceInterval))}25`, background: "#060608" }}>
                  <div className="flex justify-between text-[10px]" style={{ fontFamily: "'Space Mono', monospace" }}>
                    <span style={{ color: "#333" }}>Current health</span>
                    <span style={{ color: healthColor(calcHealth(selectedVehicle.kmSinceService, selectedVehicle.serviceInterval)) }}>
                      {calcHealth(selectedVehicle.kmSinceService, selectedVehicle.serviceInterval)}% — {selectedVehicle.serviceInterval - selectedVehicle.kmSinceService} km to service
                    </span>
                  </div>
                </motion.div>
              )}

              <ModalInput label="KM Driven This Trip" type="number" value={form.km} onChange={set("km")} placeholder="e.g. 150" required min="1" step="1" />
              <ModalInput label="Notes (optional)" value={form.notes} onChange={set("notes")} placeholder="Route, cargo, conditions…" />
              <div className="pt-2"><ModalButton type="submit" variant="yellow">Log Trip →</ModalButton></div>
            </form>
            <p className="mt-5 text-center text-[9px] tracking-[0.25em] uppercase" style={{ color: "#272727", fontFamily: "'Space Mono', monospace" }}>Health scores sync to fleet manager in real-time</p>
          </>
        )}
      </ModalShell>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════
// FEATURE DETAIL MODAL — generic per-feature info
// ════════════════════════════════════════════════════════════
const FEATURE_DETAILS = {
  "Vehicle Health Monitor": {
    accent: NEON,
    subtitle: "Predictive diagnostics",
    body: "Every vehicle gets a live health score based on KM driven since last service, fault codes, and maintenance history. AI-powered alerts fire before a breakdown occurs — not after.",
    points: ["Kilometer-based health scoring", "Fault code monitoring (OBD-II)", "Service interval tracking", "Predictive alert engine", "Mobile push notifications"],
    cta: "openHealth",
  },
  "Real-Time Fleet Overview": {
    accent: ELEC,
    subtitle: "Bird's-eye command",
    body: "One dashboard. Every vehicle, every driver, every route — live. Color-coded status indicators make the critical state of your fleet immediately obvious.",
    points: ["Live vehicle map view", "Driver assignment board", "Operational KPI tiles", "Alert feed & triage", "Custom reporting filters"],
    cta: "openDeploy",
  },
  "Odometer Logging": {
    accent: NEON,
    subtitle: "Driver trip tracking",
    body: "Drivers log trip distances with GPS-tagged odometer entries after every journey. Full audit trail including timestamps, notes, and route IDs — auto-synced to the fleet health engine.",
    points: ["Post-trip KM entry", "GPS route tagging", "Health score auto-update", "Tamper-evident audit trail", "Manager real-time sync"],
    cta: "openTripLog",
  },
  "Role-Based Access Control": {
    accent: ELEC,
    subtitle: "Zero-trust architecture",
    body: "Three tightly scoped roles — Admin, Fleet Manager, Driver — each with precisely the access they need. Enterprise-grade permissions with full audit logging on every action.",
    points: ["Admin: full platform control", "Fleet Manager: operations layer", "Driver: vehicle-only scope", "Audit log on every action", "SSO & 2FA enforcement"],
    cta: "openExplore",
  },
  "Maintenance Scheduling": {
    accent: NEON,
    subtitle: "Automated scheduling",
    body: "Service reminders trigger automatically based on KM thresholds, time intervals, and fault codes. Scheduled jobs flow directly into the operations workflow for frictionless booking.",
    points: ["KM-triggered alerts", "Calendar integration", "Workshop booking flow", "Parts pre-ordering triggers", "Compliance deadline tracking"],
    cta: "openDeploy",
  },
  "Audit & Compliance Logs": {
    accent: ELEC,
    subtitle: "Full compliance readiness",
    body: "Complete immutable access logs, failed-login tracking, and security event monitoring. Export reports in seconds for regulatory audits, insurance claims, or internal reviews.",
    points: ["Immutable event log", "Failed-login monitoring", "GDPR-compliant data export", "Insurance incident reports", "Multi-region compliance"],
    cta: "openDeploy",
  },
};

function FeatureDetailModal({ open, onClose, featureTitle, onDeploy, onExplore, onTripLog, onHealth }) {
  const detail = FEATURE_DETAILS[featureTitle];
  if (!detail) return null;

  const handleCta = () => {
    onClose();
    setTimeout(() => {
      if (detail.cta === "openDeploy") onDeploy();
      else if (detail.cta === "openExplore") onExplore();
      else if (detail.cta === "openTripLog") onTripLog();
      else if (detail.cta === "openHealth") onHealth();
    }, 300);
  };

  const ctaLabels = { openDeploy: "Deploy Now →", openExplore: "Explore Roles →", openTripLog: "Log a Trip →", openHealth: "View Fleet Health →" };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalShell title={featureTitle?.toUpperCase()} subtitle={detail.subtitle} accentColor={detail.accent} onClose={onClose}>
        <p className="text-[#555] text-[14px] leading-relaxed mb-7" style={{ fontFamily: "'Syne', sans-serif" }}>{detail.body}</p>
        <ul className="flex flex-col gap-3 mb-8">
          {detail.points.map(p => (
            <li key={p} className="flex items-start gap-3">
              <span style={{ color: detail.accent, flexShrink: 0, marginTop: 1, fontSize: 12 }}>✓</span>
              <span className="text-[13px] text-[#444]" style={{ fontFamily: "'Syne', sans-serif" }}>{p}</span>
            </li>
          ))}
        </ul>
        <ModalButton variant="yellow" onClick={handleCta}>{ctaLabels[detail.cta]}</ModalButton>
      </ModalShell>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════
// INFO MODAL — docs/about/privacy/terms placeholder
// ════════════════════════════════════════════════════════════
function InfoModal({ open, onClose, title }) {
  const content = {
    Docs: { subtitle: "Documentation", body: "Full API references, SDK guides, and integration walkthroughs are available in the FleetSync developer portal. Connect your existing tools in minutes." },
    About: { subtitle: "Our mission", body: "FleetSync was founded by a team of fleet operators who were tired of clunky, expensive tools. We built the platform we wished we had — modern, fast, and genuinely useful." },
    Privacy: { subtitle: "Privacy policy", body: "We collect only what we need, retain it only as long as required, and never sell it. You own your fleet data. Full GDPR-compliant privacy policy available on request." },
    Terms: { subtitle: "Terms of service", body: "FleetSync services are provided under fair, readable terms. No surprise clauses. Cancel anytime, export your data anytime. Terms update notifications sent 30 days in advance." },
  };
  const c = content[title] || { subtitle: "", body: "" };
  return (
    <Modal open={open} onClose={onClose}>
      <ModalShell title={title?.toUpperCase()} subtitle={c.subtitle} accentColor={ELEC} onClose={onClose}>
        <p className="text-[#555] text-[14px] leading-relaxed mb-8" style={{ fontFamily: "'Syne', sans-serif" }}>{c.body}</p>
        <ModalButton variant="outline" onClick={onClose}>Close</ModalButton>
      </ModalShell>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════
// GLOW BUTTON — cursor-following radial shine
// ════════════════════════════════════════════════════════════
function GlowButton({ children, variant = "yellow", className = "", onClick }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 60, y: 24 });
  const [hovered, setHovered] = useState(false);
  const onMove = (e) => { const r = ref.current.getBoundingClientRect(); setPos({ x: e.clientX - r.left, y: e.clientY - r.top }); };

  return (
    <motion.button ref={ref} onMouseMove={onMove} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={onClick}
      whileHover={{ scale: 1.025, y: -2 }} whileTap={{ scale: 0.97 }} className={`btn-${variant} relative overflow-hidden ${className}`}>
      <span className="absolute inset-0 pointer-events-none" style={{ background: hovered ? `radial-gradient(circle 110px at ${pos.x}px ${pos.y}px,${PURPLE_DIM}0.35) 0%, transparent 70%)` : "transparent", opacity: hovered ? 1 : 0, transition: "opacity 0.25s" }} />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}

// ════════════════════════════════════════════════════════════
// REVEAL
// ════════════════════════════════════════════════════════════
function Reveal({ children, className = "", delay = 0, dir = "up", style = {} }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const hidden = { opacity: 0, y: dir === "up" ? 36 : dir === "down" ? -36 : 0, x: dir === "left" ? 36 : dir === "right" ? -36 : 0 };
  return (
    <motion.div ref={ref} initial={hidden} animate={inView ? { opacity: 1, y: 0, x: 0 } : hidden} transition={{ duration: 0.75, delay, ease: EASE_OUT_QUINT }} className={className} style={style}>
      {children}
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════
// SPLIT HEADING
// ════════════════════════════════════════════════════════════
function SplitHeading({ text, className = "", style = {}, delay = 0, center = false }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const words = text.split(" ");
  return (
    <div ref={ref} className={`overflow-hidden ${className}`} style={style}>
      <div className={`flex flex-wrap gap-x-[0.3em] ${center ? "justify-center" : ""}`}>
        {words.map((word, i) => (
          <motion.span key={i} initial={{ y: "108%", opacity: 0 }} animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: delay + i * 0.08, ease: EASE_OUT_QUINT }} className="block">{word}</motion.span>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// ANIMATED COUNTER
// ════════════════════════════════════════════════════════════
function Counter({ raw, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let n = 0;
    const step = raw / (2000 / 16);
    const ticker = setInterval(() => { n += step; if (n >= raw) { setCount(raw); clearInterval(ticker); } else setCount(Math.floor(n)); }, 16);
    return () => clearInterval(ticker);
  }, [inView, raw]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ════════════════════════════════════════════════════════════
// EYEBROW
// ════════════════════════════════════════════════════════════
function Eyebrow({ children }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-7 h-[2px]" style={{ background: NEON }} />
      <span className="text-[10px] font-bold tracking-[0.45em] uppercase" style={{ color: NEON, fontFamily: "'Space Mono', monospace" }}>{children}</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// NAVBAR
// ════════════════════════════════════════════════════════════
function Navbar({ onDeploy, onSignIn, onDemo }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const scrollTo = id => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); };
  const links = [
    { label: "Features", id: "features" },
    { label: "Fleet", id: "fleet" },
    { label: "Drivers", id: "drivers" },
    { label: "Portal", id: "portal" },
    { label: "Analytics", id: "analytics" },
    { label: "Pricing", id: "pricing" },
  ];

  return (
    <motion.nav initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease: EASE_OUT_QUINT }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#060608]/95 backdrop-blur-2xl border-b border-white/[0.04]" : "bg-transparent"}`}>
      <div className="max-w-[1380px] mx-auto px-6 lg:px-12 flex items-center justify-between h-[76px]">
        {/* Logo */}
        <div className="flex items-center">
          <img src="/logo.png" alt="FleetSync Logo" className="h-12 md:h-16 object-contain" />
        </div>
        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-9">
          {links.map(l => (
            <li key={l.label}>
              <button onClick={() => scrollTo(l.id)} className="text-sm font-semibold text-[#666] hover:text-white transition-colors duration-200 tracking-wide"
                style={{ fontFamily: "'Syne', sans-serif", background: "none", border: "none", cursor: "pointer" }}>
                {l.label}
              </button>
            </li>
          ))}
        </ul>
        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-5">
          <button onClick={onSignIn} className="text-sm font-semibold text-[#555] hover:text-white transition-colors"
            style={{ fontFamily: "'Syne', sans-serif", background: "none", border: "none", cursor: "pointer" }}>
            Sign In
          </button>
          <GlowButton variant="yellow" className="px-7 py-3 text-xs rounded-none" onClick={onDeploy}>Get Started</GlowButton>
        </div>
        {/* Hamburger */}
        <button className="md:hidden flex flex-col gap-[5px] w-6" onClick={() => setMenuOpen(o => !o)}>
          {[0, 1, 2].map(i => (
            <span key={i} className="block h-0.5 bg-white transition-all duration-300 origin-center" style={{
              transform: menuOpen && i === 0 ? "rotate(45deg) translateY(7px)" : menuOpen && i === 1 ? "scaleX(0)" : menuOpen && i === 2 ? "rotate(-45deg) translateY(-7px)" : "none",
              opacity: menuOpen && i === 1 ? 0 : 1,
            }} />
          ))}
        </button>
      </div>
      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-[#08080b]/98 border-t border-white/[0.04]">
            <div className="px-8 py-10 flex flex-col gap-7">
              {links.map(l => (
                <button key={l.label} onClick={() => scrollTo(l.id)} className="text-2xl tracking-[0.18em] text-white uppercase text-left"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", background: "none", border: "none", cursor: "pointer" }}>
                  {l.label}
                </button>
              ))}
              <GlowButton variant="yellow" className="px-8 py-4 text-xs mt-4 self-start rounded-none" onClick={() => { setMenuOpen(false); onDeploy(); }}>Get Started</GlowButton>
              <button onClick={() => { setMenuOpen(false); onSignIn(); }} className="text-sm text-[#444] text-left"
                style={{ fontFamily: "'Syne', sans-serif", background: "none", border: "none", cursor: "pointer" }}>
                Sign In →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ════════════════════════════════════════════════════════════
// HERO
// ════════════════════════════════════════════════════════════
function Hero({ onDeploy, onDemo, vehicles }) {
  const { scrollYProgress } = useScroll();
  const parallaxY = useTransform(scrollYProgress, [0, 0.35], [0, -70]);
  const fadeOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const fn = (e) => setMouse({ x: (e.clientX / window.innerWidth - 0.5) * 28, y: (e.clientY / window.innerHeight - 0.5) * 18 });
    window.addEventListener("mousemove", fn, { passive: true });
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  const heroVehicles = vehicles.map(v => ({ plate: v.plate, pct: calcHealth(v.kmSinceService, v.serviceInterval), color: healthColor(calcHealth(v.kmSinceService, v.serviceInterval)) }));
  const alertCount = vehicles.filter(v => calcHealth(v.kmSinceService, v.serviceInterval) < 15).length;

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden grid-bg">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ x: mouse.x, y: mouse.y }} transition={{ type: "spring", stiffness: 40, damping: 25 }}
          className="absolute -top-20 right-1/4 w-[700px] h-[700px] rounded-full"
          style={{ background: `radial-gradient(circle, ${PURPLE_DIM}0.055) 0%, transparent 70%)`, filter: "blur(50px)" }} />
        <div className="absolute bottom-1/3 -left-40 w-[500px] h-[500px] rounded-full"
          style={{ background: `radial-gradient(circle, rgba(0,212,255,0.045) 0%, transparent 70%)`, filter: "blur(50px)" }} />
      </div>
      <div className="absolute top-28 right-8 md:right-14 hidden md:block text-[#2a2a2a] text-[10px] tracking-[0.22em] rotate-90 select-none" style={{ fontFamily: "'Space Mono', monospace" }}>FLEET.SYNC // v2.0</div>

      <motion.div style={{ y: parallaxY, opacity: fadeOpacity }} className="max-w-[1380px] mx-auto px-6 lg:px-12 pt-36 pb-24 w-full">
        <div className="grid lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_440px] gap-16 xl:gap-28 items-center">
          <div>
            <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: EASE_OUT_QUINT }}
              className="flex items-center gap-3 mb-10">
              <div className="w-8 h-[2px]" style={{ background: NEON }} />
              <span className="text-[10px] font-bold tracking-[0.44em] uppercase" style={{ color: NEON, fontFamily: "'Space Mono', monospace" }}>Fleet Intelligence Platform</span>
            </motion.div>

            <div className="mb-10 leading-none select-none">
              {["COMMAND", "YOUR"].map((word, i) => (
                <div key={word} className="overflow-hidden">
                  <motion.div initial={{ y: "108%" }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: EASE_OUT_QUINT }}
                    style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(72px, 11.5vw, 172px)", letterSpacing: "0.02em", lineHeight: "0.88", color: "#fff" }}>
                    {word}
                  </motion.div>
                </div>
              ))}
              <div className="overflow-hidden">
                <motion.div initial={{ y: "108%" }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.52, ease: EASE_OUT_QUINT }}
                  className="bg-gradient-to-r from-[#BF00FF] to-[#00D4FF] bg-clip-text text-transparent"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(72px, 11.5vw, 172px)", letterSpacing: "0.02em", lineHeight: "0.88" }}>
                  FLEET.
                </motion.div>
              </div>
            </div>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.75, ease: EASE_OUT_QUINT }}
              className="text-[#666] text-base md:text-[17px] leading-relaxed max-w-lg mb-12" style={{ fontFamily: "'Syne', sans-serif" }}>
              Real-time vehicle health, driver analytics, and predictive maintenance — one ultra-modern platform for operators who refuse to be surprised.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.9, ease: EASE_OUT_QUINT }}
              className="flex flex-wrap items-center gap-4">
              <GlowButton variant="yellow" className="px-10 py-4 text-sm rounded-none" onClick={onDeploy}>
                Deploy Now
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </GlowButton>
              <GlowButton variant="outline" className="px-10 py-4 text-sm rounded-none" onClick={onDemo}>Watch Demo</GlowButton>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.2 }}
              className="flex flex-wrap items-center gap-7 mt-16 pt-12 border-t border-white/[0.05]">
              {["ISO 27001 Certified", "SOC 2 Type II", "99.8% Uptime SLA"].map(b => (
                <div key={b} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: NEON }} />
                  <span className="text-[10px] text-[#3a3a3a] tracking-[0.22em] uppercase" style={{ fontFamily: "'Space Mono', monospace" }}>{b}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right column: live dashboard card */}
          <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.1, delay: 0.5, ease: EASE_OUT_QUINT }} className="hidden lg:block relative">
            <div className="absolute inset-[-1px] rounded-2xl pointer-events-none" style={{ boxShadow: `0 0 0 1px ${PURPLE_DIM}0.12), 0 0 60px ${PURPLE_DIM}0.07)` }} />
            <div className="relative bg-[#0c0c0f] rounded-2xl p-6 border border-white/[0.06] overflow-hidden">
              <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
              <div className="relative flex items-center justify-between mb-7">
                <div>
                  <div className="text-[9px] tracking-[0.3em] text-[#3a3a3a] uppercase mb-1" style={{ fontFamily: "'Space Mono', monospace" }}>Fleet Pulse</div>
                  <div className="text-xl font-bold text-white" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.12em" }}>{vehicles.length} VEHICLES</div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 border rounded-full" style={{ borderColor: `${NEON}20`, background: `${PURPLE_DIM}0.05)` }}>
                  <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full" style={{ background: NEON }} />
                  <span className="text-[9px] tracking-widest" style={{ color: NEON, fontFamily: "'Space Mono', monospace" }}>LIVE</span>
                </div>
              </div>
              <div className="relative space-y-4">
                {heroVehicles.map((v, i) => (
                  <motion.div key={v.plate} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 + i * 0.1, ease: EASE_OUT_QUINT }}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] font-bold tracking-wider text-white" style={{ fontFamily: "'Space Mono', monospace" }}>{v.plate}</span>
                      <span className="text-[11px] font-bold" style={{ color: v.color, fontFamily: "'Space Mono', monospace" }}>{v.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${v.pct}%` }} transition={{ delay: 1.1 + i * 0.1, duration: 0.9, ease: "easeOut" }}
                        className="h-full rounded-full" style={{ background: v.color, boxShadow: `0 0 8px ${v.color}66` }} />
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="relative mt-7 pt-6 border-t border-white/[0.05] flex justify-between items-end">
                <div>
                  <div className="text-[9px] text-[#333] tracking-[0.25em] uppercase mb-1" style={{ fontFamily: "'Space Mono', monospace" }}>Avg Health</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: NEON, letterSpacing: "0.06em" }}>
                    {Math.round(heroVehicles.reduce((s, v) => s + v.pct, 0) / heroVehicles.length)}%
                  </div>
                </div>
                {alertCount > 0 && (
                  <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.6, repeat: Infinity }}
                    className="flex items-center gap-2 text-[9px] px-3 py-1.5"
                    style={{ color: RED, fontFamily: "'Space Mono', monospace", background: "rgba(255,34,68,0.07)", border: "1px solid rgba(255,34,68,0.25)", letterSpacing: "0.15em" }}>
                    ● {alertCount} ALERT{alertCount > 1 ? "S" : ""}
                  </motion.div>
                )}
              </div>
            </div>
            <motion.div animate={{ y: [-6, 6, -6] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-5 -right-7 px-4 py-2 text-[10px] font-bold tracking-widest"
              style={{ background: NEON, color: "#060608", fontFamily: "'Space Mono', monospace" }}>
              ↑ 12% MTD
            </motion.div>
            <motion.div animate={{ y: [6, -6, 6] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              className="absolute -bottom-5 -left-7 px-4 py-2 text-[9px] tracking-widest"
              style={{ color: ELEC, fontFamily: "'Space Mono', monospace", background: "#0a0a0d", border: `1px solid ${ELEC}44`, boxShadow: `0 0 20px ${ELEC}1a` }}>
              ● REAL-TIME SYNC
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <motion.div animate={{ y: [0, 9, 0] }} transition={{ duration: 1.6, repeat: Infinity }} className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center pt-1.5">
          <div className="w-[3px] h-2 rounded-full" style={{ background: NEON }} />
        </motion.div>
        <span className="text-[9px] text-[#2a2a2a] tracking-[0.3em] uppercase" style={{ fontFamily: "'Space Mono', monospace" }}>Scroll</span>
      </motion.div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
// MARQUEE STRIP
// ════════════════════════════════════════════════════════════
function MarqueeStrip() {
  const items = ["REAL-TIME TRACKING", "VEHICLE HEALTH", "ROUTE OPTIMIZATION", "DRIVER ANALYTICS", "PREDICTIVE MAINTENANCE", "FLEET INTELLIGENCE", "SERVICE SCHEDULING", "ODOMETER LOGGING"];
  return (
    <div className="py-5 overflow-hidden border-y" style={{ borderColor: "rgba(255,255,255,0.04)", background: `${PURPLE_DIM}0.018)` }}>
      <div className="flex whitespace-nowrap animate-marquee">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="mx-7 text-[10px] font-bold tracking-[0.45em] uppercase" style={{ color: "#2f2f2f", fontFamily: "'Space Mono', monospace" }}>{item}</span>
            <span style={{ color: NEON, fontSize: 14 }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// STATS
// ════════════════════════════════════════════════════════════
function Stats() {
  const data = [
    { raw: 5000, suffix: "+", label: "Vehicles Monitored", sub: "Across active worldwide deployments" },
    { raw: 99, suffix: ".8%", label: "Platform Uptime", sub: "Industry-leading reliability SLA" },
    { raw: 150, suffix: "+", label: "Fleet Operators", sub: "Enterprise clients trust FleetSync" },
    { raw: 2, suffix: "M+", label: "KM Logged Daily", sub: "Odometer data processed per day" },
  ];
  return (
    <section id="analytics" className="border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
      <div className="max-w-[1380px] mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {data.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1} className={`py-16 px-10 ${i < data.length - 1 ? "border-r border-white/[0.04]" : ""}`}>
              <div className="mb-2 leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(44px,5.5vw,68px)", color: "#fff", letterSpacing: "0.02em" }}>
                <Counter raw={s.raw} suffix={s.suffix} />
              </div>
              <div className="text-xs font-bold tracking-[0.3em] uppercase mb-2" style={{ color: NEON, fontFamily: "'Space Mono', monospace" }}>{s.label}</div>
              <div className="text-xs text-[#444] leading-relaxed" style={{ fontFamily: "'Syne', sans-serif" }}>{s.sub}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
// FEATURE CARD — now clickable
// ════════════════════════════════════════════════════════════
function FeatureCard({ icon, title, desc, accent, index, onClick }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [hov, setHov] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const onMove = (e) => { const r = ref.current.getBoundingClientRect(); setPos({ x: e.clientX - r.left, y: e.clientY - r.top }); };

  return (
    <motion.button
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: index * 0.07, ease: EASE_OUT_QUINT }}
      onMouseMove={onMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      className="relative p-10 overflow-hidden text-left w-full"
      style={{ transition: "background 0.3s", background: hov ? "#09090c" : "#060608", cursor: "pointer", border: "none" }}
    >
      <motion.div animate={{ scaleX: hov ? 1 : 0 }} transition={{ duration: 0.35 }}
        className="absolute top-0 left-0 right-0 h-[1.5px] origin-left" style={{ background: accent }} />
      <span className="absolute inset-0 pointer-events-none" style={{ background: hov ? `radial-gradient(circle 180px at ${pos.x}px ${pos.y}px, ${accent}0d 0%, transparent 70%)` : "transparent", opacity: hov ? 1 : 0, transition: "opacity 0.3s" }} />
      <div className="text-3xl mb-8 transition-transform duration-300" style={{ color: accent, transform: hov ? "scale(1.15)" : "scale(1)", transformOrigin: "left" }}>{icon}</div>
      <h3 className="text-[15px] font-bold text-white mb-3 leading-snug" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "0.02em" }}>{title}</h3>
      <p className="text-[13px] text-[#4a4a4a] leading-relaxed" style={{ fontFamily: "'Syne', sans-serif" }}>{desc}</p>
      <motion.div animate={{ x: hov ? 0 : -8, opacity: hov ? 1 : 0 }} transition={{ duration: 0.2 }}
        className="mt-9 text-[10px] tracking-[0.35em] uppercase flex items-center gap-2" style={{ color: accent, fontFamily: "'Space Mono', monospace" }}>
        Explore →
      </motion.div>
    </motion.button>
  );
}

// ════════════════════════════════════════════════════════════
// FEATURES SECTION
// ════════════════════════════════════════════════════════════
function Features({ onFeatureClick }) {
  const cards = [
    { icon: "◈", title: "Vehicle Health Monitor", accent: NEON, desc: "Track service intervals and health scores in real-time. Predictive alerts fire before a breakdown ever happens." },
    { icon: "⬡", title: "Real-Time Fleet Overview", accent: ELEC, desc: "Bird's-eye dashboard with live status indicators, driver assignments, route data, and operational KPIs." },
    { icon: "◎", title: "Odometer Logging", accent: NEON, desc: "Drivers log trip data with GPS-tagged odometer entries. Full audit trail: timestamps, notes, route IDs." },
    { icon: "▣", title: "Role-Based Access Control", accent: ELEC, desc: "Granular permissions for Admins, Fleet Operators, and Drivers. Enterprise-grade zero-trust architecture." },
    { icon: "◇", title: "Maintenance Scheduling", accent: NEON, desc: "Automated service reminders and scheduling woven directly into the operations workflow." },
    { icon: "⬢", title: "Audit & Compliance Logs", accent: ELEC, desc: "Complete access logs, failed-login tracking, and security event monitoring for full compliance readiness." },
  ];
  return (
    <section id="features" className="py-28 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
      <div className="max-w-[1380px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <div>
            <Reveal><Eyebrow>Core Features</Eyebrow></Reveal>
            <SplitHeading text="EVERYTHING YOUR FLEET NEEDS." style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(38px,5.5vw,78px)", lineHeight: 0.9, color: "#fff" }} delay={0.1} />
          </div>
          <Reveal delay={0.25} dir="left">
            <p className="text-[#444] text-[15px] max-w-sm leading-relaxed" style={{ fontFamily: "'Syne', sans-serif" }}>
              From live monitoring to analytics — FleetSync covers every operational touchpoint.
            </p>
          </Reveal>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: "rgba(255,255,255,0.04)" }}>
          {cards.map((c, i) => <FeatureCard key={c.title} index={i} {...c} onClick={() => onFeatureClick(c.title)} />)}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
// SHOWCASE
// ════════════════════════════════════════════════════════════
function Showcase({ onExplore, vehicles }) {
  const avgHealth = Math.round(vehicles.reduce((s, v) => s + calcHealth(v.kmSinceService, v.serviceInterval), 0) / vehicles.length);
  const displayVehicles = vehicles.map(v => ({ name: v.plate, pct: calcHealth(v.kmSinceService, v.serviceInterval), color: healthColor(calcHealth(v.kmSinceService, v.serviceInterval)) }));
  const criticalCount = vehicles.filter(v => calcHealth(v.kmSinceService, v.serviceInterval) < 15).length;

  return (
    <section id="fleet" className="py-32 border-b overflow-hidden" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
      <div className="max-w-[1380px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-20 xl:gap-32 items-center">
          <div>
            <Reveal><Eyebrow>The Platform</Eyebrow></Reveal>
            <SplitHeading text="BUILT FOR OPERATORS. NOT ANALYSTS."
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(36px,5vw,68px)", lineHeight: 0.9, color: "#fff", marginBottom: "2rem" }} delay={0.1} />
            <Reveal delay={0.3}>
              <p className="text-[#555] text-[15px] leading-relaxed mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
                FleetSync strips away complexity. Every critical decision — scheduling a service, flagging a critical vehicle, reviewing driver performance — is surfaced instantly.
              </p>
            </Reveal>
            <Reveal delay={0.4}>
              <p className="text-[#444] text-[15px] leading-relaxed mb-12" style={{ fontFamily: "'Syne', sans-serif" }}>
                Three roles, one coherent system. Admins oversee everything. Companies manage their fleet. Drivers log their operations. Data flows up, alerts flow down.
              </p>
            </Reveal>
            <Reveal delay={0.5}>
              <div className="flex flex-wrap gap-3 mb-12">
                {[{ label: "Admin", color: RED }, { label: "Fleet Manager", color: ELEC }, { label: "Driver", color: NEON }].map(r => (
                  <button key={r.label} onClick={onExplore} className="px-5 py-2.5 text-[10px] font-bold tracking-[0.3em] uppercase transition-all"
                    style={{ border: `1px solid ${r.color}55`, color: r.color, fontFamily: "'Space Mono', monospace", background: "transparent", cursor: "pointer" }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${r.color}12`; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                    {r.label}
                  </button>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.6}>
              <GlowButton variant="outline" className="px-10 py-4 text-sm rounded-none" onClick={onExplore}>Explore The System →</GlowButton>
            </Reveal>
          </div>

          <Reveal delay={0.2} dir="left" className="relative">
            <div className="relative" style={{ aspectRatio: "4/3.2", background: "#0a0a0d", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
              <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                {[RED, "#ffaa00", NEON].map(c => <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}
                <span className="ml-4 text-[10px] text-[#2a2a2a]" style={{ fontFamily: "'Space Mono', monospace" }}>fleet-sync.io/dashboard</span>
              </div>
              <div className="p-7">
                <div className="flex justify-between mb-8">
                  <div>
                    <div className="text-[9px] text-[#2a2a2a] tracking-[0.25em] mb-1" style={{ fontFamily: "'Space Mono', monospace" }}>FLEET STATUS</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: "#fff", letterSpacing: "0.1em" }}>{vehicles.length} VEHICLES</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-[#2a2a2a] tracking-[0.25em] mb-1" style={{ fontFamily: "'Space Mono', monospace" }}>HEALTH SCORE</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: NEON, letterSpacing: "0.06em" }}>{avgHealth}%</div>
                  </div>
                </div>
                {displayVehicles.map(v => (
                  <div key={v.name} className="mb-4">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[10px] text-[#3a3a3a]" style={{ fontFamily: "'Space Mono', monospace" }}>{v.name}</span>
                      <span className="text-[10px]" style={{ color: v.color, fontFamily: "'Space Mono', monospace" }}>{v.pct === 0 ? "OVERDUE" : `${v.pct}%`}</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div className="h-full rounded-full" style={{ width: `${v.pct}%`, background: v.color, boxShadow: `0 0 5px ${v.color}88`, transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                ))}
                {criticalCount > 0 && (
                  <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.6, repeat: Infinity }}
                    className="mt-6 px-4 py-2 text-[9px] flex items-center gap-2 tracking-[0.2em]"
                    style={{ background: "rgba(255,34,68,0.05)", border: "1px solid rgba(255,34,68,0.3)", color: RED, fontFamily: "'Space Mono', monospace" }}>
                    ● {criticalCount} VEHICLE{criticalCount > 1 ? "S" : ""} REQUIRE IMMEDIATE SERVICE
                  </motion.div>
                )}
              </div>
            </div>
            <div className="absolute -top-3 -right-3 w-20 h-20 border-t-2 border-r-2" style={{ borderColor: `${NEON}33` }} />
            <div className="absolute -bottom-3 -left-3 w-20 h-20 border-b-2 border-l-2" style={{ borderColor: `${NEON}33` }} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
// PROCESS
// ════════════════════════════════════════════════════════════
function Process() {
  const steps = [
    { num: "01", title: "Connect Your Fleet", desc: "Register vehicles, assign drivers, and set service intervals in under 10 minutes." },
    { num: "02", title: "Monitor Live", desc: "Real-time health scores, odometer logs, and driver activity auto-tracked and surfaced." },
    { num: "03", title: "Act on Intelligence", desc: "AI-triggered alerts, automated maintenance scheduling, compliance reports — all hands-free." },
  ];
  return (
    <section id="drivers" className="py-28 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
      <div className="max-w-[1380px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-20">
          <Reveal>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-6 h-[2px]" style={{ background: NEON }} />
              <span className="text-[10px] font-bold tracking-[0.44em] uppercase" style={{ color: NEON, fontFamily: "'Space Mono', monospace" }}>How It Works</span>
              <div className="w-6 h-[2px]" style={{ background: NEON }} />
            </div>
          </Reveal>
          <SplitHeading text="THREE STEPS TO TOTAL CONTROL." style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(38px,5.5vw,78px)", lineHeight: 0.92, color: "#fff" }} delay={0.1} center />
        </div>
        <div className="grid md:grid-cols-3 gap-px" style={{ background: "rgba(255,255,255,0.04)" }}>
          {steps.map((s, i) => (
            <Reveal key={s.num} delay={i * 0.14} className="relative bg-[#060608] p-12">
              <div className="select-none leading-[0.7] mb-8" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(80px,10vw,120px)", color: `${PURPLE_DIM}0.05)` }}>{s.num}</div>
              <h3 className="text-[17px] font-bold text-white mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>{s.title}</h3>
              <p className="text-[13px] text-[#444] leading-relaxed" style={{ fontFamily: "'Syne', sans-serif" }}>{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 hidden md:flex items-center justify-center w-9 h-9 border"
                  style={{ background: "#060608", borderColor: "rgba(255,255,255,0.08)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={NEON} strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </div>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
// PRICING
// ════════════════════════════════════════════════════════════
function Pricing({ onDeploy, onDemo }) {
  const [billing, setBilling] = useState("monthly");
  const plans = {
    monthly: [
      { name: "Starter", price: 29, unit: "/vehicle/month", desc: "For small fleets getting started.", features: ["Up to 10 vehicles", "Real-time tracking", "Basic health reports", "Email alerts", "Mobile app"], cta: "Deploy Starter" },
      { name: "Pro", price: 79, unit: "/vehicle/month", desc: "For growing operations.", features: ["Up to 100 vehicles", "AI maintenance alerts", "Driver safety scores", "Route optimization", "ELD compliance", "API access", "Priority support"], popular: true, cta: "Deploy Pro" },
      { name: "Enterprise", price: null, unit: "custom", desc: "Unlimited scale, dedicated infra.", features: ["Unlimited vehicles", "Custom integrations", "White-label", "Dedicated CSM", "SLA guarantees", "24/7 support"], cta: "Contact Sales" },
    ],
    annual: [
      { name: "Starter", price: 23, unit: "/vehicle/month", desc: "For small fleets getting started.", features: ["Up to 10 vehicles", "Real-time tracking", "Basic health reports", "Email alerts", "Mobile app"], cta: "Deploy Starter" },
      { name: "Pro", price: 63, unit: "/vehicle/month", desc: "For growing operations.", features: ["Up to 100 vehicles", "AI maintenance alerts", "Driver safety scores", "Route optimization", "ELD compliance", "API access", "Priority support"], popular: true, cta: "Deploy Pro" },
      { name: "Enterprise", price: null, unit: "custom", desc: "Unlimited scale, dedicated infra.", features: ["Unlimited vehicles", "Custom integrations", "White-label", "Dedicated CSM", "SLA guarantees", "24/7 support"], cta: "Contact Sales" },
    ],
  };

  return (
    <section id="pricing" className="py-28 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
      <div className="max-w-[1380px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <Reveal><Eyebrow>Transparent Pricing</Eyebrow></Reveal>
          <SplitHeading text="SIMPLE. SCALABLE. FAIR." style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(38px,5.5vw,78px)", lineHeight: 0.9, color: "#fff", marginBottom: "2rem" }} delay={0.1} center />
          <Reveal delay={0.2}>
            <div className="inline-flex border mt-2" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              {["monthly", "annual"].map(b => (
                <button key={b} onClick={() => setBilling(b)} className="px-7 py-2.5 text-[10px] tracking-[0.3em] uppercase transition-all"
                  style={{ fontFamily: "'Space Mono', monospace", background: billing === b ? `${NEON}12` : "transparent", color: billing === b ? NEON : "#333", borderBottom: billing === b ? `2px solid ${NEON}` : "2px solid transparent", border: "none", cursor: "pointer" }}>
                  {b === "annual" ? "Annual −20%" : "Monthly"}
                </button>
              ))}
            </div>
          </Reveal>
        </div>
        <div className="grid md:grid-cols-3 gap-px" style={{ background: "rgba(255,255,255,0.04)" }}>
          {plans[billing].map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.1} className="relative bg-[#060608] p-10">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${NEON}, ${ELEC})` }} />
              {plan.popular && (
                <div className="absolute top-4 right-4 px-3 py-1 text-[9px] tracking-[0.3em] uppercase"
                  style={{ color: NEON, border: `1px solid ${NEON}40`, fontFamily: "'Space Mono', monospace", background: `${NEON}08` }}>
                  Popular
                </div>
              )}

              {/* Header section — fixed minHeight so all buttons align */}
              <div style={{ minHeight: 200 }}>
                <div className="mb-6">
                  <div className="text-[11px] font-bold tracking-[0.35em] uppercase mb-3" style={{ color: "#333", fontFamily: "'Space Mono', monospace" }}>{plan.name}</div>
                  {plan.price ? (
                    <>
                      <div className="leading-none mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(44px,5vw,60px)", color: "#fff" }}>${plan.price}</div>
                      <div className="text-[11px] text-[#333]" style={{ fontFamily: "'Space Mono', monospace" }}>{plan.unit}</div>
                    </>
                  ) : (
                    <div className="leading-none mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: "#fff" }}>Custom</div>
                  )}
                </div>
                <p className="text-[13px] text-[#444] leading-relaxed" style={{ fontFamily: "'Syne', sans-serif" }}>{plan.desc}</p>
              </div>

              {/* Button — all three at the same Y position */}
              <GlowButton variant={plan.popular ? "yellow" : "outline"} className="w-full py-3.5 text-xs mb-8 rounded-none"
                onClick={plan.name === "Enterprise" ? onDemo : onDeploy}>
                {plan.cta} →
              </GlowButton>

              {/* Features list */}
              <ul className="space-y-3">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-3">
                    <span style={{ color: NEON, flexShrink: 0, marginTop: 1, fontSize: 12 }}>✓</span>
                    <span className="text-[13px] text-[#444]" style={{ fontFamily: "'Syne', sans-serif" }}>{f}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.3}>
          <p className="text-center mt-10 text-[9px] text-[#2a2a2a] tracking-[0.35em] uppercase" style={{ fontFamily: "'Space Mono', monospace" }}>
            14-day free trial on all plans · No credit card required · Cancel anytime
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
// CTA
// ════════════════════════════════════════════════════════════
function CTA({ onDeploy, onDemo }) {
  return (
    <section className="relative py-36 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 75% 55% at 50% 50%, ${PURPLE_DIM}0.04) 0%, transparent 68%)` }} />
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div className="max-w-[1380px] mx-auto px-6 lg:px-12 text-center relative">
        <Reveal>
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-6 h-[2px]" style={{ background: NEON }} />
            <span className="text-[10px] font-bold tracking-[0.44em] uppercase" style={{ color: NEON, fontFamily: "'Space Mono', monospace" }}>Get Started Today</span>
            <div className="w-6 h-[2px]" style={{ background: NEON }} />
          </div>
        </Reveal>
        <SplitHeading text="READY TO TAKE COMMAND?" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(52px,8vw,120px)", lineHeight: 0.88, color: "#fff", marginBottom: "2rem" }} delay={0.1} center />
        <Reveal delay={0.4}>
          <p className="text-[#555] text-lg max-w-lg mx-auto leading-relaxed mb-14" style={{ fontFamily: "'Syne', sans-serif" }}>
            Join 150+ fleet operators already running on FleetSync. Deploy in minutes, not weeks.
          </p>
        </Reveal>
        <Reveal delay={0.5}>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <GlowButton variant="yellow" className="px-14 py-5 text-sm rounded-none" onClick={onDeploy}>Deploy FleetSync →</GlowButton>
            <GlowButton variant="outline" className="px-14 py-5 text-sm rounded-none" onClick={onDemo}>Book a Demo</GlowButton>
          </div>
        </Reveal>
        <Reveal delay={0.65}>
          <p className="mt-9 text-[9px] text-[#2a2a2a] tracking-[0.35em] uppercase" style={{ fontFamily: "'Space Mono', monospace" }}>
            No credit card required · Free 14-day trial · Enterprise pricing available
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
// FOOTER
// ════════════════════════════════════════════════════════════
function Footer({ onDeploy, onDemo, onInfo }) {
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const navLinks = [
    { label: "Features", action: () => scrollTo("features") },
    { label: "Fleet", action: () => scrollTo("fleet") },
    { label: "Pricing", action: () => scrollTo("pricing") },
    { label: "Docs", action: () => onInfo("Docs") },
    { label: "About", action: () => onInfo("About") },
    { label: "Privacy", action: () => onInfo("Privacy") },
    { label: "Terms", action: () => onInfo("Terms") },
  ];
  return (
    <footer className="border-t py-16" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
      <div className="max-w-[1380px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 mb-14">
          <div className="flex items-center">
            <img src="/logo.png" alt="FleetSync Logo" className="h-10 md:h-12 object-contain" />
          </div>
          <div className="flex flex-wrap gap-8">
            {navLinks.map(l => (
              <button key={l.label} onClick={l.action} className="text-[10px] text-[#333] hover:text-white transition-colors duration-200 tracking-[0.3em] uppercase"
                style={{ fontFamily: "'Space Mono', monospace", background: "none", border: "none", cursor: "pointer" }}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-8 border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
          <p className="text-[10px] text-[#272727]" style={{ fontFamily: "'Space Mono', monospace" }}>© 2025 FleetSync Technologies. All rights reserved.</p>
          <p className="text-[10px] text-[#272727]" style={{ fontFamily: "'Space Mono', monospace" }}>Crafted with React · Tailwind CSS · Framer Motion</p>
        </div>
      </div>
    </footer>
  );
}

// ════════════════════════════════════════════════════════════
// PORTAL LOGIN MODAL
// ════════════════════════════════════════════════════════════
const PORTAL_USERS = [
  { role: "Admin", username: "jeff bezos", password: "123", access: ["User management", "Billing & subscriptions", "Security audit logs", "Platform configuration"] },
  { role: "Fleet Manager", username: "rahul saxena", password: "123", access: ["Live fleet dashboard", "Maintenance scheduling", "Driver assignment", "Health alerts"] },
  { role: "Driver", username: "suryansh singh", password: "123", access: ["Odometer logging", "Trip reports", "Vehicle health", "Service history"] },
  { role: "Driver", username: "yashash mathur", password: "123", access: ["Odometer logging", "Trip reports", "Vehicle health", "Service history"] },
  { role: "Driver", username: "utkarsh gupta", password: "123", access: ["Odometer logging", "Trip reports", "Vehicle health", "Service history"] },
  { role: "Driver", username: "avyam srivastava", password: "123", access: ["Odometer logging", "Trip reports", "Vehicle health", "Service history"] }
];

function PortalLoginModal({ open, onClose, role, vehicles, onLogTrip, onMarkServiced }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [activeAction, setActiveAction] = useState(null);

  const set = k => e => { setForm(p => ({ ...p, [k]: e.target.value })); setError(""); };
  const reset = () => { setLoggedInUser(null); setLoading(false); setError(""); setForm({ username: "", password: "" }); setActiveAction(null); };
  const handleClose = () => { onClose(); setTimeout(reset, 300); };

  const handleSubmit = e => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const user = PORTAL_USERS.find(u => u.role === role && u.username.toLowerCase() === form.username.toLowerCase() && u.password === form.password);
      if (user) {
        setLoggedInUser(user);
      } else {
        setError("Invalid username or password.");
      }
    }, 800);
  };

  const getAccent = () => role === "Admin" ? RED : role === "Fleet Manager" ? ELEC : NEON;

  // ─── Render the logged-in content (action grid or active action view) ───
  const renderLoggedInContent = () => {
    if (activeAction) {
      return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <button onClick={() => setActiveAction(null)} className="flex items-center gap-2 mb-6 text-[10px] tracking-[0.2em] uppercase transition-colors"
            style={{ color: "#555", fontFamily: "'Space Mono', monospace", background: "none", border: "none", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.color = getAccent()} onMouseLeave={e => e.currentTarget.style.color = "#555"}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Back to Actions
          </button>
          <PortalActionView action={activeAction} accent={getAccent()} role={role} username={loggedInUser?.username} vehicles={vehicles} onLogTrip={onLogTrip} onMarkServiced={onMarkServiced} />
        </motion.div>
      );
    }

    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-4">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold" style={{ background: `${getAccent()}20`, color: getAccent(), border: `1px solid ${getAccent()}50` }}>
            {loggedInUser.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-white font-bold capitalize text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>{loggedInUser.username}</div>
            <div className="text-[10px] tracking-[0.2em] uppercase" style={{ color: getAccent(), fontFamily: "'Space Mono', monospace" }}>{role} Role Active</div>
          </div>
        </div>

        <h4 className="text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: '#666', fontFamily: "'Space Mono', monospace" }}>Available Actions</h4>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {loggedInUser.access.map((act, i) => (
            <motion.button
              key={act}
              onClick={() => setActiveAction(act)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
              whileHover="hover"
              whileTap={{ scale: 0.98 }}
              className="relative p-4 text-left border overflow-hidden group flex flex-col justify-between h-24"
              style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#08080b', cursor: 'pointer' }}
            >
              <motion.div className="absolute inset-0 opacity-0 pointer-events-none" variants={{ hover: { opacity: 1 } }} transition={{ duration: 0.3 }}
                style={{ background: `radial-gradient(ellipse at center, ${getAccent()}22 0%, transparent 70%)` }} />
              <motion.div className="absolute top-0 left-0 right-0 h-[2px] origin-left" variants={{ hover: { scaleX: 1 } }} initial={{ scaleX: 0 }} transition={{ duration: 0.3 }} style={{ background: getAccent() }} />
              <div className="relative z-10 flex items-start justify-between">
                <div className="w-6 h-6 rounded flex items-center justify-center mb-2" style={{ background: `${getAccent()}10`, border: `1px solid ${getAccent()}30` }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: getAccent() }} />
                </div>
                <motion.div variants={{ hover: { x: 3, opacity: 1 } }} initial={{ x: 0, opacity: 0.4 }} transition={{ duration: 0.2 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={getAccent()} strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </motion.div>
              </div>
              <motion.div className="relative z-10 text-[13px] font-bold text-white tracking-wide" variants={{ hover: { color: getAccent() } }} transition={{ duration: 0.2 }} style={{ fontFamily: "'Syne', sans-serif" }}>
                {act}
              </motion.div>
            </motion.button>
          ))}
        </div>
        <ModalButton type="button" onClick={() => setLoggedInUser(null)} variant="outline">Sign Out</ModalButton>
      </motion.div>
    );
  };

  return (
    <Modal open={open} onClose={handleClose} wide={!!activeAction}>
      <ModalShell title={activeAction ? activeAction.toUpperCase() : `${role?.toUpperCase()} PORTAL`} subtitle={activeAction ? `${role} Module` : (loggedInUser ? "Access Granted" : "Secure Login")} accentColor={getAccent()} onClose={handleClose}>
        <div className="max-h-[70vh] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: `${getAccent()}30 transparent` }}>
          {loggedInUser ? renderLoggedInContent() : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <ModalInput label="Username" value={form.username} onChange={set("username")} placeholder="Enter username" required />
              <ModalInput label="Password" type="password" value={form.password} onChange={set("password")} placeholder="Your password" required />
              {error && <div className="text-red-500 text-xs mt-[-10px]" style={{ fontFamily: "'Syne', sans-serif" }}>{error}</div>}
              <div className="pt-1">
                <button type="submit" className="w-full py-4 text-xs font-bold tracking-[0.12em] uppercase transition-colors"
                  style={{ background: getAccent(), color: "#060608", fontFamily: "'Syne', sans-serif", border: "none", cursor: "pointer" }}>
                  {loading ? "Authenticating…" : "Access System →"}
                </button>
              </div>
              <div className="mt-6 p-4 border rounded" style={{ borderColor: `${getAccent()}30`, background: `${getAccent()}08` }}>
                <div className="text-[9px] tracking-[0.2em] uppercase mb-3 font-bold" style={{ color: getAccent(), fontFamily: "'Space Mono', monospace" }}>
                  Testing Credentials ({role}):
                </div>
                <div className="flex flex-col gap-2">
                  {PORTAL_USERS.filter(u => u.role === role).map(u => (
                    <div key={u.username} className="text-[11px] text-[#ccc]" style={{ fontFamily: "'Space Mono', monospace" }}>
                      User: <span className="text-white font-bold">{u.username}</span> | Pass: <span className="text-white font-bold">{u.password}</span>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          )}
        </div>
      </ModalShell>
    </Modal>
  );
}

// ════════════════════════════════════════════════════════════
// PORTAL ACTION VIEW — renders real dummy-data UI per action
// ════════════════════════════════════════════════════════════

// Dummy data sets
const DUMMY_PLATFORM_USERS = [
  { id: 1, name: "Jeff Bezos", email: "jeff@fleetsync.io", role: "Admin", status: "Active", lastLogin: "Today, 11:42 AM" },
  { id: 2, name: "Rahul Saxena", email: "rahul@fleetsync.io", role: "Fleet Manager", status: "Active", lastLogin: "Today, 09:15 AM" },
  { id: 3, name: "Suryansh Singh", email: "suryansh@fleetsync.io", role: "Driver", status: "Active", lastLogin: "Yesterday, 06:30 PM" },
  { id: 4, name: "Yashash Mathur", email: "yashash@fleetsync.io", role: "Driver", status: "Active", lastLogin: "Mar 1, 04:20 PM" },
  { id: 5, name: "Utkarsh Gupta", email: "utkarsh@fleetsync.io", role: "Driver", status: "Active", lastLogin: "Feb 28, 10:00 AM" },
  { id: 6, name: "Avyam Srivastava", email: "avyam@fleetsync.io", role: "Driver", status: "Active", lastLogin: "Today, 08:45 AM" },
];

const DUMMY_INVOICES = [
  { id: "INV-0042", date: "Mar 1, 2026", amount: "$316", status: "Paid", plan: "Pro" },
  { id: "INV-0041", date: "Feb 1, 2026", amount: "$316", status: "Paid", plan: "Pro" },
  { id: "INV-0040", date: "Jan 1, 2026", amount: "$316", status: "Paid", plan: "Pro" },
  { id: "INV-0039", date: "Dec 1, 2025", amount: "$232", status: "Paid", plan: "Starter" },
];

const DUMMY_AUDIT_LOGS = [
  { id: 1, time: "Today 11:42", user: "Jeff Bezos", action: "Logged in", ip: "192.168.1.10", severity: "info" },
  { id: 2, time: "Today 11:38", user: "Jeff Bezos", action: "Updated billing plan to Pro", ip: "192.168.1.10", severity: "warn" },
  { id: 3, time: "Today 09:15", user: "Rahul Saxena", action: "Logged in", ip: "10.0.0.45", severity: "info" },
  { id: 4, time: "Today 09:20", user: "Rahul Saxena", action: "Assigned driver to vehicle FLT-444", ip: "10.0.0.45", severity: "info" },
  { id: 5, time: "Yesterday 18:30", user: "Suryansh Singh", action: "Logged trip: 120 km", ip: "Mobile", severity: "info" },
  { id: 6, time: "Yesterday 14:02", user: "Unknown", action: "Failed login attempt (3x)", ip: "89.45.12.8", severity: "critical" },
  { id: 7, time: "Mar 1 10:00", user: "Jeff Bezos", action: "Deleted user account: test@demo.com", ip: "192.168.1.10", severity: "warn" },
];

const DUMMY_MAINTENANCE = [
  { id: 1, vehicle: "ABC-123", type: "Oil Change", date: "Mar 8, 2026", status: "Scheduled", priority: "Normal" },
  { id: 2, vehicle: "XYZ-789", type: "Brake Inspection", date: "Mar 5, 2026", status: "Overdue", priority: "High" },
  { id: 3, vehicle: "FLT-444", type: "Tire Rotation", date: "Mar 12, 2026", status: "Scheduled", priority: "Normal" },
  { id: 4, vehicle: "CRIT-99", type: "Full Service", date: "Mar 3, 2026", status: "Overdue", priority: "Critical" },
  { id: 5, vehicle: "ABC-123", type: "Air Filter", date: "Apr 1, 2026", status: "Upcoming", priority: "Low" },
];

const DUMMY_DRIVER_ASSIGNMENTS = [
  { vehicle: "ABC-123", driver: "Suryansh Singh", shift: "6:00 AM – 2:00 PM", status: "On Route", route: "Delhi → Agra" },
  { vehicle: "XYZ-789", driver: "Yashash Mathur", shift: "2:00 PM – 10:00 PM", status: "At Depot", route: "Lucknow Local" },
  { vehicle: "FLT-444", driver: "Utkarsh Gupta", shift: "6:00 AM – 2:00 PM", status: "On Route", route: "Mumbai → Pune" },
  { vehicle: "CRIT-99", driver: "Avyam Srivastava", shift: "10:00 PM – 6:00 AM", status: "Service Required", route: "Kanpur Express" },
];

const DUMMY_HEALTH_ALERTS = [
  { id: 1, vehicle: "CRIT-99", message: "Service overdue — 9,800 km since last service", severity: "critical", time: "2 min ago" },
  { id: 2, vehicle: "XYZ-789", message: "Approaching service interval — 6,100 km driven", severity: "warning", time: "1 hr ago" },
  { id: 3, vehicle: "FLT-444", message: "Brake wear sensor triggered", severity: "warning", time: "3 hrs ago" },
  { id: 4, vehicle: "ABC-123", message: "Vehicle healthy — next service in 9,480 km", severity: "ok", time: "Today" },
];

// Per-driver trip reports
const DRIVER_TRIP_REPORTS = {
  "suryansh singh": [
    { id: 1, date: "Mar 3, 2026", from: "Delhi Depot", to: "Agra Distribution", km: 235, duration: "3h 40m", fuelUsed: "19.8L" },
    { id: 2, date: "Mar 2, 2026", from: "Agra Distribution", to: "Delhi Depot", km: 230, duration: "3h 30m", fuelUsed: "19.1L" },
    { id: 3, date: "Mar 1, 2026", from: "Delhi Depot", to: "Noida Hub", km: 42, duration: "1h 05m", fuelUsed: "3.6L" },
    { id: 4, date: "Feb 28, 2026", from: "Noida Hub", to: "Delhi Depot", km: 45, duration: "1h 10m", fuelUsed: "3.9L" },
    { id: 5, date: "Feb 27, 2026", from: "Delhi Depot", to: "Jaipur Warehouse", km: 280, duration: "4h 20m", fuelUsed: "24.2L" },
  ],
  "yashash mathur": [
    { id: 1, date: "Mar 3, 2026", from: "Lucknow Base", to: "Kanpur Yard", km: 85, duration: "1h 30m", fuelUsed: "7.4L" },
    { id: 2, date: "Mar 2, 2026", from: "Kanpur Yard", to: "Lucknow Base", km: 88, duration: "1h 35m", fuelUsed: "7.7L" },
    { id: 3, date: "Mar 1, 2026", from: "Lucknow Base", to: "Varanasi Depot", km: 320, duration: "5h 10m", fuelUsed: "27.5L" },
    { id: 4, date: "Feb 27, 2026", from: "Varanasi Depot", to: "Lucknow Base", km: 315, duration: "5h 00m", fuelUsed: "26.8L" },
  ],
  "utkarsh gupta": [
    { id: 1, date: "Mar 3, 2026", from: "Mumbai Terminal", to: "Pune Factory", km: 155, duration: "2h 50m", fuelUsed: "13.4L" },
    { id: 2, date: "Mar 2, 2026", from: "Pune Factory", to: "Mumbai Terminal", km: 150, duration: "2h 40m", fuelUsed: "12.8L" },
    { id: 3, date: "Mar 1, 2026", from: "Mumbai Terminal", to: "Nashik Plant", km: 172, duration: "3h 15m", fuelUsed: "14.9L" },
    { id: 4, date: "Feb 28, 2026", from: "Nashik Plant", to: "Mumbai Terminal", km: 168, duration: "3h 05m", fuelUsed: "14.2L" },
    { id: 5, date: "Feb 27, 2026", from: "Mumbai Terminal", to: "Lonavala Drop", km: 83, duration: "1h 30m", fuelUsed: "7.1L" },
    { id: 6, date: "Feb 26, 2026", from: "Lonavala Drop", to: "Mumbai Terminal", km: 85, duration: "1h 35m", fuelUsed: "7.3L" },
  ],
  "avyam srivastava": [
    { id: 1, date: "Mar 2, 2026", from: "Kanpur Depot", to: "Allahabad Hub", km: 202, duration: "3h 25m", fuelUsed: "17.3L" },
    { id: 2, date: "Mar 1, 2026", from: "Allahabad Hub", to: "Kanpur Depot", km: 198, duration: "3h 15m", fuelUsed: "16.8L" },
    { id: 3, date: "Feb 28, 2026", from: "Kanpur Depot", to: "Lucknow Drop", km: 82, duration: "1h 20m", fuelUsed: "7.0L" },
  ],
};

// Per-driver service history
const DRIVER_SERVICE_HISTORY = {
  "suryansh singh": [
    { id: 1, date: "Jan 15, 2026", type: "Full Service", workshop: "QuickFix Garage, Delhi", cost: "₹8,500", kmAtService: 51800 },
    { id: 2, date: "Oct 20, 2025", type: "Oil Change", workshop: "QuickFix Garage, Delhi", cost: "₹2,200", kmAtService: 42000 },
    { id: 3, date: "Jul 5, 2025", type: "Brake Pad Replacement", workshop: "Highway Motors, Noida", cost: "₹6,800", kmAtService: 32500 },
    { id: 4, date: "Mar 10, 2025", type: "Tire Rotation", workshop: "Highway Motors, Noida", cost: "₹3,200", kmAtService: 22000 },
  ],
  "yashash mathur": [
    { id: 1, date: "Dec 10, 2025", type: "Full Service", workshop: "Sharma Auto Works, Lucknow", cost: "₹9,200", kmAtService: 82100 },
    { id: 2, date: "Sep 1, 2025", type: "Transmission Check", workshop: "Sharma Auto Works, Lucknow", cost: "₹14,500", kmAtService: 72000 },
    { id: 3, date: "May 18, 2025", type: "Oil Change", workshop: "City Garage, Kanpur", cost: "₹2,400", kmAtService: 60800 },
    { id: 4, date: "Feb 8, 2025", type: "Air Filter + Coolant", workshop: "City Garage, Kanpur", cost: "₹4,100", kmAtService: 50200 },
    { id: 5, date: "Nov 15, 2024", type: "Full Service", workshop: "Sharma Auto Works, Lucknow", cost: "₹8,800", kmAtService: 40000 },
  ],
  "utkarsh gupta": [
    { id: 1, date: "Jan 28, 2026", type: "Oil Change", workshop: "Rapid Service, Pune", cost: "₹2,600", kmAtService: 27500 },
    { id: 2, date: "Nov 12, 2025", type: "Suspension Repair", workshop: "Mega Motors, Mumbai", cost: "₹18,200", kmAtService: 20300 },
    { id: 3, date: "Aug 3, 2025", type: "Full Service", workshop: "Rapid Service, Pune", cost: "₹7,900", kmAtService: 12800 },
  ],
  "avyam srivastava": [
    { id: 1, date: "Feb 20, 2026", type: "Emergency Brake Fix", workshop: "Roadside Assist, Kanpur", cost: "₹11,500", kmAtService: 3100 },
    { id: 2, date: "Dec 5, 2025", type: "Full Service", workshop: "Singh Motors, Kanpur", cost: "₹9,800", kmAtService: 0 },
  ],
};

// Helper: styled table row
function TRow({ children, accent }) {
  const [hov, setHov] = useState(false);
  return (
    <tr onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? `${accent}08` : "transparent", transition: "background 0.2s" }}>
      {children}
    </tr>
  );
}

// Helper: status badge
function StatusBadge({ label, color }) {
  return (
    <span className="px-2 py-0.5 text-[9px] tracking-[0.15em] uppercase font-bold" style={{ color, border: `1px solid ${color}40`, background: `${color}10`, fontFamily: "'Space Mono', monospace" }}>
      {label}
    </span>
  );
}

function PortalActionView({ action, accent, role, username, vehicles, onLogTrip, onMarkServiced }) {
  const cellStyle = { padding: "10px 12px", fontSize: 12, color: "#bbb", fontFamily: "'Syne', sans-serif", borderBottom: "1px solid rgba(255,255,255,0.04)" };
  const headStyle = { ...cellStyle, color: "#555", fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: "bold" };
  const tableStyle = { width: "100%", borderCollapse: "collapse" };

  // ─── ADMIN: User Management ───
  if (action === "User management") {
    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="text-[11px] text-[#555]" style={{ fontFamily: "'Space Mono', monospace" }}>{DUMMY_PLATFORM_USERS.length} users total</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead><tr>
              {["Name", "Email", "Role", "Status", "Last Login"].map(h => <th key={h} style={{ ...headStyle, textAlign: "left" }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {DUMMY_PLATFORM_USERS.map(u => (
                <TRow key={u.id} accent={accent}>
                  <td style={cellStyle}><span className="text-white font-bold">{u.name}</span></td>
                  <td style={cellStyle}>{u.email}</td>
                  <td style={cellStyle}><StatusBadge label={u.role} color={u.role === "Admin" ? RED : u.role === "Fleet Manager" ? ELEC : NEON} /></td>
                  <td style={cellStyle}><StatusBadge label={u.status} color={u.status === "Active" ? NEON : "#666"} /></td>
                  <td style={cellStyle}>{u.lastLogin}</td>
                </TRow>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ─── ADMIN: Billing & subscriptions ───
  if (action === "Billing & subscriptions") {
    return (
      <div>
        <div className="p-5 mb-6 border" style={{ borderColor: `${accent}25`, background: `${accent}06` }}>
          <div className="flex justify-between items-center mb-3">
            <div>
              <div className="text-[9px] tracking-[0.3em] uppercase text-[#555] mb-1" style={{ fontFamily: "'Space Mono', monospace" }}>Current Plan</div>
              <div className="text-white text-xl font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.06em" }}>PRO — $79/vehicle/month</div>
            </div>
            <StatusBadge label="Active" color={NEON} />
          </div>
          <div className="text-[11px] text-[#555]" style={{ fontFamily: "'Syne', sans-serif" }}>4 vehicles · Next billing date: Apr 1, 2026 · Est. total: $316</div>
        </div>
        <div className="text-[9px] tracking-[0.3em] uppercase text-[#555] mb-3" style={{ fontFamily: "'Space Mono', monospace" }}>Invoice History</div>
        <table style={tableStyle}>
          <thead><tr>
            {["Invoice", "Date", "Plan", "Amount", "Status"].map(h => <th key={h} style={{ ...headStyle, textAlign: "left" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {DUMMY_INVOICES.map(inv => (
              <TRow key={inv.id} accent={accent}>
                <td style={cellStyle}><span className="text-white font-bold">{inv.id}</span></td>
                <td style={cellStyle}>{inv.date}</td>
                <td style={cellStyle}>{inv.plan}</td>
                <td style={cellStyle}>{inv.amount}</td>
                <td style={cellStyle}><StatusBadge label={inv.status} color={NEON} /></td>
              </TRow>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ─── ADMIN: Security audit logs ───
  if (action === "Security audit logs") {
    const sevColor = s => s === "critical" ? RED : s === "warn" ? "#FF8C00" : NEON;
    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="text-[11px] text-[#555]" style={{ fontFamily: "'Space Mono', monospace" }}>{DUMMY_AUDIT_LOGS.length} recent events</div>
          <StatusBadge label={`${DUMMY_AUDIT_LOGS.filter(l => l.severity === "critical").length} Critical`} color={RED} />
        </div>
        <div className="flex flex-col gap-2">
          {DUMMY_AUDIT_LOGS.map(log => (
            <div key={log.id} className="p-3 border flex items-start gap-3" style={{ borderColor: `${sevColor(log.severity)}18`, background: `${sevColor(log.severity)}04` }}>
              <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: sevColor(log.severity), boxShadow: `0 0 6px ${sevColor(log.severity)}` }} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white text-[12px] font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>{log.action}</span>
                  <span className="text-[9px] text-[#444] flex-shrink-0 ml-2" style={{ fontFamily: "'Space Mono', monospace" }}>{log.time}</span>
                </div>
                <div className="text-[10px] text-[#555]" style={{ fontFamily: "'Space Mono', monospace" }}>
                  {log.user} · IP: {log.ip}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── ADMIN: Platform configuration ───
  if (action === "Platform configuration") {
    const [configs, setConfigs] = useState({
      twoFactor: true, emailAlerts: true, autoMaintenance: true,
      darkMode: true, gpsTracking: false, apiAccess: true,
      dataExport: true, webhooks: false,
    });
    const toggle = key => setConfigs(p => ({ ...p, [key]: !p[key] }));
    const configItems = [
      { key: "twoFactor", label: "Two-Factor Authentication", desc: "Require 2FA for all user logins" },
      { key: "emailAlerts", label: "Email Alert Notifications", desc: "Send critical alerts via email" },
      { key: "autoMaintenance", label: "Auto Maintenance Scheduling", desc: "Automatically schedule service based on KM thresholds" },
      { key: "darkMode", label: "Dark Mode Default", desc: "Set dark theme as default for all users" },
      { key: "gpsTracking", label: "Real-Time GPS Tracking", desc: "Enable live GPS position logging" },
      { key: "apiAccess", label: "External API Access", desc: "Allow third-party integrations via REST API" },
      { key: "dataExport", label: "Data Export (CSV/PDF)", desc: "Enable bulk data export features" },
      { key: "webhooks", label: "Webhook Notifications", desc: "Push events to external endpoints" },
    ];
    return (
      <div className="flex flex-col gap-3">
        {configItems.map(c => (
          <div key={c.key} className="flex items-center justify-between p-4 border" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#08080b" }}>
            <div>
              <div className="text-[13px] text-white font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>{c.label}</div>
              <div className="text-[10px] text-[#444] mt-0.5" style={{ fontFamily: "'Syne', sans-serif" }}>{c.desc}</div>
            </div>
            <button onClick={() => toggle(c.key)} className="w-11 h-6 rounded-full relative flex-shrink-0 transition-colors"
              style={{ background: configs[c.key] ? accent : "rgba(255,255,255,0.08)", border: "none", cursor: "pointer" }}>
              <div className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white transition-all"
                style={{ left: configs[c.key] ? "calc(100% - 21px)" : "3px", boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }} />
            </button>
          </div>
        ))}
      </div>
    );
  }

  // ─── FLEET MANAGER: Live fleet dashboard ───
  if (action === "Live fleet dashboard") {
    const vData = vehicles.map(v => ({
      ...v, health: calcHealth(v.kmSinceService, v.serviceInterval),
      color: healthColor(calcHealth(v.kmSinceService, v.serviceInterval)),
      label: healthLabel(calcHealth(v.kmSinceService, v.serviceInterval)),
      remaining: v.serviceInterval - v.kmSinceService,
    }));
    const avgHealth = Math.round(vData.reduce((s, v) => s + v.health, 0) / vData.length);
    return (
      <div>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Avg Health", value: `${avgHealth}%`, color: healthColor(avgHealth) },
            { label: "Vehicles", value: vehicles.length, color: ELEC },
            { label: "Critical", value: vData.filter(v => v.health < 15).length, color: vData.filter(v => v.health < 15).length > 0 ? RED : NEON },
          ].map(s => (
            <div key={s.label} className="p-3 border text-center" style={{ borderColor: `${s.color}20`, background: `${s.color}06` }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: s.color, letterSpacing: "0.06em" }}>{s.value}</div>
              <div className="text-[8px] tracking-[0.2em] uppercase" style={{ color: "#444", fontFamily: "'Space Mono', monospace" }}>{s.label}</div>
            </div>
          ))}
        </div>
        {vData.map(v => (
          <div key={v.id} className="p-4 border mb-3" style={{ borderColor: `${v.color}20`, background: "#060608" }}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                <span className="text-white font-bold text-[12px]" style={{ fontFamily: "'Space Mono', monospace" }}>{v.plate}</span>
                <StatusBadge label={v.label} color={v.color} />
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: v.color }}>{v.health}%</div>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="h-full rounded-full" style={{ width: `${v.health}%`, background: v.color, boxShadow: `0 0 8px ${v.color}66`, transition: "width 0.6s" }} />
            </div>
            <div className="flex justify-between text-[10px] text-[#444]" style={{ fontFamily: "'Space Mono', monospace" }}>
              <span>Driver: {v.driver}</span>
              <span>{v.remaining.toLocaleString()} km to service</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ─── FLEET MANAGER: Maintenance scheduling ───
  if (action === "Maintenance scheduling") {
    const prioColor = p => p === "Critical" ? RED : p === "High" ? "#FF8C00" : p === "Normal" ? ELEC : "#666";
    const statColor = s => s === "Overdue" ? RED : s === "Scheduled" ? ELEC : "#666";
    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="text-[11px] text-[#555]" style={{ fontFamily: "'Space Mono', monospace" }}>{DUMMY_MAINTENANCE.length} scheduled tasks</div>
          <StatusBadge label={`${DUMMY_MAINTENANCE.filter(m => m.status === "Overdue").length} Overdue`} color={RED} />
        </div>
        <div className="flex flex-col gap-3">
          {DUMMY_MAINTENANCE.map(m => (
            <div key={m.id} className="p-4 border" style={{ borderColor: `${prioColor(m.priority)}18`, background: "#060608" }}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-[12px]" style={{ fontFamily: "'Space Mono', monospace" }}>{m.vehicle}</span>
                  <StatusBadge label={m.priority} color={prioColor(m.priority)} />
                </div>
                <StatusBadge label={m.status} color={statColor(m.status)} />
              </div>
              <div className="text-[12px] text-[#bbb] mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>{m.type}</div>
              <div className="text-[10px] text-[#444]" style={{ fontFamily: "'Space Mono', monospace" }}>Scheduled: {m.date}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── FLEET MANAGER: Driver assignment ───
  if (action === "Driver assignment") {
    const statColor = s => s === "On Route" ? NEON : s === "At Depot" ? ELEC : RED;
    return (
      <div>
        <table style={tableStyle}>
          <thead><tr>
            {["Vehicle", "Driver", "Shift", "Route", "Status"].map(h => <th key={h} style={{ ...headStyle, textAlign: "left" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {DUMMY_DRIVER_ASSIGNMENTS.map(d => (
              <TRow key={d.vehicle} accent={accent}>
                <td style={cellStyle}><span className="text-white font-bold">{d.vehicle}</span></td>
                <td style={cellStyle}>{d.driver}</td>
                <td style={cellStyle}>{d.shift}</td>
                <td style={cellStyle}>{d.route}</td>
                <td style={cellStyle}><StatusBadge label={d.status} color={statColor(d.status)} /></td>
              </TRow>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ─── FLEET MANAGER: Health alerts ───
  if (action === "Health alerts") {
    const sevColor = s => s === "critical" ? RED : s === "warning" ? "#FF8C00" : NEON;
    return (
      <div className="flex flex-col gap-3">
        {DUMMY_HEALTH_ALERTS.map(a => (
          <div key={a.id} className="p-4 border flex items-start gap-3" style={{ borderColor: `${sevColor(a.severity)}20`, background: `${sevColor(a.severity)}04` }}>
            <motion.div animate={a.severity === "critical" ? { opacity: [0.5, 1, 0.5] } : {}} transition={{ duration: 1.4, repeat: Infinity }}
              className="w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0" style={{ background: sevColor(a.severity), boxShadow: `0 0 8px ${sevColor(a.severity)}` }} />
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <span className="text-white font-bold text-[12px]" style={{ fontFamily: "'Space Mono', monospace" }}>{a.vehicle}</span>
                <span className="text-[9px] text-[#444]" style={{ fontFamily: "'Space Mono', monospace" }}>{a.time}</span>
              </div>
              <div className="text-[12px] text-[#bbb]" style={{ fontFamily: "'Syne', sans-serif" }}>{a.message}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ─── DRIVER: Odometer logging ───
  if (action === "Odometer logging") {
    const [tripForm, setTripForm] = useState({ vehicleId: "", km: "", notes: "" });
    const [tripDone, setTripDone] = useState(false);
    const setT = k => e => setTripForm(p => ({ ...p, [k]: e.target.value }));
    const handleTrip = e => {
      e.preventDefault();
      const km = parseInt(tripForm.km, 10);
      if (!km || km <= 0) return;
      if (onLogTrip) onLogTrip(parseInt(tripForm.vehicleId), km);
      setTripDone(true);
    };
    if (tripDone) {
      return (
        <div className="text-center py-6">
          <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center" style={{ background: `${NEON}15`, border: `1px solid ${NEON}40` }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={NEON} strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
          </div>
          <div className="text-white text-xl font-bold mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.06em" }}>TRIP LOGGED</div>
          <p className="text-[#555] text-sm mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>{tripForm.km} km recorded successfully.</p>
          <ModalButton onClick={() => { setTripDone(false); setTripForm({ vehicleId: "", km: "", notes: "" }); }} variant="outline">Log Another Trip</ModalButton>
        </div>
      );
    }
    return (
      <form onSubmit={handleTrip} className="flex flex-col gap-5">
        <p className="text-[#555] text-[13px] leading-relaxed" style={{ fontFamily: "'Syne', sans-serif" }}>Enter your trip distance. Health scores update instantly.</p>
        <div>
          <label className="block mb-2 text-[10px] tracking-[0.35em] uppercase" style={{ color: "#3a3a3a", fontFamily: "'Space Mono', monospace" }}>Select Vehicle</label>
          <select value={tripForm.vehicleId} onChange={setT("vehicleId")} required
            style={{ width: "100%", background: "#060608", border: "1px solid rgba(255,255,255,0.07)", color: tripForm.vehicleId ? "#fff" : "#444", fontFamily: "'Syne', sans-serif", fontSize: 14, padding: "11px 14px", outline: "none" }}>
            <option value="" disabled style={{ background: "#060608" }}>Select vehicle…</option>
            {vehicles.map(v => <option key={v.id} value={v.id} style={{ background: "#060608" }}>{v.plate} — {v.driver}</option>)}
          </select>
        </div>
        <ModalInput label="KM Driven This Trip" type="number" value={tripForm.km} onChange={setT("km")} placeholder="e.g. 150" required min="1" step="1" />
        <ModalInput label="Notes (optional)" value={tripForm.notes} onChange={setT("notes")} placeholder="Route, cargo, conditions…" />
        <ModalButton type="submit" variant="yellow">Log Trip →</ModalButton>
      </form>
    );
  }

  // ─── DRIVER: Trip reports ───
  if (action === "Trip reports") {
    const trips = DRIVER_TRIP_REPORTS[username?.toLowerCase()] || [];
    const totalKm = trips.reduce((s, t) => s + t.km, 0);
    return (
      <div>
        <div className="flex gap-3 mb-6">
          <div className="flex-1 p-3 border text-center" style={{ borderColor: `${accent}20`, background: `${accent}06` }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: accent }}>{trips.length}</div>
            <div className="text-[8px] tracking-[0.2em] uppercase text-[#444]" style={{ fontFamily: "'Space Mono', monospace" }}>Trips</div>
          </div>
          <div className="flex-1 p-3 border text-center" style={{ borderColor: `${accent}20`, background: `${accent}06` }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: accent }}>{totalKm.toLocaleString()}</div>
            <div className="text-[8px] tracking-[0.2em] uppercase text-[#444]" style={{ fontFamily: "'Space Mono', monospace" }}>Total KM</div>
          </div>
        </div>
        <table style={tableStyle}>
          <thead><tr>
            {["Date", "From", "To", "KM", "Duration", "Fuel"].map(h => <th key={h} style={{ ...headStyle, textAlign: "left" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {trips.map(t => (
              <TRow key={t.id} accent={accent}>
                <td style={cellStyle}><span className="text-white">{t.date}</span></td>
                <td style={cellStyle}>{t.from}</td>
                <td style={cellStyle}>{t.to}</td>
                <td style={cellStyle}><span className="text-white font-bold">{t.km}</span></td>
                <td style={cellStyle}>{t.duration}</td>
                <td style={cellStyle}>{t.fuelUsed}</td>
              </TRow>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ─── DRIVER: Vehicle health (filtered to driver's assigned vehicle) ───
  if (action === "Vehicle health") {
    const driverName = username?.toLowerCase();
    const myVehicles = vehicles.filter(v => v.driver.toLowerCase() === driverName);
    const displayVehicles = myVehicles.length > 0 ? myVehicles : vehicles;
    const vData = displayVehicles.map(v => ({
      ...v, health: calcHealth(v.kmSinceService, v.serviceInterval),
      color: healthColor(calcHealth(v.kmSinceService, v.serviceInterval)),
      label: healthLabel(calcHealth(v.kmSinceService, v.serviceInterval)),
      remaining: v.serviceInterval - v.kmSinceService,
    }));
    return (
      <div className="flex flex-col gap-3">
        {vData.map(v => (
          <div key={v.id} className="p-4 border" style={{ borderColor: `${v.color}20`, background: "#060608" }}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-[12px]" style={{ fontFamily: "'Space Mono', monospace" }}>{v.plate}</span>
                <StatusBadge label={v.label} color={v.color} />
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: v.color }}>{v.health}%</div>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="h-full rounded-full" style={{ width: `${v.health}%`, background: v.color, transition: "width 0.6s" }} />
            </div>
            <div className="flex justify-between text-[10px] text-[#444]" style={{ fontFamily: "'Space Mono', monospace" }}>
              <span>Driver: {v.driver}</span>
              <span>{v.remaining.toLocaleString()} km to service</span>
            </div>
            {v.health < 15 && onMarkServiced && (
              <button onClick={() => onMarkServiced(v.id)} className="mt-3 w-full py-2 text-[10px] tracking-[0.25em] uppercase"
                style={{ background: `${RED}12`, border: `1px solid ${RED}40`, color: RED, fontFamily: "'Space Mono', monospace", cursor: "pointer" }}>
                ✓ Mark as Serviced
              </button>
            )}
          </div>
        ))}
      </div>
    );
  }

  // ─── DRIVER: Service history (per-driver) ───
  if (action === "Service history") {
    const history = DRIVER_SERVICE_HISTORY[username?.toLowerCase()] || [];
    return (
      <div>
        <table style={tableStyle}>
          <thead><tr>
            {["Date", "Service Type", "Workshop", "Cost", "KM at Service"].map(h => <th key={h} style={{ ...headStyle, textAlign: "left" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {history.map(s => (
              <TRow key={s.id} accent={accent}>
                <td style={cellStyle}><span className="text-white">{s.date}</span></td>
                <td style={cellStyle}><span className="text-white font-bold">{s.type}</span></td>
                <td style={cellStyle}>{s.workshop}</td>
                <td style={cellStyle}>{s.cost}</td>
                <td style={cellStyle}>{s.kmAtService.toLocaleString()} km</td>
              </TRow>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Fallback
  return <div className="text-[#555] text-sm py-8 text-center" style={{ fontFamily: "'Syne', sans-serif" }}>This module is under development.</div>;
}

// ════════════════════════════════════════════════════════════
// ROLE PORTAL SECTION
// ════════════════════════════════════════════════════════════
function RolePortalSection({ onSelectRole }) {
  const roles = [
    { name: "Admin", color: RED, desc: "System configuration, user management, and billing. The core control layer." },
    { name: "Fleet Manager", color: ELEC, desc: "Day-to-day operations, vehicle tracking, and maintenance alerts." },
    { name: "Driver", color: NEON, desc: "Log odometer entries, report trips, and check assigned vehicle health." }
  ];

  return (
    <section id="portal" className="py-28 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
      <div className="max-w-[1380px] mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <Reveal><Eyebrow>Access Portals</Eyebrow></Reveal>
          <SplitHeading text="ENTER YOUR WORKSPACE." style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(38px,5.5vw,78px)", lineHeight: 0.9, color: "#fff", marginBottom: "1rem" }} center delay={0.1} />
          <Reveal delay={0.2}>
            <p className="text-[#555] text-lg max-w-lg mx-auto leading-relaxed" style={{ fontFamily: "'Syne', sans-serif" }}>
              Secure portals tailored specifically for your operational role.
            </p>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((r, i) => (
            <Reveal key={r.name} delay={0.2 + i * 0.1}>
              <div
                onClick={() => onSelectRole(r.name)}
                className="p-10 border transition-all cursor-pointer relative overflow-hidden group"
                style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0a0a0d' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${r.color}40`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at top right, ${r.color}15, transparent 60%)` }} />

                <div className="w-12 h-12 mb-6 border flex items-center justify-center rounded-full" style={{ borderColor: `${r.color}40`, background: `${r.color}10` }}>
                  <div className="w-3 h-3 rounded-full" style={{ background: r.color, boxShadow: `0 0 10px ${r.color}` }} />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 tracking-wide" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}>{r.name} ACCESS</h3>
                <p className="text-[13px] text-[#555] mb-8 leading-relaxed" style={{ fontFamily: "'Syne', sans-serif" }}>{r.desc}</p>

                <div className="text-[10px] tracking-[0.3em] uppercase flex items-center gap-2 transition-colors" style={{ color: r.color, fontFamily: "'Space Mono', monospace" }}>
                  Login to Portal →
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════════
// GLOBAL CSS (injected into head)
// ════════════════════════════════════════════════════════════
const globalStyle = `
  .grid-bg {
    background-image:
      linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
    background-size: 60px 60px;
  }
  .noise::after {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    opacity: 0.028;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 160px 160px;
    z-index: 999;
  }
  /* btn-yellow = solid electric purple */
  .btn-yellow {
    background: #BF00FF;
    color: #060608;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s;
  }
  .btn-yellow:hover {
    background: #cf1aff;
    box-shadow: 0 0 32px rgba(191,0,255,0.35);
  }
  /* btn-outline = bordered ghost */
  .btn-outline {
    background: transparent;
    color: #fff;
    font-family: 'Syne', sans-serif;
    font-weight: 600;
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border: 1px solid rgba(255,255,255,0.18);
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s, box-shadow 0.2s;
  }
  .btn-outline:hover {
    border-color: rgba(191,0,255,0.55);
    color: #BF00FF;
    box-shadow: 0 0 24px rgba(191,0,255,0.12);
  }
  @keyframes marquee {
    0%   { transform: translateX(0%); }
    100% { transform: translateX(-50%); }
  }
  .animate-marquee { animation: marquee 40s linear infinite; }
`;

// ════════════════════════════════════════════════════════════
// ROOT APP
// ════════════════════════════════════════════════════════════
export default function App() {
  // ── Modal state ──
  const [deployOpen, setDeployOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [vehicleHealthOpen, setVehicleHealthOpen] = useState(false);
  const [tripLogOpen, setTripLogOpen] = useState(false);
  const [featureModalTitle, setFeatureModalTitle] = useState(null);
  const [infoModalTitle, setInfoModalTitle] = useState(null);
  const [portalOpen, setPortalOpen] = useState(false);
  const [portalRole, setPortalRole] = useState("Admin");

  // ── Vehicles state — drives live health scores across all sections ──
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);

  // ── Handlers ──
  const openDeploy = () => setDeployOpen(true);
  const openSignIn = () => setSignInOpen(true);
  const openDemo = () => setDemoOpen(true);
  const openExplore = () => setExploreOpen(true);
  const openHealth = () => setVehicleHealthOpen(true);
  const openTripLog = () => setTripLogOpen(true);
  const openInfo = (title) => setInfoModalTitle(title);
  const openPortal = (role) => { setPortalRole(role); setPortalOpen(true); };

  const handleFeatureClick = (title) => {
    if (title === "Vehicle Health Monitor") { openHealth(); return; }
    if (title === "Odometer Logging") { openTripLog(); return; }
    if (title === "Role-Based Access Control") { openExplore(); return; }
    setFeatureModalTitle(title);
  };

  const handleLogTrip = (vehicleId, km) => {
    setVehicles(prev => prev.map(v => v.id === vehicleId
      ? { ...v, kmSinceService: v.kmSinceService + km, totalKm: v.totalKm + km }
      : v
    ));
  };

  const handleMarkServiced = (vehicleId) => {
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, kmSinceService: 0 } : v));
  };

  // Inject global styles
  useEffect(() => {
    const tag = document.createElement("style");
    tag.textContent = globalStyle;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

  return (
    <div className="noise min-h-screen bg-[#060608] text-white overflow-x-hidden">
      <Navbar onDeploy={openDeploy} onSignIn={openSignIn} onDemo={openDemo} />
      <Hero onDeploy={openDeploy} onDemo={openDemo} vehicles={vehicles} />
      <MarqueeStrip />
      <Stats />
      <Features onFeatureClick={handleFeatureClick} />
      <Showcase onExplore={openExplore} vehicles={vehicles} />
      <Process />
      <RolePortalSection onSelectRole={openPortal} />
      <Pricing onDeploy={openDeploy} onDemo={openDemo} />
      <CTA onDeploy={openDeploy} onDemo={openDemo} />
      <Footer onDeploy={openDeploy} onDemo={openDemo} onInfo={openInfo} />

      {/* ── Modals ── */}
      <DeployModal open={deployOpen} onClose={() => setDeployOpen(false)} />
      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} onSwitchToSignup={openDeploy} />
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
      <PortalLoginModal open={portalOpen} onClose={() => setPortalOpen(false)} role={portalRole} vehicles={vehicles} onLogTrip={handleLogTrip} onMarkServiced={handleMarkServiced} />
      <ExploreModal open={exploreOpen} onClose={() => setExploreOpen(false)} onDeploy={openDeploy} />
      <VehicleHealthModal open={vehicleHealthOpen} onClose={() => setVehicleHealthOpen(false)} vehicles={vehicles} onMarkServiced={handleMarkServiced} />
      <TripLogModal open={tripLogOpen} onClose={() => setTripLogOpen(false)} vehicles={vehicles} onLogTrip={handleLogTrip} />
      <FeatureDetailModal
        open={!!featureModalTitle}
        onClose={() => setFeatureModalTitle(null)}
        featureTitle={featureModalTitle}
        onDeploy={openDeploy}
        onExplore={openExplore}
        onTripLog={openTripLog}
        onHealth={openHealth}
      />
      <InfoModal open={!!infoModalTitle} onClose={() => setInfoModalTitle(null)} title={infoModalTitle} />
    </div>
  );
}