import { z } from "zod";

/**
 * Helper to generate structured JSON from Gemini using REST API (v1beta).
 * This bypasses potential SDK validation issues with newer models or specific API keys.
 */
export async function generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    modelName: string = "gemini-2.0-flash"
): Promise<T> {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GOOGLE_GEMINI_API_KEY is not set");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const finalPrompt = `
    You are a professional JSON generator.
    ${prompt}
    
    Output strictly valid JSON matching this structure. No markdown code blocks.
  `;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: finalPrompt
                    }]
                }],
                generationConfig: {
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error:", response.status, errorText);
            throw new Error(`Gemini API returned ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        // Extract text
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error("No content generated");
        }

        // Parse (handle markdown code blocks or raw JSON)
        let cleanText = text.trim();

        // Find the first '{' and the last '}'
        const firstBrace = cleanText.indexOf('{');
        const lastBrace = cleanText.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanText = cleanText.substring(firstBrace, lastBrace + 1);
        } else {
            // Fallback: try removing markdown fences if they exist without braces (unlikely for valid JSON)
            if (cleanText.startsWith("```json")) {
                cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
            } else if (cleanText.startsWith("```")) {
                cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "");
            }
        }

        const parsed = JSON.parse(cleanText);

        // Validate
        const validated = schema.parse(parsed);

        return validated;
    } catch (err) {
        console.error("AI Generation Error", err);
        throw new Error("Failed to generate structure");
    }
}
