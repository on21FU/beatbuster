"use client"
import { redirect } from "next/navigation";
import { enterLobbyByCode, enterNewLobby } from "./join-lobby-actions";
import { useFormState, useFormStatus } from "react-dom";
import LoadingSpinner from "../components/loadingSpinner";
import { useTransition } from "react";

export default function GamePage() {

    return (
        <main>
            <div className="container">
                <div className="game-rules row">
                    <div className="col-lg-8">
                        <div className="game-rules-left">
                            <h2>Rules</h2>
                            <p>The game's process is simple: players listen to snippets of various songs and must guess the title and artist from four options. The player who selects the correct song title and artist the fastest earns the most points for that round. The game ends either after a set number of rounds or when a player reaches a certain score. So, gather your friends and test your music knowledge.</p>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="creat-section">
                            <h2>Let's start</h2>
                            <CreateNewGame />
                            <EnterByCode />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

function CreateNewGame() {
    const [pending, startTransition] = useTransition()
    const [state, enterNewLobbyAction] = useFormState(enterNewLobby, null)

    return <form action={(formData) => startTransition(() => enterNewLobbyAction(formData))} key={Math.random()}>
        <button className="btn btn-outline-primary" type="submit">
            {pending ? <LoadingSpinner size="sm" /> : "Create New Lobby"}
        </button>
    </form>
}

function EnterByCode() {

    const [pending, startTransition] = useTransition()
    const [codeState, enterLobbyByCodeAction] = useFormState(enterLobbyByCode, null)

    return <form action={(formData) => startTransition(() => enterLobbyByCodeAction(formData))} key={Math.random()}>
        <div className="creat-section-input">
            <label htmlFor="gameId">Enter Lobby Code</label>
            <div className="input-group">
                <input className="enter-lobby-code form-control" type="text" name="gameId" />
                <button type="submit" className="btn btn-primary">
                    {pending ? <LoadingSpinner size="sm" /> : "Join"}
                </button>
            </div>
        </div>
        {codeState?.message && <p style={{
            color: "red"
        }}>{codeState.message}</p>}
    </form>
}