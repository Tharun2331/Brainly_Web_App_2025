// src/components/ui/Tooltip.tsx - FIXED VERSION
import { useState, useRef, type ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, position = "bottom" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-card border-x-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-card border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-card border-y-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-card border-y-transparent border-l-transparent",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {isVisible && (
        <div className={`absolute ${positionClasses[position]} z-50 pointer-events-none animate-in fade-in duration-200`}>
          {/* Tooltip content */}
          <div className="bg-card border border-border px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
            <span className="text-sm text-foreground">{content}</span>
          </div>
          {/* Arrow */}
          <div className={`absolute ${arrowClasses[position]} w-0 h-0 border-4`} />
        </div>
      )}
    </div>
  );
}