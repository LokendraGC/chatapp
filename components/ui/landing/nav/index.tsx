import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

const Navbar = async () => {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 transition-all duration-300 backdrop-blur-sm border-b border-white/5 bg-[#050509]/60">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-black rounded-[1px]"></div>
          </div>
          <span className="text-base font-semibold tracking-tight text-white/90">
            K Xa Hajur
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-light text-zinc-300">
          <Link
            href="#features"
            className="hover:text-white transition-colors duration-200"
          >
            Features
          </Link>
          <Link href="#features" className="hover:text-white transition-colors">
            Integration
          </Link>
          <Link
            href="#features"
            className="hover:text-white transition-colors duration-200"
          >
            Pricing
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-light text-zinc-300">
          <SignedIn>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="h-11 cursor-pointer px-8 rounded-full border border-zinc-800  text-zinc-300 text-sm font-medium hover:text-white transition-all flex items-center gap-2 bg-black/30">
                <span>Dashboard</span>
              </Link>
            </div>
          </SignedIn>
          <SignedOut>
            <>
              <SignInButton>
                <button className="border border-zinc-400 rounded-full px-4 py-2 cursor-pointer text-xs font-medium text-zinc-300 hover:text-white transition-colors duration-200">
                  Sign In
                </button>
              </SignInButton>
              <button className="cursor-pointer text-xs font-medium bg-white rounded-full text-black px-4 py-2 hover:bg-zinc-200 transition-colors duration-200">
                Get Started
              </button>
            </>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
