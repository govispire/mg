import React from 'react';
import { X } from 'lucide-react';
import WeaknessHeatmapEngine from './WeaknessHeatmapEngine';

interface WeaknessDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  examId?: string;
  examName?: string;
}

export const WeaknessDetectionModal: React.FC<WeaknessDetectionModalProps> = ({
  isOpen,
  onClose,
  examId,
  examName,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', flexDirection: 'column', padding: '20px',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
      onClick={onClose}
    >
      <div
        style={{
          margin: 'auto', width: '100%', maxWidth: 1060,
          maxHeight: 'calc(100vh - 40px)', borderRadius: 16, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          background: '#f8fafc', boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
          border: '1px solid #e2e8f0',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 20px', background: '#fff',
          borderBottom: '1px solid #e2e8f0', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#ecfdf5', border: '1px solid #6ee7b7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
              🧠
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                Weakness Predictor
              </div>
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>
                Based on your last 10 test attempts · Topics from official syllabus
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: 6, background: '#f1f5f9',
              border: '1px solid #e2e8f0', cursor: 'pointer', color: '#64748b',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Engine */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <WeaknessHeatmapEngine examId={examId} examName={examName} />
        </div>
      </div>
    </div>
  );
};

export default WeaknessDetectionModal;
