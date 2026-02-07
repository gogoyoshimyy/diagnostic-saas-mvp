import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateStructured } from "@/lib/gemini";
import { z } from "zod";

// Schema for the Draft Generation
const DraftSchema = z.object({
    title: z.string(),
    description: z.string(),
    axes: z.array(z.object({
        key: z.string(),
        leftLabel: z.string(),
        rightLabel: z.string(),
    })).min(2).max(4),
    results: z.array(z.object({
        code: z.string(),
        name: z.string(),
        description: z.string(), // short description
    })), // Usually 2^N results, e.g. 4 axes -> 16 results ideally, but MVP maybe less
    questions: z.array(z.object({
        text: z.string(),
        optionA: z.string(),
        optionB: z.string(),
        axis: z.string(), // Must match one of the axes keys
        weight: z.number().optional(),
        aSide: z.boolean().optional(),
    })).min(5),
});

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    // Ideally check Auth here
    // const session = await auth();
    // if (!session) return ...

    try {
        const { topic } = await req.json(); // Input prompt or topic

        const prompt = `
      Create a diagnostic quiz about "${topic}".
      Return a JSON structure with:
      1. "title": string
      2. "description": string
      3. "axes": array of 4 objects with { "key", "leftLabel", "rightLabel" }
      4. "results": array of 8 objects with { "code", "name", "description" }
      5. "questions": array of 10 objects with { "text", "optionA", "optionB", "axis", "weight" (1), "aSide" (true/false) }
      
      Ensure all keys are present. "axis" in question must match one of the "axes" keys.
    `;

        const draft = await generateStructured(prompt, DraftSchema);

        // Save to DB
        // We use a transaction or just sequential updates
        // For MVP, simplistic sequential

        // Update Quiz Title
        await prisma.quiz.update({
            where: { id },
            data: {
                title: draft.title,
                description: draft.description,
            }
        });

        // Create Axes
        for (const axis of draft.axes) {
            await prisma.axis.create({
                data: {
                    quizId: id,
                    key: axis.key,
                    leftLabel: axis.leftLabel,
                    rightLabel: axis.rightLabel,
                }
            });
        }

        // Create Results
        for (const res of draft.results) {
            await prisma.resultType.create({
                data: {
                    quizId: id,
                    code: res.code,
                    name: res.name,
                    descriptionShort: res.description,
                }
            });
        }

        // Create Questions
        for (const q of draft.questions) {
            await prisma.question.create({
                data: {
                    quizId: id,
                    text: q.text,
                    optionA: q.optionA,
                    optionB: q.optionB,
                    axisKey: q.axis,
                    aSide: q.aSide ?? true,
                    weight: q.weight ?? 1,
                }
            });
        }

        return NextResponse.json({ success: true, draft });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to generate draft" }, { status: 500 });
    }
}
