import { useEffect } from "react"
import WebPlayback from "../webplayback"
import { Answer } from "./gameConfig"
import { useSpotifyStore } from "../game/[gameId]/gameSetup"

export function Game({ round, accessToken, answers}: {round: number, accessToken: string, answers: Answer[] }){
    return (
        <>
            <p>Runde {round}</p>
            {answers.map((answer) => {
                return <button key={answer.trackId}>{answer.trackName} {answer.trackArtists.join(", ")}</button>
            })}
        </>
    )    
}