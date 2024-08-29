export type AccountLabels = Record<string, { label: string; lastModified?: number }>;

export interface PostAccountLabels {
  labels: { label: string; wallet: string }[];
}
