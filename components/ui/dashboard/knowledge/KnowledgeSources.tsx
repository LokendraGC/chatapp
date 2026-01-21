export default function KnowledgeSources({
  sources,
  onSourceClick,
  isLoading,
}: {
  sources: KnowledgeSource[];
  onSourceClick: (source: KnowledgeSource) => void;
  isLoading: boolean;
}) {
  return (
    <div>
      <h2>Knowledge Sources</h2>
    </div>
  );
}
