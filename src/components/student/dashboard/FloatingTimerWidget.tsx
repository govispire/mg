/**
 * FloatingTimerWidget — completely self-contained.
 *
 * ✅ No context dependency (avoids React tree issues)
 * ✅ Portal on document.body (avoids CSS containment traps)
 * ✅ Listens to timerBus for start signal (cross-module communication)
 * ✅ Own interval for tick (clean, no external dependency)
 * ✅ Position saved to localStorage
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import {
  Play, Pause, RotateCcw, X,
  Lock, Flame, ChevronDown, ChevronUp, GripVertical, AlertTriangle, Timer,
} from 'lucide-react';
import { timerBus } from '@/store/timerBus';

// ── types ─────────────────────────────────────────────────────────────────────
type WState = {
  active:       boolean;
  mins:         number;
  remaining:    number;
  running:      boolean;
  done:         boolean;
  strict:       boolean;
  paused:       boolean;
  pauseWarnings: number;
  sessions:     number;
  invalidated:  boolean;
  tabAway:      boolean;
  tabLeft:      number | null;   // Date.now() when tab became hidden
  tabAwayPhase: 'warn' | 'critical' | null; // warn = 3-5min, critical = <1min left
};

// ── helpers ───────────────────────────────────────────────────────────────────
const fmt = (s: number) => {
  const v = Math.max(0, Math.floor(s));
  return `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`;
};

const getPos = () => {
  try {
    const p = JSON.parse(localStorage.getItem('tw-pos') || 'null');
    if (p && typeof p.x === 'number' && typeof p.y === 'number') return p as { x: number; y: number };
  } catch {}
  return { x: Math.max(8, window.innerWidth - 272), y: Math.max(8, window.innerHeight - 340) };
};

const sessions0 = () => {
  try { return parseInt(localStorage.getItem('focus_sessions') || '0', 10); } catch { return 0; }
};

// Away limits (strict mode)
const AWAY_WARN_MS  = 3 * 60 * 1000; // show warning after 3 min
const AWAY_LIMIT_MS = 5 * 60 * 1000; // invalidate after 5 min

// ── Initial state ─────────────────────────────────────────────────────────────
const INIT: WState = {
  active: false, mins: 25, remaining: 25 * 60,
  running: false, done: false, strict: false,
  paused: false, pauseWarnings: 0,
  sessions: sessions0(), invalidated: false,
  tabAway: false, tabLeft: null,
};

// ── Widget UI (inner component, always has access to own state) ───────────────
const WidgetUI: React.FC<{
  s: WState;
  pos: { x: number; y: number };
  collapsed: boolean;
  onToggleCollapse: () => void;
  onPause:    () => void;
  onReset:    () => void;
  onClose:    () => void;
  onFullscreen: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  boxRef: React.RefObject<HTMLDivElement | null>;
}> = ({ s, pos, collapsed, onToggleCollapse, onPause, onReset, onClose, onFullscreen, onMouseDown, boxRef }) => {
  const total  = s.mins * 60;
  const pct    = total > 0 ? Math.min(100, ((total - s.remaining) / total) * 100) : 0;
  const urgent = s.remaining < 60 && s.running && !s.done;
  const S = 72, sw = 6, r = (S - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash  = circ * (1 - pct / 100);
  const col   = s.done ? '#10b981' : s.invalidated ? '#ef4444' : urgent ? '#f97316' : '#22c55e';
  const ang   = (pct / 100) * 2 * Math.PI - Math.PI / 2;
  const tX    = S / 2 + r * Math.cos(ang);
  const tY    = S / 2 + r * Math.sin(ang);
  const bdr   = s.invalidated || s.tabAway
    ? 'rgba(239,68,68,0.5)' : s.strict ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.11)';

  return (
    <div
      ref={boxRef}
      style={{
        position: 'fixed', left: pos.x, top: pos.y,
        zIndex: 2147483647,
        width: collapsed ? 'auto' : 252,
        userSelect: 'none', touchAction: 'none',
        filter: 'drop-shadow(0 16px 48px rgba(0,0,0,0.75))',
        fontFamily: "'Inter','Outfit',sans-serif",
      }}
    >
      <div style={{
        borderRadius: 20, overflow: 'hidden',
        background: 'rgba(4,7,18,0.98)',
        backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
        border: `1.5px solid ${bdr}`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 0 0 1px rgba(0,0,0,0.4)',
      }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div onMouseDown={onMouseDown} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: collapsed ? '11px 12px' : '10px 12px 8px',
          cursor: 'grab',
          borderBottom: collapsed ? 'none' : '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <GripVertical size={11} color="rgba(255,255,255,0.2)" />
            <Timer size={11} color="#34d399" />
            {collapsed
              ? <span style={{ fontSize: 17, fontWeight: 900, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums',
                               color: s.done ? '#10b981' : urgent ? '#f97316' : '#fff' }}>
                  {s.done ? '✓' : fmt(s.remaining)}
                </span>
              : <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Study Timer
                </span>}
            {s.strict && !s.invalidated && <Lock size={9} color="#34d399" />}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IB onClick={onToggleCollapse}>{collapsed ? <ChevronDown size={11}/> : <ChevronUp size={11}/>}</IB>
            {(!s.strict || s.done || s.invalidated)
              ? <IB onClick={onClose} danger><X size={11}/></IB>
              : <div style={{ padding: 4, color: 'rgba(52,211,153,0.25)' }}><Lock size={9}/></div>}
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        {!collapsed && (
          <div style={{ padding: '10px 12px 12px' }}>
            {s.invalidated ? (
              <div style={{ textAlign:'center', padding:'6px 0' }}>
                <div style={{ fontSize:28 }}>⛔</div>
                <p style={{ color:'#f87171', fontWeight:700, fontSize:12, margin:'6px 0 2px' }}>Session Not Counted</p>
                <p style={{ color:'rgba(255,255,255,0.3)', fontSize:9, margin:0 }}>Away &gt;5 min in Strict Mode</p>
                <button onClick={onClose} style={sb({})}>Dismiss</button>
              </div>
            ) : (
              <>
                {/* Tab-away */}
                {s.tabAway && s.tabLeft !== null && (
                  <div style={{ display:'flex', gap:6, borderRadius:10, padding:'6px 8px', marginBottom:10,
                    background: s.tabAwayPhase === 'critical' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.12)',
                    border: `1px solid ${s.tabAwayPhase === 'critical' ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.35)'}`,
                  }}>
                    <AlertTriangle size={11} color={s.tabAwayPhase === 'critical' ? '#f87171' : '#fbbf24'} style={{ flexShrink:0, marginTop:1 }} />
                    <div>
                      <p style={{ color: s.tabAwayPhase === 'critical' ? '#fca5a5' : '#fde68a', fontWeight:700, fontSize:9, margin:0 }}>
                        {s.tabAwayPhase === 'critical' ? '🚨 Return NOW!' : '⚠ You left the tab!'}
                      </p>
                      <p style={{ color: s.tabAwayPhase === 'critical' ? 'rgba(252,165,165,0.6)' : 'rgba(253,230,138,0.6)', fontSize:8, margin:'2px 0 0' }}>
                        Closes in <b style={{ color: s.tabAwayPhase === 'critical' ? '#fca5a5' : '#fde68a' }}>{fmt(Math.max(0, Math.round((AWAY_LIMIT_MS - (Date.now() - (s.tabLeft ?? Date.now()))) / 1000)))}</b>
                      </p>
                    </div>
                  </div>
                )}

                {/* Circular ring + time */}
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                  <div style={{ position:'relative', width:S, height:S, flexShrink:0 }}>
                    {s.running && (
                      <div style={{ position:'absolute', borderRadius:'50%', width:r*1.6, height:r*1.6,
                                    background:`${col}18`, top:'50%', left:'50%',
                                    transform:'translate(-50%,-50%)', filter:'blur(10px)', pointerEvents:'none' }} />
                    )}
                    <svg viewBox={`0 0 ${S} ${S}`} width={S} height={S}
                         style={{ transform:'rotate(-90deg)', position:'absolute', inset:0, overflow:'visible' }}>
                      <circle cx={S/2} cy={S/2} r={r} fill="rgba(6,10,28,0.99)" stroke="rgba(255,255,255,0.08)" strokeWidth={sw}/>
                      <circle cx={S/2} cy={S/2} r={r} fill="none" stroke={col} strokeWidth={sw}
                              strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dash}
                              style={{ filter:`drop-shadow(0 0 6px ${col}cc)`, transition:'stroke-dashoffset .5s linear, stroke .3s' }}/>
                      {pct > 1 && pct < 99 && <circle cx={tX} cy={tY} r={sw/2+1.5} fill={col} style={{ filter:`drop-shadow(0 0 4px ${col})` }}/>}
                    </svg>
                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {s.done ? <span style={{ fontSize:18 }}>🎉</span>
                               : <span style={{ fontSize:9, fontWeight:900, color:urgent?'#f97316':'rgba(255,255,255,0.75)' }}>{Math.round(pct)}%</span>}
                    </div>
                  </div>

                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:32, fontWeight:900, color:s.done?'#10b981':urgent?'#f97316':'#fff',
                                  letterSpacing:'-0.03em', lineHeight:1, fontVariantNumeric:'tabular-nums' }}>
                      {s.done ? 'Done!' : fmt(s.remaining)}
                    </div>
                    <div style={{ fontSize:9, marginTop:5, fontWeight:600,
                                  color:s.done?'#34d399':s.running?'#22c55e':'rgba(255,255,255,0.3)' }}>
                      {s.done?`✓ +${s.mins}m logged`:s.running?'● Running':s.strict?'⚠ Strict · Paused':'❚❚ Paused'}
                    </div>
                    {s.strict && !s.done && s.pauseWarnings > 0 && (
                      <div style={{ fontSize:8, color:'#fbbf24', marginTop:2 }}>⚠ {s.pauseWarnings} pause attempt{s.pauseWarnings>1?'s':''}</div>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ height:3, borderRadius:99, background:'rgba(255,255,255,0.07)', marginBottom:10, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, borderRadius:99,
                                background:s.done?'#10b981':urgent?'#f97316':'linear-gradient(90deg,#15803d,#22c55e)',
                                boxShadow:`0 0 8px ${col}88`, transition:'width .5s linear' }}/>
                </div>

                {/* Controls */}
                <div style={{ display:'flex', gap:6 }}>
                  {s.done ? (
                    <button onClick={onReset} style={sb({ primary:true, flex:true })}><RotateCcw size={10}/> New Session</button>
                  ) : s.strict && s.running ? (
                    <div style={{ flex:1, padding:'6px 0', borderRadius:10, textAlign:'center', fontSize:9, fontWeight:700, background:'rgba(16,185,129,0.07)', border:'1px solid rgba(16,185,129,0.2)', color:'#34d399' }}>
                      🔥 Locked · Stay focused!
                    </div>
                  ) : (
                    <>
                      <button onClick={onPause}
                        style={s.running ? sb({ flex:true, outline:true, outlineColor:'rgba(34,197,94,0.3)', textColor:'#22c55e' }) : sb({ flex:true, primary:true })}>
                        {s.running ? <><Pause size={10}/> Pause</> : <><Play size={10}/> Resume</>}
                      </button>
                      {!s.strict && <IB onClick={onReset} title="Reset"><RotateCcw size={10}/></IB>}
                    </>
                  )}
                </div>

                {s.sessions > 0 && (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4, marginTop:8 }}>
                    <Flame size={10} color="#fb923c"/>
                    <span style={{ fontSize:8, color:'#34d399', fontWeight:700 }}>{s.sessions} session{s.sessions>1?'s':''} today</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {!collapsed && (
        <div style={{ textAlign:'center', marginTop:3 }}>
          <span style={{ fontSize:7, color:'rgba(255,255,255,0.12)', userSelect:'none' }}>⠿ drag to move</span>
        </div>
      )}
    </div>
  );
};

// ── Style helpers ─────────────────────────────────────────────────────────────
type SOpts = { primary?: boolean; outline?: boolean; outlineColor?: string; textColor?: string; flex?: boolean };
const sb = (o: SOpts): React.CSSProperties => ({
  ...(o.flex ? { flex:1 } : {}),
  display:'flex', alignItems:'center', justifyContent:'center', gap:4,
  padding:'7px 8px', borderRadius:10, cursor:'pointer', fontSize:10, fontWeight:700,
  border: o.outline ? `1px solid ${o.outlineColor ?? 'rgba(255,255,255,0.15)'}` : 'none',
  background: o.primary ? 'linear-gradient(135deg,#059669,#10b981)' : 'transparent',
  color: o.primary ? '#fff' : o.textColor ?? 'rgba(255,255,255,0.5)',
});
const IB: React.FC<{ onClick: () => void; title?: string; danger?: boolean; children: React.ReactNode }> =
  ({ onClick, title, danger, children }) => (
    <button onClick={onClick} title={title}
      style={{ padding:4, borderRadius:6, background:'transparent', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.3)', display:'flex', alignItems:'center' }}
      onMouseEnter={e => (e.currentTarget.style.color = danger?'#f87171':'rgba(255,255,255,0.9)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
    >{children}</button>
  );

// ── Main exported widget ──────────────────────────────────────────────────────
const FloatingTimerWidget: React.FC = () => {
  const [ws,       setWs]       = useState<WState>(INIT);
  const [pos,      setPos]      = useState(getPos);
  const [collapsed,setCollapsed]= useState(false);
  const boxRef   = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const mStart   = useRef({ x:0, y:0 });
  const pStart   = useRef({ x:0, y:0 });
  const tickRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Listen for start signal ──────────────────────────────────────────────
  useEffect(() => {
    return timerBus.onStart(({ mins, strict }) => {
      if (tickRef.current) clearInterval(tickRef.current);
      setWs({
        active: true, mins, remaining: mins * 60,
        running: true, done: false, strict,
        paused: false, pauseWarnings: 0,
        sessions: sessions0(),
        invalidated: false, tabAway: false, tabLeft: null, tabAwayPhase: null,
      });
      setCollapsed(false);
    });
  }, []);

  // ── Tick ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ws.active || !ws.running || ws.done) {
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
      return;
    }
    tickRef.current = setInterval(() => {
      setWs(prev => {
        if (!prev.running || prev.done) return prev;

        // Strict tab-away check: invalidate if away >= 5 min
        if (prev.strict && prev.tabAway && prev.tabLeft !== null) {
          const awayMs = Date.now() - prev.tabLeft;
          if (awayMs >= AWAY_LIMIT_MS) {
            clearInterval(tickRef.current!);
            return { ...prev, running: false, invalidated: true, tabAway: false, tabAwayPhase: null };
          }
          // Update phase: warn after 3 min, critical in last 60 sec
          const secsLeft = Math.round((AWAY_LIMIT_MS - awayMs) / 1000);
          const phase: WState['tabAwayPhase'] = awayMs >= AWAY_WARN_MS
            ? (secsLeft <= 60 ? 'critical' : 'warn')
            : null;
          if (phase !== prev.tabAwayPhase) {
            return { ...prev, tabAwayPhase: phase };
          }
        }

        const next = prev.remaining - 1;
        if (next <= 0) {
          clearInterval(tickRef.current!);
          const sessions = prev.sessions + 1;
          const total    = parseInt(localStorage.getItem('total_study_mins') || '0', 10) + prev.mins;
          try {
            localStorage.setItem('focus_sessions',   String(sessions));
            localStorage.setItem('total_study_mins', String(total));
            const arr = JSON.parse(localStorage.getItem('study_sessions') || '[]');
            arr.push({ mins: prev.mins, date: new Date().toISOString() });
            localStorage.setItem('study_sessions', JSON.stringify(arr.slice(-50)));
            // Monthly aggregation
            const mKey = `study_monthly_${new Date().toISOString().slice(0, 7)}`;
            const mCur = JSON.parse(localStorage.getItem(mKey) || '{"mins":0,"sessions":0}');
            localStorage.setItem(mKey, JSON.stringify({ mins: mCur.mins + prev.mins, sessions: mCur.sessions + 1 }));
          } catch {}
          return { ...prev, remaining: 0, running: false, done: true, sessions };
        }
        return { ...prev, remaining: next };
      });
    }, 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [ws.active, ws.running, ws.done]);

  // ── Tab-away (strict mode only) ────────────────────────────────────
  useEffect(() => {
    if (!ws.strict || !ws.running) return;
    const h = () => {
      if (document.hidden) {
        // Student left the tab — start tracking
        setWs(prev => ({ ...prev, tabAway: true, tabLeft: Date.now(), tabAwayPhase: null }));
      } else {
        // Student returned
        setWs(prev => {
          if (prev.tabLeft !== null && Date.now() - prev.tabLeft >= AWAY_LIMIT_MS) {
            if (tickRef.current) clearInterval(tickRef.current);
            return { ...prev, running: false, invalidated: true, tabAway: false, tabLeft: null, tabAwayPhase: null };
          }
          return { ...prev, tabAway: false, tabLeft: null, tabAwayPhase: null };
        });
      }
    };
    document.addEventListener('visibilitychange', h);
    return () => document.removeEventListener('visibilitychange', h);
  }, [ws.strict, ws.running]);

  // ── Auto-expand on finish ──────────────────────────────────────────────
  useEffect(() => {
    if (ws.done || ws.invalidated) setCollapsed(false);
  }, [ws.done, ws.invalidated]);

  // ── Drag ────────────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button,a,input')) return;
    e.preventDefault();
    dragging.current = true;
    mStart.current   = { x: e.clientX, y: e.clientY };
    pStart.current   = { ...pos };
  }, [pos]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const W = boxRef.current?.offsetWidth  ?? 252;
      const H = boxRef.current?.offsetHeight ?? 320;
      const nx = Math.max(0, Math.min(pStart.current.x + e.clientX - mStart.current.x, window.innerWidth  - W));
      const ny = Math.max(0, Math.min(pStart.current.y + e.clientY - mStart.current.y, window.innerHeight - H));
      setPos({ x: nx, y: ny });
    };
    const onUp = () => { dragging.current = false; try { localStorage.setItem('tw-pos', JSON.stringify(pos)); } catch {} };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, [pos]);

  // ── Actions ─────────────────────────────────────────────────────────────
  const onPause = () => setWs(prev => {
    if (prev.strict && prev.running) return { ...prev, pauseWarnings: prev.pauseWarnings + 1 };
    return { ...prev, running: !prev.running };
  });

  const onReset = () => setWs(prev => ({
    ...prev, running: false, done: false, invalidated: false,
    remaining: prev.mins * 60, pauseWarnings: 0, tabAway: false, tabLeft: null,
  }));

  const onClose = () => {
    if (tickRef.current) clearInterval(tickRef.current);
    setWs(INIT);
  };

  const onFullscreen = () => {
    // TODO: switch to fullscreen mode in StudyTimerWidget if needed
    onClose();
  };

  // ── Render ─────────────────────────────────────────────────────────────
  if (!ws.active) return null;

  return ReactDOM.createPortal(
    <WidgetUI
      s={ws} pos={pos} collapsed={collapsed}
      onToggleCollapse={() => setCollapsed(c => !c)}
      onPause={onPause} onReset={onReset}
      onClose={onClose} onFullscreen={onFullscreen}
      onMouseDown={onMouseDown} boxRef={boxRef}
    />,
    document.body,
  );
};

export default FloatingTimerWidget;
