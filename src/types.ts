export interface Era {
  id: string;
  name: string;
  category: "ancient" | "medieval" | "retro" | "future" | "fantasy";
  period: string;
  yearDisplay: string;
  description: string;
  prompt: string;
  styleInstruction: string;
  iconName: string;
  bgGradient: string;
  accentColor: string;
  sampleOutfit: string;
  sampleLocation: string;
  previewSeed: number;
}

export interface PassportCard {
  alias: string;
  assignedRole: string;
  year: string;
  location: string;
  outfitDescription: string;
  survivalScore: number;
  survivalTip: string;
  historicalFacts: string[];
  quote: string;
}

export interface TimeTravelResult {
  id: string;
  originalImage: string;
  resultImage: string;
  era: Era;
  customPrompt?: string;
  style: string;
  aspectRatio: string;
  faceAnalysis?: string;
  passportCard?: PassportCard;
  timestamp: string;
  frameStyle?: string;
}

export type PhotoFrameType = 'none' | 'polaroid' | 'antique_gold' | 'cyber_hud' | 'film_strip' | 'renaissance';

export type ImageStyle = 'photorealistic' | 'oil_painting' | 'vintage_polaroid' | 'steampunk' | 'cyberpunk' | 'comic_book';
