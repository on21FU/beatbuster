import { useState } from "react"
import { Answer } from "./gameConfig"
import { useSocketStore, useSpotifyStore } from "../game/[gameId]/gameSetup"
import { Player, PlayerAnswer } from "~/types"

export function Game({ round, answers, roundStart, user, roundTime, playerAnswers, players, showResultsScreen, setPlayerGuessTrackId, playerGuessTrackId }:
    { round: number, answers: Answer[], roundStart: Date | null, user: Player, roundTime: number, playerAnswers: PlayerAnswer[] | null, players: Player[], showResultsScreen: boolean, setPlayerGuessTrackId: (trackId: string | null) => void, playerGuessTrackId: string | null }) {

    const animationPath = "/assets/" + roundTime + "s_raten.gif"

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

    if (showResultsScreen) {
        return <div className="round-result container">
            <h2>Results:</h2>
            <ul className="round-result-list">
                {playerAnswers?.map((playerAnswer, index) => {
                    const player = players.find(player => player.userId === playerAnswer.userId)
                    return <li className="round-result-list-item" key={index}>
                        <div className="round-result-item-content">{player?.username}</div> 
                        <div className="round-result-item-content">{playerAnswer.gainedScore}</div>
                        <div className="round-result-item-content">{playerAnswer.timeToAnswer}s</div>
                    </li>
                })}
            </ul>
        </div>
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
                            return <button className="answer-button col-lg-5"
                                onClick={() => handleAnswer(answer)}
                                key={answer.trackId}
                                disabled={!!playerGuessTrackId}>
                                <PlayerAnswerDisplay answer={answer} />
                                {answer.trackName} - {answer.trackArtists.join(", ")}
                            </button>
                        })}
                    </div>
                </div>
            </div>
        </>
    )

    function PlayerAnswerDisplay({ answer }: { answer: Answer }) {
        if (playerAnswers?.length) {
            return <OtherPlayerAnswerDisplay answer={answer} playerAnswers={playerAnswers} />
        }

        if (answer.trackId === playerGuessTrackId) {
            return <img src={user.imageUrl} />
        }
    }

    function OtherPlayerAnswerDisplay({ answer, playerAnswers }: { answer: Answer, playerAnswers: PlayerAnswer[] }) {
        return playerAnswers.map(playerAnswer => {
            if (playerAnswer.trackId === answer.trackId) {
                return <img
                    key={playerAnswer.userId}
                    src={players.find(player => player.userId === playerAnswer.userId)?.imageUrl} />
            }
        })
    }
}