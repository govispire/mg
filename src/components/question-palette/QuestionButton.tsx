/**
 * QuestionButton.tsx
 * Renders IBPS-standard question palette buttons using CSS clip-path shapes.
 *
 * Shapes:
 *   answered        → green downward-pentagon (house shape ▼)
 *   not-answered    → red downward-shield    (shield ▼)
 *   not-visited     → light-gray rounded square with border
 *   marked          → purple circle
 *   answered-marked → purple circle + small green badge
 *
 * HOW TO ADJUST SHAPES:
 *   Edit the CSS clip-path values inside SHAPE_STYLES below.
 *   Pentagon: clip-path polygon defines the 5 corners.
 *   Shield:   clip-path polygon with deeper pointed bottom.
 */

import React from 'react';
import './palette.css';

export type PaletteStatus =
    | 'not-visited'
    | 'not-answered'
    | 'answered'
    | 'marked'
    | 'answered-marked';

// ── Per-status CSS shape config ──────────────────────────────────
interface ShapeStyle {
    background: string;
    clipPath?: string;
    borderRadius?: string;
    border?: string;
    textColor: string;
}

const SHAPE_STYLES: Record<PaletteStatus, ShapeStyle> = {
    // Green downward pentagon (house shape pointing down)
    answered: {
        background: 'linear-gradient(160deg, #5dce5d 0%, #3cb83c 100%)',
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 68%, 50% 100%, 0% 68%)',
        textColor: '#ffffff',
    },
    // Red/orange shield pointing down
    'not-answered': {
        background: 'linear-gradient(160deg, #f05050 0%, #d63232 100%)',
        clipPath: 'polygon(5% 0%, 95% 0%, 100% 10%, 100% 65%, 50% 100%, 0% 65%, 0% 10%)',
        textColor: '#ffffff',
    },
    // Light gray rounded square — NO sprite, pure CSS
    'not-visited': {
        background: '#f3f4f6',
        borderRadius: '6px',
        border: '1.5px solid #9ca3af',
        textColor: '#374151',
    },
    // Purple circle
    marked: {
        background: 'linear-gradient(135deg, #9966cc 0%, #7c3aed 100%)',
        borderRadius: '50%',
        textColor: '#ffffff',
    },
    // Purple circle with green badge (handled separately)
    'answered-marked': {
        background: 'linear-gradient(135deg, #9966cc 0%, #7c3aed 100%)',
        borderRadius: '50%',
        textColor: '#ffffff',
    },
};

// ── getBgStyle kept for backward-compat (no longer used for shapes) ──
export function getBgStyle(_status: PaletteStatus, _containerSize = 52): React.CSSProperties {
    return {}; // no-op — CSS shapes handle rendering now
}

// spriteMap exported so legend can reference it (textColor only needed now)
export const spriteMap: Record<PaletteStatus, { textColor: string }> = {
    'answered': { textColor: '#ffffff' },
    'not-answered': { textColor: '#ffffff' },
    'not-visited': { textColor: '#374151' },
    'marked': { textColor: '#ffffff' },
    'answered-marked': { textColor: '#ffffff' },
};

// ── QuestionButton ────────────────────────────────────────────────
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
    size = 52,
    onClick,
}) => {
    const shape = SHAPE_STYLES[status] ?? SHAPE_STYLES['not-visited'];
    const isAnsweredMarked = status === 'answered-marked';

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={`Question ${questionNumber} – ${status.replace(/-/g, ' ')}`}
            aria-current={isCurrent ? 'true' : undefined}
            className={`q-btn status-${status}${isCurrent ? ' is-current' : ''}`}
            style={{
                width: size,
                height: size,
                position: 'relative',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 0,
                outline: 'none',
                // Current question glow
                filter: isCurrent ? 'drop-shadow(0 0 5px rgba(29,78,216,0.8))' : undefined,
            }}
        >
            {/* Shape div */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: shape.background,
                    clipPath: shape.clipPath,
                    borderRadius: shape.borderRadius,
                    border: shape.border,
                    width: '100%',
                    height: '100%',
                }}
            />

            {/* Question number overlay */}
            <span
                style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700,
                    fontSize: size < 40 ? 10 : size < 48 ? 12 : 13,
                    color: shape.textColor,
                    lineHeight: 1,
                    // Shift number slightly up for pentagon/shield (bottom is the point)
                    paddingBottom: shape.clipPath ? '18%' : 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                }}
            >
                {questionNumber}
            </span>

            {/* Answered-and-marked: small green badge at bottom-right */}
            {isAnsweredMarked && (
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: Math.round(size * 0.35),
                        height: Math.round(size * 0.35),
                        background: '#22c55e',
                        borderRadius: '50%',
                        border: '2px solid white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {/* Green checkmark */}
                    <svg
                        viewBox="0 0 10 8"
                        fill="none"
                        style={{ width: '55%', height: '55%' }}
                    >
                        <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            )}
        </button>
    );
};

export default QuestionButton;
