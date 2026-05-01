export type PrayerFlowRecitation = {
  arabic: string;
  transliteration: string;
  meaning: string;
  name: string;
  label?: string;
};

export type PrayerFlowCard = {
  number: number;
  title: string;
  description: string;
  recitations?: PrayerFlowRecitation[];
  note?: string;
};

export type PrayerType = "2rakat" | "4rakat" | "maghrib" | "witr";

export const prayerFlows: Record<PrayerType, PrayerFlowCard[]> = {
  "2rakat": [],
  "4rakat": [],
  "maghrib": [],
  "witr": [],
};
