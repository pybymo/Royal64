export interface Fingerprint {

    id: number;

    userId: number;

    trustScore: number;

    gamesAnalyzed: number;

    averageMoveTimeMs: number;

    engineSimilarity: number;

    lastAnalyzedAt?: string;

    createdAt: string;

    updatedAt: string;

}