import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

const Navbar = async () => {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 w-full max-w-[100vw] overflow-x-hidden border-b border-white/5 gpu-layer bg-[#050509] sm:bg-[#050509]/80 sm:backdrop-blur-sm sm:transition-all sm:duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 min-w-0">
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink-0">
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-sm flex items-center justify-center shrink-0">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-black rounded-[1px]"></div>
          </div>
          <span className="text-sm sm:text-base font-semibold tracking-tight text-white/90 truncate">
          Sahayak Chatbot
          </span>
        </Link>

        {/* Center nav links: desktop only */}
        <div className="hidden md:flex items-center gap-10 text-[15px] font-medium text-zinc-200 shrink-0">
          <Link
            href="/features"
            className="inline-block py-2 transition-all duration-200 hover:text-white hover:scale-105 hover:[text-shadow:0_0_12px_rgba(129,140,248,0.5)]"
          >
            Features
          </Link>
          <Link
            href="/features"
            className="inline-block py-2 transition-all duration-200 hover:text-white hover:scale-105 hover:[text-shadow:0_0_12px_rgba(129,140,248,0.5)]"
          >
            Integration
          </Link>
          <Link
            href="/features"
            className="inline-block py-2 transition-all duration-200 hover:text-white hover:scale-105 hover:[text-shadow:0_0_12px_rgba(129,140,248,0.5)]"
          >
            Pricing
          </Link>
        </div>

        {/* Right auth actions: visible on mobile and desktop */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-8 text-sm font-light text-zinc-300 shrink-0">
          <SignedIn>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/dashboard" className="h-9 sm:h-11 cursor-pointer px-4 sm:px-8 rounded-full border border-zinc-800 text-zinc-300 text-xs sm:text-sm font-medium hover:text-white transition-all flex items-center gap-2 bg-black/30">
                <span>Dashboard</span>
              </Link>
            </div>
          </SignedIn>
          <SignedOut>
            <>
              <SignInButton>
                <button className="border border-zinc-400 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 cursor-pointer text-xs font-medium text-zinc-300 hover:text-white transition-colors duration-200">
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton>
                <button className="cursor-pointer text-xs font-medium bg-white rounded-full text-black px-3 py-1.5 sm:px-4 sm:py-2 hover:bg-zinc-200 transition-colors duration-200">
                  Get Started
                </button>
              </SignUpButton>
            </>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;