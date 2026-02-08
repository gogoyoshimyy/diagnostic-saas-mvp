// 回答値のマッピング (-2 ~ +2)
export type AnswerValue = -2 | -1 | 0 | 1 | 2;

// 汎用的な質問型 (PrismaとAPIレスポンスの両方に対応)
export interface ScorableQuestion {
    id: string;
    axisKey: string;
    aSide: boolean | string; // boolean(Prisma) or "LEFT"/"RIGHT"(API)
    weight: number;
}

export interface AxisDef {
    key: string;
}

// 軸スコアの計算結果
export type AxisScore = {
    key: string;
    rawScore: number;
    maxScore: number;
    normalized: number; // -1.0 to 1.0
};

/**
 * 軸スコアを計算する
 * @param questions 全質問リスト
 * @param answers ユーザーの回答 { questionId: value }
 * @param axes 軸定義リスト
 */
export function computeAxisScores(
    questions: ScorableQuestion[],
    answers: Record<string, AnswerValue>,
    axes: AxisDef[]
): Record<string, AxisScore> {
    const scores: Record<string, AxisScore> = {};

    // Initialize
    axes.forEach((axis) => {
        scores[axis.key] = {
            key: axis.key,
            rawScore: 0,
            maxScore: 0,
            normalized: 0,
        };
    });

    // Calculate
    questions.forEach((q) => {
        const answer = answers[q.id];
        if (answer === undefined) return;

        const weight = q.weight || 1;

        // aSideの判定: "LEFT" または true なら Aは左側
        // stringの場合は "LEFT" かどうか、booleanの場合は true かどうか
        const isALeft = typeof q.aSide === 'string' ? q.aSide === 'LEFT' : q.aSide === true;

        // direction:
        // Aが左(Left)の場合: direction = 1
        //   回答 -2(すごくA) -> -2 * 1 = -2 (負のスコア=A側) -> OK
        //   回答 +2(すごくB) -> +2 * 1 = +2 (正のスコア=B側) -> OK
        // Aが右(Right)の場合: direction = -1
        //   回答 -2(すごくA) -> -2 * -1 = +2 (正のスコア=A=Right側) -> OK
        //   回答 +2(すごくB) -> +2 * -1 = -2 (負のスコア=B=Left側) -> OK
        // normalized < 0 は常にLEFT側、>= 0 は常にRIGHT側を意味する。
        const direction = isALeft ? 1 : -1;

        const contribution = answer * weight * direction;

        // Max score per question = 2 * weight
        const maxContribution = 2 * weight;

        if (scores[q.axisKey]) {
            scores[q.axisKey].rawScore += contribution;
            scores[q.axisKey].maxScore += maxContribution;
        }
    });

    // Calculate Normalized
    Object.values(scores).forEach(score => {
        if (score.maxScore > 0) {
            score.normalized = score.rawScore / score.maxScore;
        } else {
            score.normalized = 0;
        }
    });

    return scores;
}

/**
 * 結果コードを生成する (例: "0101")
 * 軸の定義順に、normalized < 0 なら "0"(LEFT側), >= 0 なら "1"(RIGHT側)
 */
export function computeResultCode(
    axisScores: Record<string, AxisScore>,
    axes: AxisDef[]
): string {
    return axes.map(axis => {
        const score = axisScores[axis.key]?.normalized ?? 0;
        // < 0 is LEFT (usually Option A if aSide=LEFT), >= 0 is RIGHT
        return score < 0 ? "0" : "1";
    }).join("");
}

// Recommendation Types
export interface RecommendationConditionDef {
    axisKey: string;
    threshold: number;
    operator: string;
}

export interface RecommendationDef {
    id: string;
    title: string;
    description: string | null;
    url: string | null;
    priority: number | string; // API returns string "HIGH"/"NORMAL"? or number. Let's handle both or minimal.
    conditions: RecommendationConditionDef[];
}

/**
 * おすすめコンテンツをフィルタリングする
 */
export function filterRecommendations(
    recommendations: RecommendationDef[],
    axisScores: Record<string, AxisScore>
): RecommendationDef[] {
    return recommendations.filter(rec => {
        if (!rec.conditions || rec.conditions.length === 0) return true;

        return rec.conditions.every(cond => {
            const score = axisScores[cond.axisKey]?.normalized ?? 0;
            const scorePercent = Math.round(score * 100);

            switch (cond.operator) {
                case "gte": return scorePercent >= cond.threshold;
                case "lte": return scorePercent <= cond.threshold;
                case "eq": return scorePercent === cond.threshold;
                default: return scorePercent >= cond.threshold;
            }
        });
    });
    // Sorting should be done by caller or already sorted by API
}
