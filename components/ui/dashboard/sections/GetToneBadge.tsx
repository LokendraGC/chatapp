import { Badge } from "../../badge";

export function getToneBadge(tone: Tone) {
  switch (tone) {
    case "strict":
      return (
        <Badge variant="outline" className="border-red-500/30 text-red-500">
          Strict
        </Badge>
      );
    case "neutral":
      return (
        <Badge variant="outline" className="border-blue-500/30 text-blue-500">
          Neutral
        </Badge>
      );
    case "friendly":
      return (
        <Badge
          variant="outline"
          className="border-indigo-500/30 text-indigo-500"
        >
          Friendly
        </Badge>
      );
    case "empathetic":
      return (
        <Badge
          variant="outline"
          className="border-purple-500/30 text-purple-500"
        >
          Empathetic
        </Badge>
      );
  }
}


export function getStatusBadge(status: SectionStatus) {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-emerald-500/10 text-emerald-500">Active</Badge>
      case "draft":
        return <Badge variant="secondary">Draft</Badge>
      case "disabled":
        return <Badge variant="outline" className="text-muted-foreground border-border">Disabled</Badge>
    }
  }