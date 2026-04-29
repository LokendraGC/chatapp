import { getWorkspaceEmail } from "@/lib/workspace";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";


const FALLBACK_FAQS = [
  { question: "How can I contact support?", answer: "You can reach us via the contact tab or send us a message here." },
  { question: "What services do you offer?", answer: "We offer a range of services. Feel free to ask me anything specific!" },
  { question: "How do I book an appointment?", answer: "You can book an appointment by contacting us directly through this chat." },
];

export async function GET(req: Request) {
  try {
    const clerkUser = await currentUser();
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");
    const token = searchParams.get("token");

    let user_email = "";
    
    // If authenticated (dashboard), use the workspace email
    if (clerkUser) {
      user_email = (await getWorkspaceEmail(clerkUser)) || "";
    } 
    // If token provided (widget), decode it to get the owner's email
    else if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        if (payload && payload.ownerEmail) {
          user_email = payload.ownerEmail as string;
        }
      } catch (e) {
        console.error("Token verification failed in FAQ fetch:", e);
      }
    }

    

    const faqs = await prisma.faq.findMany({
      where: {
        user_email: user_email || undefined,
        ...(domain ? { domain: { contains: domain } } : {}),
      },
      orderBy: [{ sort_order: "asc" }, { created_at: "desc" }],
    });

    // After your prisma.faq.findMany:
    return NextResponse.json({ 
      faqs: faqs.length > 0 ? faqs : FALLBACK_FAQS 
    }, { status: 200 });

  } catch (error) {
   console.error("Error fetching FAQs:", error);
    return NextResponse.json({ faqs: FALLBACK_FAQS });
  }
}
