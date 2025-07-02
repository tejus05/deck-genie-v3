/**
 * UploadThing type definitions for the frontend.
 */

export type FileRouter = {
  presentationUploader: {
    input: {
      userId: string;
      presentationTitle?: string;
    };
    output: {
      url: string;
      key: string;
      name: string;
      size: number;
    };
  };
  thumbnailUploader: {
    input: {
      userId: string;
      presentationKey: string;
    };
    output: {
      url: string;
      key: string;
      name: string;
      size: number;
    };
  };
};

export interface UploadedFile {
  url: string;
  key: string;
  name: string;
  size: number;
}

export interface UploadProgress {
  progress: number;
  isUploading: boolean;
  uploadedBytes: number;
  totalBytes: number;
}

export interface UploadError {
  message: string;
  code?: string;
}
