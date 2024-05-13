import { useEffect, useState } from "react"
import WebPlayback from "../webplayback"
import { Answer } from "./gameConfig"
import { useSocketStore, useSpotifyStore } from "../game/[gameId]/gameSetup"
import { Player, PlayerAnswer } from "~/types"

export function Game({ round, answers, roundStart, user, playerAnswers, players }:
    { round: number, answers: Answer[], roundStart: Date | null, user: Player, playerAnswers: PlayerAnswer[] | null, players: Player[] }) {

    const { socket } = useSocketStore()
    const [playerGuessTrackId, setPlayerGuessTrackId] = useState<string | null>(null)

    function handleAnswer(answer: Answer) {
        if (!roundStart) {
            console.log("Round start is not set")
            return
        }
        const timeToAnswer = new Date().getTime() - roundStart.getTime()
        if (!socket) {
            console.log("Socket is not set")
            return
        }
        setPlayerGuessTrackId(answer.trackId)

        socket.send(JSON.stringify({
            type: "answer",
            body: {
                userId: user.userId,
                trackId: answer.trackId,
                timeToAnswer
            }
        }))
    }

    function getPlayerAnswerProfilePicture({ answer, playerAnswers, players }: { answer: Answer, playerAnswers: PlayerAnswer[] | null, players: Player[] }) {
        if (!playerAnswers) return
        const playerAnswersTrackIds = playerAnswers.map(playerAnswer => playerAnswer.trackId)
        const answersWithAnswer = playerAnswersTrackIds.includes(answer.trackId)
    }

    return (
        <>
            <p>Runde {round}</p>
            {answers.map((answer) => {
                return <button
                    onClick={() => handleAnswer(answer)}
                    key={answer.trackId}
                    disabled={!!playerGuessTrackId}>
                    {answer.trackId === playerGuessTrackId && <img src={user.imageUrl} />}
                    {playerAnswers && playerAnswers.map(playerAnswer => playerAnswer.trackId).includes(answer.trackId) && "✔️"}
                    {answer.trackName} - {answer.trackArtists.join(", ")}
                </button>
            })}
        </>
    )
}