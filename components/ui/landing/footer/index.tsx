import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-black/40 w-full">
      <div className="w-full px-6 pt-16 pb-6">
        <div className="flex items-center justify-center">
          <span className="text-center text-[clamp(3rem,14vw,16rem)] font-extrabold tracking-tight text-white/10 select-none">
            K Xa Hajur
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-12 flex flex-col md:flex-row items-center justify-between gap-4">
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
          <Link href="/features" className="hover:text-white transition-colors">
            Terms
          </Link>
          <Link href="/features" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
        </div>

        {/* Right: Copyright */}
        <div className="flex items-center">
          <p className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} K Xa Hajur. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
