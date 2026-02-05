"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../../card";
import { Palette, Save } from "lucide-react";
import { Label } from "../../label";
import { cn } from "@/lib/utils";
import { Textarea } from "../../textarea";
import { Button } from "../../button";

interface ApartmentConfigProps {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  welcomeMessage: string;
  setWelcomeMessage: (message: string) => void;
  handleSave: () => void;
  isSaving: boolean;
  hasChanges: boolean;
}

const PRESET_COLORS = [
  { name: "Indigo", value: "#4f46e5" },
  { name: "Blue", value: "#2563eb" },
  { name: "Emerald", value: "#059669" },
  { name: "Rose", value: "#e11d48" },
  { name: "Orange", value: "#ea580c" },
];

export default function ApartmentConfig({
  primaryColor,
  setPrimaryColor,
  welcomeMessage,
  setWelcomeMessage,
  handleSave,
  isSaving,
  hasChanges,
}: ApartmentConfigProps) {
  return (
    <Card className="border-border bg-card overflow-hidden relative shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium text-foreground uppercase">
            Appearance
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-foreground">Primary Color</Label>
          <div className="flex items-center gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.name}
                onClick={() => setPrimaryColor(color.value)}
                className={cn(
                  "w-6 h-6 cursor-pointer rounded-full border-2 transition-all",
                  primaryColor === color.value
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "opacity-60 hover:opacity-100"
                )}
                style={{
                  borderColor: color.value,
                  backgroundColor: color.value,
                }}
                title={color.name}
              />
            ))}

            <div className="relative w-6 h-6 rounded-full overflow-hidden border-2 border-white">
              <div
                className="w-full h-full"
                style={{ backgroundColor: primaryColor }}
              />
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Welcome Message</Label>
          <div className="flex items-center gap-2">
            <Textarea
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              className="min-h-12.5 max-h-37.5 pr-12 outline-none text-foreground bg-muted/30 border-border resize-none rounded-xl disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {hasChanges && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full animate-in"
          >
            {isSaving ? (
              "Saving ..."
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
