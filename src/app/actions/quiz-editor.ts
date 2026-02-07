"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { redirect } from "next/navigation"

// ----------------------------------------------------------------------
// Basic Settings
// ----------------------------------------------------------------------

const UpdateBasicSchema = z.object({
    title: z.string().min(1, "タイトルは必須です"),
    description: z.string().optional(),
    slug: z.string().min(1, "スラッグは必須です"),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateBasic(quizId: string, prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        return { message: "Unauthorized", errors: {} }
    }

    const validatedFields = UpdateBasicSchema.safeParse({
        title: formData.get("title"),
        description: formData.get("description"),
        slug: formData.get("slug"),
    })

    if (!validatedFields.success) {
        return {
            message: "入力内容に誤りがあります",
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    try {
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            select: { creatorId: true }
        })

        if (!quiz || quiz.creatorId !== session.user.id) {
            return { message: "権限がありません", errors: {} }
        }

        await prisma.quiz.update({
            where: { id: quizId },
            data: {
                title: validatedFields.data.title,
                description: validatedFields.data.description,
                slug: validatedFields.data.slug,
            },
        })

        revalidatePath(`/quizzes/${quizId}/edit`)
        return { message: "更新しました", errors: {} }
    } catch {
        return { message: "更新に失敗しました", errors: {} }
    }
}


// ----------------------------------------------------------------------
// Questions
// ----------------------------------------------------------------------

const UpdateQuestionSchema = z.object({
    id: z.string(),
    text: z.string().min(1, "質問文は必須です"),
    optionA: z.string().min(1, "選択肢Aは必須です"),
    optionB: z.string().min(1, "選択肢Bは必須です"),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateQuestion(quizId: string, prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { message: "Unauthorized", errors: {} }

    const validatedFields = UpdateQuestionSchema.safeParse({
        id: formData.get("id"),
        text: formData.get("text"),
        optionA: formData.get("optionA"),
        optionB: formData.get("optionB"),
    })

    if (!validatedFields.success) {
        return { message: "入力エラー", errors: validatedFields.error.flatten().fieldErrors }
    }

    try {
        const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, select: { creatorId: true } })
        if (!quiz || quiz.creatorId !== session.user.id) return { message: "Unauthorized", errors: {} }

        await prisma.question.update({
            where: { id: validatedFields.data.id },
            data: {
                text: validatedFields.data.text,
                optionA: validatedFields.data.optionA,
                optionB: validatedFields.data.optionB,
            }
        })

        revalidatePath(`/quizzes/${quizId}/edit`)
        return { message: "更新しました", errors: {} }
    } catch {
        return { message: "更新失敗", errors: {} }
    }
}


// ----------------------------------------------------------------------
// Results
// ----------------------------------------------------------------------

const UpdateResultSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "名前は必須です"),
    description: z.string().optional(),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateResultType(quizId: string, prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { message: "Unauthorized", errors: {} }

    const validatedFields = UpdateResultSchema.safeParse({
        id: formData.get("id"),
        name: formData.get("name"),
        description: formData.get("description"),
    })

    if (!validatedFields.success) {
        return { message: "入力エラー", errors: validatedFields.error.flatten().fieldErrors }
    }

    try {
        const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, select: { creatorId: true } })
        if (!quiz || quiz.creatorId !== session.user.id) return { message: "Unauthorized", errors: {} }

        await prisma.resultType.update({
            where: { id: validatedFields.data.id },
            data: {
                name: validatedFields.data.name,
                descriptionShort: validatedFields.data.description
            }
        })

        revalidatePath(`/quizzes/${quizId}/edit`)
        return { message: "更新しました", errors: {} }
    } catch {
        return { message: "更新失敗", errors: {} }
    }
}
