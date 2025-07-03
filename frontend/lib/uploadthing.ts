import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react";
import type { OurFileRouter } from "./uploadthing-core";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();

export const uploadFileToUploadThing = async (
  file: File,
  endpoint: keyof OurFileRouter
) => {
  try {
    const result = await uploadFiles(endpoint, { files: [file] });
    return result[0];
  } catch (error) {
    console.error("UploadThing upload error:", error);
    throw error;
  }
};

export const deleteFileFromUploadThing = async (fileKey: string) => {
  try {
    const response = await fetch(`/api/uploadthing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", fileKey }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to delete file from UploadThing");
    }
    
    return true;
  } catch (error) {
    console.error("UploadThing delete error:", error);
    throw error;
  }
};

export const getFileInfo = async (fileKey: string) => {
  try {
    const response = await fetch(`/api/uploadthing?key=${fileKey}`);
    
    if (!response.ok) {
      throw new Error("Failed to get file info from UploadThing");
    }
    
    return await response.json();
  } catch (error) {
    console.error("UploadThing file info error:", error);
    throw error;
  }
};
