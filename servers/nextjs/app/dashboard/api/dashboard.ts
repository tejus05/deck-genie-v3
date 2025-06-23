import {
  getHeader,
  getHeaderForFormData,
} from "@/app/(presentation-generator)/services/api/header";
import { getEnv } from "@/utils/constant";
import { clearLogs, logOperation } from "@/app/(presentation-generator)/utils/log";

const urls = getEnv();
const BASE_URL = urls.BASE_URL;
export interface PresentationResponse {
  id: string;
  title: string;
  created_at: string;
  data: any | null;
  file: string;
  n_slides: number;
  prompt: string;
  summary: string | null;
  theme: string;
  titles: string[];
  user_id: string;
  vector_store: any;

  thumbnail: string;
}

export class DashboardApi {
 
  static async getPresentations(): Promise<PresentationResponse[]> {
    try {
      logOperation('Fetching user presentations');
      const response = await fetch(
        `${BASE_URL}/ppt/user_presentations`,
        {
          method: "GET",
        }
      );
      if (response.status === 200) {
        const data = await response.json();
        logOperation(`Successfully fetched ${data.length} presentations`);
        return data;
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
  static async deletePresentation(presentation_id: string) {
    try {
      logOperation(`Deleting presentation ${presentation_id}`);
      const response = await fetch(
        `${BASE_URL}/ppt/delete?presentation_id=${presentation_id}`,
        {
          method: "DELETE",
          headers: getHeader(),
        }
      );

      if (response.status === 204) {
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
  static async setSlideThumbnail(presentation_id: string, file: any) {
    logOperation(`Setting thumbnail for presentation ${presentation_id}`);
    const formData = new FormData();

    formData.append("presentation_id", presentation_id);
    formData.append("thumbnail", file);
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
}
