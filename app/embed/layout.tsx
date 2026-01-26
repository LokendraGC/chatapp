const EmbedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-[#050509] min-h-screen flex flex-col p-0 antialiased text-zinc-100 selection:bg-zinc-800 font-sans">
      {children}
    </div>
  );
};

export default EmbedLayout;
