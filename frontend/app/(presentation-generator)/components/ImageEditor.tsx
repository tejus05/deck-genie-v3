"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { PresentationGenerationApi } from "../services/api/presentation-generation";
import { RootState } from "@/store/store";
import { usePathname, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
  updateSlideImage,
  updateSlideProperties,
} from "@/store/slices/presentationGeneration";
import { ThemeImagePrompt, getStaticFileUrl } from "../utils/others";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ToolTip from "@/components/ToolTip";
import { getEnv } from "@/utils/constant";
import { clearLogs, logOperation } from "../utils/log";

interface ImageEditorProps {
  initialImage: string | null;
  imageIdx?: number;
  title: string;
  slideIndex: number;
  elementId: string;
  className?: string;
  promptContent?: string;
  properties?: null | any;
}

const ImageEditor = ({
  initialImage,
  imageIdx = 0,
  className,
  title,
  slideIndex,
  elementId,
  promptContent,
  properties,
}: ImageEditorProps) => {
  const dispatch = useDispatch();

  const { currentTheme } = useSelector((state: RootState) => state.theme);

  const searchParams = useSearchParams();
  const [image, setImage] = useState(initialImage);
  const [previewImages, setPreviewImages] = useState([initialImage]);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [prompt, setPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  
  const [objectFit, setObjectFit] = useState<"cover" | "contain" | "fill">(
    (properties &&
      properties[imageIdx] &&
      properties[imageIdx].initialObjectFit) ||
    "cover"
  );
  const imageRef = useRef<HTMLImageElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const popoverContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setImage(initialImage);
    setPreviewImages([initialImage]);

  }, [initialImage]);

  // Close toolbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        imageContainerRef.current &&
        !imageContainerRef.current.contains(event.target as Node) &&
        toolbarRef.current &&
        !toolbarRef.current.contains(event.target as Node) &&
        !popoverContentRef.current
      ) {
        setIsToolbarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleImageClick = () => {
    logOperation(`Opening toolbar for slide ${slideIndex}, element ${elementId}`);
    setIsToolbarOpen(true);
  };

  const handleOpenEditor = () => {
    logOperation(`Opening image editor for slide ${slideIndex}, element ${elementId}`);
    setIsToolbarOpen(false);
    setIsEditorOpen(true);
  };

  const handleImageChange = (newImage: string) => {
    logOperation(`Changing image for slide ${slideIndex}, element ${elementId}`);
    setImage(newImage);
    dispatch(
      updateSlideImage({
        index: slideIndex,
        imageIdx: imageIdx,
        image: newImage,
      })
    );
    setIsEditorOpen(false);
  };

  const handleFitChange = (fit: "cover" | "contain" | "fill") => {
    logOperation(`Changing image fit for slide ${slideIndex}, element ${elementId}: ${fit}`);
    setObjectFit(fit);

    if (imageRef.current) {
      imageRef.current.style.objectFit = fit;
    }

    saveImageProperties(fit);
  };

  const saveImageProperties = (
    fit: "cover" | "contain" | "fill"
  ) => {
    logOperation(`Saving image properties for slide ${slideIndex}, element ${elementId}: fit=${fit}`);
    const propertiesData = {
      initialObjectFit: fit,
    };

    dispatch(
      updateSlideProperties({
        index: slideIndex,
        itemIdx: imageIdx,
        properties: propertiesData,
      })
    );
  };

  const handleGenerateImage = async () => {
    try {
      logOperation(`Generating image for slide ${slideIndex}, element ${elementId} with prompt: ${prompt}`);
      setIsGenerating(true);
      setError(null);

      const presentation_id = searchParams.get("id");

      const response = await PresentationGenerationApi.generateImage({
        presentation_id: presentation_id!,
        prompt: {
          theme_prompt: ThemeImagePrompt[currentTheme],
          image_prompt: prompt,
          aspect_ratio: "4:5",
        },
      });

      logOperation(`Image generation successful for slide ${slideIndex}, element ${elementId}`);
      setPreviewImages(response.paths);
    } catch (err) {
      const errorMessage = "Failed to generate image. Please try again.";
      logOperation(`Image generation failed for slide ${slideIndex}, element ${elementId}: ${err}`);
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const presentation_id = searchParams.get("id");
    const file = event.target.files?.[0];
    if (!file) return;

    logOperation(`Attempting to upload file for slide ${slideIndex}, element ${elementId}: ${file.name}`);

    if (file.size > 5 * 1024 * 1024) {
      const error_message = "File size should be less than 5MB";
      logOperation(`File upload failed for slide ${slideIndex}, element ${elementId}: File too large`);
      setUploadError(error_message);
      return;
    }

    if (!file.type.startsWith("image/")) {
      const error_message = "Please upload an image file";
      logOperation(`File upload failed for slide ${slideIndex}, element ${elementId}: Invalid file type`);
      setUploadError(error_message);
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append('images', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/ppt/files/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      const relativePath = result.images[0]; // Get the uploaded image path

      logOperation(`File upload successful for slide ${slideIndex}, element ${elementId}: ${relativePath}`);
      setUploadedImageUrl(relativePath);
    } catch (err) {
      const error_message = "Failed to upload image. Please try again.";
      logOperation(`File upload failed for slide ${slideIndex}, element ${elementId}: ${err}`);
      setUploadError(error_message);
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // Helper function to determine image URL
  const getImageUrl = (src: string | null) => {
    if (!src) return "";
    return getStaticFileUrl(src);
  };
  const urls = getEnv();
  const BASE_URL = urls.BASE_URL;

  return (
    <>
      <div
        ref={imageContainerRef}
        className={cn(
          "relative group max-md:h-[200px] max-lg:h-[300px] max-md:pointer-events-none  lg:aspect-[4/4] w-full cursor-pointer rounded-lg overflow-hidden",
          className
        )}
        data-slide-element
        data-slide-index={slideIndex}
        data-element-type="picture"
        data-element-id={elementId}
        onClick={(e) => {
          if (initialImage !== undefined) {
            handleImageClick();
          }
        }}
      >
        {image ? (
          <img
            ref={imageRef}
            src={getImageUrl(image)}
            alt={title}
            className="w-full h-full transition-all duration-200 "
            style={{
              objectFit: objectFit,
            }}
            data-slide-index={slideIndex}
            data-element-type="picture"
            data-is-image
            data-object-fit={objectFit}
            data-element-id={`${elementId}-image`}
            data-is-network={image && image.startsWith("http")}
            data-image-path={image}
          />
        ) : (
          <div className="w-full h-full relative">
            <Skeleton className="w-full h-full bg-gray-300 animate-pulse" />
            {
              <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center text-sm text-gray-500">
                {initialImage !== undefined
                  ? "Click to add image"
                  : "Loading..."}
              </p>
            }
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 rounded-lg" />

        {/* Image Toolbar */}
        {isToolbarOpen && (
          <div
            ref={toolbarRef}
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg z-10 toolbar-popover"
          >
            <div className="flex items-center p-1 space-x-1">
              <ToolTip content="Edit">
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors "
                  onClick={handleOpenEditor}
                  title="Edit Image"
                >
                  <Edit className="w-4 h-4 text-gray-700" />
                </button>
              </ToolTip>
            </div>
          </div>
        )}
      </div>

      <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <SheetContent
          side="right"
          className="w-[600px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <SheetHeader>
            <SheetTitle>Update Image</SheetTitle>
          </SheetHeader>

          <div className="mt-6">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid bg-blue-100 border border-blue-300 w-full grid-cols-1 mx-auto ">
                <TabsTrigger className="font-medium" value="upload">
                  Upload
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-4 space-y-4">
                <div className="space-y-4">
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                      isUploading
                        ? "border-gray-400 bg-gray-50"
                        : "border-gray-300"
                    )}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="file-upload"
                      className={cn(
                        "flex flex-col items-center",
                        isUploading ? "cursor-wait" : "cursor-pointer"
                      )}
                    >
                      {isUploading ? (
                        <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mb-2" />
                      ) : (
                        <Upload className="w-8 h-8 text-gray-500 mb-2" />
                      )}
                      <span className="text-sm text-gray-600">
                        {isUploading
                          ? "Uploading your image..."
                          : "Click to upload an image"}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        Maximum file size: 5MB
                      </span>
                    </label>
                  </div>
                  {uploadError && (
                    <p className="text-red-500 text-sm text-center">
                      {uploadError}
                    </p>
                  )}

                  {(uploadedImageUrl || isUploading) && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">
                        Uploaded Image Preview
                      </h3>
                      <div className="aspect-[4/3] relative rounded-lg overflow-hidden border border-gray-200">
                        {isUploading ? (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mb-2" />
                              <span className="text-sm text-gray-500">
                                Processing...
                              </span>
                            </div>
                          </div>
                        ) : (
                          uploadedImageUrl && (
                            <div
                              onClick={() =>
                                handleImageChange(uploadedImageUrl)
                              }
                              className="cursor-pointer group w-full h-full"
                            >
                              <img
                                src={getStaticFileUrl(uploadedImageUrl)}
                                alt="Uploaded preview"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="bg-white/90 px-3 py-1 rounded-full text-sm font-medium">
                                  Click to use this image
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default React.memo(ImageEditor);
