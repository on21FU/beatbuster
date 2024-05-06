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

const updatePlayersSchema = z.object({
    type: z.literal("update-players"),
    body: z.object({
        players: z.array(playerSchema),
    })
})

const messageSchema = z.union([startRoundSchema, updatePlayersSchema])

export function validateMessage(message: unknown): message is z.infer<typeof messageSchema> {
    return messageSchema.safeParse(message).success
}