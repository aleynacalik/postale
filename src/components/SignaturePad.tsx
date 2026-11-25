import React, { useRef, useState } from 'react';
import { Eraser, PenLine } from 'lucide-react';

interface SignaturePadProps {
  value: string | null;
  onChange: (svgPath: string | null) => void;
}

interface Point {
  x: number;
  y: number;
}

const VIEW_W = 300;
const VIEW_H = 110;

function strokesToSvgPath(strokes: Point[][]): string {
  return strokes
    .filter((s) => s.length > 0)
    .map((stroke) => {
      if (stroke.length === 1) {
        const p = stroke[0];
        return `M ${p.x} ${p.y} L ${p.x + 0.6} ${p.y + 0.6}`;
      }
      return stroke
        .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');
    })
    .join(' ');
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ value, onChange }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const drawingRef = useRef(false);

  const getLocalPoint = (e: React.PointerEvent<SVGSVGElement>): Point => {
    const rect = svgRef.current!.getBoundingClientRect();
    const x = Math.round((((e.clientX - rect.left) / rect.width) * VIEW_W) * 10) / 10;
    const y = Math.round((((e.clientY - rect.top) / rect.height) * VIEW_H) * 10) / 10;
    return {
      x: Math.min(VIEW_W - 2, Math.max(2, x)),
      y: Math.min(VIEW_H - 2, Math.max(2, y)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const pt = getLocalPoint(e);
    setStrokes((prev) => [...prev, [pt]]);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const pt = getLocalPoint(e);
    setStrokes((prev) => {
      if (!prev.length) return [[pt]];
      const lastStroke = prev[prev.length - 1];
      const lastPt = lastStroke[lastStroke.length - 1];
      // Skip micro-jitter < 2px for cleaner, lighter paths
      if (lastPt && Math.hypot(pt.x - lastPt.x, pt.y - lastPt.y) < 2) {
        return prev;
      }
      const next = [...prev.slice(0, -1), [...lastStroke, pt]];
      return next;
    });
  };

  const finishStroke = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setStrokes((current) => {
      const newPath = strokesToSvgPath(current);
      const combined = value && !current.length ? value : value ? `${value} ${newPath}` : newPath;
      if (newPath) {
        onChange(combined.trim());
      }
      return [];
    });
  };

  const livePath = strokesToSvgPath(strokes);
  const displayPath = [value, livePath].filter(Boolean).join(' ');

  return (
    <div className="signature-pad-wrap">
      <div className="signature-pad-canvas">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="signature-svg-pad"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishStroke}
          onPointerCancel={finishStroke}
        >
          <line
            x1="18"
            y1="86"
            x2="282"
            y2="86"
            stroke="rgba(36,29,28,0.16)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          {displayPath && (
            <path
              d={displayPath}
              fill="none"
              stroke="#241d1c"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>

        {!displayPath && (
          <div className="signature-placeholder" aria-hidden="true">
            <PenLine size={14} />
            <span>İmzanı parmağınla veya fareyle buraya çiz</span>
          </div>
        )}
      </div>

      {value && (
        <button
          type="button"
          className="pill-btn ghost small"
          onClick={() => {
            setStrokes([]);
            onChange(null);
          }}
        >
          <Eraser size={13} />
          <span>İmzayı Temizle</span>
        </button>
      )}
    </div>
  );
};
