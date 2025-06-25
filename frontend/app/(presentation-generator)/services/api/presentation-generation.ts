import {  getEnv } from "@/utils/constant";
import { getHeader, getHeaderForFormData } from "./header";
import { IconSearch, ImageGenerate, ImageSearch } from "./params";
import { clearLogs, logOperation } from "../../utils/log";

const urls = getEnv();
const BASE_URL = urls.BASE_URL;
export class PresentationGenerationApi {
  // static BASE_URL="https://api.presenton.ai";
  // static BASE_URL="https://presentation-generator-fragrant-mountain-1643.fly.dev";
  // static BASE_URL = "http://localhost:48388";

  static async getChapterDetails() {
    try {
      logOperation('Fetching chapter details');
      const response = await fetch(
        `${BASE_URL}/ppt/chapter-details`,
        {
          method: "GET",
          headers: getHeader(),
          cache: "no-cache",
        }
      );
      if (response.status === 200) {
        const data = await response.json();
        logOperation('Successfully fetched chapter details');
        return data;
      }
    } catch (error) {
      logOperation(`Error fetching chapter details: ${error}`);
      console.error("Error getting chapter details:", error);
      throw error;
    }
  }

  static async uploadDoc(documents: File[], images: File[]) {
    logOperation(`Uploading documents: ${documents.length} files, images: ${images.length} files`);
    const formData = new FormData();

    documents.forEach((document) => {
      formData.append("documents", document);
    });

    images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      const response = await fetch(
        `${BASE_URL}/ppt/files/upload`,
        {
          method: "POST",
          headers: getHeaderForFormData(),
          // Remove Content-Type header as browser will set it automatically with boundary
          body: formData,
          cache: "no-cache",
        }
      );

      if (!response.ok) {
        logOperation(`Upload failed with status: ${response.status}`);
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      logOperation('Successfully uploaded documents and images');
      return data;
    } catch (error) {
      logOperation(`Upload error: ${error}`);
      console.error("Upload error:", error);
      throw error;
    }
  }

 

  static async decomposeDocuments(documentKeys: string[], imageKeys: string[]) {
    logOperation(`Decomposing documents: ${documentKeys.length} files, images: ${imageKeys.length} files`);
    try {
      const response = await fetch(
        `${BASE_URL}/ppt/files/decompose`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify({
            documents: documentKeys,
            images: imageKeys,
          }),
          cache: "no-cache",
        }
      );
      if (response.status === 200) {
        const data = await response.json();
        logOperation('Successfully decomposed documents');
        return data;
      } else {
        logOperation(`Failed to decompose files: ${response.statusText}`);
        throw new Error(`Failed to decompose files: ${response.statusText}`);
      }
    } catch (error) {
      logOperation(`Error in Decompose Files: ${error}`);
      console.error("Error in Decompose Files", error);
      throw error;
    }
  }
  static async titleGeneration({
    presentation_id,
  }: {
    presentation_id: string;
  }) {
    try {
      const response = await fetch(
        `${BASE_URL}/ppt/titles/generate`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify({
            prompt: prompt,
            presentation_id: presentation_id,
          }),
          cache: "no-cache",
        }
      );
      if (response.status === 200) {
        const data = await response.json();

        return data;
      } else {
        throw new Error(`Failed to generate titles: ${response.statusText}`);
      }
    } catch (error) {
      console.error("error in title generation", error);
      throw error;
    }
  }

  static async generatePresentation(presentationData: any) {
    logOperation('Generating presentation');
    try {
      const response = await fetch(
        `${BASE_URL}/ppt/generate`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify(presentationData),
          cache: "no-cache",
        }
      );
      if (response.status === 200) {
        const data = await response.json();
        logOperation('Successfully generated presentation');
        return data;
      } else {
        logOperation(`Failed to generate presentation: ${response.statusText}`);
        throw new Error(`Failed to generate presentation: ${response.statusText}`);
      }
    } catch (error) {
      logOperation(`Error in presentation generation: ${error}`);
      console.error("error in presentation generation", error);
      throw error;
    }
  }
  static async editSlide(
    presentation_id: string,
    index: number,
    prompt: string
  ) {
    logOperation(`Editing slide ${index} in presentation ${presentation_id}`);
    try {
      const response = await fetch(
        `${BASE_URL}/ppt/edit`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify({
            presentation_id,

            index,
            prompt,
          }),
          cache: "no-cache",
        }
      );

      if (!response.ok) {
        logOperation(`Failed to update slide ${index}: ${response.statusText}`);
        throw new Error("Failed to update slides");
      }

      const data = await response.json();
      logOperation(`Successfully updated slide ${index}`);
      return data;
    } catch (error) {
      logOperation(`Error in slide update: ${error}`);
      console.error("error in slide update", error);
      throw error;
    }
  }

  static async updatePresentationContent(body: any) {
    try {
      const response = await fetch(
        `${BASE_URL}/ppt/slides/update`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify(body),
          cache: "no-cache",
        }
      );
      if (response.ok) {
        const data = await response.json();

        return data;
      } else {
        throw new Error(
          `Failed to update presentation content: ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("error in presentation content update", error);
      throw error;
    }
  }

  static async generateData(presentationData: any) {
    try {
      const response = await fetch(
        `${BASE_URL}/ppt/generate/data`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify(presentationData),
          cache: "no-cache",
        }
      );
      if (response.ok) {
        const data = await response.json();

        return data;
      } else {
        throw new Error(`Failed to generate data: ${response.statusText}`);
      }
    } catch (error) {
      console.error("error in data generation", error);
      throw error;
    }
  }
  // IMAGE AND ICON SEARCH
  static async imageSearch(imageSearch: ImageSearch) {
    try {
      const response = await fetch(
        `${BASE_URL}/ppt/image/search`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify(imageSearch),
          cache: "no-cache",
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`Failed to search images: ${response.statusText}`);
      }
    } catch (error) {
      console.error("error in image search", error);
      throw error;
    }
  }
  static async generateImage(imageGenerate: ImageGenerate) {
    logOperation(`Generating image with prompt: ${imageGenerate.prompt.image_prompt}`);
    try {
      const response = await fetch(
        `${BASE_URL}/ppt/image/generate`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify(imageGenerate),
          cache: "no-cache",
        }
      );
      if (response.ok) {
        const data = await response.json();
        logOperation('Successfully generated image');
        return data;
      } else {
        logOperation(`Failed to generate images: ${response.statusText}`);
        throw new Error(`Failed to generate images: ${response.statusText}`);
      }
    } catch (error) {
      logOperation(`Error in image generation: ${error}`);
      console.error("error in image generation", error);
      throw error;
    }
  }
  static async searchIcons(iconSearch: IconSearch) {
    try {
      const response = await fetch(
        `${BASE_URL}/ppt/icon/search`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify(iconSearch),
          cache: "no-cache",
        }
      );
      if (response.ok) {
        const data = await response.json();

        return data;
      } else {
        throw new Error(`Failed to search icons: ${response.statusText}`);
      }
    } catch (error) {
      console.error("error in icon search", error);
      throw error;
    }
  }

  static async updateDocuments(body: any) {
    try {
      const response = await fetch(
        `${BASE_URL}/ppt/document/update`,
        {
          method: "POST",
          headers: getHeaderForFormData(),
          body: body,
          cache: "no-cache",
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`Failed to update documents: ${response.statusText}`);
      }
    } catch (error) {
      console.error("error in document update", error);
      throw error;
    }
  }

  // EXPORT PRESENTATION
  static async exportAsPPTX(presentationData: any) {
    logOperation('Exporting presentation as PPTX');
    try {
      const response = await fetch(
        `${BASE_URL}/ppt/presentation/export_as_pptx`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify(presentationData),
          cache: "no-cache",
        }
      );
      if (response.ok) {
        const data = await response.json();
        logOperation('Successfully exported presentation as PPTX');
        return {
          ...data,
          url: `${BASE_URL}${data.url}`,
        };
      } else {
        logOperation(`Failed to export as pptx: ${response.statusText}`);
        throw new Error(`Failed to export as pptx: ${response.statusText}`);
      }
    } catch (error) {
      logOperation(`Error in pptx export: ${error}`);
      console.error("error in pptx export", error);
      throw error;
    }
  }
  static async exportAsPDF(presentationData: any) {
    logOperation('Exporting presentation as PDF');
    try {
      const response = await fetch(
        `${BASE_URL}/ppt/presentation/export_as_pdf`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify(presentationData),
        }
      );
      if (response.ok) {
        const data = await response.json();
        logOperation('Successfully exported presentation as PDF');
        return data;
      } else {
        logOperation(`Failed to export as pdf: ${response.statusText}`);
        throw new Error(`Failed to export as pdf: ${response.statusText}`);
      }
    } catch (error) {
      logOperation(`Error in pdf export: ${error}`);
      console.error("error in pdf export", error);
      throw error;
    }
  }
  static async deleteSlide(presentation_id: string, slide_id: string) {
    logOperation(`Deleting slide ${slide_id} from presentation ${presentation_id}`);
    try {
      const response = await fetch(
        `${BASE_URL}/ppt/slide/delete?presentation_id=${presentation_id}&slide_id=${slide_id}`,
        {
          method: "DELETE",
          headers: getHeader(),
          cache: "no-cache",
        }
      );
      if (response.status === 204) {
        logOperation(`Successfully deleted slide ${slide_id}`);
        return true;
      } else {
        logOperation(`Failed to delete slide: ${response.statusText}`);
        throw new Error(`Failed to delete slide: ${response.statusText}`);
      }
    } catch (error) {
      logOperation(`Error in slide deletion: ${error}`);
      console.error("error in slide deletion", error);
      throw error;
    }
  }
  // SET THEME COLORS
  static async setThemeColors(presentation_id: string, theme: any) {
    logOperation(`Setting theme colors for presentation ${presentation_id}`);
    try {
      const response = await fetch(
        `${BASE_URL}/ppt/presentation/theme`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify({
            presentation_id,
            theme,
          }),
         
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`Failed to set theme colors: ${response.statusText}`);
      }
    } catch (error) {
      console.error("error in theme colors set", error);
      throw error;
    }
  }
  // QUESTIONS

  static async getQuestions({
    prompt,
    n_slides,
    documents,
    images,
    language,
  
  }: {
    prompt: string;
    n_slides: number | null;
    documents?: string[];
    images?: string[];
    language: string | null;
    
  }) {
    try {
      const response = await fetch(
        `${BASE_URL}/ppt/create`,
        {
          method: "POST",
          headers: getHeader(),
          body: JSON.stringify({
            prompt,
            n_slides,
            language,
            documents,
            images,
           
          }),
          cache: "no-cache",
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`Failed to get questions: ${response.statusText}`);
      }
    } catch (error) {
      console.error("error in question generation", error);
      throw error;
    }
  }
}
