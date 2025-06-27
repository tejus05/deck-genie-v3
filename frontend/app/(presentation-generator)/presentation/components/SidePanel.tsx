"use client";
import React, { useState, useEffect } from "react";
import { LayoutList, ListTree, PanelRightOpen, X } from "lucide-react";
import ToolTip from "@/components/ToolTip";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { DashboardApi } from "@/app/dashboard/api/dashboard";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import * as htmlToImage from "html-to-image";
import { setPresentationData } from "@/store/slices/presentationGeneration";
import { SortableSlide } from "./SortableSlide";
import { SortableListItem } from "./SortableListItem";
import { renderMiniSlideContent } from "../../components/slide_config";

interface SidePanelProps {
  selectedSlide: number;
  onSlideClick: (index: number) => void;
  isMobilePanelOpen: boolean;
  setIsMobilePanelOpen: (value: boolean) => void;
  loading: boolean;
}

const SidePanel = ({
  selectedSlide,
  onSlideClick,
  isMobilePanelOpen,
  setIsMobilePanelOpen,
  loading,
}: SidePanelProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [active, setActive] = useState<"list" | "grid">("grid");

  const { presentationData, isStreaming } = useSelector(
    (state: RootState) => state.presentationGeneration
  );
  const { currentTheme, currentColors } = useSelector(
    (state: RootState) => state.theme
  );
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize panel state based on screen size
    const handleResize = () => {
      if (window.innerWidth < 1280) { // xl breakpoint
        setIsOpen(false); // Desktop panel should be closed on smaller screens
      }
    };
    
    // Set initial state
    handleResize();
    
    // Listen for resize events
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Handle mobile panel state changes
    if (window.innerWidth < 1280) {
      setIsOpen(isMobilePanelOpen);
    }
  }, [isMobilePanelOpen]);

  useEffect(() => {
    if (
      presentationData?.presentation?.thumbnail === null &&
      presentationData.slides.some(
        (slide) => slide.images && slide.images.length > 0
      )
    ) {
      setTimeout(() => {
        setSlideThumbnail();
      }, 4000);
    }
  }, [presentationData]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleClose = () => {
    if (window.innerWidth < 1280) { // xl breakpoint is 1280px
      setIsMobilePanelOpen(false);
    } else {
      setIsOpen(false);
    }
  };

  const dataUrlToFile = (dataUrl: string, filename: string) => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*)/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!active || !over || !presentationData?.slides) return;

    if (active.id !== over.id) {
      // Find the indices of the dragged and target items
      const oldIndex = presentationData?.slides.findIndex(
        (item) => item.id === active.id
      );
      const newIndex = presentationData?.slides.findIndex(
        (item) => item.id === over.id
      );

      // Reorder the array
      const reorderedArray = arrayMove(
        presentationData?.slides,
        oldIndex,
        newIndex
      );

      // Update indices of all slides
      const updatedArray = reorderedArray.map((slide, index) => ({
        ...slide,
        index: index,
      }));

      // Update the store with new order and indices
      dispatch(
        setPresentationData({ ...presentationData, slides: updatedArray })
      );
    }
  };

  const setSlideThumbnail = async () => {
    const slideContainer = document.querySelector(".slide-container");
    if (!slideContainer) return;
    const image = await htmlToImage
      .toPng(slideContainer as HTMLElement)
      .then((dataUrl) => {
        return dataUrl;
      });

    const file = dataUrlToFile(image, "thumbnail.png");

    const response = await DashboardApi.setSlideThumbnail(
      presentationData?.presentation?.id!,
      file
    );
  };

  // Loading shimmer component
  if (
    !presentationData ||
    loading ||
    !presentationData?.slides ||
    presentationData?.slides.length === 0
  ) {
    return null;
  }

  return (
    <>
      {/* Desktop Toggle Button - Always visible when panel is closed */}
      {!isOpen && (
        <div className="hidden xl:block fixed left-6 bottom-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="glass border-2 border-white/30 text-white px-4 py-3 rounded-xl shadow-modern-xl hover:bg-white/20 hover:border-white/50 transition-all duration-200 hover:scale-105 flex items-center gap-2 backdrop-blur-md"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/80 rounded-xl"></div>
            <PanelRightOpen className="relative text-white" size={20} />
            <span className="relative text-sm font-medium">Show Panel</span>
          </Button>
        </div>
      )}

      {/* Mobile Toggle Button - Always visible when panel is closed */}
      {!isMobilePanelOpen && (
        <div className="xl:hidden fixed left-6 bottom-6 z-50">
          <Button
            onClick={() => setIsMobilePanelOpen(true)}
            className="glass border-2 border-white/30 text-white px-4 py-3 rounded-xl shadow-modern-xl hover:bg-white/20 hover:border-white/50 transition-all duration-200 hover:scale-105 flex items-center gap-2 backdrop-blur-md"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/80 rounded-xl"></div>
            <PanelRightOpen className="relative text-white" size={20} />
            <span className="relative text-sm font-medium">Show Panel</span>
          </Button>
        </div>
      )}

      {/* Side Panel */}
      <div
        className={`
          fixed xl:relative h-full z-50 xl:z-auto
          transition-all duration-300 ease-in-out
          ${isOpen ? "ml-0" : "-ml-[300px]"}
          ${
            isMobilePanelOpen
              ? "translate-x-0"
              : "-translate-x-full xl:translate-x-0"
          }
        `}
      >
        <div
          data-theme={currentTheme}
          style={{
            backgroundColor: currentColors.slideBg,
          }}
          className="min-w-[300px] max-w-[300px] h-[calc(100vh-150px)] rounded-2xl hide-scrollbar overflow-hidden slide-theme shadow-modern-xl border-2 border-border/20 backdrop-blur-sm"
        >
          <div
            style={{
              backgroundColor: currentColors.slideBg,
            }}
            className="sticky top-0 z-40 px-6 py-6 border-b border-border/20"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center justify-start gap-3">
                <ToolTip content="Image Preview">
                  <Button
                    size="sm"
                    variant={active === "grid" ? "default" : "outline"}
                    className={`rounded-lg transition-all duration-200 hover:scale-105 ${
                      active === "grid"
                        ? "shadow-modern"
                        : "border-2 border-border/30 hover:border-accent/50"
                    }`}
                    onClick={() => setActive("grid")}
                  >
                    <LayoutList size={18} />
                  </Button>
                </ToolTip>
                <ToolTip content="List Preview">
                  <Button
                    size="sm"
                    variant={active === "list" ? "default" : "outline"}
                    className={`rounded-lg transition-all duration-200 hover:scale-105 ${
                      active === "list"
                        ? "shadow-modern"
                        : "border-2 border-border/30 hover:border-accent/50"
                    }`}
                    onClick={() => setActive("list")}
                  >
                    <ListTree size={18} />
                  </Button>
                </ToolTip>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg border-2 border-border/30 hover:border-destructive/50 hover:bg-destructive/10 transition-all duration-200 hover:scale-105 group"
              >
                <X
                  className="text-muted-foreground group-hover:text-destructive transition-colors"
                  size={18}
                />
              </button>
            </div>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {/* List Preview */}
            {active === "list" && (
              <div className="p-4 overflow-y-auto hide-scrollbar h-[calc(100%-100px)]">
                {isStreaming ? (
                  presentationData &&
                  presentationData?.slides.map((slide, index) => (
                    <div
                      key={`${index}-${slide.type}-${slide.id}`}
                      className={`p-3 cursor-pointer rounded-lg slide-box`}
                    >
                      <span className="font-medium slide-title">
                        Slide {index + 1}
                      </span>
                      <p className="text-sm slide-description">
                        {slide.content.title}
                      </p>
                    </div>
                  ))
                ) : (
                  <SortableContext
                    items={
                      presentationData?.slides.map((slide) => slide.id!) || []
                    }
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2" id={`slide-${selectedSlide}`}>
                      {presentationData &&
                        presentationData?.slides.map((slide, index) => (
                          <SortableListItem
                            key={`${slide.id}-${index}`}
                            slide={slide}
                            index={index}
                            selectedSlide={selectedSlide}
                            onSlideClick={onSlideClick}
                          />
                        ))}
                    </div>
                  </SortableContext>
                )}
              </div>
            )}

            {/* Grid Preview */}
            {active === "grid" && (
              <div className="p-4 overflow-y-auto hide-scrollbar h-[calc(100%-100px)] space-y-4">
                {isStreaming ? (
                  presentationData &&
                  presentationData?.slides.map((slide, index) => (
                    <div key={`${index}-${slide.type}-${slide.id}`}>
                      {renderMiniSlideContent(slide, presentationData?.presentation?.tone || "Professional")}
                    </div>
                  ))
                ) : (
                  <SortableContext
                    items={
                      presentationData?.slides.map((slide) => slide.id!) || []
                    }
                    strategy={verticalListSortingStrategy}
                  >
                    {presentationData &&
                      presentationData?.slides.map((slide, index) => (
                        <SortableSlide
                          key={`${slide.id}-${index}`}
                          slide={slide}
                          index={index}
                          selectedSlide={selectedSlide}
                          onSlideClick={onSlideClick}
                          tone={presentationData?.presentation?.tone || "Professional"}
                        />
                      ))}
                  </SortableContext>
                )}
              </div>
            )}
          </DndContext>
        </div>
      </div>
    </>
  );
};

export default SidePanel;
