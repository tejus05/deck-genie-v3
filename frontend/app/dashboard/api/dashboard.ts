import {
  getHeader,
  getHeaderForFormData,
} from "@/app/(presentation-generator)/services/api/header";
import { getEnv } from "@/utils/constant";
import { logOperation } from "@/app/(presentation-generator)/utils/log";
import { Presentation } from "../types";

const urls = getEnv();
const BASE_URL = urls.BASE_URL;

// Backend presentation model (what we receive from API)
export interface PresentationResponse {
  id: number;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  owner_id: number;
  file_path?: string;
  thumbnail_path?: string;
  uploadthing_url?: string;
  uploadthing_key?: string;
  uploadthing_thumbnail_url?: string;
  uploadthing_thumbnail_key?: string;
  file_size?: number;
  // Computed fields from backend
  download_url?: string;
  thumbnail_url?: string;
  storage_type: string;
}

// Legacy presentation model for backward compatibility
export interface LegacyPresentationResponse {
  id: string;
  title: string;
  created_at: string;
  data: unknown | null;
  file: string;
  n_slides: number;
  prompt: string;
  summary: string | null;
  theme: string;
  titles: string[];
  user_id: string;
  vector_store: unknown;
  thumbnail: string;
}

export class DashboardApi {
  // Transform backend presentation to frontend presentation
  static transformPresentation(apiPresentation: PresentationResponse): Presentation {
    // Use backend computed URLs or fallback to constructing them
    const downloadUrl = apiPresentation.download_url || apiPresentation.uploadthing_url || 
      (apiPresentation.file_path ? `/files/presentations/${apiPresentation.id}/download` : '');
    
    const thumbnailUrl = apiPresentation.thumbnail_url || apiPresentation.uploadthing_thumbnail_url || 
      apiPresentation.thumbnail_path || 
      '/default-presentation-thumbnail.png';

    return {
      id: apiPresentation.id,
      title: apiPresentation.title,
      description: apiPresentation.description,
      created_at: apiPresentation.created_at,
      updated_at: apiPresentation.updated_at,
      owner_id: apiPresentation.owner_id,
      file_path: apiPresentation.file_path,
      thumbnail_path: apiPresentation.thumbnail_path,
      uploadthing_url: apiPresentation.uploadthing_url,
      uploadthing_key: apiPresentation.uploadthing_key,
      uploadthing_thumbnail_url: apiPresentation.uploadthing_thumbnail_url,
      uploadthing_thumbnail_key: apiPresentation.uploadthing_thumbnail_key,
      file_size: apiPresentation.file_size,
      download_url: apiPresentation.download_url,
      thumbnail_url: apiPresentation.thumbnail_url,
      storage_type: apiPresentation.storage_type,
      type: 'slide', // All presentations are slides for now
      date: new Date(apiPresentation.created_at).toLocaleDateString(),
      thumbnail: thumbnailUrl,
    };
  }
 
  static async getPresentations(): Promise<Presentation[]> {
    try {
      logOperation('Fetching user presentations');
      const response = await fetch(
        `${BASE_URL}/files/my-presentations`,
        {
          method: "GET",
          headers: getHeader(),
        }
      );
      if (response.status === 200) {
        const data: PresentationResponse[] = await response.json();
        logOperation(`Successfully fetched ${data.length} presentations`);
        return data.map(this.transformPresentation);
      } else if (response.status === 404) {
        logOperation('No presentations found');
        console.log("No presentations found");
        return [];
      }
      return [];
    } catch (error) {
      logOperation(`Error fetching presentations: ${error}`);
      console.error("Error fetching presentations:", error);
      throw error;
    }
  }
  static async getPresentation(id: string) {
    try {
      logOperation(`Fetching presentation with ID: ${id}`);
      const response = await fetch(
        `${BASE_URL}/ppt/presentation?presentation_id=${id}`,
        {
          method: "GET",
         
        }
      );
      if (response.status === 200) {
        const data = await response.json();
        logOperation(`Successfully fetched presentation ${id}`);
        return data;
      }
      logOperation(`Presentation ${id} not found`);
      throw new Error("Presentation not found");
    } catch (error) {
      logOperation(`Error fetching presentation ${id}: ${error}`);
      console.error("Error fetching presentations:", error);
      throw error;
    }
  }
  static async deletePresentation(presentation_id: number) {
    try {
      logOperation(`Deleting presentation ${presentation_id}`);
      const response = await fetch(
        `${BASE_URL}/files/presentations/${presentation_id}`,
        {
          method: "DELETE",
          headers: getHeader(),
        }
      );

      if (response.status === 200) {
        logOperation(`Successfully deleted presentation ${presentation_id}`);
        return true;
      }
      logOperation(`Failed to delete presentation ${presentation_id}`);
      return false;
    } catch (error) {
      logOperation(`Error deleting presentation ${presentation_id}: ${error}`);
      console.error("Error deleting presentation:", error);
      throw error;
    }
  }
  static async setSlideThumbnail(presentation_id: string, file: unknown) {
    logOperation(`Setting thumbnail for presentation ${presentation_id}`);
    const formData = new FormData();

    formData.append("presentation_id", presentation_id);
    formData.append("thumbnail", file as Blob);
    try {
      const response = await fetch(
        `${BASE_URL}/ppt/presentation/thumbnail`,
        {
          method: "POST",
          headers: getHeaderForFormData(),
          body: formData,
        }
      );
      const data = await response.json();
      logOperation(`Successfully set thumbnail for presentation ${presentation_id}`);
      return data;
    } catch (error) {
      logOperation(`Error setting slide thumbnail for presentation ${presentation_id}: ${error}`);
      console.error("Error setting slide thumbnail:", error);
      throw error;
    }
  }
  static async downloadPresentation(presentation_id: number): Promise<void> {
    try {
      logOperation(`Downloading presentation ${presentation_id}`);
      const response = await fetch(
        `${BASE_URL}/files/presentations/${presentation_id}/download`,
        {
          method: "GET",
          headers: getHeader(),
        }
      );

      if (response.status === 200) {
        // Handle direct file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `presentation_${presentation_id}.pptx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        logOperation(`Successfully downloaded presentation ${presentation_id}`);
      } else if (response.status === 302) {
        // Handle redirect (for UploadThing URLs)
        window.open(response.url, '_blank');
        logOperation(`Redirected to download presentation ${presentation_id}`);
      } else {
        throw new Error(`Failed to download: ${response.status}`);
      }
    } catch (error) {
      logOperation(`Error downloading presentation ${presentation_id}: ${error}`);
      console.error("Error downloading presentation:", error);
      throw error;
    }
  }
}
