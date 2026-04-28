import Sidebar from "@/components/ui/dashboard/sidebar";
import { cookies } from "next/headers";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import ToastProvider from "@/components/ui/toast-provider";
import { ThemeProvider } from "next-themes";
import DashboardHeader from "@/components/ui/dashboard/header";

export const metadata = {
  title: "Karmi chat app",
  description: "A chatbot to help you with your support needs.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkUser = await currentUser();
  const cookieStore = await cookies();
  const metaDataCookie = cookieStore.get("metadata");

  let metadata: {
    business_name?: string;
    website_url?: string;
    external_links?: string;
  } | null = null;
  let userEmail: string | null =
    clerkUser?.emailAddresses?.[0]?.emailAddress ?? null;

  if (clerkUser && userEmail) {
    if (metaDataCookie?.value) {
      try {
        const cookieData = JSON.parse(metaDataCookie.value) as {
          business_name?: string;
          website_url?: string;
          external_links?: string | null;
        };
        metadata = {
          business_name: cookieData.business_name,
          website_url: cookieData.website_url,
          external_links: cookieData.external_links ?? undefined,
        };
        if (cookieData.business_name && !cookieData.website_url) {
          const [fullMetadata] = await prisma.metaData.findMany({
            where: { user_email: userEmail },
          });
          if (fullMetadata)
            metadata = {
              business_name: fullMetadata.business_name,
              website_url: fullMetadata.website_url,
              external_links: fullMetadata.external_links ?? undefined,
            };
        }
      } catch (error) {
        console.error("Error parsing metadata:", error);
      }
    }
    if (!metadata) {
      const [dbMetadata] = await prisma.metaData.findMany({
        where: { user_email: userEmail },
      });
      if (dbMetadata)
        metadata = {
          business_name: dbMetadata.business_name,
          website_url: dbMetadata.website_url,
          external_links: dbMetadata.external_links ?? undefined,
        };
    }
  }

  const showSidebar = !!clerkUser && !!metadata;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div
        suppressHydrationWarning
        className="bg-background text-foreground min-h-screen flex flex-col p-0 antialiased selection:bg-zinc-800 font-sans"
      >
        {showSidebar ? (
          <>
            <Sidebar metadata={metadata} email={userEmail} />
            <div className="flex-1 flex flex-col md:ml-64 relative min-h-screen transition-all duration-300 ease-in-out bg-background">
              <DashboardHeader metadata={metadata} email={userEmail} />
              <main className="flex-1">{children}</main>
            </div>
          </>
        ) : (
          children
        )}
        <ToastProvider />
      </div>
    </ThemeProvider>
  );
}
