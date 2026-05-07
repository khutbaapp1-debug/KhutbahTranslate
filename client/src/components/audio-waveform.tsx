import { useEffect, useRef } from "react";

const BAR_COUNT = 20;

interface AudioWaveformProps {
  analyserRef: { current: AnalyserNode | null };
  isActive: boolean;
}

export function AudioWaveform({ analyserRef, isActive }: AudioWaveformProps) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const dataRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    function cancelLoop() {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }

    function setIdle() {
      barsRef.current.forEach((bar) => {
        if (!bar) return;
        bar.style.height = "4px";
        bar.style.opacity = "0.3";
      });
    }

    if (isActive && analyserRef.current) {
      const binCount = analyserRef.current.frequencyBinCount;
      dataRef.current = new Uint8Array(binCount);
      const step = binCount / BAR_COUNT;

      const tick = () => {
        if (!analyserRef.current || !dataRef.current) return;
        analyserRef.current.getByteFrequencyData(dataRef.current);

        barsRef.current.forEach((bar, i) => {
          if (!bar) return;
          const value = dataRef.current![Math.floor(i * step)];
          bar.style.height = `${Math.max(8, (value / 255) * 100)}%`;
          bar.style.opacity = "1";
        });

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    } else {
      cancelLoop();
      setIdle();
    }

    return cancelLoop;
  }, [isActive, analyserRef]);

  return (
    <div className="flex items-end justify-center gap-0.5 h-10 w-full">
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <div
          key={i}
          ref={(el) => { barsRef.current[i] = el; }}
          className="w-1.5 rounded-sm bg-primary"
          style={{ height: "4px", opacity: 0.3 }}
        />
      ))}
    </div>
  );
}
