import { useEffect } from "react"
import WebPlayback from "../webplayback"
import { Answer } from "./gameConfig"
import { useSocketStore, useSpotifyStore } from "../game/[gameId]/gameSetup"

export function Game({ round, answers, roundStart, userId }:
    { round: number, answers: Answer[], roundStart: Date | null, userId: string }) {

    const { socket } = useSocketStore()

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

        socket.send(JSON.stringify({
            type: "answer",
            body: {
                userId,
                trackId: answer.trackId,
                timeToAnswer
            }
        }))
    }

    return (
        <>
            <p>Runde {round}</p>
            {answers.map((answer) => {
                return <button onClick={() => handleAnswer(answer)} key={answer.trackId}>{answer.trackName} - {answer.trackArtists.join(", ")}</button>
            })}
        </>
    )
}