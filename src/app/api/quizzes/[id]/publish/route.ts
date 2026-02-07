import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const StatusSchema = z.object({
    status: z.enum(["DRAFT", "PUBLIC", "UNLISTED", "PRIVATE"])
});

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const params = await props.params;

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const json = await req.json();
        const { status } = StatusSchema.parse(json);

        // Verify ownership
        const quiz = await prisma.quiz.findUnique({
            where: { id: params.id },
            select: { creatorId: true }
        });

        if (!quiz || quiz.creatorId !== session.user.id) {
            return NextResponse.json({ error: "Not Found or Unauthorized" }, { status: 404 });
        }

        await prisma.quiz.update({
            where: { id: params.id },
            data: { status }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}
