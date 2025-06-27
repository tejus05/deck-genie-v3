export interface UploadedFile {
  id: string;
  file: File;
  size: string;
}
export enum ThemeType {
  Light = "light",
  Dark = "dark",
  Custom = "custom",
  Faint_Yellow = "faint_yellow",
  Royal_Blue = "royal_blue",
  Light_Red = "light_red",
  Dark_Pink = "dark_pink",
}

export enum ToneType {
  InvestorPitch = "Investor Pitch",
  Executive = "Executive", 
  Technical = "Technical",
  StartupPitch = "Startup Pitch",
  Conversational = "Conversational",
  Professional = "Professional"
}

export interface PresentationConfig {
  tone: ToneType | null;
  prompt: string;
}
