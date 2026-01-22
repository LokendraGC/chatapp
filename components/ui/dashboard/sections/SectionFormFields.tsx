import { Label } from "../../label";
import { Input } from "../../input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../select";
import { Button } from "../../button";
import { X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../../radio-group";

interface SectionFormFieldsProps {
  formData: SectionFormData;
  setFormData: (data: SectionFormData) => void;
  selectedSources: string[];
  setSelectedSources: (sources: string[]) => void;
  isLoadingSources: boolean;
  isDissabled: boolean;
  knowledgeSources: KnowledgeSource[];
}

type ToneOption = {
  value: Tone;
  label: string;
  badge?: string;
  description: string;
};

const TONE_OPTIONS: ToneOption[] = [
  {
    value: "strict",
    label: "Strict",
    badge: "Fact-Based",
    description: "Only answer if fully confident. No Small talk",
  },
  {
    value: "friendly",
    label: "Friendly",
    description: "Warm and conversational. Good for general FAQ.",
  },
  {
    value: "empathetic",
    label: "Empathetic",
    description: "Support-first, apologetic, and calming.",
  },
];

export default function SectionFormFields({
  formData,
  setFormData,
  selectedSources,
  setSelectedSources,
  isLoadingSources,
  isDissabled,
  knowledgeSources,
}: SectionFormFieldsProps) {
  return (
    <>
      <div className="space-y-6">
        <h4 className="text-xs font-semibold text-zinc-400 tracking-tight uppercase">
          Basic Information
        </h4>

        <div className="space-y-2">
          <Label className="text-zinc-400">Section Name</Label>
          <Input
            placeholder="e.g. Billing Policy"
            className="bg-white/2 border-white/10 text-white placeholder:text-zinc-500"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={isDissabled}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-400">Description</Label>
          <Input
            placeholder="When should the AI use this section?"
            className="bg-white/2 border-white/10 text-white placeholder:text-zinc-500"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            disabled={isDissabled}
          />
          <p className="text-[11px] text-zinc-500 mt-1">
            Used by routing model to decide when activate this section.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-semibold text-zinc-400 tracking-tight uppercase">
              Data Source
            </h4>
            <span className="text-xs text-zinc-500">
              {selectedSources.length} attached
            </span>
          </div>

          <Select
            value={selectedSources[0] || ""}
            onValueChange={(value) => {
              if (!selectedSources.includes(value)) {
                setSelectedSources([...selectedSources, value]);
              }
            }}
            disabled={isDissabled}
          >
            <SelectTrigger className="bg-white/2 border-white/10 text-white placeholder:text-zinc-500">
              <SelectValue
                placeholder={
                  isLoadingSources ? "Loading Sources..." : "Select a source"
                }
              />
            </SelectTrigger>
            <SelectContent className="bg-[#0A0A0E] border-white/10 text-white">
              {knowledgeSources.length > 0 ? (
                knowledgeSources?.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    <div className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs text-zinc-400">
                        {source.type}
                      </span>
                      <span>{source.name}</span>
                    </div>
                  </SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="no-sources" disabled>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">
                        No sources added yet
                      </span>
                    </div>
                  </SelectItem>
                </>
              )}
            </SelectContent>
          </Select>

          {selectedSources?.length > 0 && (
            <div className="space-y-2">
              {selectedSources?.map((sourceId) => {
                const source = knowledgeSources?.find((s) => s.id === sourceId);
                if (!source) return null;
                return (
                  <div
                    key={source.id}
                    className="space-y-1 flex items-center justify-between p-2 rounded-md bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 capitalize">
                        {source.type}
                      </span>
                      <span className="text-sm text-zinc-300">
                        {source.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-white hover:text-red-400"
                      onClick={() => {
                        setSelectedSources(
                          selectedSources.filter((id) => id !== sourceId)
                        );
                      }}
                      disabled={isDissabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-zinc-400 tracking-tight uppercase">
            Tone
          </h4>
          <RadioGroup
            value={formData.tone}
            onValueChange={(value) => setFormData({ ...formData, tone: value as Tone })}
            className="grid grid-cols-1 gap-2"
            disabled={isDissabled}
          >
            {TONE_OPTIONS.map((option) => {
              const isSelected = formData.tone === option.value;
              return (
                <div
                  key={option.value}
                  onClick={() => {
                    if (!isDissabled) {
                      setFormData({ ...formData, tone: option.value as Tone });
                    }
                  }}
                  className={`flex items-center cursor-pointer space-x-3 rounded-md p-3 border gap-3 transition-all ${
                    isSelected
                      ? "border-white/30 bg-white/10 shadow-md"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
                  } ${isDissabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <RadioGroupItem
                    className={`border-white/10 ${isSelected ? "border-white/20" : ""}`}
                    value={option.value}
                    id={option.value}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium cursor-pointer ${
                          isSelected ? "text-white" : "text-zinc-300"
                        }`}
                      >
                        {option.label}
                      </span>
                      {option.badge && (
                        <span className="text-[11px] text-red-500 bg-red-900/10 px-2 py-1 rounded-md">
                          {option.badge}
                        </span>
                      )}
                    </div>

                    {option.description && (
                      <p className={`text-xs mt-1 ${isSelected ? "text-zinc-400" : "text-zinc-500"}`}>
                        {option.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </RadioGroup>
        </div>
      </div>
    </>
  );
}
