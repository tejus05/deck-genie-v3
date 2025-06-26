import React, { useEffect, useState } from "react";
import { Slide } from "../../types/slide";
import { renderSlideContent } from "../../components/slide_config";
import { Loader2, PlusIcon, Trash2 } from "lucide-react";
import ToolTip from "@/components/ToolTip";
import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { addSlide, updateSlide } from "@/store/slices/presentationGeneration";
import NewSlide from "../../components/slide_layouts/NewSlide";
import { getEmptySlideContent } from "../../utils/NewSlideContent";
import { clearLogs, logOperation } from "../../utils/log";

interface SlideContentProps {
  slide: Slide;
  index: number;

  presentationId: string;

  onDeleteSlide: (index: number) => void;
}

const SlideContent = ({
  slide,
  index,

  presentationId,
  onDeleteSlide,
}: SlideContentProps) => {
  const dispatch = useDispatch();
  const [showNewSlideSelection, setShowNewSlideSelection] = useState(false);
  const { presentationData, isStreaming } = useSelector(
    (state: RootState) => state.presentationGeneration
  );

  const handleNewSlide = (type: number, index: number) => {
    logOperation(`Adding new slide of type ${type} after slide ${index}`);
    const newSlide: Slide = getEmptySlideContent(
      type,
      index + 1,
      presentationData?.presentation!.id!
    );

    dispatch(addSlide({ slide: newSlide, index: index + 1 }));
    setShowNewSlideSelection(false);
  };
  // Scroll to the new slide when the presentationData is updated
  useEffect(() => {
    if (
      presentationData &&
      presentationData?.slides &&
      presentationData.slides.length > 1 &&
      isStreaming
    ) {

      const slideElement = document.getElementById(`slide-${index}`);
      if (slideElement) {
        slideElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [presentationData?.slides, isStreaming]);

  const language = presentationData?.presentation?.language || "English";
  return (
    <>
      <div
        id={`slide-${isStreaming ? index : slide.index}`}
        className=" w-full max-w-[1280px] flex items-center max-md:mb-4 justify-center relative"
      >
        {isStreaming && (
          <Loader2 className="w-8 h-8 absolute right-2 top-2 z-30 text-blue-800 animate-spin" />
        )}
        <div className={` w-full group `}>
          {renderSlideContent(slide, language)}

          {!showNewSlideSelection && (
            <div className="group-hover:opacity-100 hidden md:block opacity-0 transition-opacity my-4 duration-300">
              <ToolTip content="Add new slide below">
                {!isStreaming && (
                  <div
                    onClick={() => setShowNewSlideSelection(true)}
                    className="  bg-white shadow-md w-[80px] py-2 border hover:border-[#5141e5] duration-300  flex items-center justify-center rounded-lg cursor-pointer mx-auto"
                  >
                    <PlusIcon className="text-gray-500 text-base cursor-pointer" />
                  </div>
                )}
              </ToolTip>
            </div>
          )}
          {showNewSlideSelection && (
            <NewSlide
              onSelectLayout={(type) => handleNewSlide(type, slide.index)}
              setShowNewSlideSelection={setShowNewSlideSelection}
            />
          )}
          {!isStreaming && (
            <ToolTip content="Delete slide">
              <div
                onClick={() => onDeleteSlide(slide.index)}
                className="absolute top-2 z-20 sm:top-4 right-2 sm:right-4 hidden md:block  transition-transform"
              >
                <Trash2 className="text-gray-500 text-xl cursor-pointer" />
              </div>
            </ToolTip>
          )}
        </div>
      </div>
    </>
  );
};

export default SlideContent;
