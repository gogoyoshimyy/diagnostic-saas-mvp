import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateStructured } from "@/lib/gemini";
import { z } from "zod";
import { nanoid } from 'nanoid';

// Reusing schema logic or similar
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
        description: z.string(),
    })),
    questions: z.array(z.object({
        text: z.string(),
        optionA: z.string(),
        optionB: z.string(),
        axis: z.string(),
        weight: z.number().optional(),
        aSide: z.boolean().optional(),
    })).min(5),
});

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { topic } = await req.json();

        // 1. Create Shell
        // Slug generation: simplistic nano id for MVP uniqueness
        const slug = nanoid(10);

        const quiz = await prisma.quiz.create({
            data: {
                title: topic || "Untitled Quiz",
                slug: slug,
                creatorId: session.user.id,
                status: "DRAFT",
            }
        });

        // 2. If topic provided, run AI immediately (MVP "Generate" flow)
        if (topic) {
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

            // Update in transaction or sequential
            await prisma.quiz.update({
                where: { id: quiz.id },
                data: {
                    title: draft.title,
                    description: draft.description
                }
            });

            // Create Axes
            for (const axis of draft.axes) {
                await prisma.axis.create({
                    data: {
                        quizId: quiz.id,
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
                        quizId: quiz.id,
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
                        quizId: quiz.id,
                        text: q.text,
                        optionA: q.optionA,
                        optionB: q.optionB,
                        axisKey: q.axis,
                        aSide: q.aSide ?? true,
                        weight: q.weight ?? 1,
                    }
                });
            }
        }

        return NextResponse.json({ id: quiz.id });
    } catch (error) {
        console.error("Create Error", error);
        return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 });
    }
}
