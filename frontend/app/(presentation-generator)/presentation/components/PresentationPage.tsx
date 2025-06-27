"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { RootState } from "@/store/store";
import { Skeleton } from "@/components/ui/skeleton";
import PresentationMode from "../../components/PresentationMode";

import { DashboardApi } from "@/app/dashboard/api/dashboard";
import SidePanel from "../components/SidePanel";
import SlideContent from "../components/SlideContent";

import {
  deletePresentationSlide,
  setPresentationData,
  setStreaming,
} from "@/store/slices/presentationGeneration";
import { toast } from "@/hooks/use-toast";
import { PresentationGenerationApi } from "../../services/api/presentation-generation";
import { setThemeColors, ThemeColors } from "../../store/themeSlice";
import { ThemeType } from "../../upload/type";
import LoadingState from "../../components/LoadingState";
import Header from "../components/Header";
import { Loader2 } from "lucide-react";

import { jsonrepair } from "jsonrepair";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { getEnv } from "@/utils/constant";
import { clearLogs, logOperation } from "../../utils/log";

const urls = getEnv();
const BASE_URL = urls.BASE_URL;

// Custom debounce function
function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

const PresentationPage = ({ presentation_id }: { presentation_id: string }) => {
  const urls = getEnv();
  const BASE_URL = urls.BASE_URL;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { currentTheme, currentColors } = useSelector(
    (state: RootState) => state.theme
  );
  const { presentationData, isStreaming } = useSelector(
    (state: RootState) => state.presentationGeneration
  );
  const [error, setError] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPresentMode = searchParams.get("mode") === "present";
  const session = searchParams.get("session");
  const currentSlide = parseInt(
    searchParams.get("slide") || `${selectedSlide}` || "0"
  );
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [autoSaveLoading, setAutoSaveLoading] = useState(false);

  // Add ref for tracking initial load
  const isInitialLoad = useRef(true);

  // Ref to track the previous length of slides
  const previousSlidesLength = useRef(0);

  // Create auto-save function
  const autoSave = useCallback(
    (data: { presentation_id: string; slides: any[] }) => {
      setAutoSaveLoading(true);
      logOperation('Auto-saving presentation changes');
      // Fire and forget - no await
      PresentationGenerationApi.updatePresentationContent(data)
        .then(() => {
          logOperation('Auto-save completed successfully');
        })
        .catch((error) => {
          logOperation(`Auto-save error: ${error}`);
          console.error("Error AAYO", error);
        })
        .finally(() => {
          setAutoSaveLoading(false);
        });
    },
    [presentation_id]
  );

  // Create debounced version of autoSave
  const debouncedSave = useDebounce(autoSave, 2000);

  // Watch for changes in presentationData and trigger auto-save
  useEffect(() => {
    if (
      presentationData &&
      !isStreaming &&
      !isInitialLoad.current &&
      presentationData.slides &&
      presentationData.slides.some(
        (slide) => slide.images && slide.images.length > 0
      )
    ) {

      debouncedSave({
        presentation_id: presentation_id,
        slides: presentationData.slides,
      });
    }
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
    }
  }, [presentationData, debouncedSave]);

  // Function to fetch the slides
  useEffect(() => {
    let evtSource: EventSource;
    let accumulatedChunks = "";

    const fetchSlides = async () => {
      logOperation('Starting slide streaming');
      dispatch(setStreaming(true));

      evtSource = new EventSource(
        `${BASE_URL}/ppt/generate/stream?presentation_id=${presentation_id}&session=${session}`
      );

      evtSource.onopen = () => {
        logOperation('Stream connection opened');
        setColorsVariables(currentColors, currentTheme);
      };

      evtSource.addEventListener("response", (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "chunk") {
          accumulatedChunks += data.chunk;

          try {
            const repairedJson = jsonrepair(accumulatedChunks);
            const partialData = JSON.parse(repairedJson);
            if (partialData.slides) {
              if (
                partialData.slides.length !== previousSlidesLength.current &&
                partialData.slides.length > 1
              ) {
                partialData.slides.splice(-1);
                dispatch(
                  setPresentationData({
                    presentation: null,
                    slides: partialData.slides,
                  })
                );
                previousSlidesLength.current = partialData.slides.length + 1;
                setLoading(false);
              }
            }
          } catch (error) {
            // It's okay if this fails, it just means the JSON isn't complete yet
          }
        } else if (data.type === "complete") {
          try {
            logOperation('Stream completed successfully');
            dispatch(setPresentationData(data.presentation));
            dispatch(setStreaming(false));
            if (data.presentation.theme) {
              dispatch(
                setThemeColors({
                  ...data.presentation.presentation.theme.colors,
                  theme: data.presentation.presentation.theme.name as ThemeType,
                })
              );
              setColorsVariables(
                data.presentation.presentation.theme.colors,
                data.presentation.presentation.theme.name as ThemeType
              );
            }
            setLoading(false);

            evtSource.close();
            // Remove session parameter from URL
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete("session");
            window.history.replaceState({}, "", newUrl.toString());
          } catch (error) {
            logOperation(`Error processing stream completion: ${error}`);
            evtSource.close();
            console.error("Error parsing accumulated chunks:", error);
          }
          accumulatedChunks = "";
        } else if (data.type === "closing") {
          logOperation('Stream closing normally');
          dispatch(setPresentationData(data.presentation));
          if (data.presentation.theme) {
            dispatch(
              setThemeColors({
                ...data.presentation.presentation.theme.colors,
                theme: data.presentation.presentation.theme.name as ThemeType,
              })
            );
            setColorsVariables(
              data.presentation.presentation.theme.colors,
              data.presentation.presentation.theme.name as ThemeType
            );
          }
          setLoading(false);
          dispatch(setStreaming(false));
          evtSource.close();
          // Remove session parameter from URL
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete("session");
          window.history.replaceState({}, "", newUrl.toString());
        }
      });
      evtSource.onerror = (error) => {
        logOperation(`Stream error: ${error}`);
        console.error("EventSource failed:", error);

        setLoading(false);
        dispatch(setStreaming(false));
        setError(true);

        evtSource.close();
      };
    };

    if (session) {
      fetchSlides();
    } else {
      fetchUserSlides();
    }

    return () => {
      if (evtSource) {
        evtSource.close();
      }
    };
  }, []);
  // Function to scroll to specific slide
  const handleSlideClick = (index: number) => {
    const slideElement = document.getElementById(`slide-${index}`);
    if (slideElement) {
      slideElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setSelectedSlide(index);
    }
  };
  // Function to fetch the user slides
  const fetchUserSlides = async () => {
    try {
      logOperation('Fetching user slides');
      const data = await DashboardApi.getPresentation(presentation_id);
      if (data) {
        logOperation('User slides fetched successfully');
        if (data.presentation.theme) {
          dispatch(
            setThemeColors({
              ...data.presentation.theme.colors,
              theme: data.presentation.theme.name as ThemeType,
            })
          );
          setColorsVariables(
            data.presentation.theme.colors,
            data.presentation.theme.name as ThemeType
          );
        }
        dispatch(setPresentationData(data));
        setLoading(false);
      }
    } catch (error) {
      logOperation(`Error fetching user slides: ${error}`);
      setError(true);
      toast({
        title: "Error",
        description: "Failed to load presentation",
        variant: "destructive",
      });

      console.error("Error fetching user slides:", error);
      setLoading(false);
    }
  };
  const setColorsVariables = (colors: ThemeColors, theme: ThemeType) => {
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      const cssKey = key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
      root.style.setProperty(`--${theme}-${cssKey}`, value);
    });
  };
  // Function to toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  // Function to handle present exit
  const handlePresentExit = () => {
    setIsFullscreen(false);
    router.push(`/presentation?id=${presentation_id}`);
  };
  // Function to handle slide change  for presentation mode
  const handleSlideChange = (newSlide: number) => {
    if (newSlide >= 0 && newSlide < presentationData?.slides.length!) {
      logOperation(`Changing to slide ${newSlide}`);
      setSelectedSlide(newSlide);
      router.push(
        `/presentation?id=${presentation_id}&mode=present&slide=${newSlide}`,
        { scroll: false }
      );
    }
  };

  const handleDeleteSlide = async (index: number) => {
    logOperation(`Deleting slide at index ${index}`);
    dispatch(deletePresentationSlide(index));
    const response = PresentationGenerationApi.deleteSlide(
      presentation_id,
      presentationData?.slides[index].id!
    );
  };

  if (isPresentMode) {
    return (
      <PresentationMode

        slides={presentationData?.slides!}
        currentSlide={currentSlide}
        currentTheme={currentTheme}
        isFullscreen={isFullscreen}
        onFullscreenToggle={toggleFullscreen}
        onExit={handlePresentExit}
        onSlideChange={handleSlideChange}
        tone={presentationData?.presentation?.tone || "Professional"}
      />
    );
  }

  // Regular view
  return (
    <div className="h-screen flex overflow-hidden flex-col">
      {/* Auto save loading state */}
      {autoSaveLoading && (
        <div className="fixed right-6 top-24 z-50 glass border border-white/20 rounded-xl px-4 py-2 shadow-modern flex items-center gap-2 backdrop-blur-md">
          <Loader2 className="w-4 h-4 animate-spin text-accent" />
          <span className="text-sm font-medium text-foreground">Saving...</span>
        </div>
      )}
      <Header presentation_id={presentation_id} currentSlide={currentSlide} />
      {error ? (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-background via-muted/30 to-destructive/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-destructive/5 via-transparent to-destructive/5"></div>
          <div
            className="relative glass border-2 border-destructive/20 text-foreground px-8 py-12 rounded-3xl shadow-modern-xl flex flex-col items-center max-w-lg mx-6"
            role="alert"
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-destructive/20 rounded-full blur-lg"></div>
              <AlertCircle className="relative w-20 h-20 text-destructive" />
            </div>
            <strong className="font-bold text-3xl mb-3 font-display text-gradient">Something went wrong!</strong>
            <p className="text-lg mb-2 text-center font-body text-muted-foreground">
              We encountered an issue loading your presentation.
            </p>
            <p className="text-base mb-6 text-center font-body text-muted-foreground">
              Please check your internet connection or try again later.
            </p>
            <Button
              size="lg"
              variant="destructive"
              className="shadow-modern-xl hover:shadow-modern-xl hover:scale-[1.02] transition-all duration-300"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: currentColors.background,
          }}
          className="flex flex-1  relative pt-6"
        >
          <SidePanel
            selectedSlide={selectedSlide}
            onSlideClick={handleSlideClick}
            loading={loading}
            isMobilePanelOpen={isMobilePanelOpen}
            setIsMobilePanelOpen={setIsMobilePanelOpen}
          />
          <div className="flex-1 h-[calc(100vh-100px)]  overflow-y-auto">
            <div
              className="mx-auto flex flex-col items-center  overflow-hidden  justify-center p-2 sm:p-6  pt-0 slide-theme"
              data-theme={currentTheme}
            >
              {!presentationData ||
                loading ||
                !presentationData?.slides ||
                presentationData?.slides.length === 0 ? (
                <div className="relative w-full h-[calc(100vh-120px)] mx-auto ">
                  <div className=" ">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <Skeleton
                        key={index}
                        className="aspect-video bg-gray-400 my-4 w-full mx-auto max-w-[1280px]"
                      />
                    ))}
                  </div>
                  {session && <LoadingState />}
                </div>
              ) : (
                <>
                  {presentationData &&
                    presentationData.slides &&
                    presentationData.slides.length > 0 &&
                    presentationData.slides.map((slide, index) => (
                      <SlideContent
                        key={`${slide.type}-${index}-${slide.index}}`}
                        slide={slide}
                        index={index}
                        presentationId={presentation_id}
                        onDeleteSlide={handleDeleteSlide}
                      />
                    ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresentationPage;
