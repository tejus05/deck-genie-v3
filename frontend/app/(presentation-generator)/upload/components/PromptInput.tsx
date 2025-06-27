import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";


interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;

}

export function PromptInput({
  value,
  onChange,
}: PromptInputProps) {
  const [showHint, setShowHint] = useState(false);
  const handleChange = (value: string) => {
    setShowHint(value.length > 0);
    onChange(value);
  };
  
  return (
    <div className="space-y-3">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <Textarea
          value={value}
          rows={6}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Describe your idea in detail"
          data-testid="prompt-input"
          className={`relative py-6 px-6 border-2 font-body text-base min-h-[180px] max-h-[300px] border-accent/30 bg-background/80 backdrop-blur-sm rounded-2xl focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent hover:border-accent/50 overflow-y-auto custom_scrollbar shadow-modern transition-all duration-200`}
        />
        
        {/* Character count or hint */}
        {showHint && (
          <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-lg">
            {value.length} characters
          </div>
        )}
      </div>
      
      
    </div>
  );
}
