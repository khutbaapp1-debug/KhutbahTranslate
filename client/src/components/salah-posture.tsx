type Pose =
  | "takbir"
  | "qiyam"
  | "ruku"
  | "sujood"
  | "jalsah"
  | "tasleem";

interface SalahPostureProps {
  pose: Pose;
  className?: string;
}

const svgProps = {
  viewBox: "0 0 120 100",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Ground() {
  return (
    <line
      x1="18"
      y1="93"
      x2="102"
      y2="93"
      strokeOpacity="0.3"
      strokeDasharray="3 3"
    />
  );
}

const labels: Record<Pose, string> = {
  takbir: "Takbir position diagram",
  qiyam: "Standing position diagram",
  ruku: "Bowing position diagram",
  sujood: "Prostration position diagram",
  jalsah: "Sitting position diagram",
  tasleem: "Closing salam position diagram",
};

export function SalahPosture({ pose, className }: SalahPostureProps) {
  const aria = labels[pose];

  switch (pose) {
    case "takbir":
      return (
        <svg {...svgProps} className={className} role="img" aria-label={aria}>
          <circle cx="60" cy="20" r="6" />
          <line x1="60" y1="26" x2="60" y2="60" />
          <path d="M60 32 L48 22 L46 12" />
          <path d="M60 32 L72 22 L74 12" />
          <line x1="60" y1="60" x2="52" y2="88" />
          <line x1="60" y1="60" x2="68" y2="88" />
          <Ground />
        </svg>
      );

    case "qiyam":
      return (
        <svg {...svgProps} className={className} role="img" aria-label={aria}>
          <circle cx="60" cy="20" r="6" />
          <line x1="60" y1="26" x2="60" y2="60" />
          <path d="M60 32 Q50 38 60 44" />
          <path d="M60 32 Q70 38 60 44" />
          <line x1="60" y1="60" x2="52" y2="88" />
          <line x1="60" y1="60" x2="68" y2="88" />
          <Ground />
        </svg>
      );

    case "ruku":
      return (
        <svg {...svgProps} className={className} role="img" aria-label={aria}>
          <circle cx="92" cy="38" r="6" />
          <line x1="58" y1="42" x2="86" y2="38" />
          <line x1="80" y1="42" x2="70" y2="68" />
          <line x1="58" y1="42" x2="54" y2="88" />
          <line x1="58" y1="42" x2="62" y2="88" />
          <Ground />
        </svg>
      );

    case "sujood":
      return (
        <svg {...svgProps} className={className} role="img" aria-label={aria}>
          <circle cx="86" cy="80" r="6" />
          <line x1="78" y1="84" x2="62" y2="58" />
          <path d="M62 58 Q56 64 50 72" />
          <line x1="50" y1="72" x2="38" y2="90" />
          <line x1="50" y1="72" x2="34" y2="90" />
          <Ground />
        </svg>
      );

    case "jalsah":
      return (
        <svg {...svgProps} className={className} role="img" aria-label={aria}>
          <circle cx="60" cy="32" r="6" />
          <line x1="60" y1="38" x2="60" y2="66" />
          <path d="M60 44 Q70 52 76 68" />
          <path d="M60 44 Q50 52 44 68" />
          <line x1="60" y1="66" x2="42" y2="80" />
          <line x1="60" y1="66" x2="78" y2="80" />
          <Ground />
        </svg>
      );

    case "tasleem":
      return (
        <svg {...svgProps} className={className} role="img" aria-label={aria}>
          <circle cx="68" cy="32" r="6" />
          <path d="M76 30 L82 32 L76 36" strokeOpacity="0.5" />
          <line x1="60" y1="38" x2="60" y2="66" />
          <path d="M60 44 Q70 52 76 68" />
          <path d="M60 44 Q50 52 44 68" />
          <line x1="60" y1="66" x2="42" y2="80" />
          <line x1="60" y1="66" x2="78" y2="80" />
          <Ground />
        </svg>
      );
  }
}

export type { Pose };
