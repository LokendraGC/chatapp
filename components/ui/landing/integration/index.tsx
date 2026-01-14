import React from "react";

const Integration = () => {
  return (
    <section
      id="how-it-works"
      className="py-24 border-t border-white/5 bg-black/20"
    >
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center">
        <div className="flex-1">
          <h2 className="text-3xl md:text-4xl font-medium text-white tracking-tight">
            Drop-in simplicity.
          </h2>
          <p className="text-lg text-zinc-400 font-light mb-8 leading-relaxed">
            No complex SDKs or user syncing. Just add our script tag and
            you&apos;re live. We inherit your CSS variables automatically.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 text-sm text-zinc-300">
              <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-700">
                1
              </div>
              Scan your documentation URL
            </div>
            <div className="w-px h-4 bg-zinc-800 ml-3"></div>
            <div className="flex items-center gap-4 text-sm text-zinc-300">
              <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-700">
                2
              </div>
              Copy the script tag we generate for you
            </div>
            <div className="w-px h-4 bg-zinc-800 ml-3"></div>
            <div className="flex items-center gap-4 text-sm text-zinc-300">
              <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-700">
                3
              </div>
              Automatically start collecting feedback
            </div>
          </div>
        </div>

        <div className="flex-1 w-full max-w-lg">
          <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0e] shadow-2xl">
            {/* Window Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#0E0E13]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30"></div>
              </div>
              <span className="text-xs text-zinc-400 font-mono ml-2">
                index.html
              </span>
            </div>

            {/* Code Content */}
            <div className="p-6 bg-[#0a0a0e]">
              <div className="font-mono text-sm text-zinc-400 leading-relaxed space-y-1">
                <div className="text-zinc-500">&lt;!-- K Xa Hajur --&gt;</div>
                <div>
                  &lt;<span className="text-pink-400">script</span>&gt;
                </div>
                <div>
                  &lt;<span className="text-pink-400">script</span>
                  <span className="text-indigo-400"> src</span>=
                  <span className="text-emerald-400">
                    &quot;https://oneminutesupport.com/init.js&quot;
                  </span>
                  &gt;&lt;/<span className="text-pink-400">script</span>&gt;
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Integration;
