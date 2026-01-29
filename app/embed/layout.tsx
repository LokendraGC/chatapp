export const dynamic = "force-dynamic";

const EmbedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-full bg-transparent antialiased text-zinc-100 selection:bg-zinc-800 font-sans overflow-hidden">
      {children}
    </div>
  );
};

export default EmbedLayout;
