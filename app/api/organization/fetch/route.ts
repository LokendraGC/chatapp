import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [metaDataRecord] = await prisma.metaData.findMany({
      where: {
        user_email: clerkUser.emailAddresses[0]?.emailAddress,
      },
    });

    const organization = {
      ...(metaDataRecord || []),
      id: clerkUser?.id,
    };

    return NextResponse.json({ organization }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch organization data" },
      { status: 500 }
    );
  }
}
