import { cookies } from "next/headers";

export const metadata = {
  title: "K xa Hajur chat app",
  description: "A chatbot to help you with your support needs.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const metaDataCookie = cookieStore.get("metaData");
  return (
    <div className="bg-[#050509] min-h-screen flex flex-col p-0 antialiased text-zinc-100 selection:bg-zinc-800 font-sans">
      {metaDataCookie?.value ? <>{children}</> : children}
    </div>
  );
}
