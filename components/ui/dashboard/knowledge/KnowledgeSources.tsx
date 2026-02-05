import { Filter, Search, Globe, FileText, Upload, File } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../card";
import { Spinner } from "../../spinner";
import { Input } from "../../input";
import { Button } from "../../button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../table";
import { Skeleton } from "../../skeleton";
import { Badge } from "../../badge";
import { useState, useMemo } from "react";

type SourceType = "website" | "docs" | "text" | "upload";
type SourceStatus = "active" | "training" | "error" | "excluded";

export function getTypeIcon(type: SourceType) {
  switch (type) {
    case "website":
      return <Globe className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
    case "text":
      return <FileText className="h-4 w-4 text-green-500 dark:text-green-400" />;
    case "upload":
      return <Upload className="h-4 w-4 text-purple-500 dark:text-purple-400" />;
    case "docs":
      return <File className="h-4 w-4 text-orange-500 dark:text-orange-400" />;
    default:
      return <File className="h-4 w-4 text-muted-foreground" />;
  }
}

export function getStatusBadge(status: SourceStatus) {
  switch (status) {
    case "active":
      return (
        <Badge variant="default" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          {status}
        </Badge>
      );
    case "training":
      return (
        <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
          {status}
        </Badge>
      );
    case "error":
      return (
        <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20">
          {status}
        </Badge>
      );
    case "excluded":
      return (
        <Badge variant="secondary" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20">
          {status}
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

interface KnowledgeSourceProps {
  sources: KnowledgeSource[];
  onSourceClick: (source: KnowledgeSource) => void;
  isLoading: boolean;
}

export default function KnowledgeSources({
  sources,
  onSourceClick,
  isLoading,
}: KnowledgeSourceProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter sources based on search query
  const filteredSources = useMemo(() => {
    if (!searchQuery.trim()) {
      return sources;
    }

    const query = searchQuery.toLowerCase().trim();
    return sources.filter((source) => {
      const nameMatch = source.name?.toLowerCase().includes(query);
      const urlMatch = source.source_url?.toLowerCase().includes(query);
      const typeMatch = source.type?.toLowerCase().includes(query);
      const statusMatch = source.status?.toLowerCase().includes(query);
      
      return nameMatch || urlMatch || typeMatch || statusMatch;
    });
  }, [sources, searchQuery]);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium text-foreground">
            Sources {searchQuery && `(${filteredSources.length})`}
          </CardTitle>

          <div className="flex items-center gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search sources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/30 border-border w-50 md:w-64 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs uppercase font-medium text-muted-foreground">
                Name
              </TableHead>
              <TableHead className="text-xs uppercase font-medium text-muted-foreground">
                Type
              </TableHead>
              <TableHead className="text-xs uppercase font-medium text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="text-xs uppercase font-medium text-muted-foreground">
                Last Updated
              </TableHead>
              <TableHead className="text-xs uppercase font-medium text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index} className="border-border">
                  <TableCell>
                    <Skeleton className="h-4 w-32 bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20 bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16 bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24 bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16 bg-muted" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredSources.length > 0 ? (
              filteredSources.map((source, index) => (
                <TableRow
                  key={source.id || index}
                  className="border-border hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => onSourceClick(source)}
                >
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(source.type as SourceType)}
                      <div className="flex flex-col">
                        <span>{source.name}</span>
                        {source.source_url && (
                          <span className="text-xs text-muted-foreground font-normal truncate max-w-md">
                            {source.source_url}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground capitalize">
                    {source.type}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(source.status as SourceStatus)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {source.last_updated
                      ? new Date(source.last_updated).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground hover:bg-muted"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSourceClick(source);
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : searchQuery ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-muted-foreground"
                >
                  No sources found matching "{searchQuery}"
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-muted-foreground"
                >
                  No knowledge sources added yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
