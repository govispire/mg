import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus, Trash2, Edit2, Save, X, Check, Eye, EyeOff,
  Image as ImageIcon, Megaphone, MousePointer, BarChart2,
  AlertTriangle, Upload, Crop, RotateCcw, ChevronUp, ChevronDown,
  Calendar, Tag, Link, Type, AlignLeft, Palette,
} from 'lucide-react';
import { AdBanner, AdType, getAdBanners, saveAdBanners, getSlideDuration } from '@/data/adsStore';

// ─── Types ────────────────────────────────────────────────────────────────────
type CropState = {
  startX: number; startY: number;
  endX: number; endY: number;
  dragging: boolean;
  dragFrom: { x: number; y: number; cropX: number; cropY: number } | null;
  resizing: string | null; // 'nw'|'ne'|'sw'|'se'|null
};

const BLANK_AD: Omit<AdBanner, 'id' | 'clicks' | 'impressions' | 'createdAt' | 'updatedAt'> = {
  title: '',
  subtitle: '',
  ctaText: 'Learn More',
  ctaUrl: '',
  imageDataUrl: '',
  imagePosition: 'full',
  bgColor: 'linear-gradient(135deg,#1e40af 0%,#10b981 100%)',
  adType: 'promotional',
  isActive: true,
  priority: 10,
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  targetCategory: '',
};

const AD_TYPE_LABELS: Record<AdType, { label: string; color: string; icon: string }> = {
  exam:         { label: 'Exam Update',  color: 'bg-blue-100 text-blue-700',    icon: '🎯' },
  promotional:  { label: 'Promotion',    color: 'bg-orange-100 text-orange-700', icon: '🔥' },
  announcement: { label: 'Announcement', color: 'bg-purple-100 text-purple-700', icon: '📢' },
  course:       { label: 'Course Offer', color: 'bg-emerald-100 text-emerald-700', icon: '📚' },
};

const GRADIENTS = [
  'linear-gradient(135deg,#1e40af 0%,#10b981 100%)',
  'linear-gradient(135deg,#7c3aed 0%,#ec4899 100%)',
  'linear-gradient(135deg,#ea580c 0%,#facc15 100%)',
  'linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)',
  'linear-gradient(135deg,#065f46 0%,#34d399 100%)',
  'linear-gradient(135deg,#be123c 0%,#fb923c 100%)',
];

// ─── Image Cropper ────────────────────────────────────────────────────────────
const ImageCropper: React.FC<{
  srcUrl: string;
  onCrop: (dataUrl: string) => void;
  onCancel: () => void;
}> = ({ srcUrl, onCrop, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cropState, setCropState] = useState<CropState>({
    startX: 10, startY: 10, endX: 90, endY: 90,
    dragging: false, dragFrom: null, resizing: null,
  });
  const [imgLoaded, setImgLoaded] = useState(false);

  const getRelPos = (e: React.MouseEvent | MouseEvent, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)),
    };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    e.preventDefault();
    const pos = getRelPos(e, containerRef.current);
    const { startX, startY, endX, endY } = cropState;
    const handle = 5;

    const near = (a: number, b: number) => Math.abs(a - b) < handle;

    // Resize handles
    if (near(pos.x, startX) && near(pos.y, startY))
      return setCropState(s => ({ ...s, resizing: 'nw', dragging: false }));
    if (near(pos.x, endX) && near(pos.y, startY))
      return setCropState(s => ({ ...s, resizing: 'ne', dragging: false }));
    if (near(pos.x, startX) && near(pos.y, endY))
      return setCropState(s => ({ ...s, resizing: 'sw', dragging: false }));
    if (near(pos.x, endX) && near(pos.y, endY))
      return setCropState(s => ({ ...s, resizing: 'se', dragging: false }));

    // Inside crop box = drag
    if (pos.x > startX && pos.x < endX && pos.y > startY && pos.y < endY)
      return setCropState(s => ({
        ...s, dragging: true, resizing: null,
        dragFrom: { x: pos.x, y: pos.y, cropX: startX, cropY: startY },
      }));

    // New crop
    setCropState(s => ({ ...s, startX: pos.x, startY: pos.y, endX: pos.x, endY: pos.y, dragging: false, resizing: 'se' }));
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const pos = getRelPos(e, containerRef.current);
    setCropState(s => {
      if (s.resizing) {
        const h = s.resizing;
        return {
          ...s,
          startX: h.includes('w') ? Math.min(pos.x, s.endX - 2) : s.startX,
          startY: h.includes('n') ? Math.min(pos.y, s.endY - 2) : s.startY,
          endX:   h.includes('e') ? Math.max(pos.x, s.startX + 2) : s.endX,
          endY:   h.includes('s') ? Math.max(pos.y, s.startY + 2) : s.endY,
        };
      }
      if (s.dragging && s.dragFrom) {
        const dx = pos.x - s.dragFrom.x;
        const dy = pos.y - s.dragFrom.y;
        const w = s.endX - s.startX;
        const h = s.endY - s.startY;
        const nx = Math.max(0, Math.min(100 - w, s.dragFrom.cropX + dx));
        const ny = Math.max(0, Math.min(100 - h, s.dragFrom.cropY + dy));
        return { ...s, startX: nx, startY: ny, endX: nx + w, endY: ny + h };
      }
      return s;
    });
  }, []);

  const onMouseUp = useCallback(() => {
    setCropState(s => ({ ...s, dragging: false, resizing: null, dragFrom: null }));
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const applyCrop = () => {
    const img = imgRef.current;
    if (!img || !imgLoaded) return;
    const canvas = document.createElement('canvas');
    // Full HD output
    canvas.width = 1920;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;
    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const sx = (cropState.startX / 100) * natW;
    const sy = (cropState.startY / 100) * natH;
    const sw = ((cropState.endX - cropState.startX) / 100) * natW;
    const sh = ((cropState.endY - cropState.startY) / 100) * natH;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    onCrop(canvas.toDataURL('image/webp', 0.92));
  };

  const reset = () => setCropState({
    startX: 5, startY: 5, endX: 95, endY: 95,
    dragging: false, dragFrom: null, resizing: null,
  });

  const { startX, startY, endX, endY } = cropState;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <Crop className="h-4 w-4 text-[#003366]" /> Crop Image — drag to reposition, drag corners to resize
        </h4>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={reset}>
            <RotateCcw className="h-3 w-3" /> Reset
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onCancel}>Cancel</Button>
          <Button size="sm" className="h-7 text-xs bg-[#003366] gap-1" onClick={applyCrop}>
            <Check className="h-3 w-3" /> Apply Crop
          </Button>
        </div>
      </div>

      {/* Crop canvas */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg border-2 border-[#003366]/30 cursor-crosshair"
        style={{ userSelect: 'none' }}
        onMouseDown={onMouseDown}
      >
        <img
          ref={imgRef}
          src={srcUrl}
          alt="crop"
          className="w-full block max-h-[400px] object-contain"
          onLoad={() => setImgLoaded(true)}
          draggable={false}
        />
        {/* Dark overlay outside crop */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top */}
          <div className="absolute top-0 left-0 right-0 bg-black/50" style={{ height: `${startY}%` }} />
          {/* Bottom */}
          <div className="absolute left-0 right-0 bottom-0 bg-black/50" style={{ height: `${100 - endY}%` }} />
          {/* Left */}
          <div className="absolute left-0 bg-black/50" style={{ top: `${startY}%`, height: `${endY - startY}%`, width: `${startX}%` }} />
          {/* Right */}
          <div className="absolute right-0 bg-black/50" style={{ top: `${startY}%`, height: `${endY - startY}%`, width: `${100 - endX}%` }} />
          {/* Crop border */}
          <div
            className="absolute border-2 border-white shadow-lg"
            style={{ left: `${startX}%`, top: `${startY}%`, width: `${endX - startX}%`, height: `${endY - startY}%` }}
          >
            {/* Rule of thirds grid */}
            <div className="absolute inset-0">
              <div className="absolute bg-white/30" style={{ left: '33.3%', top: 0, bottom: 0, width: 1 }} />
              <div className="absolute bg-white/30" style={{ left: '66.6%', top: 0, bottom: 0, width: 1 }} />
              <div className="absolute bg-white/30" style={{ top: '33.3%', left: 0, right: 0, height: 1 }} />
              <div className="absolute bg-white/30" style={{ top: '66.6%', left: 0, right: 0, height: 1 }} />
            </div>
            {/* Corner handles */}
            {[['nw', '-top-1.5 -left-1.5'], ['ne', '-top-1.5 -right-1.5'], ['sw', '-bottom-1.5 -left-1.5'], ['se', '-bottom-1.5 -right-1.5']].map(([dir, pos]) => (
              <div key={dir} className={`absolute ${pos} w-4 h-4 border-2 border-white bg-[#003366] rounded-sm cursor-${dir}-resize`} />
            ))}
          </div>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 text-center">Output: 1920×600px Full HD • Format: WebP 92% quality</p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdsManager: React.FC = () => {
  const [ads, setAds] = useState<AdBanner[]>([]);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<AdBanner, 'id' | 'clicks' | 'impressions' | 'createdAt' | 'updatedAt'>>(BLANK_AD);
  const [rawImageUrl, setRawImageUrl] = useState<string>('');
  const [showCropper, setShowCropper] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdBanner | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setAds(getAdBanners()); }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const persist = (updated: AdBanner[]) => {
    setAds(updated);
    saveAdBanners(updated);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { showToast('File too large (max 20MB)', 'error'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      setRawImageUrl(ev.target?.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropped = (dataUrl: string) => {
    setForm(f => ({ ...f, imageDataUrl: dataUrl }));
    setShowCropper(false);
    setRawImageUrl('');
    showToast('Image cropped & applied ✓');
  };

  const startAdd = () => {
    setAdding(true);
    setEditingId(null);
    setForm({ ...BLANK_AD, priority: ads.length > 0 ? Math.max(...ads.map(a => a.priority)) + 10 : 10 });
    setShowCropper(false);
  };

  const startEdit = (ad: AdBanner) => {
    setEditingId(ad.id);
    setAdding(false);
    setForm({
      title: ad.title, subtitle: ad.subtitle, ctaText: ad.ctaText, ctaUrl: ad.ctaUrl,
      imageDataUrl: ad.imageDataUrl, imagePosition: ad.imagePosition, bgColor: ad.bgColor,
      adType: ad.adType, isActive: ad.isActive, priority: ad.priority,
      startDate: ad.startDate, endDate: ad.endDate, targetCategory: ad.targetCategory,
    });
    setShowCropper(false);
  };

  const cancelForm = () => {
    setAdding(false); setEditingId(null);
    setShowCropper(false); setRawImageUrl('');
  };

  const saveForm = () => {
    if (!form.title.trim()) { showToast('Title is required', 'error'); return; }
    if (!form.startDate || !form.endDate) { showToast('Start and end dates required', 'error'); return; }
    const now = new Date().toISOString();
    if (editingId) {
      persist(ads.map(a => a.id === editingId ? { ...a, ...form, updatedAt: now } : a));
      showToast('Ad updated successfully');
    } else {
      const newAd: AdBanner = {
        id: `ad-${Date.now()}`, ...form,
        clicks: 0, impressions: 0,
        createdAt: now, updatedAt: now,
      };
      persist([...ads, newAd]);
      showToast('Ad created and published');
    }
    cancelForm();
  };

  const toggleActive = (id: string) => {
    persist(ads.map(a => a.id === id ? { ...a, isActive: !a.isActive, updatedAt: new Date().toISOString() } : a));
  };

  const changePriority = (id: string, dir: 'up' | 'down') => {
    const sorted = [...ads].sort((a, b) => a.priority - b.priority);
    const idx = sorted.findIndex(a => a.id === id);
    if (dir === 'up' && idx > 0) {
      const tmp = sorted[idx].priority;
      sorted[idx].priority = sorted[idx - 1].priority;
      sorted[idx - 1].priority = tmp;
    } else if (dir === 'down' && idx < sorted.length - 1) {
      const tmp = sorted[idx].priority;
      sorted[idx].priority = sorted[idx + 1].priority;
      sorted[idx + 1].priority = tmp;
    }
    persist(sorted);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    persist(ads.filter(a => a.id !== deleteTarget.id));
    showToast(`"${deleteTarget.title}" deleted`, 'error');
    setDeleteTarget(null);
  };

  const sorted = [...ads].sort((a, b) => a.priority - b.priority);
  const totalImpressions = ads.reduce((s, a) => s + a.impressions, 0);
  const totalClicks = ads.reduce((s, a) => s + a.clicks, 0);
  const activeCount = ads.filter(a => a.isActive).length;
  const today = new Date().toISOString().split('T')[0];
  const liveCount = ads.filter(a => a.isActive && a.startDate <= today && a.endDate >= today).length;

  // ── Form panel ──────────────────────────────────────────────────────────────
  const FormPanel = () => (
    <Card className="border-2 border-[#003366]/30 bg-[#003366]/[0.02] shadow-md">
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="text-sm font-bold text-[#003366] flex items-center gap-2">
          <Megaphone className="h-4 w-4" />
          {adding ? 'Create New Ad Banner' : 'Edit Ad Banner'}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-4">

        {/* Image Upload + Crop */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1 mb-1.5">
            <ImageIcon className="h-3 w-3" /> Banner Image (Full HD 1920×600)
          </label>
          {showCropper && rawImageUrl ? (
            <ImageCropper srcUrl={rawImageUrl} onCrop={handleCropped} onCancel={() => { setShowCropper(false); setRawImageUrl(''); }} />
          ) : (
            <div className="space-y-2">
              {form.imageDataUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-200">
                  <img src={form.imageDataUrl} alt="preview" className="w-full h-28 object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => fileRef.current?.click()}
                      className="bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1">
                      <Upload className="h-3 w-3" /> Replace
                    </button>
                    <button onClick={() => setForm(f => ({ ...f, imageDataUrl: '' }))}
                      className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1">
                      <X className="h-3 w-3" /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-[#003366]/30 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#003366]/60 hover:bg-[#003366]/5 transition-all"
                >
                  <Upload className="h-6 w-6 text-[#003366]/50" />
                  <span className="text-xs text-slate-500">Click to upload image (JPG/PNG/WEBP, max 20MB)</span>
                  <span className="text-[10px] text-slate-400">Will be cropped to 1920×600 Full HD</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />

              {/* Image position */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Image Layout</label>
                <div className="flex gap-2 mt-1">
                  {(['full', 'left', 'right', 'center'] as const).map(pos => (
                    <button key={pos} onClick={() => setForm(f => ({ ...f, imagePosition: pos }))}
                      className={`flex-1 text-[10px] font-semibold py-1.5 rounded-lg border transition-all capitalize ${form.imagePosition === pos ? 'bg-[#003366] text-white border-[#003366]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#003366]/40'}`}>
                      {pos === 'full' ? '↔ Full BG' : pos === 'left' ? '◧ Left' : pos === 'right' ? '◨ Right' : '◉ Center'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Background gradient (if no image or as fallback) */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1 mb-1.5">
            <Palette className="h-3 w-3" /> Background Gradient (fallback / overlay)
          </label>
          <div className="flex gap-2 flex-wrap">
            {GRADIENTS.map((g, i) => (
              <button key={i} onClick={() => setForm(f => ({ ...f, bgColor: g }))}
                className={`w-10 h-7 rounded-md border-2 transition-all ${form.bgColor === g ? 'border-[#003366] scale-110' : 'border-transparent hover:border-slate-300'}`}
                style={{ background: g }} />
            ))}
            <input type="text" value={form.bgColor} onChange={e => setForm(f => ({ ...f, bgColor: e.target.value }))}
              placeholder="custom CSS gradient"
              className="flex-1 min-w-32 text-[10px] border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#003366]" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1 mb-1">
              <Type className="h-3 w-3" /> Headline *
            </label>
            <input className="w-full text-xs border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#003366]"
              placeholder="e.g. IBPS PO 2026 Notification Out!"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1 mb-1">
              <AlignLeft className="h-3 w-3" /> Subheadline
            </label>
            <input className="w-full text-xs border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#003366]"
              placeholder="Short description or tagline"
              value={form.subtitle}
              onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} />
          </div>
        </div>

        {/* CTA */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1 mb-1">
              <MousePointer className="h-3 w-3" /> CTA Button Text
            </label>
            <input className="w-full text-xs border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#003366]"
              placeholder="Learn More / Apply Now"
              value={form.ctaText}
              onChange={e => setForm(f => ({ ...f, ctaText: e.target.value }))} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1 mb-1">
              <Link className="h-3 w-3" /> CTA Link URL
            </label>
            <input className="w-full text-xs border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#003366]"
              placeholder="/student/tests/banking or https://..."
              value={form.ctaUrl}
              onChange={e => setForm(f => ({ ...f, ctaUrl: e.target.value }))} />
          </div>
        </div>

        {/* Ad type + Category + Priority */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1 mb-1">
              <Tag className="h-3 w-3" /> Ad Type
            </label>
            <select className="w-full text-xs border rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#003366]"
              value={form.adType}
              onChange={e => setForm(f => ({ ...f, adType: e.target.value as AdType }))}>
              <option value="exam">🎯 Exam Update (10s)</option>
              <option value="promotional">🔥 Promotion (5s)</option>
              <option value="announcement">📢 Announcement (5s)</option>
              <option value="course">📚 Course Offer (5s)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1 mb-1">
              Target Audience
            </label>
            <select className="w-full text-xs border rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#003366]"
              value={form.targetCategory}
              onChange={e => setForm(f => ({ ...f, targetCategory: e.target.value }))}>
              <option value="">All Students</option>
              <option value="banking">Banking</option>
              <option value="ssc">SSC</option>
              <option value="railway">Railway</option>
              <option value="upsc">UPSC</option>
              <option value="insurance">Insurance</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">
              Priority (lower = first)
            </label>
            <input type="number" min={1} max={999}
              className="w-full text-xs border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#003366]"
              value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority: parseInt(e.target.value) || 10 }))} />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3" /> Show From *
            </label>
            <input type="date" className="w-full text-xs border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#003366]"
              value={form.startDate}
              onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3" /> Show Until *
            </label>
            <input type="date" className="w-full text-xs border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#003366]"
              value={form.endDate}
              onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
          </div>
        </div>

        {/* Active toggle */}
        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
          <input type="checkbox" className="rounded" checked={form.isActive}
            onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
          Publish immediately (visible to students)
        </label>

        {/* Preview */}
        {previewMode && form.title && (
          <div className="rounded-xl overflow-hidden border border-slate-200">
            <div className="text-[10px] text-slate-400 px-3 py-1 bg-slate-50 border-b font-semibold uppercase tracking-wide">Preview</div>
            <div
              className="relative min-h-[100px] flex items-center px-6 py-4"
              style={{ background: form.imageDataUrl && form.imagePosition === 'full' ? undefined : form.bgColor }}
            >
              {form.imageDataUrl && form.imagePosition === 'full' && (
                <>
                  <img src={form.imageDataUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                </>
              )}
              <div className="relative z-10">
                <p className="font-black text-white text-lg leading-tight">{form.title}</p>
                {form.subtitle && <p className="text-white/80 text-xs mt-0.5">{form.subtitle}</p>}
                {form.ctaText && (
                  <div className="mt-2 inline-flex items-center gap-1 bg-white text-slate-800 font-bold text-xs px-3 py-1.5 rounded-full">
                    {form.ctaText}
                  </div>
                )}
              </div>
              {form.imageDataUrl && form.imagePosition === 'center' && (
                <img src={form.imageDataUrl} alt="" className="ml-auto h-20 w-20 object-contain rounded-xl" />
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          <Button size="sm" className="h-8 text-xs bg-[#003366] gap-1.5" onClick={saveForm}>
            <Save className="h-3 w-3" />{adding ? 'Publish Ad' : 'Save Changes'}
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5"
            onClick={() => setPreviewMode(p => !p)}>
            <Eye className="h-3 w-3" />{previewMode ? 'Hide Preview' : 'Preview'}
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={cancelForm}>
            <X className="h-3 w-3" />Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 max-w-5xl">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Megaphone size={18} className="text-[#003366]" />
            Ad Banners Manager
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage promotional banners shown on the student dashboard. Changes are live immediately.
          </p>
        </div>
        {!adding && !editingId && (
          <Button size="sm" className="h-8 text-xs bg-[#003366] gap-1.5" onClick={startAdd}>
            <Plus size={13} /> New Ad Banner
          </Button>
        )}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Ads', value: ads.length, icon: ImageIcon, color: 'text-slate-600 bg-slate-50 border-slate-200' },
          { label: 'Live Now', value: liveCount, icon: Eye, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          { label: 'Impressions', value: totalImpressions.toLocaleString(), icon: BarChart2, color: 'text-blue-700 bg-blue-50 border-blue-200' },
          { label: 'Clicks', value: totalClicks.toLocaleString(), icon: MousePointer, color: 'text-orange-700 bg-orange-50 border-orange-200' },
        ].map(stat => (
          <div key={stat.label} className={`rounded-xl border p-3 flex items-center gap-3 ${stat.color}`}>
            <stat.icon className="h-5 w-5 opacity-70 shrink-0" />
            <div>
              <div className="text-xl font-black leading-none">{stat.value}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wide opacity-70 mt-0.5">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {toast.type === 'success' ? <Check size={14} /> : <AlertTriangle size={14} />}
          {toast.msg}
        </div>
      )}

      {/* Form */}
      {(adding || editingId) && <FormPanel />}

      {/* Ads list */}
      <div className="space-y-3">
        {sorted.length === 0 && !adding && (
          <div className="text-center py-20 text-muted-foreground">
            <Megaphone size={44} className="mx-auto mb-4 opacity-20" />
            <p className="font-semibold text-base">No ads created yet</p>
            <p className="text-sm mt-1">Click "New Ad Banner" to create your first promotional banner</p>
          </div>
        )}

        {sorted.map((ad, idx) => {
          const isEditing = editingId === ad.id;
          const isLive = ad.isActive && ad.startDate <= today && ad.endDate >= today;
          const isScheduled = ad.isActive && ad.startDate > today;
          const isExpired = ad.endDate < today;
          const typeInfo = AD_TYPE_LABELS[ad.adType];
          const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0.0';

          return (
            <div key={ad.id}>
              {isEditing ? (
                <FormPanel />
              ) : (
                <Card className={`border transition-all ${!ad.isActive ? 'opacity-55' : ''} ${isLive ? 'border-emerald-200' : ''}`}>
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Thumbnail */}
                      <div className="w-20 h-14 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 relative">
                        {ad.imageDataUrl ? (
                          <img src={ad.imageDataUrl} alt={ad.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ background: ad.bgColor }}>
                            <ImageIcon className="h-5 w-5 text-white/60" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="font-bold text-sm text-slate-900 truncate">{ad.title}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${typeInfo.color}`}>
                            {typeInfo.icon} {typeInfo.label}
                          </span>
                          {isLive && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-0.5"><span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse inline-block"></span> LIVE</span>}
                          {isScheduled && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">Scheduled</span>}
                          {isExpired && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">Expired</span>}
                          {!ad.isActive && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">Hidden</span>}
                        </div>
                        {ad.subtitle && <p className="text-[11px] text-slate-500 truncate">{ad.subtitle}</p>}
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 flex-wrap">
                          <span>📅 {ad.startDate} → {ad.endDate}</span>
                          <span>⏱ {getSlideDuration(ad.adType) / 1000}s slide</span>
                          {ad.targetCategory && <span>👥 {ad.targetCategory}</span>}
                          <span>👁 {ad.impressions.toLocaleString()}</span>
                          <span>🖱 {ad.clicks} ({ctr}% CTR)</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Priority arrows */}
                        <div className="flex flex-col">
                          <button onClick={() => changePriority(ad.id, 'up')} disabled={idx === 0}
                            className="p-0.5 hover:bg-slate-100 rounded disabled:opacity-30">
                            <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                          </button>
                          <button onClick={() => changePriority(ad.id, 'down')} disabled={idx === sorted.length - 1}
                            className="p-0.5 hover:bg-slate-100 rounded disabled:opacity-30">
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                          </button>
                        </div>

                        <button onClick={() => toggleActive(ad.id)} title={ad.isActive ? 'Hide' : 'Show'}
                          className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground transition-colors">
                          {ad.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button onClick={() => startEdit(ad)}
                          className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(ad)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          );
        })}
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2 bg-sky-50 border border-sky-200 rounded-lg px-4 py-3 text-xs text-sky-700">
        <Megaphone size={13} className="mt-0.5 shrink-0" />
        <div>
          <strong>Live changes</strong> — Ad banners appear immediately below the Target Exam banner on the student dashboard.
          <br /><strong>Exam Update</strong> ads auto-slide every <strong>10 seconds</strong>; all other types slide every <strong>5 seconds</strong>.
          <br /><strong>Scheduling</strong> — Ads only show between their Start and End dates. Use Eye icon to temporarily hide.
          <br /><strong>Priority</strong> — Lower number = shown first in the rotation. Use ▲▼ arrows to reorder.
        </div>
      </div>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" /> Delete Ad Banner?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>"{deleteTarget?.title}"</strong> and remove it from the student dashboard.
              Click/impression data will also be lost. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmDelete}>
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdsManager;
