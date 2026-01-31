import { summarizeMarkdown } from "@/lib/gemini";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import path from "path";
import { pathToFileURL } from "url";

export async function POST(req: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = req.headers.get("Content-Type");

    // Handle FormData (file upload)
    if (contentType?.includes("multipart/form-data")) {
      const formData = await req.formData();
      const type = formData.get("type") as string;

      if (type === "upload") {
        const file = formData.get("file") as File;

        if (!file) {
          return NextResponse.json(
            { error: "File is required" },
            { status: 400 }
          );
        }

        const fileName = file.name;
        const fileType = file.type;
        let extractedText = "";
        let formattedContent = "";

        // Handle PDF files - use pdfjs-dist with Node.js polyfills
        if (fileType === "application/pdf" || fileName.toLowerCase().endsWith('.pdf')) {
          try {
            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            // Polyfill DOMMatrix/Path2D/ImageData for pdfjs-dist in Node.js (minimal shim)
            const g = globalThis as Record<string, unknown>;
            if (typeof g.DOMMatrix === "undefined") {
              g.DOMMatrix = class DOMMatrix {
                a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
                constructor(_init?: string | number[]) {}
                translate() { return this; }
                scale() { return this; }
                multiply() { return this; }
                invertSelf() { return this; }
                transformPoint() { return { x: 0, y: 0 }; }
              };
            }
            if (typeof g.Path2D === "undefined") {
              g.Path2D = class Path2D { constructor(_path?: string) {} };
            }
            if (typeof g.ImageData === "undefined") {
              g.ImageData = class ImageData {
                width: number;
                height: number;
                data: Uint8ClampedArray;
                constructor(w: number, h: number) {
                  this.width = w;
                  this.height = h;
                  this.data = new Uint8ClampedArray(w * h * 4);
                }
              };
            }

            const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
            // Required: set worker to legacy build worker (file URL for Node.js)
            const workerPath = path.join(
              process.cwd(),
              "node_modules",
              "pdfjs-dist",
              "legacy",
              "build",
              "pdf.worker.mjs"
            );
            pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

            const loadingTask = pdfjs.getDocument({
              data: uint8Array,
              verbosity: 0,
              disableFontFace: true,
            });
            const pdfDocument = await loadingTask.promise;
            const numPages = pdfDocument.numPages;

            const textParts: string[] = [];
            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
              const page = await pdfDocument.getPage(pageNum);
              const textContent = await page.getTextContent();
              const pageText = textContent.items
                .map((item) => ("str" in item ? item.str : ""))
                .join(" ");
              textParts.push(pageText);
            }
            extractedText = textParts.join("\n\n");

            console.log("PDF extraction successful:", {
              fileName,
              textLength: extractedText.length,
              numPages,
            });

            if (!extractedText || extractedText.trim().length === 0) {
              extractedText = `PDF file: ${fileName}. No extractable text found.`;
              console.warn("PDF has no extractable text:", fileName);
            }
          } catch (pdfError: unknown) {
            const msg = pdfError instanceof Error ? pdfError.message : String(pdfError);
            console.error("PDF parsing error:", pdfError);
            extractedText = `PDF file: ${fileName}. Error extracting text: ${msg}`;
          }
        }
        // Handle CSV files
        else if (fileType === "text/csv" || fileName.toLowerCase().endsWith('.csv')) {
          try {
            const fileContent = await file.text();
            const lines = fileContent
              .split("\n")
              .filter((line) => line.trim() !== "");

            if (lines.length > 0) {
              const headers = lines[0]?.split(",").map((header) => header.trim());

              // Parse CSV rows
              const rows = lines.slice(1).map(line => {
                const values = line.split(",");
                const row: any = {};
                headers?.forEach((header, index) => {
                  row[header] = values[index]?.trim() || '';
                });
                return row;
              });

              // Format CSV content for summarization
              extractedText = `CSV File: ${fileName}\n`;
              extractedText += `Headers: ${headers?.join(', ')}\n`;
              extractedText += `Rows: ${rows.length}\n`;
              extractedText += `Sample data: ${JSON.stringify(rows.slice(0, 3), null, 2)}`;

              // Store full data in metadata
              formattedContent = JSON.stringify({
                fileName,
                headers,
                rowCount: rows.length,
                data: rows.slice(0, 50) // Limit to first 50 rows for storage
              });
            } else {
              extractedText = `Empty CSV file: ${fileName}`;
            }
          } catch (csvError: any) {
            console.error("CSV parsing error:", csvError);
            extractedText = `CSV file: ${fileName}. Error: ${csvError.message}`;
          }
        }
        // Handle text files (TXT, etc.)
        else if (fileType.includes("text/plain") || fileName.toLowerCase().endsWith('.txt')) {
          extractedText = await file.text();
        }
        // Handle other text-based files
        else if (fileType.includes("text/")) {
          extractedText = await file.text();
        }
        // Unsupported file type
        else {
          return NextResponse.json(
            {
              error: "Unsupported file type",
              details: `File type ${fileType} is not supported. Please upload PDF, CSV, or text files.`
            },
            { status: 400 }
          );
        }

        // If we haven't set formattedContent yet (for non-CSV files), store full extracted text
        // so the full PDF/document is available to the chatbot (capped to avoid DB size issues)
        const MAX_CONTENT_CHARS = 500_000;
        if (!formattedContent && extractedText) {
          formattedContent =
            extractedText.length <= MAX_CONTENT_CHARS
              ? extractedText
              : extractedText.slice(0, MAX_CONTENT_CHARS) + "\n\n[Document truncated at " + MAX_CONTENT_CHARS + " characters.]";
        }

        // If still no content (e.g., empty file)
        if (!formattedContent) {
          formattedContent = `Uploaded file: ${fileName}`;
        }

        // Save to database
        const knowledgeSource = await prisma.knowledgeSource.create({
          data: {
            user_email: clerkUser.emailAddresses[0]?.emailAddress || "unknown@example.com",
            type: "upload",
            name: fileName,
            status: "active",
            content: formattedContent,
            meta_data: JSON.stringify({
              fileName: fileName,
              fileType: fileType,
              fileSize: file.size,
              lastModified: file.lastModified,
              originalTextLength: extractedText.length,
              processed: true,
              isPDF: fileType === "application/pdf" || fileName.toLowerCase().endsWith('.pdf'),
              isCSV: fileType === "text/csv" || fileName.toLowerCase().endsWith('.csv'),
              isText: fileType.includes("text/"),
            }),
          },
        });

        console.log("Knowledge source created:", {
          id: knowledgeSource.id,
          name: knowledgeSource.name,
          contentLength: formattedContent.length,
          type: fileType
        });

        return NextResponse.json(
          {
            message: "Knowledge source stored successfully",
            fileName: fileName,
            sourceId: knowledgeSource.id,
            contentType: fileType
          },
          { status: 200 }
        );
      }
    } else {
      // Handle JSON requests (website and text)
      const body = await req.json();
      const type = body.type;

      if (type === "website") {
        const apiKey = process.env.FIRECRAWL_API_KEY;
        if (!apiKey) {
          return NextResponse.json(
            { error: "Firecrawl API key is not configured (FIRECRAWL_API_KEY)" },
            { status: 500 }
          );
        }

        const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            url: body.url,
            formats: ["markdown"],
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error("Firecrawl scrape error:", res.status, errText);
          return NextResponse.json(
            { error: "Failed to fetch website content" },
            { status: 500 }
          );
        }

        const json = await res.json() as { success?: boolean; data?: { markdown?: string } };
        if (!json?.success || !json?.data?.markdown) {
          return NextResponse.json(
            { error: "Invalid or empty response from scrape" },
            { status: 500 }
          );
        }

        let rawMarkdown = json.data.markdown;
        // Strip standalone image lines (![alt](url)) to keep content text-focused for the chatbot
        rawMarkdown = rawMarkdown.replace(/^!\[[^\]]*\]\([^)]+\)\s*$/gm, "").replace(/\n{3,}/g, "\n\n").trim();
        const MAX_CONTENT_CHARS = 500_000;
        const markDown =
          rawMarkdown.length <= MAX_CONTENT_CHARS
            ? rawMarkdown
            : rawMarkdown.slice(0, MAX_CONTENT_CHARS) +
              "\n\n[Content truncated at " + MAX_CONTENT_CHARS + " characters.]";

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

        return NextResponse.json(
          {
            message: "Website knowledge source stored successfully",
            url: body.url
          },
          { status: 200 }
        );

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
          {
            message: "Text knowledge source stored successfully",
            title: title
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { error: "Invalid type parameter. Use 'website' or 'text'." },
          { status: 400 }
        );
      }
    }

    // If we get here, it means the type wasn't "upload" in the form data
    return NextResponse.json(
      { error: "Invalid request type" },
      { status: 400 }
    );

  } catch (err: any) {
    console.error("Error in POST /api/knowledge/store:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: err.message
      },
      { status: 500 }
    );
  }
}