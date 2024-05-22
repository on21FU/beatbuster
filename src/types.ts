import { z } from "zod";

const playerSchema = z.object({
    userId: z.string(),
    username: z.string(),
    imageUrl: z.string(),
    score: z.number(),
})

export type Player = z.infer<typeof playerSchema>

const startRoundSchema = z.object({
    type: z.literal("start-round"),
    body: z.object({
        players: z.array(playerSchema),
        round: z.number(),
        tracks: z.object({
            correctTrackId: z.string(),
            wrongTrackIds: z.array(z.string())
        })
    })
})

const answerSchema = z.object({
    userId: z.string(),
    trackId: z.string(),
    timeToAnswer: z.number(),
    gainedScore: z.number(),
})

const roundResultsSchema = z.object({
    type: z.literal("round-results"),
    body: z.object({
        correctTrackId: z.string(),
        players: z.array(playerSchema),
        answers: z.array(answerSchema),
    })
})


const updatePlayersSchema = z.object({
    type: z.literal("update-players"),
    body: z.object({
        players: z.array(playerSchema),
    })
})

const gameResultSchema = z.object({
    type: z.literal("game-results"),
    body: z.object({
        players: z.array(playerSchema)
    })
})

const messageSchema = z.union([
    startRoundSchema,
    updatePlayersSchema,
    roundResultsSchema,
    gameResultSchema
])

export function validateMessage(message: unknown): message is z.infer<typeof messageSchema> {
    return messageSchema.safeParse(message).success
}

export type PlayerAnswer = z.infer<typeof answerSchema>