/**
 * QuestionButton.tsx — sprite-based question palette button
 *
 * Sprite: /images/questions-sprite.png (590 × 950 px)
 *
 * ── HOW TO RE-MAP COORDINATES ─────────────────────────────────────
 * Open /public/images/questions-sprite.png in an image editor.
 * Find the top-left pixel (x, y) of each icon and its natural (w, h).
 * Update spriteMap below. getBgStyle() auto-scales to any container size.
 * ──────────────────────────────────────────────────────────────────
 */

import React from 'react';
import './palette.css';

export type PaletteStatus =
    | 'not-visited'
    | 'not-answered'
    | 'answered'
    | 'marked'
    | 'answered-marked';

interface SpriteEntry {
    x: number;   // top-left pixel X in sprite
    y: number;   // top-left pixel Y in sprite
    w: number;   // icon width in sprite
    h: number;   // icon height in sprite
    textColor: '#ffffff' | '#374151';
}

// Full sprite dimensions (px)
const SPRITE_W = 590;
const SPRITE_H = 950;

export const spriteMap: Partial<Record<PaletteStatus, SpriteEntry>> = {
    // Green downward-pentagon (house shape)
    'answered': {
        x: 4, y: 5, w: 50, h: 42,
        textColor: '#ffffff',
    },
    // Red upward-shield
    'not-answered': {
        x: 57, y: 6, w: 49, h: 41,
        textColor: '#ffffff',
    },
    // Purple circle
    'marked': {
        x: 108, y: 1, w: 49, h: 49,
        textColor: '#ffffff',
    },
    // Purple circle + green badge (composite in sprite)
    'answered-marked': {
        x: 203, y: 48, w: 53, h: 50,
        textColor: '#ffffff',
    },
    // NOT-VISITED intentionally omitted — rendered with CSS (see below)
};

// ── CSS fallback for not-visited (no sprite needed) ─────────────
//   Matches original IBPS design: light-gray bg, gray border, rounded
export function getNotVisitedStyle(containerSize: number) {
    return {
        width: `${containerSize}px`,
        height: `${containerSize}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#e5e7eb',          // gray-200
        border: '2px solid #9ca3af',   // gray-400
        borderRadius: '6px',
        fontSize: containerSize < 44 ? '10px' : '13px',
        fontWeight: 700,
        color: '#374151',              // gray-700
        cursor: 'pointer',
    } as React.CSSProperties;
}

// ── Sprite background style helper ─────────────────────────────
export function getBgStyle(
    status: PaletteStatus,
    containerSize = 52,
): React.CSSProperties {
    const m = spriteMap[status];
    if (!m) return {};                 // not-visited handled separately
    const scale = containerSize / Math.max(m.w, m.h);
    return {
        backgroundImage: `url('/images/questions-sprite.png')`,
        backgroundPosition: `-${m.x * scale}px -${m.y * scale}px`,
        backgroundSize: `${SPRITE_W * scale}px ${SPRITE_H * scale}px`,
        backgroundRepeat: 'no-repeat',
        display: 'block',
        width: `${containerSize}px`,
        height: `${containerSize}px`,
    };
}

// ── QuestionButton ──────────────────────────────────────────────
interface QuestionButtonProps {
    questionNumber: number;
    status: PaletteStatus;
    isCurrent?: boolean;
    size?: number;
    onClick: () => void;
}

export const QuestionButton: React.FC<QuestionButtonProps> = ({
    questionNumber,
    status,
    isCurrent = false,
    size = 48,
    onClick,
}) => {
    const isNotVisited = status === 'not-visited';
    const textColor = spriteMap[status]?.textColor ?? '#374151';
    const fontSize = size < 44 ? '10px' : size < 50 ? '12px' : '13px';
    const currentRing: React.CSSProperties = isCurrent
        ? { outline: '2px solid #1d4ed8', outlineOffset: '2px', borderRadius: '4px' }
        : {};

    // ── NOT VISITED: pure CSS, no sprite ──────────────────────
    if (isNotVisited) {
        return (
            <button
                type="button"
                onClick={onClick}
                aria-label={`Question ${questionNumber} – not visited`}
                aria-current={isCurrent ? 'true' : undefined}
                style={{
                    ...getNotVisitedStyle(size),
                    ...currentRing,
                }}
            >
                {questionNumber}
            </button>
        );
    }

    // ── SPRITE STATUSES ────────────────────────────────────────
    const bgStyle = getBgStyle(status, size);

    return (
        <button
            type="button"
            className={`q-btn${isCurrent ? ' is-current' : ''}`}
            style={{ width: size, height: size, ...currentRing }}
            onClick={onClick}
            aria-label={`Question ${questionNumber} – ${status.replace(/-/g, ' ')}`}
            aria-current={isCurrent ? 'true' : undefined}
        >
            {/* Sprite icon — absolutely positioned so it fills the button
                without adding to normal flow, num overlay sits on top */}
            <span
                aria-hidden="true"
                style={{
                    ...bgStyle,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                }}
            />
            {/* Number overlay */}
            <span
                className="num"
                style={{ color: textColor, fontSize, position: 'relative', zIndex: 1 }}
            >
                {questionNumber}
            </span>
        </button>
    );
};

export default QuestionButton;
