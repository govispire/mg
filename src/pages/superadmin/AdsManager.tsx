import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import {
  Plus, Trash2, Edit2, Save, X, Check, Eye, EyeOff,
  Image as ImageIcon, Megaphone, MousePointer, BarChart2,
  AlertTriangle, Upload, Crop, RotateCcw, ChevronUp, ChevronDown,
  Calendar, Tag, Link, Type, AlignLeft, Palette, MapPin,
  Settings, Users, Target, TrendingUp, Download, RefreshCw,
  ChevronLeft, ChevronRight, ToggleLeft, ToggleRight, Info,
  Zap, Clock, Filter, BarChart,
} from 'lucide-react';
import {
  AdBanner, AdType, AdPlacement, TargetScope, DisplayMode,
  getAdBanners, saveAdBanners, getSlideDuration,
  getAdsSettings, saveAdsSettings, AdsSettings, DEFAULT_SETTINGS,
} from '@/data/adsStore';

// ─── Placement Registry ────────────────────────────────────────────────────────
export interface PlacementConfig {
  id: AdPlacement;
  label: string;
  description: string;
  icon: string;
  cropWidth: number;
  cropHeight: number;
  previewAspect: string;
}

export const PLACEMENT_REGISTRY: PlacementConfig[] = [
  { id: 'days_left_panel',  label: 'Days Left Sidebar',    description: 'Right-side panel — square 320×320 works on both desktop (portrait) and mobile (landscape)', icon: '📌', cropWidth: 320,  cropHeight: 320, previewAspect: '1/1' },
  { id: 'dashboard_banner', label: 'Dashboard Banner',      description: 'Full-width landscape strip below Target Exam card', icon: '🖼️', cropWidth: 1200, cropHeight: 300, previewAspect: '1200/300' },
  { id: 'test_page',        label: 'Test Page',             description: 'Banner shown on the Tests listing page', icon: '📝', cropWidth: 1200, cropHeight: 300, previewAspect: '1200/300' },
  { id: 'popup_modal',      label: 'Popup Modal',           description: 'Full-screen interstitial popup', icon: '💬', cropWidth: 600,  cropHeight: 400, previewAspect: '600/400' },
];

const getPlacement = (id: string): PlacementConfig =>
  PLACEMENT_REGISTRY.find(p => p.id === id) ?? PLACEMENT_REGISTRY[0];

// ─── Types ────────────────────────────────────────────────────────────────────
type AdFormData = Omit<AdBanner, 'id' | 'clicks' | 'impressions' | 'createdAt' | 'updatedAt'>;

const makeBlankAd = (priority = 10): AdFormData => ({
  title: '', subtitle: '', ctaText: '', ctaUrl: '',
  imageDataUrl: '', imagePosition: 'full',
  bgColor: 'linear-gradient(135deg,#1e40af 0%,#10b981 100%)',
  adType: 'promotional', placement: 'days_left_panel',
  isActive: true, priority,
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  targetScope: 'all', targetCategoryIds: [], targetExamIds: [],
  targetEmails: [], targetConditions: {},
  maxViewsPerDay: 3, maxPerSession: 1,
  rightPanelEnabled: true, displayMode: 'auto_slide', defaultSlide: 'days_left',
  targetCategory: '',
});

const AD_TYPE_META: Record<AdType, { label: string; color: string; icon: string; duration: string }> = {
  exam:         { label: 'Exam Update',  color: 'bg-blue-100 text-blue-700',    icon: '🎯', duration: '10s' },
  promotional:  { label: 'Promotion',    color: 'bg-orange-100 text-orange-700', icon: '🔥', duration: '5s' },
  announcement: { label: 'Announcement', color: 'bg-purple-100 text-purple-700', icon: '📢', duration: '5s' },
  course:       { label: 'Course Offer', color: 'bg-emerald-100 text-emerald-700', icon: '📚', duration: '5s' },
};

const GRADIENTS = [
  'linear-gradient(135deg,#1e40af 0%,#10b981 100%)',
  'linear-gradient(135deg,#7c3aed 0%,#ec4899 100%)',
  'linear-gradient(135deg,#ea580c 0%,#facc15 100%)',
  'linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)',
  'linear-gradient(135deg,#065f46 0%,#34d399 100%)',
  'linear-gradient(135deg,#be123c 0%,#fb923c 100%)',
  'linear-gradient(135deg,#1e293b 0%,#334155 100%)',
];

const EXAM_CATALOG: Record<string, string[]> = {
  banking:  ['IBPS PO', 'IBPS Clerk', 'SBI PO', 'SBI Clerk', 'RBI Grade B', 'NABARD'],
  ssc:      ['SSC CGL', 'SSC CHSL', 'SSC MTS', 'SSC GD', 'SSC CPO'],
  railway:  ['RRB NTPC', 'RRB Group D', 'RRB ALP', 'RRB JE'],
  upsc:     ['IAS / CSE', 'CAPF', 'NDA', 'CDS'],
  insurance:['LIC AAO', 'NIACL AO', 'GIC RE'],
  state:    ['State PSC', 'State PCS', 'State SI'],
};

// ─── Image Cropper ─────────────────────────────────────────────────────────────
type CropState = { startX: number; startY: number; endX: number; endY: number; dragging: boolean; dragFrom: { x: number; y: number; cropX: number; cropY: number } | null; resizing: string | null; };

const ImageCropper: React.FC<{ srcUrl: string; placement: PlacementConfig; onCrop: (d: string) => void; onCancel: () => void; }> = ({ srcUrl, placement, onCrop, onCancel }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const ar = placement.cropWidth / placement.cropHeight;   // target W:H ratio in pixels

  // Compute a crop box that maximises coverage of the container while locking AR.
  // Coordinates are percentages of the container (0-100).
  const initCrop = useCallback((): CropState => {
    const con = containerRef.current;
    const img = imgRef.current;
    if (!con || !img) {
      // Fallback: centre 60% wide box
      const w = 60; const h = w / ar;
      const sx = (100 - w) / 2; const sy = (100 - h) / 2;
      return { startX: sx, startY: sy, endX: sx + w, endY: sy + h, dragging: false, dragFrom: null, resizing: null };
    }
    // Pixel dimensions of container and rendered image
    const cRect = con.getBoundingClientRect();
    const iRect = img.getBoundingClientRect();
    // Image occupies these % of the container
    const imgW = (iRect.width  / cRect.width)  * 100;
    const imgH = (iRect.height / cRect.height) * 100;
    // Container pixel AR (needed to translate pixel AR → % AR)
    const conAR = cRect.width / cRect.height;  // container W:H
    // In percentage space the effective AR is: (pixelAR * containerH/containerW) = pixelAR/conAR
    const pctAR = ar / conAR;  // (crop_w% / crop_h%)
    // Fit crop box inside the visible image area
    let w = imgW;
    let h = w / pctAR;
    if (h > imgH) { h = imgH; w = h * pctAR; }
    // Centre inside the image area
    const imgLeft = ((iRect.left - cRect.left) / cRect.width) * 100;
    const imgTop  = ((iRect.top  - cRect.top)  / cRect.height) * 100;
    const sx = imgLeft + (imgW - w) / 2;
    const sy = imgTop  + (imgH - h) / 2;
    return { startX: sx, startY: sy, endX: sx + w, endY: sy + h, dragging: false, dragFrom: null, resizing: null };
  }, [ar]);

  const [cropState, setCropState] = useState<CropState>(initCrop);
  const reinitCrop = useCallback(() => setCropState(initCrop()), [initCrop]);

  const getImageRect = () => {
    const img = imgRef.current; const con = containerRef.current;
    if (!img || !con) return { left: 0, top: 0, width: 100, height: 100 };
    const cr = con.getBoundingClientRect();
    const ir = img.getBoundingClientRect();
    return {
      left: ((ir.left - cr.left) / cr.width) * 100,
      top: ((ir.top - cr.top) / cr.height) * 100,
      width: (ir.width / cr.width) * 100,
      height: (ir.height / cr.height) * 100,
    };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const con = containerRef.current; if (!con) return;
    const rect = con.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 100;
    const my = ((e.clientY - rect.top) / rect.height) * 100;
    const { startX, startY, endX, endY } = cropState;
    const inside = mx > startX + 1 && mx < endX - 1 && my > startY + 1 && my < endY - 1;
    const corner = (cx: number, cy: number) => Math.abs(mx - cx) < 3 && Math.abs(my - cy) < 3;
    let resizing: string | null = null;
    if (corner(startX, startY)) resizing = 'nw';
    else if (corner(endX, startY)) resizing = 'ne';
    else if (corner(startX, endY)) resizing = 'sw';
    else if (corner(endX, endY)) resizing = 'se';
    if (resizing) { setCropState(s => ({ ...s, resizing, dragging: false })); return; }
    if (inside) { setCropState(s => ({ ...s, dragging: true, resizing: null, dragFrom: { x: mx, y: my, cropX: startX, cropY: startY } })); return; }
  };

  useEffect(() => {
    const conAR = (() => {
      const c = containerRef.current;
      return c ? c.clientWidth / c.clientHeight : 1;
    });
    const onMove = (e: MouseEvent) => {
      const con = containerRef.current; if (!con) return;
      const rect = con.getBoundingClientRect();
      const cAR = rect.width / rect.height;   // container pixel AR
      const pctAR = ar / cAR;                 // effective AR in % space
      const mx = ((e.clientX - rect.left) / rect.width) * 100;
      const my = ((e.clientY - rect.top)  / rect.height) * 100;
      setCropState(s => {
        if (s.dragging && s.dragFrom) {
          const dx = mx - s.dragFrom.x; const dy = my - s.dragFrom.y;
          const w = s.endX - s.startX; const h = s.endY - s.startY;
          const nx = Math.max(0, Math.min(100 - w, s.dragFrom.cropX + dx));
          const ny = Math.max(0, Math.min(100 - h, s.dragFrom.cropY + dy));
          return { ...s, startX: nx, startY: ny, endX: nx + w, endY: ny + h };
        }
        if (s.resizing) {
          let { startX, startY, endX, endY } = s;
          // All AR calculations use pctAR (% width / % height)
          if (s.resizing === 'se') { endX = mx; endY = startY + (endX - startX) / pctAR; }
          else if (s.resizing === 'sw') { startX = mx; endY = startY + (endX - startX) / pctAR; }
          else if (s.resizing === 'ne') { endX = mx; startY = endY - (endX - startX) / pctAR; }
          else if (s.resizing === 'nw') { startX = mx; startY = endY - (endX - startX) / pctAR; }
          startX = Math.max(0, Math.min(startX, endX - 5));
          startY = Math.max(0, Math.min(startY, endY - 5));
          endX = Math.min(100, endX); endY = Math.min(100, endY);
          return { ...s, startX, startY, endX, endY };
        }
        return s;
      });
    };
    const onUp = () => setCropState(s => ({ ...s, dragging: false, resizing: null, dragFrom: null }));
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [ar]);

  const reset = () => setCropState(initCrop());
  const applyCrop = () => {
    const img = imgRef.current; if (!img) return;
    const r = getImageRect();
    const relSX = (cropState.startX - r.left) / r.width;
    const relSY = (cropState.startY - r.top) / r.height;
    const relEX = (cropState.endX - r.left) / r.width;
    const relEY = (cropState.endY - r.top) / r.height;
    const sx = Math.max(0, relSX * img.naturalWidth);
    const sy = Math.max(0, relSY * img.naturalHeight);
    const sw = Math.max(1, (relEX - relSX) * img.naturalWidth);
    const sh = Math.max(1, (relEY - relSY) * img.naturalHeight);
    // Save at exact panel dimensions so object-cover fills perfectly
    const canvas = document.createElement('canvas');
    canvas.width = placement.cropWidth; canvas.height = placement.cropHeight;
    canvas.getContext('2d')!.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    onCrop(canvas.toDataURL('image/webp', 0.92));
  };

  const { startX, startY, endX, endY } = cropState;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-xs text-slate-700 flex items-center gap-1.5"><Crop className="h-3.5 w-3.5 text-emerald-600" /> Crop Image <span className="text-[10px] font-normal text-slate-400">— AR locked {placement.cropWidth}:{placement.cropHeight}</span></h4>
        <div className="flex gap-1.5">
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={reset}><RotateCcw className="h-3 w-3" />Reset</Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onCancel}>Cancel</Button>
          <Button size="sm" className="h-7 text-xs bg-emerald-600 gap-1" onClick={applyCrop}><Check className="h-3 w-3" />Apply</Button>
        </div>
      </div>
      <div ref={containerRef} className="relative overflow-hidden rounded-xl border-2 border-emerald-400/40 cursor-crosshair bg-slate-900" style={{ userSelect: 'none' }} onMouseDown={onMouseDown}>
        <img ref={imgRef} src={srcUrl} alt="crop" className="w-full block max-h-[380px] object-contain" draggable={false} onLoad={reinitCrop} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 bg-black/50" style={{ height: `${startY}%` }} />
          <div className="absolute left-0 right-0 bottom-0 bg-black/50" style={{ height: `${100 - endY}%` }} />
          <div className="absolute left-0 bg-black/50" style={{ top: `${startY}%`, height: `${endY - startY}%`, width: `${startX}%` }} />
          <div className="absolute right-0 bg-black/50" style={{ top: `${startY}%`, height: `${endY - startY}%`, width: `${100 - endX}%` }} />
          <div className="absolute border-2 border-white shadow-lg" style={{ left: `${startX}%`, top: `${startY}%`, width: `${endX - startX}%`, height: `${endY - startY}%` }}>
            <div className="absolute inset-0">
              <div className="absolute bg-white/20" style={{ left: '33%', top: 0, bottom: 0, width: 1 }} />
              <div className="absolute bg-white/20" style={{ left: '66%', top: 0, bottom: 0, width: 1 }} />
              <div className="absolute bg-white/20" style={{ top: '33%', left: 0, right: 0, height: 1 }} />
              <div className="absolute bg-white/20" style={{ top: '66%', left: 0, right: 0, height: 1 }} />
            </div>
            {[['nw', '-top-1.5 -left-1.5'], ['ne', '-top-1.5 -right-1.5'], ['sw', '-bottom-1.5 -left-1.5'], ['se', '-bottom-1.5 -right-1.5']].map(([d, p]) => (
              <div key={d} className={`absolute ${p} w-3.5 h-3.5 border-2 border-white bg-emerald-600 rounded-sm`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Targeting Engine Panel ────────────────────────────────────────────────────
const TargetingPanel: React.FC<{ form: AdFormData; setForm: React.Dispatch<React.SetStateAction<AdFormData>> }> = ({ form, setForm }) => {
  const [emailInput, setEmailInput] = useState('');
  const scopes: { id: TargetScope; label: string; icon: string }[] = [
    { id: 'all',         label: 'All Students',    icon: '👥' },
    { id: 'category',    label: 'Category Based',  icon: '🏷️' },
    { id: 'exam',        label: 'Exam Based',      icon: '📋' },
    { id: 'student',     label: 'Specific Students', icon: '🎓' },
    { id: 'performance', label: 'Performance Based', icon: '📊' },
    { id: 'behavior',    label: 'Behavior Based',  icon: '⚡' },
  ];

  const addEmail = () => {
    const v = emailInput.trim().toLowerCase();
    if (!v) return;
    setForm(f => ({ ...f, targetEmails: [...new Set([...f.targetEmails, v])] }));
    setEmailInput('');
  };
  const removeEmail = (e: string) => setForm(f => ({ ...f, targetEmails: f.targetEmails.filter(x => x !== e) }));
  const toggleCat = (c: string) => setForm(f => ({
    ...f, targetCategoryIds: f.targetCategoryIds.includes(c) ? f.targetCategoryIds.filter(x => x !== c) : [...f.targetCategoryIds, c],
  }));
  const toggleExam = (e: string) => setForm(f => ({
    ...f, targetExamIds: f.targetExamIds.includes(e) ? f.targetExamIds.filter(x => x !== e) : [...f.targetExamIds, e],
  }));
  const setCond = (k: string, v: number | boolean | undefined) => setForm(f => ({ ...f, targetConditions: { ...f.targetConditions, [k]: v } }));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Target className="h-4 w-4 text-emerald-600" />
        <span className="text-sm font-bold text-slate-800">Targeting Engine</span>
      </div>

      {/* Scope radio */}
      <div className="space-y-1">
        {scopes.map(s => (
          <button key={s.id} onClick={() => setForm(f => ({ ...f, targetScope: s.id }))}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left text-xs transition-all ${form.targetScope === s.id ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'}`}>
            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${form.targetScope === s.id ? 'border-emerald-500' : 'border-slate-300'}`}>
              {form.targetScope === s.id && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
            </div>
            <span>{s.icon} {s.label}</span>
          </button>
        ))}
      </div>

      {/* Category sub-panel */}
      {form.targetScope === 'category' && (
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Select Categories</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(EXAM_CATALOG).map(c => (
              <button key={c} onClick={() => toggleCat(c)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border capitalize transition-all ${form.targetCategoryIds.includes(c) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'}`}>{c}</button>
            ))}
          </div>
        </div>
      )}

      {/* Exam sub-panel */}
      {form.targetScope === 'exam' && (
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Select Category then Exams</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(EXAM_CATALOG).map(c => (
              <button key={c} onClick={() => toggleCat(c)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border capitalize transition-all ${form.targetCategoryIds.includes(c) ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>{c}</button>
            ))}
          </div>
          {form.targetCategoryIds.map(cat => (
            <div key={cat}>
              <p className="text-[10px] font-semibold text-slate-500 capitalize mb-1">{cat} Exams</p>
              <div className="flex flex-wrap gap-1.5">
                {(EXAM_CATALOG[cat] || []).map(ex => {
                  const id = `${cat}-${ex.toLowerCase().replace(/\s+/g, '-')}`;
                  return (
                    <button key={id} onClick={() => toggleExam(id)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${form.targetExamIds.includes(id) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'}`}>{ex}</button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Student emails */}
      {form.targetScope === 'student' && (
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Enter Emails / IDs</p>
          <div className="flex gap-2">
            <input value={emailInput} onChange={e => setEmailInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addEmail()}
              placeholder="student@email.com" className="flex-1 text-xs border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            <Button size="sm" className="h-8 text-xs bg-emerald-600" onClick={addEmail}>Add</Button>
          </div>
          {form.targetEmails.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {form.targetEmails.map(e => (
                <span key={e} className="flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full">
                  {e}<button onClick={() => removeEmail(e)} className="hover:text-red-500"><X className="h-2.5 w-2.5" /></button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Performance */}
      {form.targetScope === 'performance' && (
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Show when student score is below:</p>
          {[
            { key: 'quantLt', label: 'Quant < ', val: form.targetConditions.quantLt },
            { key: 'reasoningLt', label: 'Reasoning < ', val: form.targetConditions.reasoningLt },
            { key: 'accuracyLt', label: 'Accuracy < ', val: form.targetConditions.accuracyLt },
          ].map(({ key, label, val }) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs text-slate-600 w-28">{label}</span>
              <input type="number" min={0} max={100} value={val ?? ''} onChange={e => setCond(key, e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-16 text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center" placeholder="%" />
            </div>
          ))}
        </div>
      )}

      {/* Behavior */}
      {form.targetScope === 'behavior' && (
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Show when behavior matches:</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 w-28">Inactive &gt;</span>
            <input type="number" min={0} value={form.targetConditions.inactiveDaysGt ?? ''} onChange={e => setCond('inactiveDaysGt', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-16 text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center" placeholder="days" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 w-28">No test in &gt;</span>
            <input type="number" min={0} value={form.targetConditions.noTestDaysGt ?? ''} onChange={e => setCond('noTestDaysGt', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-16 text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center" placeholder="days" />
          </div>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={!!form.targetConditions.skippedWeakTopics} onChange={e => setCond('skippedWeakTopics', e.target.checked || undefined)}
              className="rounded" />
            Skipped weak topics
          </label>
        </div>
      )}
    </div>
  );
};

// ─── Live Preview ───────────────────────────────────────────────────────────────
const LivePreview: React.FC<{ form: AdFormData }> = ({ form }) => {
  const p = getPlacement(form.placement);
  const isPortrait = p.cropWidth < p.cropHeight;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4 text-emerald-600" />
        <span className="text-sm font-bold text-slate-800">Live Preview</span>
        <span className="text-[10px] text-slate-400">{p.icon} {p.label}</span>
      </div>
      <div className="bg-slate-100 rounded-xl p-3 flex items-center justify-center min-h-[160px]">
        <div className="overflow-hidden rounded-xl relative shadow-md"
          style={{ aspectRatio: p.previewAspect, width: isPortrait ? 130 : '100%', maxHeight: isPortrait ? 195 : 160, background: form.bgColor }}>
          {form.imageDataUrl && <img src={form.imageDataUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />}
          {form.title && (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
              <div className={`absolute inset-0 flex flex-col gap-1 p-2.5 z-10 ${isPortrait ? 'items-center text-center justify-center' : 'items-start justify-end'}`}>
                <p className="font-black text-white text-xs leading-tight line-clamp-3">{form.title}</p>
                {form.subtitle && <p className="text-white/80 text-[9px] line-clamp-2">{form.subtitle}</p>}
                {form.ctaText && <div className="mt-1 inline-flex items-center gap-1 bg-white text-slate-800 font-bold text-[9px] px-2 py-0.5 rounded-full">{form.ctaText}</div>}
              </div>
            </>
          )}
          {!form.title && !form.imageDataUrl && (
            <div className="absolute inset-0 flex items-center justify-center text-white/40 text-xs">Preview</div>
          )}
          {/* Dots */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
            {[0, 1, 2].map(i => <div key={i} className={`rounded-full ${i === 0 ? 'w-3 h-1 bg-white' : 'w-1 h-1 bg-white/40'}`} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Create Ad Form ─────────────────────────────────────────────────────────────
interface AdFormProps {
  form: AdFormData; setForm: React.Dispatch<React.SetStateAction<AdFormData>>;
  adding: boolean; showCropper: boolean; rawImageUrl: string;
  onSave: () => void; onCancel: () => void;
  onCropped: (d: string) => void; onCancelCrop: () => void;
  onFileSelect: (f: File) => void;
}

const AdForm: React.FC<AdFormProps> = ({ form, setForm, adding, showCropper, rawImageUrl, onSave, onCancel, onCropped, onCancelCrop, onFileSelect }) => {
  const localFileRef = useRef<HTMLInputElement>(null);
  const placementCfg = getPlacement(form.placement ?? '');
  const adTypeMeta = AD_TYPE_META[form.adType];
  const isPortrait = placementCfg.cropWidth < placementCfg.cropHeight;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      {/* ── LEFT COLUMN ── */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-emerald-600" />
            {adding ? 'Create New Ad' : 'Edit Ad'}
          </h2>
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${adTypeMeta.color}`}>{adTypeMeta.icon} {adTypeMeta.label} · {adTypeMeta.duration}</span>
        </div>

        {/* 1. Placement */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><MapPin className="h-3 w-3" />Where should this ad appear?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PLACEMENT_REGISTRY.map(p => (
              <button key={p.id} onClick={() => setForm(f => ({ ...f, placement: p.id }))}
                className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${form.placement === p.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                <span className="text-xl shrink-0">{p.icon}</span>
                <div>
                  <p className={`text-xs font-bold ${form.placement === p.id ? 'text-emerald-700' : 'text-slate-700'}`}>{p.label}</p>
                  <p className="text-[10px] text-slate-400 leading-snug">{p.description}</p>
                  <p className="text-[9px] text-slate-300 mt-0.5">{p.cropWidth}×{p.cropHeight}px</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 2. Right Panel Settings */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Settings className="h-3 w-3" />Right Panel Settings</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <button type="button" onClick={() => setForm(f => ({ ...f, rightPanelEnabled: !f.rightPanelEnabled }))}
              className={`relative w-10 h-5 rounded-full transition-colors ${form.rightPanelEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.rightPanelEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
            <span className="text-xs font-medium text-slate-700">Enable in Right Panel Slider</span>
          </label>
          {form.rightPanelEnabled && (
            <>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Display Mode</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {([['days_left_only', 'Days Left Only'], ['ads_only', 'Ads Only'], ['auto_slide', 'Auto Slide (Days + Ads)']] as [DisplayMode, string][]).map(([v, l]) => (
                    <button key={v} onClick={() => setForm(f => ({ ...f, displayMode: v }))}
                      className={`text-[10px] font-semibold py-1.5 px-2 rounded-lg border transition-all text-center ${form.displayMode === v ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>{l}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Default Slide</label>
                  <div className="flex gap-1.5">
                    {(['days_left', 'ad'] as const).map(v => (
                      <button key={v} onClick={() => setForm(f => ({ ...f, defaultSlide: v }))}
                        className={`flex-1 text-[10px] font-semibold py-1.5 rounded-lg border transition-all ${form.defaultSlide === v ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                        {v === 'days_left' ? 'Days Left' : 'Ad'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Auto Rotation</label>
                  <select className="w-full text-xs border rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    value={form.adType} onChange={e => setForm(f => ({ ...f, adType: e.target.value as AdType }))}>
                    <option value="promotional">5 sec</option>
                    <option value="exam">10 sec</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </section>

        {/* 3. Banner Design */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><ImageIcon className="h-3 w-3" />Banner Design</h3>

          {/* Image Upload */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Upload Image ({placementCfg.cropWidth}×{placementCfg.cropHeight})</label>
            {showCropper && rawImageUrl ? (
              <ImageCropper srcUrl={rawImageUrl} placement={placementCfg} onCrop={onCropped} onCancel={onCancelCrop} />
            ) : (
              <div className="space-y-2">
                {form.imageDataUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                    <div className="w-full bg-slate-100 overflow-hidden" style={{ aspectRatio: placementCfg.previewAspect, maxHeight: isPortrait ? 180 : 100 }}>
                      <img src={form.imageDataUrl} alt="preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button onClick={() => localFileRef.current?.click()} className="bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"><Upload className="h-3 w-3" />Replace</button>
                      <button onClick={() => setForm(f => ({ ...f, imageDataUrl: '' }))} className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"><X className="h-3 w-3" />Remove</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => localFileRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-emerald-400 hover:bg-emerald-50 transition-all py-6">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center"><Upload className="h-5 w-5 text-slate-400" /></div>
                    <span className="text-xs text-slate-500 font-medium">Click to upload (JPG/PNG/WebP, max 20MB)</span>
                    <span className="text-[10px] text-slate-400">Full image used — no auto-crop (uses object-contain)</span>
                  </button>
                )}
                <input ref={localFileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) { onFileSelect(f); e.target.value = ''; } }} />
              </div>
            )}
          </div>

          {/* Gradient fallback */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 block flex items-center gap-1"><Palette className="h-3 w-3" />Fallback Gradient</label>
            <div className="flex gap-2 flex-wrap items-center">
              {GRADIENTS.map((g, i) => (
                <button key={i} onClick={() => setForm(f => ({ ...f, bgColor: g }))}
                  className={`w-8 h-6 rounded-md border-2 transition-all ${form.bgColor === g ? 'border-emerald-500 scale-110' : 'border-transparent hover:border-slate-300'}`}
                  style={{ background: g }} />
              ))}
              <input type="text" value={form.bgColor} onChange={e => setForm(f => ({ ...f, bgColor: e.target.value }))}
                className="flex-1 min-w-32 text-[10px] border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="custom CSS gradient" />
            </div>
          </div>

          {/* Text Overlay */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Type className="h-3 w-3 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Text Overlay</span>
              <span className="text-[9px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full">optional — leave blank for image-only</span>
            </div>
            <input className="w-full text-xs border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Headline (e.g. IBPS PO Notification Out!)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <input className="w-full text-xs border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Subheadline (optional tagline)" value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} />
          </div>

          {/* Ad Type */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 block flex items-center gap-1"><Tag className="h-3 w-3" />Ad Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(Object.keys(AD_TYPE_META) as AdType[]).map(type => {
                const m = AD_TYPE_META[type];
                return (
                  <button key={type} onClick={() => setForm(f => ({ ...f, adType: type }))}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-[10px] font-bold transition-all ${form.adType === type ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'}`}>
                    <span>{m.icon}</span><span className="truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block flex items-center gap-1"><MousePointer className="h-3 w-3" />CTA Button Text</label>
              <input className="w-full text-xs border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Learn More / Apply Now" value={form.ctaText} onChange={e => setForm(f => ({ ...f, ctaText: e.target.value }))} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block flex items-center gap-1"><Link className="h-3 w-3" />CTA Link URL</label>
              <input className="w-full text-xs border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="https://... or /student/tests" value={form.ctaUrl} onChange={e => setForm(f => ({ ...f, ctaUrl: e.target.value }))} />
            </div>
          </div>
        </section>

        {/* 4. Publish Targeting */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="h-3 w-3" />Publish Targeting</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Priority (lower = higher)</label>
              <input type="number" min={1} max={999} className="w-full text-xs border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                value={form.priority} onChange={e => setForm(f => ({ ...f, priority: parseInt(e.target.value) || 10 }))} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Show From *</label>
              <input type="date" className="w-full text-xs border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Show Until *</label>
              <input type="date" className="w-full text-xs border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-2 pt-4">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
                <input type="checkbox" className="rounded" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                Publish immediately
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block flex items-center gap-1"><Clock className="h-3 w-3" />Max Views Per Day</label>
              <input type="number" min={1} max={100} className="w-full text-xs border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                value={form.maxViewsPerDay} onChange={e => setForm(f => ({ ...f, maxViewsPerDay: parseInt(e.target.value) || 3 }))} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Max Per Session</label>
              <input type="number" min={1} max={10} className="w-full text-xs border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                value={form.maxPerSession} onChange={e => setForm(f => ({ ...f, maxPerSession: parseInt(e.target.value) || 1 }))} />
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pb-4">
          <Button className="h-9 px-6 text-sm bg-emerald-600 hover:bg-emerald-700 gap-2 rounded-xl" onClick={onSave}>
            <Zap className="h-4 w-4" />{adding ? 'Publish Ad' : 'Save Changes'}
          </Button>
          <Button variant="outline" className="h-9 px-4 text-sm gap-2 rounded-xl" onClick={onCancel}>
            <X className="h-4 w-4" />Cancel
          </Button>
        </div>
      </div>

      {/* ── RIGHT COLUMN ── */}
      <div className="space-y-4">
        {/* Targeting Engine */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <TargetingPanel form={form} setForm={setForm} />
        </div>
        {/* Live Preview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <LivePreview form={form} />
        </div>
      </div>
    </div>
  );
};

// ─── All Ads Tab ────────────────────────────────────────────────────────────────
const AllAdsTab: React.FC<{
  ads: AdBanner[];
  onEdit: (a: AdBanner) => void;
  onDelete: (a: AdBanner) => void;
  onToggle: (id: string) => void;
  onCreateNew: () => void;
}> = ({ ads, onEdit, onDelete, onToggle, onCreateNew }) => {
  const [placementFilter, setPlacementFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const today = new Date().toISOString().split('T')[0];

  const filtered = ads
    .filter(a => placementFilter === 'all' || a.placement === placementFilter)
    .filter(a => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'active') return a.isActive && a.startDate <= today && a.endDate >= today;
      if (statusFilter === 'inactive') return !a.isActive;
      if (statusFilter === 'scheduled') return a.isActive && a.startDate > today;
      if (statusFilter === 'expired') return a.endDate < today;
      return true;
    })
    .sort((a, b) => a.priority - b.priority);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalViews = ads.reduce((s, a) => s + a.impressions, 0);
  const totalClicks = ads.reduce((s, a) => s + a.clicks, 0);
  const liveCount = ads.filter(a => a.isActive && a.startDate <= today && a.endDate >= today).length;
  const avgCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0.00';

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Ads', value: ads.length, sub: `${liveCount} live`, color: 'border-slate-200 bg-white' },
          { label: 'Total Views', value: totalViews.toLocaleString(), sub: 'all time', color: 'border-blue-200 bg-blue-50' },
          { label: 'Total Clicks', value: totalClicks.toLocaleString(), sub: 'all time', color: 'border-orange-200 bg-orange-50' },
          { label: 'Avg CTR%', value: `${avgCtr}%`, sub: 'clicks / views', color: 'border-emerald-200 bg-emerald-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
            <div className="text-xl font-black text-slate-900">{s.value}</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">{s.label}</div>
            <div className="text-[10px] text-slate-400">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters + Create button */}
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            {['all', ...PLACEMENT_REGISTRY.map(p => p.id)].map(pid => {
              const p = PLACEMENT_REGISTRY.find(x => x.id === pid);
              return (
                <button key={pid} onClick={() => { setPlacementFilter(pid); setPage(1); }}
                  className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all ${placementFilter === pid ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                  {pid === 'all' ? 'All' : (p?.icon + ' ' + p?.label)}
                </button>
              );
            })}
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-xs border rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="scheduled">Scheduled</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <Button className="h-9 text-sm bg-emerald-600 hover:bg-emerald-700 gap-2 rounded-xl" onClick={onCreateNew}>
          <Plus className="h-4 w-4" />Create New Ad
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {paginated.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Megaphone size={44} className="mx-auto mb-3 opacity-20" />
            <p className="font-semibold">No ads match this filter</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="grid items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wide"
              style={{ gridTemplateColumns: '80px 1fr 70px 70px 60px 120px 120px 70px 80px' }}>
              <span>Thumbnail</span><span>Ad Details</span><span className="text-center">Views</span><span className="text-center">Clicks</span>
              <span className="text-center">CTR%</span><span>Placement</span><span>Audience</span><span className="text-center">Priority</span><span className="text-center">Status</span>
            </div>
            {paginated.map((ad) => {
              const isLive = ad.isActive && ad.startDate <= today && ad.endDate >= today;
              const isScheduled = ad.isActive && ad.startDate > today;
              const isExpired = ad.endDate < today;
              const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0.0';
              const p = getPlacement(ad.placement ?? '');
              const isPortrait = p.cropWidth < p.cropHeight;
              const scopeLabel = () => {
                if (ad.targetScope === 'category') return `Cat: ${ad.targetCategoryIds.join(', ')}`;
                if (ad.targetScope === 'exam') return `Exam: ${ad.targetExamIds.map(e => e.replace(/^[^-]+-/, '').replace(/-/g, ' ')).join(', ')}`;
                if (ad.targetScope === 'student') return ad.targetEmails.slice(0, 2).join(', ');
                if (ad.targetScope === 'performance') return 'Performance';
                if (ad.targetScope === 'behavior') return 'Behavior';
                return 'All Students';
              };

              return (
                <div key={ad.id} className="grid items-center gap-2 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors"
                  style={{ gridTemplateColumns: '80px 1fr 70px 70px 60px 120px 120px 70px 80px' }}>
                  {/* Thumb */}
                  <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center"
                    style={{ width: isPortrait ? 44 : 72, height: isPortrait ? 66 : 44 }}>
                    {ad.imageDataUrl ? <img src={ad.imageDataUrl} alt="" className="w-full h-full object-cover" /> :
                      <div className="w-full h-full flex items-center justify-center" style={{ background: ad.bgColor }}>
                        <ImageIcon className="h-3 w-3 text-white/50" />
                      </div>}
                  </div>
                  {/* Info */}
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-slate-800 truncate">{ad.title || <span className="text-slate-400 italic">Image-only</span>}</p>
                    {ad.subtitle && <p className="text-[10px] text-slate-400 truncate">{ad.subtitle}</p>}
                    <div className="flex items-center gap-1 mt-0.5">
                      {isLive && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-0.5"><span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse inline-block" />LIVE</span>}
                      {isScheduled && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">Scheduled</span>}
                      {isExpired && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">Expired</span>}
                      {!ad.isActive && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">Hidden</span>}
                    </div>
                    <p className="text-[9px] text-slate-300 mt-0.5">{ad.startDate} → {ad.endDate}</p>
                  </div>
                  {/* Stats */}
                  <p className="text-center text-xs font-semibold text-slate-700">{ad.impressions.toLocaleString()}</p>
                  <p className="text-center text-xs font-semibold text-slate-700">{ad.clicks.toLocaleString()}</p>
                  <p className="text-center text-xs font-semibold text-emerald-700">{ctr}%</p>
                  {/* Placement */}
                  <span className="text-[10px] font-semibold text-slate-600">{p.icon} {p.label}</span>
                  {/* Audience */}
                  <span className="text-[10px] text-slate-500 truncate">{scopeLabel()}</span>
                  {/* Priority */}
                  <p className="text-center text-xs font-bold text-slate-600">{ad.priority}</p>
                  {/* Toggle + actions */}
                  <div className="flex items-center gap-1 justify-center">
                    <button onClick={() => onToggle(ad.id)} title={ad.isActive ? 'Disable' : 'Enable'}
                      className={`relative w-8 h-4 rounded-full transition-colors ${ad.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${ad.isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                    <button onClick={() => onEdit(ad)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"><Edit2 size={12} /></button>
                    <button onClick={() => onDelete(ad)} className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={12} /></button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} ads</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 transition-colors">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${p === page ? 'bg-emerald-600 text-white' : 'border border-slate-200 hover:bg-slate-50 text-slate-600'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Analytics Tab ──────────────────────────────────────────────────────────────
const AnalyticsTab: React.FC<{ ads: AdBanner[] }> = ({ ads }) => {
  const totalViews = ads.reduce((s, a) => s + a.impressions, 0);
  const totalClicks = ads.reduce((s, a) => s + a.clicks, 0);
  const avgCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0.00';
  const settings = getAdsSettings();
  const avgCpc = settings.defaultCpc;

  // Generate last 14 days of dummy trend data seeded from real totals
  const chartData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    const base = totalViews / 14;
    const basec = totalClicks / 14;
    const rand = 0.5 + Math.random();
    return { date: label, views: Math.round(base * rand), clicks: Math.round(basec * rand) };
  });

  const sorted = [...ads].sort((a, b) => {
    const ctrA = a.impressions > 0 ? (a.clicks / a.impressions) : 0;
    const ctrB = b.impressions > 0 ? (b.clicks / b.impressions) : 0;
    return ctrB - ctrA;
  });

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Views', value: totalViews.toLocaleString(), sub: '+3,142 today', color: 'from-blue-500 to-blue-600' },
          { label: 'Total Clicks', value: totalClicks.toLocaleString(), sub: '+382 today', color: 'from-orange-400 to-orange-500' },
          { label: 'Avg CTR%', value: `${avgCtr}%`, sub: '+0.24% vs last week', color: 'from-emerald-500 to-emerald-600' },
          { label: 'Avg CPC', value: `₹ ${avgCpc.toFixed(2)}`, sub: 'cost per click', color: 'from-violet-500 to-violet-600' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl text-white p-4 bg-gradient-to-br ${s.color}`}>
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-xs font-semibold mt-0.5 opacity-90">{s.label}</div>
            <div className="text-[10px] opacity-70 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2"><BarChart className="h-4 w-4 text-emerald-600" />Clicks &amp; Views (Last 14 Days)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gClicks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="views" name="Views" stroke="#10b981" strokeWidth={2} fill="url(#gViews)" dot={false} />
            <Area type="monotone" dataKey="clicks" name="Clicks" stroke="#3b82f6" strokeWidth={2} fill="url(#gClicks)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top Ads */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-600" />Top Performing Ads</h3>
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 rounded-xl"><Download className="h-3 w-3" />Export CSV</Button>
        </div>
        <div className="divide-y divide-slate-50">
          {sorted.length === 0 ? (
            <p className="text-center py-10 text-slate-400 text-sm">No ad data yet</p>
          ) : sorted.map(ad => {
            const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00';
            const p = getPlacement(ad.placement ?? '');
            const isLive = ad.isActive && ad.startDate <= today && ad.endDate >= today;
            return (
              <div key={ad.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                  {ad.imageDataUrl ? <img src={ad.imageDataUrl} alt="" className="w-full h-full object-cover" /> :
                    <div className="w-full h-full" style={{ background: ad.bgColor }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-800 truncate">{ad.title || 'Image-only ad'}</p>
                  {ad.subtitle && <p className="text-[11px] text-slate-500 truncate">{ad.subtitle}</p>}
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] text-slate-400">{p.icon} {p.label}</span>
                    <span className="text-[10px] text-slate-300">·</span>
                    <span className="text-[10px] text-slate-400 capitalize">{ad.targetScope}</span>
                  </div>
                </div>
                <div className="text-right shrink-0 flex gap-5">
                  <div><p className="text-sm font-bold text-slate-800">{ad.impressions.toLocaleString()}</p><p className="text-[10px] text-slate-400">Views</p></div>
                  <div><p className="text-sm font-bold text-slate-800">{ad.clicks.toLocaleString()}</p><p className="text-[10px] text-slate-400">Clicks</p></div>
                  <div><p className="text-sm font-bold text-emerald-700">{ctr}%</p><p className="text-[10px] text-slate-400">CTR</p></div>
                  <div><p className="text-sm font-bold text-violet-700">₹{avgCpc.toFixed(2)}</p><p className="text-[10px] text-slate-400">CPC</p></div>
                  <span className={`self-center text-[10px] font-bold px-2.5 py-1 rounded-full ${isLive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {isLive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Settings Tab ───────────────────────────────────────────────────────────────
const SettingsTab: React.FC = () => {
  const [s, setS] = useState<AdsSettings>(getAdsSettings());
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState<string>('ad');

  const save = () => { saveAdsSettings(s); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const Accordion: React.FC<{ id: string; title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ id, title, icon, children }) => (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <button onClick={() => setOpen(o => o === id ? '' : id)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-2.5 font-semibold text-sm text-slate-800">{icon}{title}</div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open === id ? 'rotate-180' : ''}`} />
      </button>
      {open === id && <div className="px-5 pb-5 space-y-4 border-t border-slate-100">{children}</div>}
    </div>
  );

  return (
    <div className="max-w-2xl space-y-4">
      <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><Settings className="h-5 w-5 text-emerald-600" />Settings</h2>

      <Accordion id="ad" title="Ad Settings" icon={<Megaphone className="h-4 w-4 text-emerald-600" />}>
        <div className="pt-4 space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-700">Max Auto Rotation Time</label>
            <p className="text-[11px] text-slate-400 mb-3">Limit how long an ad will auto-rotate in Right Panel Slider.</p>
            <div className="flex items-center gap-3">
              <input type="range" min={5} max={60} step={5} value={s.maxRotationSec}
                onChange={e => setS(x => ({ ...x, maxRotationSec: parseInt(e.target.value) }))}
                className="flex-1 accent-emerald-600" />
              <span className="text-sm font-bold text-slate-800 w-12 text-right">{s.maxRotationSec}s</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              {[5, 10, 20, 30, 40, 50, 60].map(v => <span key={v}>{v}</span>)}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Cost Per Click (CPC)</label>
            <p className="text-[11px] text-slate-400 mb-2">Default cost per click (adjustable per ad)</p>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">₹</span>
              <input type="number" step={0.5} min={0} value={s.defaultCpc} onChange={e => setS(x => ({ ...x, defaultCpc: parseFloat(e.target.value) || 0 }))}
                className="w-48 text-sm border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Cost to advertiser each time their ad is clicked.</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Viewability Limit</label>
            <p className="text-[11px] text-slate-400 mb-2">Default views required before counting a view (adjustable per ad)</p>
            <input type="number" min={1} max={100} value={s.viewabilityLimit} onChange={e => setS(x => ({ ...x, viewabilityLimit: parseInt(e.target.value) || 5 }))}
              className="w-48 text-sm border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Performance Targets</label>
            <div className="mt-2 space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Minimum CTR%</label>
                <div className="flex items-center gap-2">
                  <input type="number" step={0.1} min={0} max={100} value={s.minCtrPct} onChange={e => setS(x => ({ ...x, minCtrPct: parseFloat(e.target.value) || 0 }))}
                    className="w-36 text-sm border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                  <span className="text-slate-500 text-sm">%</span>
                </div>
              </div>
            </div>
          </div>
          <Button className="h-9 px-6 bg-emerald-600 hover:bg-emerald-700 text-sm rounded-xl gap-2" onClick={save}>
            {saved ? <><Check className="h-4 w-4" />Saved!</> : 'Save Changes'}
          </Button>
        </div>
      </Accordion>

      <Accordion id="payment" title="Payment Settings" icon={<BarChart2 className="h-4 w-4 text-blue-600" />}>
        <div className="pt-4 text-sm text-slate-400 italic">Payment gateway integration coming soon.</div>
      </Accordion>

      <Accordion id="admin" title="Admin Controls" icon={<Users className="h-4 w-4 text-violet-600" />}>
        <div className="pt-4 text-sm text-slate-400 italic">Role-based ad approval workflow coming soon.</div>
      </Accordion>

      <Accordion id="notifications" title="Notification Preferences" icon={<Zap className="h-4 w-4 text-orange-500" />}>
        <div className="pt-4 text-sm text-slate-400 italic">Email/push notification settings coming soon.</div>
      </Accordion>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────────
type Tab = 'all' | 'create' | 'analytics' | 'settings';

const AdsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [ads, setAds] = useState<AdBanner[]>([]);
  const [editingAd, setEditingAd] = useState<AdBanner | null>(null);
  const [form, setForm] = useState<AdFormData>(makeBlankAd());
  const [rawImageUrl, setRawImageUrl] = useState('');
  const [showCropper, setShowCropper] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdBanner | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => { setAds(getAdBanners()); }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3200);
  };
  const persist = (updated: AdBanner[]) => { setAds(updated); saveAdBanners(updated); };

  const handleFileSelect = (file: File) => {
    if (file.size > 20 * 1024 * 1024) { showToast('File too large (max 20MB)', 'error'); return; }
    const reader = new FileReader();
    reader.onload = ev => { setRawImageUrl(ev.target?.result as string); setShowCropper(true); };
    reader.readAsDataURL(file);
  };

  const handleCropped = (dataUrl: string) => {
    setForm(f => ({ ...f, imageDataUrl: dataUrl }));
    setShowCropper(false); setRawImageUrl('');
    showToast('Image cropped & applied ✓');
  };

  const startCreate = () => {
    setEditingAd(null);
    setForm(makeBlankAd(ads.length > 0 ? Math.max(...ads.map(a => a.priority)) + 10 : 10));
    setShowCropper(false); setRawImageUrl('');
    setActiveTab('create');
  };

  const startEdit = (ad: AdBanner) => {
    setEditingAd(ad);
    setForm({
      title: ad.title, subtitle: ad.subtitle, ctaText: ad.ctaText, ctaUrl: ad.ctaUrl,
      imageDataUrl: ad.imageDataUrl, imagePosition: ad.imagePosition, bgColor: ad.bgColor,
      adType: ad.adType, placement: ad.placement ?? 'days_left_panel',
      isActive: ad.isActive, priority: ad.priority,
      startDate: ad.startDate, endDate: ad.endDate,
      targetScope: ad.targetScope ?? 'all',
      targetCategoryIds: ad.targetCategoryIds ?? [],
      targetExamIds: ad.targetExamIds ?? [],
      targetEmails: ad.targetEmails ?? [],
      targetConditions: ad.targetConditions ?? {},
      maxViewsPerDay: ad.maxViewsPerDay ?? 3,
      maxPerSession: ad.maxPerSession ?? 1,
      rightPanelEnabled: ad.rightPanelEnabled ?? true,
      displayMode: ad.displayMode ?? 'auto_slide',
      defaultSlide: ad.defaultSlide ?? 'days_left',
      targetCategory: ad.targetCategory ?? '',
    });
    setShowCropper(false); setRawImageUrl('');
    setActiveTab('create');
  };

  const cancelForm = () => {
    setEditingAd(null); setShowCropper(false); setRawImageUrl('');
    setActiveTab('all');
  };

  const saveForm = () => {
    if (!form.imageDataUrl && !form.title.trim()) { showToast('Please upload an image or add a headline', 'error'); return; }
    if (!form.startDate || !form.endDate) { showToast('Start and end dates required', 'error'); return; }
    const now = new Date().toISOString();
    if (editingAd) {
      persist(ads.map(a => a.id === editingAd.id ? { ...a, ...form, updatedAt: now } : a));
      showToast('Ad updated successfully ✓');
    } else {
      const newAd: AdBanner = { id: `ad-${Date.now()}`, ...form, clicks: 0, impressions: 0, createdAt: now, updatedAt: now };
      persist([...ads, newAd]);
      showToast('Ad created and published ✓');
    }
    cancelForm();
  };

  const toggleActive = (id: string) => {
    persist(ads.map(a => a.id === id ? { ...a, isActive: !a.isActive, updatedAt: new Date().toISOString() } : a));
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    persist(ads.filter(a => a.id !== deleteTarget.id));
    showToast(`Deleted ad`, 'error');
    setDeleteTarget(null);
  };

  const today = new Date().toISOString().split('T')[0];
  const liveCount = ads.filter(a => a.isActive && a.startDate <= today && a.endDate >= today).length;

  const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'all',       label: 'All Ads',   icon: <Megaphone className="h-4 w-4" />, badge: ads.length },
    { id: 'create',    label: editingAd ? 'Edit Ad' : 'Create Ad', icon: <Plus className="h-4 w-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="h-4 w-4" />, badge: liveCount },
    { id: 'settings',  label: 'Settings',  icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Megaphone className="h-5 w-5 text-emerald-600" />Ads Manager</h1>
        <div className="flex items-center gap-3">
          {toast && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {toast.type === 'success' ? <Check size={12} /> : <AlertTriangle size={12} />}{toast.msg}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6">
        <div className="flex gap-0">
          {TABS.map(t => (
            <button key={t.id} onClick={() => { if (t.id !== 'create' || !editingAd) { setActiveTab(t.id); } else setActiveTab(t.id); }}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all relative ${activeTab === t.id ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {t.icon}{t.label}
              {t.badge !== undefined && t.badge > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === t.id ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-7xl">
        {activeTab === 'all' && (
          <AllAdsTab ads={ads} onEdit={startEdit} onDelete={setDeleteTarget} onToggle={toggleActive} onCreateNew={startCreate} />
        )}
        {activeTab === 'create' && (
          <AdForm form={form} setForm={setForm} adding={!editingAd} showCropper={showCropper} rawImageUrl={rawImageUrl}
            onFileSelect={handleFileSelect} onSave={saveForm} onCancel={cancelForm}
            onCropped={handleCropped} onCancelCrop={() => { setShowCropper(false); setRawImageUrl(''); }} />
        )}
        {activeTab === 'analytics' && <AnalyticsTab ads={ads} />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-5 w-5" />Delete Ad?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>"{deleteTarget?.title || 'this ad'}"</strong> and remove it from all placement zones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdsManager;
