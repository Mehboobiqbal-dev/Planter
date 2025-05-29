// src/types/plant.ts
export interface ImageFormat {
  url: string;
  width: number;
  height: number;
}

export interface Image {
  id: number;
  name: string;
  url: string;
  formats: {
    thumbnail?: ImageFormat;
    small?: ImageFormat;
    medium?: ImageFormat;
    large?: ImageFormat;
  };
  caption: string;
  alternativeText: string;
  width: number;
  height: number;
}

export interface CareRequirement {
  icon: string;
  label: string;
  value: string;
}

export interface CareSection {
  title: string;
  icon: string;
  description: string;
}

export interface Plant {
  _id: string;
  name: string;
  category: string;
  image: string;
  latin?: string;
  description?: string;
  invitation?: string;
  fullDescription?: string;
  images?: Image[];
  care?: Record<string, string>;
  careRequirements?: CareRequirement[];
  careSections?: CareSection[];
  funFact?: string;
  commonName?: string;
  slug?: string;
  toxicity?: string | null;
  difficulty?: string;
  humidity?: string;
  detailId?: string | null | undefined;
}

export interface Category {
  name: string;
  slug: string;
  headerImage: string;
  title: string;
  description: string;
  mainDescription: string;
  expandedDescription: string;
}