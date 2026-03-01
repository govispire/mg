/**
 * QuestionButton.tsx
 * Renders a single question palette button using the sprite sheet.
 *
 * Sprite: /images/questions-sprite.png (590 × 950 px)
 *
 * ── HOW TO RE-MAP COORDINATES ──────────────────────────────────
 * Open /public/images/questions-sprite.png in any image editor.
 * Find the top-left corner (x, y) of each icon you need.
 * Set those as `x` and `y` in spriteMap below.
 * Adjust `w` and `h` to the icon's natural size in the sprite.
 * The button container is always 52×52px; the sprite will be scaled
 * to fill it via background-size if iconW/iconH differ from 52.
 * ───────────────────────────────────────────────────────────────
 */

import React from 'react';
import './palette.css';

// ── Status type (mirrors QuestionStatus enum values as strings) ──
export type PaletteStatus =
    | 'not-visited'
    | 'not-answered'
    | 'answered'
    | 'marked'
    | 'answered-marked';

// ── Sprite Map ───────────────────────────────────────────────────
// x, y = top-left pixel of the icon in the 590×950px sprite.
// w, h = natural size of the icon in the sprite (before scaling).
// displayW, displayH = rendered size inside the 52px button.

interface SpriteEntry {
    x: number;  // sprite pixel X
    y: number;  // sprite pixel Y
    w: number;  // icon width in sprite
    h: number;  // icon height in sprite
    textColor: '#ffffff' | '#374151'; // number overlay colour
}

export const spriteMap: Record<PaletteStatus, SpriteEntry> = {
    // Green downward-pentagon shape
    'answered': {
        x: 4, y: 5, w: 50, h: 42,
        textColor: '#ffffff',
    },
    // Red upward-shield shape
    'not-answered': {
        x: 57, y: 6, w: 49, h: 41,
        textColor: '#ffffff',
    },
    // Gray rounded rectangle
    'not-visited': {
        x: 208, y: 4, w: 44, h: 43,
        textColor: '#374151',
    },
    // Purple circle
    'marked': {
        x: 108, y: 1, w: 49, h: 49,
        textColor: '#ffffff',
    },
    // Purple circle + small green check badge (composite icon in sprite)
    'answered-marked': {
        x: 203, y: 48, w: 53, h: 50,
        textColor: '#ffffff',
    },
};

// ── Helper: compute CSS background-position ─────────────────────
export function getBgStyle(status: PaletteStatus, containerSize = 52) {
    const m = spriteMap[status] ?? spriteMap['not-visited'];
    // Scale factor so the icon fills the container
    const scale = containerSize / Math.max(m.w, m.h);
    return {
        backgroundImage: `url('/images/questions-sprite.png')`,
        backgroundPosition: `-${m.x * scale}px -${m.y * scale}px`,
        backgroundSize: `${590 * scale}px ${950 * scale}px`,
        backgroundRepeat: 'no-repeat' as const,
        width: `${containerSize}px`,
        height: `${containerSize}px`,
    };
}

// ── Component Props ─────────────────────────────────────────────
interface QuestionButtonProps {
    /** 1-based question number shown inside the button */
    questionNumber: number;
    /** Question status drives which sprite frame is shown */
    status: PaletteStatus;
    /** Whether this is the currently active question */
    isCurrent?: boolean;
    /** Button size in px (default 52) */
    size?: number;
    onClick: () => void;
}

// ── QuestionButton ───────────────────────────────────────────────
export const QuestionButton: React.FC<QuestionButtonProps> = ({
    questionNumber,
    status,
    isCurrent = false,
    size = 52,
    onClick,
}) => {
    const bgStyle = getBgStyle(status, size);
    const textColor = spriteMap[status]?.textColor ?? '#ffffff';

    return (
        <button
            type="button"
            className={`q-btn status-${status}${isCurrent ? ' is-current' : ''}`}
            style={{ width: size, height: size }}
            onClick={onClick}
            aria-label={`Question ${questionNumber} – ${status.replace(/-/g, ' ')}`}
            aria-current={isCurrent ? 'true' : undefined}
        >
            {/* Sprite frame */}
            <span className="q-icon" style={bgStyle} aria-hidden="true" />

            {/* Number overlay */}
            <span
                className="num"
                style={{
                    color: textColor,
                    fontSize: size < 44 ? '10px' : size < 50 ? '12px' : '13px',
                }}
            >
                {questionNumber}
            </span>
        </button>
    );
};

export default QuestionButton;
