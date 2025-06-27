/**
 * UploadPage Component
 * 
 * This compone  const [config, setConfig] = useState<PresentationConfig>({
    slides: null,
    tone: ToneType.Professional,
    prompt: "",
  });ndles the presentation generation upload process, allowing users to:
 * - Configure presentation settings (slides, tone)
 * - Input prompts
 * 
 * @component
 */

"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  setError,
  setPresentationId,
  setTitles,
} from "@/store/slices/presentationGeneration";
import { ConfigurationSelects } from "./ConfigurationSelects";
import { PromptInput } from "./PromptInput";
import { PresentationConfig, ToneType } from "../type";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PresentationGenerationApi } from "../../services/api/presentation-generation";
import { OverlayLoader } from "@/components/ui/overlay-loader";
import Wrapper from "@/components/Wrapper";
import { clearLogs, logOperation } from "../../utils/log";

// Types for loading state
interface LoadingState {
  isLoading: boolean;
  message: string;
  duration?: number;
  showProgress?: boolean;
  extra_info?: string;
}

const UploadPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();



  // State management
  const [config, setConfig] = useState<PresentationConfig>({
    tone: ToneType.Professional,
    prompt: "",
  });

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    message: "",
    duration: 4,
    showProgress: false,
    extra_info: "",
  });

  /**
   * Updates the presentation configuration
   * @param key - Configuration key to update
   * @param value - New value for the configuration
   */
  const handleConfigChange = (key: keyof PresentationConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * Validates the current configuration
   * @returns boolean indicating if the configuration is valid
   */
  const validateConfiguration = (): boolean => {
    if (!config.tone) {
      toast({
        title: "Please select a tone",
        description: "Choose a presentation tone to continue",
        variant: "destructive",
      });
      return false;
    }

    if (!config.prompt.trim()) {
      toast({
        title: "Please provide a prompt",
        description: "A prompt is required to generate your presentation",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  /**
   * Handles the presentation generation process
   */
  const handleGeneratePresentation = async () => {
    if (!validateConfiguration()) return;

    try {
      // Clear previous logs before starting new presentation
      clearLogs();
      logOperation(`----New Presentation Generation----`);

      // Log the configuration
      logOperation(`Config: ${JSON.stringify(config)}`);

      await handleDirectPresentationGeneration();
    } catch (error) {
      handleGenerationError(error);
    }
  };

  /**
   * Handles direct presentation generation from prompt
   */
  const handleDirectPresentationGeneration = async () => {
    logOperation('Starting direct presentation generation');
    setLoadingState({
      isLoading: true,
      message: "Generating outlines...",
      showProgress: true,
      duration: 30,
    });

    const createResponse = await PresentationGenerationApi.getQuestions({
      prompt: config?.prompt ?? "",
      images: [],
      tone: config?.tone ?? "",
    });

    try {
      logOperation('Generating presentation titles');
      const titlePromise = await PresentationGenerationApi.titleGeneration({
        presentation_id: createResponse.id,
      });
      dispatch(setPresentationId(titlePromise.id));
      dispatch(setTitles(titlePromise.titles));
      logOperation('Presentation generation completed successfully');
      router.push("/theme");
    } catch (error) {
      console.error("Error in title generation:", error);
      logOperation(`Error in title generation: ${error}`);
      toast({
        title: "Error in title generation.",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  /**
   * Handles errors during presentation generation
   */
  const handleGenerationError = (error: any) => {
    console.error("Error in presentation generation:", error);
    logOperation(`Presentation generation error: ${error}`);
    dispatch(setError("Failed to generate presentation"));
    setLoadingState({
      isLoading: false,
      message: "",
      duration: 0,
      showProgress: false,
    });
    toast({
      title: "Error",
      description: "Failed to generate presentation. Please try again.",
      variant: "destructive",
    });
  };

  return (
    <Wrapper className="pb-10 lg:max-w-[70%] xl:max-w-[65%]">
      <OverlayLoader
        show={loadingState.isLoading}
        text={loadingState.message}
        showProgress={loadingState.showProgress}
        duration={loadingState.duration}
        extra_info={loadingState.extra_info}
      />
      <div className="flex flex-col gap-4 md:items-center md:flex-row justify-between py-4">
        <p></p>
        <ConfigurationSelects
          config={config}
          onConfigChange={handleConfigChange}
        />
      </div>
      <div className="relative">
        <PromptInput
          value={config.prompt}
          onChange={(value) => handleConfigChange("prompt", value)}

          data-testid="prompt-input"
        />
      </div>
      <Button
        onClick={handleGeneratePresentation}
        className="w-full rounded-[32px] flex items-center justify-center py-6 bg-[#5141e5] text-white font-instrument_sans font-semibold text-xl hover:bg-[#5141e5]/80 transition-colors duration-300"
        data-testid="next-button"
      >
        <span>Next</span>
        <ChevronRight className="!w-6 !h-6" />
      </Button>
    </Wrapper>
  );
};

export default UploadPage;
