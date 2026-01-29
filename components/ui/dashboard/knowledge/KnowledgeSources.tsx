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
      return <Globe className="h-4 w-4 text-blue-400" />;
    case "text":
      return <FileText className="h-4 w-4 text-green-400" />;
    case "upload":
      return <Upload className="h-4 w-4 text-purple-400" />;
    case "docs":
      return <File className="h-4 w-4 text-orange-400" />;
    default:
      return <File className="h-4 w-4 text-zinc-400" />;
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
    <Card className="border-white/5 bg-[#0a0a0e]">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium text-white">
            Sources {searchQuery && `(${filteredSources.length})`}
          </CardTitle>

          <div className="flex items-center gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search sources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/2 border-white/10 w-50 md:w-64 text-white placeholder:text-zinc-500"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white hover:bg-white/5"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-xs uppercase font-medium text-zinc-500">
                Name
              </TableHead>
              <TableHead className="text-xs uppercase font-medium text-zinc-500">
                Type
              </TableHead>
              <TableHead className="text-xs uppercase font-medium text-zinc-500">
                Status
              </TableHead>
              <TableHead className="text-xs uppercase font-medium text-zinc-500">
                Last Updated
              </TableHead>
              <TableHead className="text-xs uppercase font-medium text-zinc-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index} className="border-white/5">
                  <TableCell>
                    <Skeleton className="h-4 w-32 bg-white/10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20 bg-white/10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16 bg-white/10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24 bg-white/10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16 bg-white/10" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredSources.length > 0 ? (
              filteredSources.map((source, index) => (
                <TableRow
                  key={source.id || index}
                  className="border-white/5 hover:bg-white/2 cursor-pointer transition-colors"
                  onClick={() => onSourceClick(source)}
                >
                  <TableCell className="font-medium text-zinc-200">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(source.type as SourceType)}
                      <div className="flex flex-col">
                        <span>{source.name}</span>
                        {source.source_url && (
                          <span className="text-xs text-zinc-500 font-normal truncate max-w-md">
                            {source.source_url}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-400 capitalize">
                    {source.type}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(source.status as SourceStatus)}
                  </TableCell>
                  <TableCell className="text-zinc-400 text-sm">
                    {source.last_updated
                      ? new Date(source.last_updated).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400 hover:text-white hover:bg-white/5"
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
                  className="h-32 text-center text-zinc-500"
                >
                  No sources found matching "{searchQuery}"
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-zinc-500"
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
