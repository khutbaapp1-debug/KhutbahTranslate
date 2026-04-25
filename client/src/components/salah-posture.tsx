import takbirImg from "@assets/salah/takbir.png";
import qiyamImg from "@assets/salah/qiyam.png";
import rukuImg from "@assets/salah/ruku.png";
import sujoodImg from "@assets/salah/sujood.png";
import jalsahImg from "@assets/salah/jalsah.png";
import tasleemImg from "@assets/salah/tasleem.png";

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

const images: Record<Pose, string> = {
  takbir: takbirImg,
  qiyam: qiyamImg,
  ruku: rukuImg,
  sujood: sujoodImg,
  jalsah: jalsahImg,
  tasleem: tasleemImg,
};

const labels: Record<Pose, string> = {
  takbir: "Takbir position",
  qiyam: "Standing position",
  ruku: "Bowing position",
  sujood: "Prostration position",
  jalsah: "Sitting position",
  tasleem: "Closing salam position",
};

export function SalahPosture({ pose, className }: SalahPostureProps) {
  return (
    <img
      src={images[pose]}
      alt={labels[pose]}
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}

export type { Pose };
