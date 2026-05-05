import { NextResponse } from "next/server";
import { searchWeb } from "@/lib/tavily";

export async function GET() {
  try {
    const result = await searchWeb("Who is prime minister of Nepal?");
    console.log("Tavily Search Result:", result);
    
    return NextResponse.json({ 
      success: true, 
      message: "Check your terminal console for the log!",
      data: result 
    });
  } catch (error: any) {
    console.error("Tavily Search Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
