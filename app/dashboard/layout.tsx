import Sidebar from "@/components/ui/dashboard/sidebar";
import { cookies } from "next/headers";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

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
  const metaDataCookie = cookieStore.get("metadata");
  
  let metadata = null;
  let userEmail = null;

  if (metaDataCookie?.value) {
    try {
      // Get user email
      const clerkUser = await currentUser();
      if (clerkUser) {
        userEmail = clerkUser.emailAddresses[0]?.emailAddress || null;
      }

      // Parse metadata from cookie
      const cookieData = JSON.parse(metaDataCookie.value);
      metadata = cookieData;

      // If only business_name is in cookie, fetch full metadata from DB
      if (cookieData.business_name && !cookieData.website_url && userEmail) {
        const fullMetadata = await prisma.metaData.findUnique({
          where: {
            user_email: userEmail,
          },
        });
        if (fullMetadata) {
          metadata = fullMetadata;
        }
      }
    } catch (error) {
      console.error("Error parsing metadata:", error);
    }
  }

  return (
    <div className="bg-[#050509] min-h-screen flex flex-col p-0 antialiased text-zinc-100 selection:bg-zinc-800 font-sans">
      {metaDataCookie?.value ? (
        <>
          <Sidebar metadata={metadata} email={userEmail} />
          <div className="flex-1 flex flex-col md:ml-64 relative min-h-screen transition-all duration-300 ease-in-out">
            {/* <Header/> */}
            <main className="flex-1">{children}</main>
          </div>
        </>
      ) : (
        children
      )}
    </div>
  );
}
