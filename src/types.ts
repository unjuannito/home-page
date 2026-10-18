export interface LayoutConfig {
  pc: { rows: number; cols: number };
  tablet: { rows: number; cols: number };
  mobile: { rows: number; cols: number };
}

export interface SearchSettings {
  searchEngine: string;
  aiEngine: string;
  showBlur: boolean;
}

export interface ShortcutData {
  name: string;
  url: string;
  imageURl: string;
}
