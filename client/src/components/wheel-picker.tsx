import { useRef, useEffect } from "react";

interface WheelPickerProps {
  items: { label: string; value: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
  className?: string;
}

export function WheelPicker({ items, selectedValue, onChange, className }: WheelPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedIndex = items.findIndex((i) => i.value === selectedValue);

  function scrollToIndex(index: number, smooth = true) {
    const el = scrollRef.current;
    const item = itemRefs.current[index];
    if (!el || !item) return;
    el.scrollTo({
      left: item.offsetLeft + item.offsetWidth / 2 - el.clientWidth / 2,
      behavior: smooth ? "smooth" : "instant",
    });
  }

  useEffect(() => {
    const t = setTimeout(() => scrollToIndex(selectedIndex, false), 16);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleScroll() {
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      const el = scrollRef.current;
      if (!el) return;
      const viewCenter = el.scrollLeft + el.clientWidth / 2;
      let closest = 0;
      let minDist = Infinity;
      itemRefs.current.forEach((item, i) => {
        if (!item) return;
        const d = Math.abs(item.offsetLeft + item.offsetWidth / 2 - viewCenter);
        if (d < minDist) { minDist = d; closest = i; }
      });
      onChange(items[closest].value);
    }, 80);
  }

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <style>{`.wp-scroll::-webkit-scrollbar{display:none}`}</style>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-14 z-10 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-14 z-10 bg-gradient-to-l from-background to-transparent" />
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="wp-scroll flex items-center h-12"
        style={{ overflowX: "scroll", scrollSnapType: "x mandatory", scrollbarWidth: "none" }}
      >
        <div style={{ flex: "0 0 50%" }} aria-hidden="true" />
        {items.map((item, index) => {
          const dist = Math.abs(index - selectedIndex);
          const opacity = dist === 0 ? 1 : dist === 1 ? 0.5 : 0.2;
          const scale = dist === 0 ? 1.1 : 1;
          return (
            <button
              key={item.value}
              ref={(el) => { itemRefs.current[index] = el; }}
              onClick={() => { onChange(item.value); scrollToIndex(index); }}
              style={{
                flex: "0 0 auto",
                scrollSnapAlign: "center",
                opacity,
                transform: `scale(${scale})`,
                transition: "opacity 200ms ease, transform 200ms ease",
              }}
              className="px-5 h-full flex items-center text-sm font-medium text-foreground whitespace-nowrap"
              data-testid={`wheel-item-${item.value}`}
            >
              {item.label}
            </button>
          );
        })}
        <div style={{ flex: "0 0 50%" }} aria-hidden="true" />
      </div>
    </div>
  );
}
