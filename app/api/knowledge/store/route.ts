import { summarizeMarkdown } from "@/lib/gemini";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = req.headers.get("Content-Type");
    let type: string;
    let body: any;

    if (contentType?.includes("multipart/form-data")) {
      const formData = await req.formData();
      type = formData.get("type") as string;

      if (type === "upload") {
        const file = formData.get("file") as File;

        if (!file) {
          return NextResponse.json(
            { error: "File is required" },
            { status: 400 }
          );
        }

        const fileContent = await file.text();

        const lines = fileContent
          .split("\n")
          .filter((line) => line.trim() !== "");
        const headers = lines[0]?.split(",").map((header) => header.trim());
        let formattedContent: any = "";

        const markDown = await summarizeMarkdown(formattedContent);
        formattedContent = markDown;

        await prisma.knowledgeSource.create({
          data: {
            user_email: clerkUser.emailAddresses[0]?.emailAddress,
            type: "upload",
            name: file.name,
            status: "active",
            content: formattedContent,
            meta_data: JSON.stringify({
              fileName: file.name,
              rowCount: lines.length,
              fileType: file.type,
              fileSize: file.size,
              headers: headers,
            }),
          },
        });

        return NextResponse.json(
          { message: "Knowledge source stored successfully" },
          { status: 200 }
        );
      }
    } else {
      body = await req.json();
      type = body.type;
      if (type === "text") {
        const { title, content } = body;
        const markDown = await summarizeMarkdown(content);
        console.log(markDown);
      }
      if (type === "website") {
        const zenURL = new URL("https://api.zenrows.com/v1/");
        zenURL.searchParams.set("apikey", process.env.ZENROWS_API_KEY!);
        zenURL.searchParams.set("url", body.url);
        zenURL.searchParams.set("response_type", "markdown");

        const res = await fetch(zenURL.toString(), {
          headers: {
            "User-Agent": "K Xa Hajur/1.0",
          },
        });

        if (!res.ok) {
          return NextResponse.json(
            { error: "Failed to fetch website content" },
            { status: 500 }
          );
        }

        const html = await res.text();
        // console.log("Website HTML content:", html);

        const markDown = await summarizeMarkdown(html);

        await prisma.knowledgeSource.create({
          data: {
            user_email: clerkUser.emailAddresses[0]?.emailAddress,
            type: "website",
            name: body.url,
            source_url: body.url,
            status: "active",
            content: markDown,
          },
        });
      } else if (type === "text") {
        const { title, content } = body;
        let textContent: string;
        if (content.length > 500) {
          const markDown = await summarizeMarkdown(content);
          textContent = markDown;
        } else {
          textContent = content;
        }

        await prisma.knowledgeSource.create({
          data: {
            user_email: clerkUser.emailAddresses[0]?.emailAddress,
            type: "text",
            name: title,
            status: "active",
            content: textContent,
          },
        });

        return NextResponse.json(
          { message: "Knowledge source stored successfully" },
          { status: 200 }
        );
      }
    }

    return NextResponse.json(
      { message: "Knowledge source stored successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
