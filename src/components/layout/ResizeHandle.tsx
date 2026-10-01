import { useState, useRef, useEffect, useCallback } from "react";

interface ResizeHandleProps {
  direction: "vertical" | "horizontal";
  onResize: (delta: number) => void;
  onResizeEnd?: () => void;
  onDoubleClick?: () => void;
  className?: string;
  title?: string;
}

export default function ResizeHandle({
  direction,
  onResize,
  onResizeEnd,
  onDoubleClick,
  className = "",
  title = "Drag to resize • Double click to reset",
}: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef<number>(0);
  const onResizeRef = useRef(onResize);
  const onResizeEndRef = useRef(onResizeEnd);

  useEffect(() => {
    onResizeRef.current = onResize;
    onResizeEndRef.current = onResizeEnd;
  }, [onResize, onResizeEnd]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const target = e.currentTarget;
      target.setPointerCapture(e.pointerId);

      setIsDragging(true);
      startPosRef.current = direction === "vertical" ? e.clientX : e.clientY;

      // Add user-select none to body while dragging
      document.body.style.userSelect = "none";
      document.body.style.cursor = direction === "vertical" ? "col-resize" : "row-resize";

      const handlePointerMove = (moveEvt: PointerEvent) => {
        const current = direction === "vertical" ? moveEvt.clientX : moveEvt.clientY;
        const delta = current - startPosRef.current;
        startPosRef.current = current;
        onResizeRef.current(delta);
      };

      const handlePointerUp = (upEvt: PointerEvent) => {
        try {
          target.releasePointerCapture(upEvt.pointerId);
        } catch {
          // ignore
        }
        setIsDragging(false);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("pointercancel", handlePointerUp);
        onResizeEndRef.current?.();
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerUp);
    },
    [direction]
  );

  return (
    <div
      onPointerDown={handlePointerDown}
      onDoubleClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDoubleClick?.();
      }}
      title={title}
      className={`
        group relative select-none touch-none z-20 shrink-0
        ${direction === "vertical" ? "w-1 cursor-col-resize hover:w-1.5 -mx-0.5" : "h-1 cursor-row-resize hover:h-1.5 -my-0.5"}
        ${className}
      `}
    >
      {/* Visual Indicator Line */}
      <div
        className={`
          w-full h-full transition-colors duration-150
          ${
            isDragging
              ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
              : "bg-transparent group-hover:bg-indigo-500/50"
          }
        `}
      />
    </div>
  );
}
