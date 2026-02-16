export interface LegoPart {
  id: string;
  name: string;
  color: string;
  quantity: number;
  collected: number;
  description: string;
  elementId?: string;
  designId?: string;
  imageUrl?: string;
}

export interface LegoSet {
  id: string;
  number: string;
  name: string;
  theme: string;
  totalParts: number;
  imageUrl: string;
  parts: LegoPart[];
  lastModified: number;
  externalUrls?: { title: string; uri: string }[];
}

export interface AppState {
  sets: LegoSet[];
  activeSetId: string | null;
  isSearching: boolean;
  error: string | null;
}