import React from "react";
import { Check } from "lucide-react";

export const Pricing = () => {
  return (
    <section id="pricing" className="py-32 px-6 max-w-6xl mx-auto text-center">
      <h2 className="text-3xl md:text-4xl font-medium text-white tracking-tight mb-4">
        Fair, usage-based pricing.
      </h2>
      <p className="text-zinc-500 font-light mb-16">
        Start free, upgrade as you grow.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="p-8 rounded-3xl border border-white/5 bg-zinc-900/20 flex flex-col items-start text-left hover:bg-zinc-900/30 transition-colors h-full">
          <div className="text-sm font-medium text-zinc-400 mb-2">Starter</div>
          <div className="text-4xl font-medium text-white tracking-tight">
            $0 <span className="text-lg text-zinc-600 font-light">/mo</span>
          </div>

          <ul className="space-y-3 mb-8 mt-4 text-sm text-zinc-300 font-light w-full flex-1">
            <li className="flex items-center gap-3">
              <Check className="w-4 h-4 text-zinc-600" />
              100 conversations
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-4 h-4 text-zinc-600" />1 Knowledge Source
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-4 h-4 text-zinc-600" />
              Community Support
            </li>
          </ul>
          <button className="cursor-pointer w-full bg-transparent border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/10 mx-auto transition-all mt-auto">
            Start Free
          </button>
        </div>

        <div className="p-8 rounded-3xl border border-white/5 bg-zinc-900/20 flex flex-col items-start text-left hover:bg-zinc-900/30 transition-colors h-full">
          <div className="text-sm font-medium text-zinc-400 mb-2">Popular</div>
          <div className="text-xl font-medium text-indigo-400 mb-2">Pro</div>
          <div className="text-4xl font-medium text-white tracking-tight">
            $29 <span className="text-lg text-zinc-600 font-light">/mo</span>
          </div>

          <ul className="space-y-3 mb-8 mt-4 text-sm text-zinc-300 font-light w-full flex-1">
            <li className="flex items-center gap-3">
              <Check className="w-4 h-4 text-indigo-400" />
              Unlimited conversations
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-4 h-4 text-indigo-400" />
              Unlimited Knowledge Sources
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-4 h-4 text-indigo-400" />
              Priority Support
            </li>
          </ul>
          <button className="cursor-pointer w-full bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-200 mx-auto transition-all mt-auto">
            Upgrade to Pro
          </button>
        </div>
      </div>
    </section>
  );
};
