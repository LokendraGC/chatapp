import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { color, welcome_message } = await req.json();

    // Validate required fields
    if (!color || !welcome_message) {
      return NextResponse.json(
        { error: "Color and welcome message are required" }, 
        { status: 400 }
      );
    }

    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
    
    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" }, 
        { status: 400 }
      );
    }

    // Update metadata
    const metadata = await prisma.chatBotMetadata.updateMany({
      where: { 
        user_email: userEmail 
      },
      data: { 
        color: color.trim(),
        welcome_message: welcome_message.trim()
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        data: {
          color,
          welcome_message
        },
        count: metadata.count 
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating metadata:", error);
    
    // Check if it's a Prisma error
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to update: ${error.message}` }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}