"use client";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Palette,
  SquareArrowOutUpRight,
  Play,
  Loader2,
  ExternalLink,
} from "lucide-react";
import React, { useState } from "react";
import Wrapper from "@/components/Wrapper";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import UserAccount from "../../components/UserAccount";
import { PresentationGenerationApi } from "../../services/api/presentation-generation";
import { OverlayLoader } from "@/components/ui/overlay-loader";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useDispatch, useSelector } from "react-redux";

import Link from "next/link";

import { ThemeType } from "@/app/(presentation-generator)/upload/type";
import {
  setTheme,
  setThemeColors,
  defaultColors,
  serverColors,
} from "../../store/themeSlice";
import CustomThemeSettings from "../../components/CustomThemeSettings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RootState } from "@/store/store";
import { toast } from "@/hooks/use-toast";

import ThemeSelector from "./ThemeSelector";
import Modal from "./Modal";

import Announcement from "@/components/Announcement";
import { getFontLink } from "../../utils/others";
import { clearLogs, logOperation } from "../../utils/log";

const Header = ({
  presentation_id,
  currentSlide,
}: {
  presentation_id: string;
  currentSlide?: number;
}) => {
  const [open, setOpen] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const router = useRouter();

  const [showCustomThemeModal, setShowCustomThemeModal] = useState(false);
  const { currentTheme, currentColors } = useSelector(
    (state: RootState) => state.theme
  );
  const { presentationData, isStreaming } = useSelector(
    (state: RootState) => state.presentationGeneration
  );
  const dispatch = useDispatch();
  const handleThemeSelect = async (value: string) => {
    if (isStreaming) return;
    if (value === "custom") {
      logOperation('Opening custom theme modal');
      setShowCustomThemeModal(true);
      return;
    } else {
      const themeType = value as ThemeType;
      const themeColors = serverColors[themeType] || defaultColors[themeType];

      if (themeColors) {
        try {
          logOperation(`Changing theme to: ${themeType}`);
          // Update UI
          dispatch(setTheme(themeType));
          dispatch(setThemeColors({ ...themeColors, theme: themeType }));
          // Set CSS variables
          const root = document.documentElement;
          root.style.setProperty(
            `--${themeType}-slide-bg`,
            themeColors.slideBg
          );
          root.style.setProperty(
            `--${themeType}-slide-title`,
            themeColors.slideTitle
          );
          root.style.setProperty(
            `--${themeType}-slide-heading`,
            themeColors.slideHeading
          );
          root.style.setProperty(
            `--${themeType}-slide-description`,
            themeColors.slideDescription
          );
          root.style.setProperty(
            `--${themeType}-slide-box`,
            themeColors.slideBox
          );

          // Save in background
          await PresentationGenerationApi.setThemeColors(presentation_id, {
            name: themeType,
            colors: {
              ...themeColors,
            },
          });
          logOperation(`Theme ${themeType} applied successfully`);
        } catch (error) {
          logOperation(`Error updating theme: ${error}`);
          console.error("Failed to update theme:", error);
          toast({
            title: "Error updating theme",
            description:
              "Failed to update the presentation theme. Please try again.",
            variant: "destructive",
          });
        }
      }
    }
  };

  const getCleanTitle = () => {
    const title = presentationData?.presentation?.title;
    if (!title || 
        title === "Title of this presentation in about 3 to 8 words" ||
        title === "Presentation" ||
        title.trim().length === 0) {
      
      // Try to generate a better title from the prompt
      const prompt = presentationData?.presentation?.prompt;
      if (prompt && prompt.trim().length > 0) {
        // Take first 4 words from prompt and title case them
        const words = prompt.trim().split(' ').slice(0, 4);
        const generatedTitle = words.map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
        return generatedTitle;
      }
      
      return `Presentation ${presentation_id.slice(0, 8)}`;
    }
    return title;
  };

  const getSlideMetadata = async () => {
    try {
      logOperation('Fetching slide metadata');
      
      // For web mode, create metadata for each slide based on current presentation data
      const slides = presentationData?.slides || [];
      const metadata = slides.map((slide: any, index: number) => {
        // Extract text content from the slide
        const elements = [];
        
        if (slide.content) {
          // Try to extract title
          const title = slide.content.title || slide.content.heading || slide.title;
          if (title) {
            elements.push({
              type: 'text',
              content: title,
              position: { left: 50, top: 50, width: 600, height: 100 },
              fontSize: 36,
              fontWeight: 'bold'
            });
          }
          
          // Try to extract subtitle  
          const subtitle = slide.content.subtitle || slide.content.subheading;
          if (subtitle) {
            elements.push({
              type: 'text', 
              content: subtitle,
              position: { left: 50, top: 150, width: 600, height: 50 },
              fontSize: 24
            });
          }
          
          // Try to extract bullet points or content
          const bulletPoints = slide.content.bullet_points || slide.content.bullets || slide.content.points;
          if (bulletPoints && Array.isArray(bulletPoints) && bulletPoints.length > 0) {
            const bulletText = bulletPoints.map((point: any) => `• ${point}`).join('\n');
            elements.push({
              type: 'text',
              content: bulletText,
              position: { left: 50, top: 220, width: 600, height: 300 },
              fontSize: 18
            });
          }
          
          // Try to extract general content
          const content = slide.content.content || slide.content.text || slide.content.description;
          if (content && typeof content === 'string' && !bulletPoints) {
            elements.push({
              type: 'text',
              content: content,
              position: { left: 50, top: 220, width: 600, height: 300 },
              fontSize: 18
            });
          }
        }
        
        // If no content found, add a placeholder
        if (elements.length === 0) {
          elements.push({
            type: 'text',
            content: `Slide ${index + 1}`,
            position: { left: 50, top: 50, width: 600, height: 100 },
            fontSize: 36,
            fontWeight: 'bold'
          });
        }
        
        return {
          elements: elements,
          backgroundColor: currentColors?.slideBg || '#ffffff',
          slideIndex: index
        };
      });
      
      logOperation('Slide metadata fetched successfully');
      return metadata;
    } catch (error) {
      logOperation(`Error fetching metadata: ${error}`);
      setShowLoader(false);
      console.error("Error fetching metadata:", error);
      toast({
        title: "Error fetching slide metadata",
        description: error instanceof Error ? error.message : "Failed to fetch metadata",
        variant: "destructive",
      });
      throw error;
    }
  };
  const metaData = async () => {
    const body = {
      presentation_id: presentation_id,
      slides: presentationData?.slides,
    };
    await PresentationGenerationApi.updatePresentationContent(body)
      .then(() => { })
      .catch((error) => {
        console.error(error);
      });

    const apiBody = {
      presentation_id: presentation_id,
      pptx_model: {
        background_color: currentColors?.slideBg || '#ffffff',
        slides: presentationData?.slides || []
      },
    };

    return apiBody;
  };
  const handleExportPptx = async () => {
    if (isStreaming) return;

    setOpen(false);
    try {
      logOperation('Starting advanced PPTX export with DeckGenie integration');
      setShowLoader(true);
      
      toast({
        title: "Exporting presentation...",
        description: "Please wait while we export your presentation with full fidelity.",
        variant: "default",
      });

      const metadataResponse = await fetch('/api/slide-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: `http://localhost:3000/pdf-maker?id=${presentation_id}`,
          theme: currentTheme || 'light',
          customColors: currentColors
        })
      });

      if (!metadataResponse.ok) {
        throw new Error("Failed to extract slide metadata");
      }

      const { pptx_model } = await metadataResponse.json();
      logOperation('Successfully extracted slide metadata for PPTX generation');
      
      // Debug: Log the actual PPTX model structure
      console.log('PPTX Model Debug:', JSON.stringify(pptx_model, null, 2));
      console.log('Number of slides:', pptx_model.slides.length);
      console.log('Background color:', pptx_model.background_color);

      // Now send the PPTX model to backend for generation
      const backendResponse = await fetch('http://127.0.0.1:8000/ppt/presentation/export_as_pptx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          presentation_id: presentation_id,
          pptx_model: pptx_model
        })
      });

      if (backendResponse.ok) {
        const { path: pptxPath } = await backendResponse.json();
        logOperation('PPTX export completed, initiating download');
        
        // Create a download link
        const link = document.createElement('a');
        const fileName = pptxPath.split('/').pop() || `presentation-${presentation_id}.pptx`;
        // Construct correct presentations URL
        link.href = `http://127.0.0.1:8000/presentations/${presentation_id}/${fileName}`;
        link.download = `${getCleanTitle()}.pptx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        logOperation('PPTX download completed successfully');
        
        toast({
          title: "Export successful!",
          description: "Your presentation has been exported with full fidelity.",
          variant: "default",
        });
      } else {
        throw new Error("Failed to export PPTX");
      }

    } catch (err) {
      logOperation(`Error in PPTX export: ${err}`);
      console.error(err);
      toast({
        title: "Having trouble exporting!",
        description:
          "We are having trouble exporting your presentation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowLoader(false);
    }
  };

  const handleExportPdf = async () => {
    if (isStreaming) return;

    setOpen(false);
    try {
      logOperation('Starting PDF export');
      setShowLoader(true);
      
      toast({
        title: "Exporting presentation...",
        description: "Please wait while we export your presentation.",
        variant: "default",
      });

      const response = await fetch('/api/export-as-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: `http://localhost:3000/pdf-maker?id=${presentation_id}`,
          title: getCleanTitle(),
        })
      });

      if (response.ok) {
        const { url: pdfUrl } = await response.json();
        logOperation('PDF export completed, initiating download');
        
        // Create a download link
        const link = document.createElement('a');
        link.href = pdfUrl.startsWith('http') ? pdfUrl : `http://localhost:8000${pdfUrl}`;
        link.download = `${getCleanTitle()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        logOperation('PDF download completed successfully');
      } else {
        throw new Error("Failed to export PDF");
      }

    } catch (err) {
      logOperation(`Error in PDF export: ${err}`);
      console.error(err);
      toast({
        title: "Having trouble exporting!",
        description:
          "We are having trouble exporting your presentation. Please try again.",
        variant: "default",
      });
    } finally {
      setShowLoader(false);
    }
  };

  const ExportOptions = () => (
    <div className="space-y-2 max-md:mt-4 bg-white rounded-lg">
      <Button
        onClick={handleExportPdf}
        variant="ghost"
        className="pb-4 border-b rounded-none border-gray-300 w-full flex justify-start text-[#5146E5]"
      >
        <img src="/pdf.svg" alt="pdf export" width={30} height={30} />
        Export as PDF
      </Button>
      <Button
        onClick={handleExportPptx}
        variant="ghost"
        className="w-full flex justify-start text-[#5146E5]"
      >
        <img src="/pptx.svg" alt="pptx export" width={30} height={30} />
        Export as PPTX
      </Button>
      <p className="text-sm pt-3 border-t border-gray-300">
        Font Used:
        <a className="text-blue-500  flex items-center gap-1" href={getFontLink(currentColors.fontFamily).link || ''} target="_blank" rel="noopener noreferrer">
          {getFontLink(currentColors.fontFamily).name || ''} <ExternalLink className="w-4 h-4" />
        </a>
      </p>
    </div>
  );

  const MenuItems = () => (
    <div className="flex flex-col lg:flex-row items-center gap-4">
      {/* Present Button */}
      <Button
        onClick={() => router.push(`?id=${presentation_id}&mode=present&slide=${currentSlide || 0}`)}
        variant="ghost"
        className="border border-white font-bold text-white rounded-[32px] transition-all duration-300 group"
      >
        <Play className="w-4 h-4 mr-1 stroke-white group-hover:stroke-black" />
        Present
      </Button>

      {/* Desktop Export Button with Popover */}

      <div className="hidden lg:block">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button className="border py-5 text-white font-bold rounded-[32px] transition-all duration-500 hover:border w-full">
              <SquareArrowOutUpRight className="w-4 h-4 mr-1" />
              Export
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[250px] space-y-2 py-3 px-2">
            <ExportOptions />
          </PopoverContent>
        </Popover>
      </div>

      {/* Mobile Export Section */}
      <div className="lg:hidden flex flex-col w-full">
        <ExportOptions />
      </div>
    </div>
  );

  return (
    <div className="glass border-b-2 border-white/20 w-full shadow-modern-xl sticky top-0 z-50 backdrop-blur-md">
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-90"></div>
      <OverlayLoader
        show={showLoader}
        text="Exporting presentation..."
        showProgress={true}
        duration={40}
      />
      <Announcement />
      <Wrapper className="relative flex items-center justify-between py-4">
        <Link href="/dashboard" className="min-w-[162px] transition-transform hover:scale-105">
          <img
            src="/logo-white.png"
            alt="Presentation logo"
            width={162}
            height={32}
            className="drop-shadow-lg"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-4 2xl:gap-6">
          {isStreaming && (
            <div className="flex items-center gap-2 glass border border-white/30 rounded-xl px-3 py-2">
              <Loader2 className="animate-spin text-white w-4 h-4" />
              <span className="text-white text-sm font-medium">Processing...</span>
            </div>
          )}
          <Select value={currentTheme} onValueChange={handleThemeSelect}>
            <SelectTrigger className="w-[180px] glass border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-200 rounded-xl">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <span className="font-medium">Change Theme</span>
              </div>
            </SelectTrigger>
            <SelectContent className="w-[320px] p-0 border-2 border-border/50 rounded-xl shadow-modern-xl">
              <ThemeSelector
                onSelect={handleThemeSelect}
                selectedTheme={currentTheme}
              />
            </SelectContent>
          </Select>
          {/* Custom Theme Modal */}
          <Modal
            isOpen={showCustomThemeModal}
            onClose={() => setShowCustomThemeModal(false)}
            title="Custom Theme Colors"
          >
            <CustomThemeSettings
              onClose={() => setShowCustomThemeModal(false)}
              presentationId={presentation_id}
            />
          </Modal>
          <MenuItems />
          <UserAccount />
        </div>

        {/* Mobile Menu */}
        <div className="lg:hidden flex items-center gap-4">
          <UserAccount />
          <Sheet>
            <SheetTrigger asChild>
              <button className="glass border-2 border-white/30 rounded-xl p-3 hover:bg-white/20 hover:border-white/50 transition-all duration-200 group">
                <Menu className="h-5 w-5 text-white group-hover:text-white/90 transition-colors" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="glass border-l-2 border-white/20 p-6 backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-accent/90 to-primary/90"></div>
              <div className="relative flex flex-col gap-6 mt-10">
                <Select onValueChange={handleThemeSelect}>
                  <SelectTrigger className="w-full glass border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      <SelectValue placeholder="Choose Theme" className="font-medium" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light Theme</SelectItem>
                    <SelectItem value="dark">Dark Theme</SelectItem>
                    <SelectItem value="royal_blue">Royal Blue Theme</SelectItem>
                    <SelectItem value="cream">Cream Theme</SelectItem>
                    <SelectItem value="dark_pink">Dark Pink Theme</SelectItem>
                    <SelectItem value="light_red">Light Red Theme</SelectItem>
                    <SelectItem value="faint_yellow">
                      Faint Yellow Theme
                    </SelectItem>
                    <SelectItem value="custom">Custom Theme</SelectItem>
                  </SelectContent>
                </Select>
                <MenuItems />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Wrapper>
    </div>
  );
};

export default Header;
