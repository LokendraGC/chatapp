import { getWorkspaceEmail } from "@/lib/workspace";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function DELETE(req: Request) {
    const clerkUser = await currentUser();
    if (!clerkUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "Source ID is required" }, { status: 400 });
        }

        const source = await prisma.knowledgeSource.findUnique({
            where: { id },
        });

        if (!source) {
            return NextResponse.json({ error: "Source not found" }, { status: 404 });
        }

        if (source.user_email !== (await getWorkspaceEmail(clerkUser) || "")) {
            return NextResponse.json({ error: "You can not delete this source" }, { status: 403 });
        }

        await prisma.knowledgeSource.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Source deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting source:", error);
        return NextResponse.json({ error: "Failed to delete source" }, { status: 500 });
    }
}