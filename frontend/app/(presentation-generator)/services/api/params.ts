export interface ImageGenerate {
  presentation_id: string;
  prompt: {
    theme_prompt: string;
    image_prompt: string;
    aspect_ratio: string;
  };
}
