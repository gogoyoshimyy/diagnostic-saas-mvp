import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const EventSchema = z.object({
    quizId: z.string(),
    type: z.enum(["view", "start", "complete", "share_copy", "promo_generate", "reco_click"]),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { quizId, type } = EventSchema.parse(body);

        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

        // Use upsert to increment the specific counter
        // Note: mapping enum to field name requires a switch or map

        const fieldMap: Record<string, string> = {
            view: "views",
            start: "starts",
            complete: "completes",
            share_copy: "shareCopy",
            promo_generate: "promoGenerate",
            reco_click: "recoClick",
        };

        const fieldName = fieldMap[type];

        if (!fieldName) {
            return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }

        // Prisma increment usage
        await prisma.quizDailyStat.upsert({
            where: {
                quizId_date: {
                    quizId,
                    date: today,
                },
            },
            update: {
                [fieldName]: {
                    increment: 1,
                },
            },
            create: {
                quizId,
                date: today,
                [fieldName]: 1,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Event Error", error);
        return NextResponse.json({ error: "Failed to track event" }, { status: 500 });
    }
}
