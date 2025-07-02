export interface Presentation {
  id: number;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  owner_id: number;
  // Legacy file storage
  file_path?: string;
  thumbnail_path?: string;
  // UploadThing storage
  uploadthing_url?: string;
  uploadthing_key?: string;
  uploadthing_thumbnail_url?: string;
  uploadthing_thumbnail_key?: string;
  file_size?: number;
  // Computed fields from backend
  download_url?: string;
  thumbnail_url?: string;
  storage_type: string;
  // UI computed fields
  type: 'video' | 'slide';
  date: string; // formatted created_at
  thumbnail: string; // computed thumbnail for UI
}

export interface PresentationFilter {
  type?: 'video' | 'slide';
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
} 