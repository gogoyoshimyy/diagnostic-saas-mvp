import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Cache Control
// PUBLIC: Cache for 60s, stale 300s
// UNLISTED: No store
function setCacheHeaders(response: NextResponse, status: string) {
    if (status === "PUBLIC") {
        response.headers.set(
            "Cache-Control",
            "public, s-maxage=60, stale-while-revalidate=300"
        );
    } else if (status === "UNLISTED") {
        response.headers.set("Cache-Control", "private, no-store");
        response.headers.set("X-Robots-Tag", "noindex, nofollow");
    }
}

export async function GET(req: NextRequest, props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { slug } = params;

    try {
        const quiz = await prisma.quiz.findUnique({
            where: { slug },
            include: {
                axes: true,
                questions: true,
                resultTypes: true,
                recommendations: {
                    include: { conditions: true },
                    orderBy: { priority: 'desc' } // High priority first
                },
                shareAssets: {
                    where: { selected: true },
                },
            },
        });

        // 404 if not found or DRAFT/PRIVATE (unless we treat PRIVATE same as DRAFT for public view)
        // Requirement says: PUBLIC and UNLISTED only.
        if (!quiz || (quiz.status !== "PUBLIC" && quiz.status !== "UNLISTED")) {
            return NextResponse.json({ error: "Not Found" }, { status: 404 });
        }

        // Sort items if needed (Prisma ensures consistent order if ID based, but better if we had 'order')
        // MVP: Assume creation order or ID is fine.

        // Construct simplified response
        const responseData = {
            quiz: {
                id: quiz.id,
                slug: quiz.slug,
                status: quiz.status,
                title: quiz.title,
                description: quiz.description,
                designTemplate: quiz.theme || "simple", // Mapping theme to designTemplate
                promoCardTemplate: quiz.promoCardTemplate, // Keep this too
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                axes: quiz.axes.map((a: any) => ({
                    key: a.key,
                    leftLabel: a.leftLabel,
                    rightLabel: a.rightLabel
                })),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                questions: quiz.questions.map((q: any) => ({
                    id: q.id,
                    text: q.text,
                    optionA: q.optionA,
                    optionB: q.optionB,
                    axisKey: q.axisKey,
                    aSide: q.aSide ? "LEFT" : "RIGHT", // Mapping boolean to requested string enum-like
                    weight: q.weight
                })),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                results: quiz.resultTypes.map((r: any) => ({
                    code: r.code,
                    name: r.name,
                    tagline: r.tagline || "",
                    description: r.descriptionShort || ""
                })),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                recommendations: quiz.recommendations.map((r: any) => ({
                    id: r.id,
                    title: r.title,
                    description: r.description,
                    url: r.url,
                    priority: r.priority > 0 ? "HIGH" : "NORMAL", // Simple mapping logic for MVP
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    conditions: r.conditions.map((c: any) => ({
                        axisKey: c.axisKey,
                        threshold: c.threshold
                    }))
                })),
                share: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    selectedSubcopy: quiz.shareAssets.find((s: any) => s.kind === "SUBCOPY")?.content || null,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    selectedShareText: quiz.shareAssets.find((s: any) => s.kind === "SHARETEXT")?.content || null
                }
            }
        };

        const res = NextResponse.json(responseData);
        setCacheHeaders(res, quiz.status);
        return res;

    } catch (error) {
        console.error("API Error", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
