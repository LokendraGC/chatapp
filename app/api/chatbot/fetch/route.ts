import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [existingMetaData] = await prisma.chatBotMetadata.findMany({
      where: {
        user_email: clerkUser.emailAddresses[0]?.emailAddress,
      },
    });

    if (!existingMetaData) {
      const newMetaData = await prisma.chatBotMetadata.create({
        data: {
          user_email: clerkUser.emailAddresses[0]?.emailAddress,
        },
      });

      return NextResponse.json(
        {
          exists: true,
          source: "database",
          data: newMetaData,
        },
        { status: 200 }
      );
      
    }

    return NextResponse.json(
      {
        exists: true,
        source: "database",
        data: existingMetaData,
      },
      { status: 200 }
    );
    
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
