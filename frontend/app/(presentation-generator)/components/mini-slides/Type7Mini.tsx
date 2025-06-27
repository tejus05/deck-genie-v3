import { useSelector } from "react-redux";
import { PresentationGenerationApi } from "../../services/api/presentation-generation";
import { RootState } from "@/store/store";
import { numberTranslations } from "../../utils/others";
import MiniTypeWriter from "./MiniTypeWriter";

interface Type7MiniProps {
  title: string;
  body: Array<{
    heading: string;
    description: string;
  }>;
  tone: string;
}

const Type7Mini = ({ title, body, tone }: Type7MiniProps) => {
  const { currentColors } = useSelector((state: RootState) => state.theme);
  const isGridLayout = body.length === 4;

  return (
    <div className="slide-container w-full aspect-video bg-white p-2 flex flex-col justify-center items-center rounded-lg text-[6px] border shadow-xl">
      <div className="text-center mb-1">
        <div className="font-semibold text-[10px] slide-title truncate">
          <MiniTypeWriter text={title} />
        </div>
      </div>
      <div className={isGridLayout ? "grid grid-cols-2 gap-1" : "flex gap-1"}>
        {body.map((item, index) => (
          <div key={index} className="bg-gray-50 rounded-sm p-1 slide-box">
            <div className="flex gap-1 items-start">
              <div
                className="text-[5px] font-bold flex-shrink-0"
                style={{ color: currentColors.accentColor }}
              >
                {
                  numberTranslations[
                    "English"
                  ][index]
                }
              </div>
              <div className="flex-1">
                <div className="truncate font-medium slide-heading">
                  <MiniTypeWriter text={item.heading} />
                </div>
                <div className="text-gray-600 text-[4px] slide-description">
                  <MiniTypeWriter text={item.description} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Type7Mini;
