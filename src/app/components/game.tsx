import { useEffect } from "react"
import WebPlayback from "../webplayback"
import { Answer } from "./gameConfig"
import { useSocketStore, useSpotifyStore } from "../game/[gameId]/gameSetup"

export function Game({ round, answers, roundStart, userId, roundTime }:
    { round: number, answers: Answer[], roundStart: Date | null, userId: string, roundTime:number }) {

    const { socket } = useSocketStore()
    
    const animationPath = "/assets/" + roundTime + "s_raten.gif"


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
            <div className="game container">
                <div className="game-animation">
                    <img src={animationPath} />
                </div>
                <h3 className="text-center">Runde {round}</h3>
                <div className="answers-wrapper">
                    <div className="row">
                        {answers.map((answer) => {
                            return <button className="answer-button col-lg-5" onClick={() => handleAnswer(answer)} key={answer.trackId}>{answer.trackName} - {answer.trackArtists.join(", ")}</button>
                        })}
                    </div>
                </div>
            </div>
        </>
    )
}