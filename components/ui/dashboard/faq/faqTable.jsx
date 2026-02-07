import { GripVertical, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../table";
import { Button } from "../../button";

function trimText(value, maxLength) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength)}…`;
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function FaqTable({
  faqs,
  isLoading,
  onEdit,
  onDelete,
  onReorder,
}) {
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const handleDrop = (targetId, sourceId) => {
    const activeId = sourceId || draggedId;
    if (!activeId || activeId === targetId) return;
    if (typeof onReorder === "function") {
      onReorder(activeId, targetId);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="w-8 pl-4 py-3" />
          <TableHead className="text-xs uppercase font-medium text-muted-foreground pl-6 py-3">
            Question
          </TableHead>
          <TableHead className="text-xs uppercase font-medium text-muted-foreground py-3">
            Answer
          </TableHead>
          <TableHead className="text-xs uppercase font-medium text-muted-foreground py-3">
            Created At
          </TableHead>
          <TableHead className="text-xs uppercase font-medium text-muted-foreground text-right pr-6 py-3">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center text-muted-foreground py-8"
            >
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading FAQs...</span>
              </div>
            </TableCell>
          </TableRow>
        ) : faqs.length > 0 ? (
          faqs.map((faq) => (
            <TableRow
              key={faq.id}
              className={`border-border group transition-colors hover:bg-muted/30 ${
                dragOverId === faq.id ? "bg-muted/40" : ""
              }`}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", faq.id);
                setDraggedId(faq.id);
              }}
              onDragEnter={(event) => {
                if (!draggedId) return;
                event.preventDefault();
                setDragOverId(faq.id);
              }}
              onDragOver={(event) => {
                if (!draggedId) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setDragOverId(faq.id);
              }}
              onDragLeave={() => {
                setDragOverId(null);
              }}
              onDrop={(event) => {
                event.preventDefault();
                const sourceId =
                  event.dataTransfer.getData("text/plain") || draggedId;
                handleDrop(faq.id, sourceId);
                setDragOverId(null);
                setDraggedId(null);
              }}
              onDragEnd={() => {
                setDragOverId(null);
                setDraggedId(null);
              }}
            >
              <TableCell className="pl-4 py-3 text-muted-foreground">
                <span
                  className="inline-flex items-center cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="w-4 h-4" />
                </span>
              </TableCell>
              <TableCell className="font-medium text-foreground pl-6 py-3 max-w-xs">
                <span className="line-clamp-2">{faq.question}</span>
              </TableCell>
              <TableCell className="text-muted-foreground py-3 max-w-md">
                <span className="line-clamp-2">{trimText(faq.answer, 30)}</span>
              </TableCell>
              <TableCell className="text-muted-foreground py-3 text-sm whitespace-nowrap">
                {formatDate(faq.created_at)}
              </TableCell>
              <TableCell className="text-right pr-6 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(faq)}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(faq)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center text-muted-foreground py-8"
            >
              No FAQs found. Click &quot;Add FAQ&quot; to create your first one.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
