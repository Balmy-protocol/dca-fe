export type AccountLabels = Record<string, { label: string; lastModified?: number }>;
export type AccountEns = Record<string, string | null>;

export interface PostAccountLabels {
  labels: { label: string; wallet: string }[];
}
