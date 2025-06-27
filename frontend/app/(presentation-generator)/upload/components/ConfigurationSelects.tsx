import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToneType, PresentationConfig } from "../type";
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Types
interface ConfigurationSelectsProps {
  config: PresentationConfig;
  onConfigChange: (key: keyof PresentationConfig, value: string) => void;
}

// Constants
const TONE_OPTIONS = Object.values(ToneType);

/**
 * Renders a tone selection component
 */
const ToneSelect: React.FC<{
  value: string | null;
  onValueChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ value, onValueChange, open, onOpenChange }) => (
  <Popover open={open} onOpenChange={onOpenChange}>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        name="tone"
        data-testid="tone-select"
        aria-expanded={open}
        className="w-[220px] justify-between font-body font-medium h-11 bg-background/50 hover:bg-background/80 border-2 border-accent/30 hover:border-accent/50 focus-visible:ring-2 focus-visible:ring-accent rounded-xl shadow-modern hover:shadow-modern-lg transition-all duration-200"
      >
        <p className="text-sm font-medium truncate">
          {value || "Select tone"}
        </p>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-[280px] p-0 border-2 border-border/50 rounded-xl shadow-modern-xl" align="end">
      <Command>
        <CommandInput
          placeholder="Search tone..."
          className="font-body border-b border-border/30"
        />
        <CommandList>
          <CommandEmpty className="py-6 text-center text-sm text-muted-foreground font-body">No tone found.</CommandEmpty>
          <CommandGroup className="p-2">
            {Object.values(ToneType).map((tone) => (
              <CommandItem
                key={tone}
                value={tone}
                role="option"
                onSelect={(currentValue) => {
                  onValueChange(currentValue);
                  onOpenChange(false);
                }}
                className="font-body rounded-lg py-3 px-3 hover:bg-accent/10 focus:bg-accent/10 transition-colors duration-150"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4 text-accent",
                    value === tone ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="font-medium">{tone}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
);

export function ConfigurationSelects({
  config,
  onConfigChange,
}: ConfigurationSelectsProps) {
  const [openTone, setOpenTone] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-6">
          <ToneSelect
            value={config.tone}
            onValueChange={(value) => onConfigChange("tone", value)}
            open={openTone}
            onOpenChange={setOpenTone}
          />
      </div>
    </div>
  );
}
