import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="border-t border-white/5 py-12 bg-black/40 w-full">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-black rounded-[1px]"></div>
            </div>
            <span className="text-base font-semibold tracking-tight text-white/90">
              K Xa Hajur
            </span>
          </Link>
        </div>

        {/* Center: Privacy and Terms */}
        <div className="flex items-center gap-6 text-sm text-zinc-400">
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
        </div>

        {/* Right: Copyright */}
        <div className="flex items-center">
          <p className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} Your Company. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
