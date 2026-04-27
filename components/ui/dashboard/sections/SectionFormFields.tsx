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
    value: "neutral",
    label: "Neutral",
    description: "Professional and concise.",
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
        <h4 className="text-xs font-semibold text-muted-foreground tracking-tight uppercase">
          Basic Information
        </h4>

        <div className="space-y-2">
          <Label className="text-muted-foreground">
            Section Name <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="e.g. Billing Policy"
            className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={isDissabled}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground">
            Description <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="When should the AI use this section?"
            className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            disabled={isDissabled}
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Used by routing model to decide when to activate this section.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-semibold text-muted-foreground tracking-tight uppercase">
              Data Source <span className="text-red-500">*</span>
            </h4>
            <span className="text-xs text-muted-foreground">
              {selectedSources.length} attached
            </span>
          </div>

          <Select
            value=""
            onValueChange={(value) => {
              if (!selectedSources.includes(value)) {
                setSelectedSources([...selectedSources, value]);
              }
            }}
            disabled={isDissabled}
          >
            <SelectTrigger className="w-full bg-muted/30 border-border text-foreground placeholder:text-muted-foreground cursor-pointer">
              <SelectValue
                placeholder={
                  isLoadingSources ? "Loading Sources..." : "Select source"
                }
              />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-popover-foreground">
              {knowledgeSources.length > 0 ? (
                knowledgeSources?.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    <div className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs text-muted-foreground">
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
                      <span className="text-xs text-muted-foreground">
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
                    className="space-y-1 flex items-center justify-between p-2 rounded-md bg-muted/30 border border-border"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground capitalize">
                        {source.type}
                      </span>
                      <span className="text-sm text-foreground">
                        {source.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer h-6 w-6 p-0 text-foreground hover:text-red-500"
                      onClick={() => {
                        setSelectedSources(
                          selectedSources.filter((id) => id !== sourceId),
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
          <h4 className="text-xs font-semibold text-muted-foreground tracking-tight uppercase">
            Tone <span className="text-red-500">*</span>
          </h4>
          <RadioGroup
            value={formData.tone}
            onValueChange={(value) =>
              setFormData({ ...formData, tone: value as Tone })
            }
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
                      ? "border-primary/50 bg-muted shadow-sm"
                      : "border-border bg-muted/30 hover:border-border hover:bg-muted/50"
                  } ${isDissabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <RadioGroupItem
                    className={`border-border ${
                      isSelected ? "border-primary" : ""
                    }`}
                    value={option.value}
                    id={option.value}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium cursor-pointer ${
                          isSelected
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {option.label}
                      </span>
                      {option.badge && (
                        <span className="text-[11px] text-red-600 dark:text-red-500 bg-red-500/10 px-2 py-1 rounded-md">
                          {option.badge}
                        </span>
                      )}
                    </div>

                    {option.description && (
                      <p className="text-xs mt-1 text-muted-foreground">
                        {option.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Scope Rules
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">
                Allowed Topics
              </Label>
              <Input
                placeholder="e.g. pricing, returns, etc."
                className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground"
                value={formData.allowedTopics}
                onChange={(e) =>
                  setFormData({ ...formData, allowedTopics: e.target.value })
                }
                disabled={isDissabled}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">
                Blocked Topics
              </Label>
              <Input
                placeholder="e.g. competitors etc."
                className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground"
                value={formData.blockedTopics}
                onChange={(e) =>
                  setFormData({ ...formData, blockedTopics: e.target.value })
                }
                disabled={isDissabled}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
