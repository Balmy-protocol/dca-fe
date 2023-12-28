export type AccountLabels = Record<string, string>;
export type AccountEns = Record<string, string | null>;

export interface PostAccountLabels {
  labels: { label: string; wallet: string }[];
}
