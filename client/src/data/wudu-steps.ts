export type WuduRecitation = {
  arabic: string;
  transliteration: string;
  meaning: string;
  name: string;
};

export type WuduStep = {
  number: number;
  title: string;
  description: string;
  recitations?: WuduRecitation[];
  note?: string;
};

export const wuduSteps: WuduStep[] = [];
