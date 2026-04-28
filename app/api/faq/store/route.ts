import { getWorkspaceEmail } from "@/lib/workspace";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { question, answer, domain } = body;
    if (!question?.trim() || !answer?.trim()) {
      return NextResponse.json(
        { error: "Question and answer are required" },
        { status: 400 }
      );
    }

    const userEmail = (await getWorkspaceEmail(clerkUser)) || "";

    // Automatically fetch domain from MetaData based on userEmail
    const metadata = await prisma.metaData.findUnique({
      where: { user_email: userEmail },
      select: { website_url: true }
    });
    
    const autoDomain = metadata?.website_url || "";

    const existingMax = await prisma.faq.aggregate({
      _max: { sort_order: true },
      where: {
        user_email: userEmail,
      },
    });
    const nextOrder = (existingMax._max.sort_order ?? -1) + 1;

    const faq = await prisma.faq.create({
      data: {
        user_email: userEmail,
        question: question.trim(),
        answer: answer.trim(),
        sort_order: nextOrder,
        domain: autoDomain,
      },
    });

    // Fetch all FAQs for this domain and store in a cookie
    const allDomainFaqs = await prisma.faq.findMany({
      where: { domain: autoDomain },
      orderBy: { sort_order: "asc" },
      select: { question: true, answer: true }
    });

    const response = NextResponse.json({ faq }, { status: 200 });
    
    // Set cookie (be mindful of 4KB limit)
    const cookieValue = JSON.stringify(allDomainFaqs.slice(0, 10)); // Limit to first 10 to be safe
    response.cookies.set("domain_faqs", cookieValue, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("Error creating FAQ:", error);
    return NextResponse.json(
      { error: "Failed to create FAQ" },
      { status: 500 }
    );
  }
}
