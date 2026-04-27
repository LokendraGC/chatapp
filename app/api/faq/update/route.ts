import { getWorkspaceEmail } from "@/lib/workspace";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, question, answer } = body;
    if (!id || !question?.trim() || !answer?.trim()) {
      return NextResponse.json(
        { error: "ID, question and answer are required" },
        { status: 400 }
      );
    }

    const faq = await prisma.faq.updateMany({
      where: {
        id,
        user_email: (await getWorkspaceEmail(clerkUser) || "") ?? "",
      },
      data: {
        question: question.trim(),
        answer: answer.trim(),
      },
    });
    if (faq.count === 0) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }
    const updated = await prisma.faq.findUnique({ where: { id } });
    return NextResponse.json({ faq: updated }, { status: 200 });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return NextResponse.json(
      { error: "Failed to update FAQ" },
      { status: 500 }
    );
  }
}
