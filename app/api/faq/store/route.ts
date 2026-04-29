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
    const { question, answer } = body;

    if (!question?.trim() || !answer?.trim()) {
      return NextResponse.json(
        { error: "Question and answer are required" },
        { status: 400 }
      );
    }

    const userEmail = (await getWorkspaceEmail(clerkUser)) || "";

    const existingMax = await prisma.faq.aggregate({
      _max: { sort_order: true },
      where: { user_email: userEmail },
    });
    const nextOrder = (existingMax._max.sort_order ?? -1) + 1;

    const faq = await prisma.faq.create({
      data: {
        user_email: userEmail,
        question: question.trim(),
        answer: answer.trim(),
        sort_order: nextOrder,
      },
    });

    return NextResponse.json({ faq }, { status: 200 });

  } catch (error) {
    console.error("Error creating FAQ:", error);
    return NextResponse.json(
      { error: "Failed to create FAQ" },
      { status: 500 }
    );
  }
}