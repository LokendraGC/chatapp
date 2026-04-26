import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../table";
import { getStatusBadge, getToneBadge } from "./GetToneBadge";
import { Button } from "../../button";

interface SectionTableProps {
  sections: Section[];
  isLoading: boolean;
  onPreview: (section: Section) => void;
  onEdit: (id: string) => void;
  onCreateSection: () => void;
}

export default function SectionTable({
  sections,
  isLoading,
  onPreview,
  onEdit,
  onCreateSection,
}: SectionTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="text-xs uppercase font-medium text-muted-foreground pl-6 py-3">
            Name
          </TableHead>
          <TableHead className="text-xs uppercase font-medium text-muted-foreground text-center py-3">
            Sources
          </TableHead>
          <TableHead className="text-xs uppercase font-medium text-muted-foreground py-3">
            Tone
          </TableHead>
          <TableHead className="text-xs uppercase font-medium text-muted-foreground py-3">
            Scope
          </TableHead>
          <TableHead className="text-xs uppercase font-medium text-muted-foreground py-3">
            Status
          </TableHead>
          <TableHead className="text-xs uppercase font-medium text-muted-foreground text-right pr-16 py-3">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading Sections...</span>
              </div>
            </TableCell>
          </TableRow>
        ) : sections.length > 0 ? (
          sections.map((section) => (
            <TableRow
              key={section.id}
              className="border-border group transition-colors hover:bg-muted/30"
            >
              <TableCell className="font-medium text-foreground pl-6 py-3">
                {section.name}
              </TableCell>
              <TableCell className="text-muted-foreground text-center py-3">
                {section.sourceCount}
              </TableCell>
              <TableCell className="text-muted-foreground py-3">
                {getToneBadge(section.tone)}
              </TableCell>
              <TableCell className="text-muted-foreground py-3">
                <span className="text-xs">{section.scopeLabel || "General"}</span>
              </TableCell>
              <TableCell className="text-muted-foreground py-3">
                {getStatusBadge(section.status)}
              </TableCell>


              <TableCell className="text-right pr-6 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(section.id)}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted mr-2"
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPreview(section)}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Preview
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
              No sections found. Create your first section to get started.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
