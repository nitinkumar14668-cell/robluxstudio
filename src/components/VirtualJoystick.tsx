import React, { useRef, useState, useEffect, useCallback } from 'react';

export interface JoystickVector {
  x: number; // -1 (left) to 1 (right)
  y: number; // -1 (forward) to 1 (backward)
}

interface VirtualJoystickProps {
  onMove: (vector: JoystickVector) => void;
  onEnd?: () => void;
  opacity?: number;
  size?: number; // Outer diameter, default 130
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  onMove,
  onEnd,
  opacity = 0.9,
  size = 130,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState<boolean>(false);
  const activeTouchIdRef = useRef<number | null>(null);

  const radius = size / 2;
  const maxTravel = radius * 0.72; // Maximum travel distance for knob

  const updatePosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const distance = Math.hypot(dx, dy);

      if (distance > maxTravel) {
        const ratio = maxTravel / distance;
        dx *= ratio;
        dy *= ratio;
      }

      setKnobPos({ x: dx, y: dy });

      // Normalized output (-1 to 1)
      const normX = dx / maxTravel;
      const normY = dy / maxTravel;
      onMove({ x: normX, y: normY });
    },
    [maxTravel, onMove]
  );

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (activeTouchIdRef.current !== null) return;

    const touch = e.changedTouches[0];
    activeTouchIdRef.current = touch.identifier;
    setIsActive(true);
    updatePosition(touch.clientX, touch.clientY);
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (activeTouchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === activeTouchIdRef.current) {
          e.preventDefault();
          e.stopPropagation();
          updatePosition(touch.clientX, touch.clientY);
          break;
        }
      }
    },
    [updatePosition]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (activeTouchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === activeTouchIdRef.current) {
          e.stopPropagation();
          activeTouchIdRef.current = null;
          setIsActive(false);
          setKnobPos({ x: 0, y: 0 });
          onMove({ x: 0, y: 0 });
          if (onEnd) onEnd();
          break;
        }
      }
    },
    [onMove, onEnd]
  );

  useEffect(() => {
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchMove, handleTouchEnd]);

  // Mouse fallback for desktop testing
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsActive(true);
    updatePosition(e.clientX, e.clientY);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      updatePosition(moveEvent.clientX, moveEvent.clientY);
    };

    const handleMouseUp = () => {
      setIsActive(false);
      setKnobPos({ x: 0, y: 0 });
      onMove({ x: 0, y: 0 });
      if (onEnd) onEnd();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onMouseDown={handleMouseDown}
      style={{
        width: size,
        height: size,
        opacity,
      }}
      className="relative rounded-full select-none touch-none flex items-center justify-center cursor-pointer pointer-events-auto transition-opacity duration-200"
    >
      {/* Outer Glow / Boundary Base */}
      <div
        className={`absolute inset-0 rounded-full border-2 transition-colors duration-200 backdrop-blur-md ${
          isActive
            ? 'bg-black/60 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.4)]'
            : 'bg-black/40 border-white/25 shadow-lg'
        }`}
      >
        {/* Subtle Roblox Directional Cross / Stud accents */}
        <div className="absolute inset-x-0 top-2 text-center text-[10px] font-bold text-white/40 leading-none">
          ▲
        </div>
        <div className="absolute inset-x-0 bottom-2 text-center text-[10px] font-bold text-white/40 leading-none">
          ▼
        </div>
        <div className="absolute inset-y-0 left-2 flex items-center text-[10px] font-bold text-white/40 leading-none">
          ◀
        </div>
        <div className="absolute inset-y-0 right-2 flex items-center text-[10px] font-bold text-white/40 leading-none">
          ▶
        </div>

        {/* Center Guide Ring */}
        <div className="absolute inset-0 m-auto w-10 h-10 rounded-full border border-white/10" />
      </div>

      {/* Dynamic Draggable Knob */}
      <div
        className={`absolute w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform ease-out ${
          isActive
            ? 'bg-gradient-to-tr from-sky-600 to-sky-400 border-2 border-white scale-105'
            : 'bg-[#2a2a34]/90 border border-white/30'
        }`}
        style={{
          transform: `translate3d(${knobPos.x}px, ${knobPos.y}px, 0)`,
          transition: isActive ? 'none' : 'transform 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
      >
        {/* Inner Roblox Grip Ring */}
        <div className="w-6 h-6 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
          <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-white' : 'bg-sky-400/70'}`} />
        </div>
      </div>
    </div>
  );
};
