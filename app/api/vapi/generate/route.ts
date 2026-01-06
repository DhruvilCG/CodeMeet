import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid } = await request.json();

  const apiKey = process.env.GROQ_API_KEY;
  console.log("GROQ_API_KEY present:", !!apiKey);
  console.log("Request body:", { type, role, level, techstack, amount, userid });

  try {
    console.log("About to call Groq API directly");
    
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: `Generate 5 interview questions for a ${role} with ${level} level experience in ${techstack}. Focus on ${type} questions. Return only the questions as a numbered list.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    console.log("Groq API response status:", groqResponse.status);
    const groqData = await groqResponse.json();
    console.log("Groq API response:", JSON.stringify(groqData, null, 2));

    if (!groqResponse.ok) {
      throw new Error(`Groq API error: ${groqData.error?.message || "Unknown error"}`);
    }

    const questions = groqData.choices[0]?.message?.content || "";
    console.log("Extracted questions:", questions);

    if (!questions || questions.trim() === "") {
      console.log("Questions empty or falsy");
      return Response.json(
        { success: false, error: "No questions generated" },
        { status: 500 }
      );
    }

    console.log("Questions validation passed, saving to Firestore");

    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: techstack.split(","),
      questions: questions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json({ 
      success: true,
      data: {
        questions: questions,
        interviewId: interview.userId,
        role: role,
        level: level,
        type: type
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error in Groq API call:", error);
    console.error("Error type:", error instanceof Error ? error.message : "Unknown");
    return Response.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
