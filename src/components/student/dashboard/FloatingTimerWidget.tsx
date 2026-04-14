/**
 * FloatingTimerWidget — reads ALL state from useTimerStore.
 *
 * ✅ No own tick interval (tick is driven by StudyTimerWidget's useEffect)
 * ✅ Only renders when mode === 'widget' && active === true
 * ✅ Close → store.closeWidget() → session ENDS (no background running)
 * ✅ Portal on document.body (avoids CSS containment traps)
 * ✅ Draggable, position saved to store (persisted)
 */
import React, { useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import {
  Play, Pause, RotateCcw, X,
  Lock, Flame, ChevronDown, ChevronUp, GripVertical, AlertTriangle, Timer,
} from 'lucide-react';
import { useTimerStore } from '@/store/useTimerStore';
import { useState } from 'react';

// ── helpers ───────────────────────────────────────────────────────────────────
const fmt = (s: number) => {
  const v = Math.max(0, Math.floor(s));
  return `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`;
};

// ── Tick for widget mode (lives here so FloatingTimerWidget drives ticks when active) ──
// NOTE: StudyTimerWidget also drives ticks. Both components subscribe to the same store;
//       whichever is mounted will drive the tick. Only one should be mounted at a time.

// ── Style helpers ─────────────────────────────────────────────────────────────
type SOpts = { primary?: boolean; outline?: boolean; outlineColor?: string; textColor?: string; flex?: boolean };
const sb = (o: SOpts): React.CSSProperties => ({
  ...(o.flex ? { flex: 1 } : {}),
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
  padding: '7px 8px', borderRadius: 10, cursor: 'pointer', fontSize: 10, fontWeight: 700,
  border: o.outline ? `1px solid ${o.outlineColor ?? 'rgba(255,255,255,0.15)'}` : 'none',
  background: o.primary ? 'linear-gradient(135deg,#059669,#10b981)' : 'transparent',
  color: o.primary ? '#fff' : o.textColor ?? 'rgba(255,255,255,0.5)',
});
const IB: React.FC<{ onClick: () => void; title?: string; danger?: boolean; children: React.ReactNode }> =
  ({ onClick, title, danger, children }) => (
    <button onClick={onClick} title={title}
      style={{ padding: 4, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer',
               color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center' }}
      onMouseEnter={e => (e.currentTarget.style.color = danger ? '#f87171' : 'rgba(255,255,255,0.9)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
    >{children}</button>
  );

// ── Main exported widget ──────────────────────────────────────────────────────
const FloatingTimerWidget: React.FC = () => {
  const {
    active, mode, running, done, invalidated,
    remaining, selectedMins: mins, strictMode: strict,
    tabAwayWarning: tabAway, tabAwaySecsLeft, tabAwayPhase,
    pauseWarnings, focusSessions,
    widgetX, widgetY,
    pauseResume, resetTimer, closeWidget, setWidgetPos,
    tick, onTabHidden, onTabVisible,
  } = useTimerStore();

  const [collapsed, setCollapsed] = useState(false);
  const boxRef   = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const mStart   = useRef({ x: 0, y: 0 });
  const pStart   = useRef({ x: 0, y: 0 });

  // ── Tick (widget mode drives its own tick here) ───────────────────────────
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (!active || mode !== 'widget' || !running) return;
    tickRef.current = setInterval(() => tick(), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [active, mode, running, tick]);

  // ── Tab-away (strict mode only) ───────────────────────────────────────────
  useEffect(() => {
    if (!active || mode !== 'widget' || !strict) return;
    const h = () => document.hidden ? onTabHidden() : onTabVisible();
    document.addEventListener('visibilitychange', h);
    return () => document.removeEventListener('visibilitychange', h);
  }, [active, mode, strict, onTabHidden, onTabVisible]);

  // ── Auto-expand on finish ─────────────────────────────────────────────────
  useEffect(() => {
    if (done || invalidated) setCollapsed(false);
  }, [done, invalidated]);

  // ── Drag ──────────────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button,a,input')) return;
    e.preventDefault();
    dragging.current = true;
    mStart.current   = { x: e.clientX, y: e.clientY };
    pStart.current   = { x: widgetX, y: widgetY };
  }, [widgetX, widgetY]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const W  = boxRef.current?.offsetWidth  ?? 252;
      const H  = boxRef.current?.offsetHeight ?? 320;
      const nx = Math.max(0, Math.min(pStart.current.x + e.clientX - mStart.current.x, window.innerWidth  - W));
      const ny = Math.max(0, Math.min(pStart.current.y + e.clientY - mStart.current.y, window.innerHeight - H));
      setWidgetPos(nx, ny);
    };
    const onUp = () => { dragging.current = false; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, [setWidgetPos]);

  // ── Only render in widget mode ────────────────────────────────────────────
  if (!active || mode !== 'widget') return null;

  const total  = mins * 60;
  const pct    = total > 0 ? Math.min(100, ((total - remaining) / total) * 100) : 0;
  const urgent = remaining < 60 && running && !done;
  const S = 72, sw = 6, r = (S - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash  = circ * (1 - pct / 100);
  const col   = done ? '#10b981' : invalidated ? '#ef4444' : urgent ? '#f97316' : '#22c55e';
  const ang   = (pct / 100) * 2 * Math.PI - Math.PI / 2;
  const tX    = S / 2 + r * Math.cos(ang);
  const tY    = S / 2 + r * Math.sin(ang);
  const bdr   = invalidated || tabAway
    ? 'rgba(239,68,68,0.5)' : strict ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.11)';

  return ReactDOM.createPortal(
    <div
      ref={boxRef}
      style={{
        position: 'fixed', left: widgetX, top: widgetY,
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
        {/* ── Header ─────────────────────────────────────────────────── */}
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
                               color: done ? '#10b981' : urgent ? '#f97316' : '#fff' }}>
                  {done ? '✓' : fmt(remaining)}
                </span>
              : <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Study Timer
                </span>}
            {strict && !invalidated && <Lock size={9} color="#34d399" />}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IB onClick={() => setCollapsed(c => !c)}>
              {collapsed ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
            </IB>
            {(!strict || done || invalidated)
              ? <IB onClick={closeWidget} danger><X size={11} /></IB>
              : <div style={{ padding: 4, color: 'rgba(52,211,153,0.25)' }}><Lock size={9} /></div>}
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────────── */}
        {!collapsed && (
          <div style={{ padding: '10px 12px 12px' }}>
            {invalidated ? (
              <div style={{ textAlign: 'center', padding: '6px 0' }}>
                <div style={{ fontSize: 28 }}>⛔</div>
                <p style={{ color: '#f87171', fontWeight: 700, fontSize: 12, margin: '6px 0 2px' }}>Session Not Counted</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, margin: 0 }}>Away &gt;5 min in Strict Mode</p>
                <button onClick={closeWidget} style={sb({})}>Dismiss</button>
              </div>
            ) : (
              <>
                {/* Tab-away warning */}
                {tabAway && tabAwaySecsLeft !== null && (
                  <div style={{ display: 'flex', gap: 6, borderRadius: 10, padding: '6px 8px', marginBottom: 10,
                    background: tabAwayPhase === 'critical' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.12)',
                    border: `1px solid ${tabAwayPhase === 'critical' ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.35)'}`,
                  }}>
                    <AlertTriangle size={11} color={tabAwayPhase === 'critical' ? '#f87171' : '#fbbf24'} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p style={{ color: tabAwayPhase === 'critical' ? '#fca5a5' : '#fde68a', fontWeight: 700, fontSize: 9, margin: 0 }}>
                        {tabAwayPhase === 'critical' ? '🚨 Return NOW!' : '⚠ You left the tab!'}
                      </p>
                      <p style={{ color: tabAwayPhase === 'critical' ? 'rgba(252,165,165,0.6)' : 'rgba(253,230,138,0.6)', fontSize: 8, margin: '2px 0 0' }}>
                        Closes in <b style={{ color: tabAwayPhase === 'critical' ? '#fca5a5' : '#fde68a' }}>{fmt(tabAwaySecsLeft)}</b>
                      </p>
                    </div>
                  </div>
                )}

                {/* Circular ring + time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ position: 'relative', width: S, height: S, flexShrink: 0 }}>
                    {running && (
                      <div style={{ position: 'absolute', borderRadius: '50%', width: r * 1.6, height: r * 1.6,
                                    background: `${col}18`, top: '50%', left: '50%',
                                    transform: 'translate(-50%,-50%)', filter: 'blur(10px)', pointerEvents: 'none' }} />
                    )}
                    <svg viewBox={`0 0 ${S} ${S}`} width={S} height={S}
                         style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0, overflow: 'visible' }}>
                      <circle cx={S/2} cy={S/2} r={r} fill="rgba(6,10,28,0.99)" stroke="rgba(255,255,255,0.08)" strokeWidth={sw} />
                      <circle cx={S/2} cy={S/2} r={r} fill="none" stroke={col} strokeWidth={sw}
                              strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dash}
                              style={{ filter: `drop-shadow(0 0 6px ${col}cc)`, transition: 'stroke-dashoffset .5s linear, stroke .3s' }} />
                      {pct > 1 && pct < 99 && <circle cx={tX} cy={tY} r={sw / 2 + 1.5} fill={col} style={{ filter: `drop-shadow(0 0 4px ${col})` }} />}
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {done
                        ? <span style={{ fontSize: 18 }}>🎉</span>
                        : <span style={{ fontSize: 9, fontWeight: 900, color: urgent ? '#f97316' : 'rgba(255,255,255,0.75)' }}>{Math.round(pct)}%</span>}
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: done ? '#10b981' : urgent ? '#f97316' : '#fff',
                                  letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                      {done ? 'Done!' : fmt(remaining)}
                    </div>
                    <div style={{ fontSize: 9, marginTop: 5, fontWeight: 600,
                                  color: done ? '#34d399' : running ? '#22c55e' : 'rgba(255,255,255,0.3)' }}>
                      {done ? `✓ +${mins}m logged` : running ? '● Running' : strict ? '⚠ Strict · Paused' : '❚❚ Paused'}
                    </div>
                    {strict && !done && pauseWarnings > 0 && (
                      <div style={{ fontSize: 8, color: '#fbbf24', marginTop: 2 }}>
                        ⚠ {pauseWarnings} pause attempt{pauseWarnings > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.07)', marginBottom: 10, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99,
                                background: done ? '#10b981' : urgent ? '#f97316' : 'linear-gradient(90deg,#15803d,#22c55e)',
                                boxShadow: `0 0 8px ${col}88`, transition: 'width .5s linear' }} />
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: 6 }}>
                  {done ? (
                    <button onClick={resetTimer} style={sb({ primary: true, flex: true })}>
                      <RotateCcw size={10} /> New Session
                    </button>
                  ) : strict && running ? (
                    <div style={{ flex: 1, padding: '6px 0', borderRadius: 10, textAlign: 'center', fontSize: 9, fontWeight: 700,
                                  background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}>
                      🔥 Locked · Stay focused!
                    </div>
                  ) : (
                    <>
                      <button onClick={pauseResume}
                        style={running
                          ? sb({ flex: true, outline: true, outlineColor: 'rgba(34,197,94,0.3)', textColor: '#22c55e' })
                          : sb({ flex: true, primary: true })}>
                        {running ? <><Pause size={10} /> Pause</> : <><Play size={10} /> Resume</>}
                      </button>
                      {!strict && <IB onClick={resetTimer} title="Reset"><RotateCcw size={10} /></IB>}
                    </>
                  )}
                </div>

                {focusSessions > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 8 }}>
                    <Flame size={10} color="#fb923c" />
                    <span style={{ fontSize: 8, color: '#34d399', fontWeight: 700 }}>
                      {focusSessions} session{focusSessions > 1 ? 's' : ''} today
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {!collapsed && (
        <div style={{ textAlign: 'center', marginTop: 3 }}>
          <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.12)', userSelect: 'none' }}>⠿ drag to move</span>
        </div>
      )}
    </div>,
    document.body,
  );
};

export default FloatingTimerWidget;
