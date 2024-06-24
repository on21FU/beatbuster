"use client"

import { useTransition } from "react"
import { useFormState } from "react-dom"
import { enterLobbyByCode, enterNewLobby } from "./join-lobby-actions"
import LoadingSpinner from "../components/loadingSpinner"

export function CreateNewGame() {
    const [pending, startTransition] = useTransition()
    const [state, enterNewLobbyAction] = useFormState(enterNewLobby, null)

    return <form action={(formData) => startTransition(() => enterNewLobbyAction(formData))} key={Math.random()}>
        <button className="btn btn-primary" type="submit">
            {pending ? <LoadingSpinner size="sm" color="dark"/> : "Create New Lobby"}
        </button>
    </form>
}

export function EnterByCode() {

    const [pending, startTransition] = useTransition()
    const [codeState, enterLobbyByCodeAction] = useFormState(enterLobbyByCode, null)

    return <form action={(formData) => startTransition(() => enterLobbyByCodeAction(formData))} key={Math.random()}>
        <div className="creat-section-input">
            <label htmlFor="gameId">Enter Lobby Code</label>
            <div className="input-group">
                <input className="enter-lobby-code form-control" type="text" name="gameId" />
                <button type="submit" className="btn btn-primary">
                    {pending ? <LoadingSpinner color="dark" size="sm" /> : "Join"}
                </button>
            </div>
        </div>
        {codeState?.message && <p style={{
            color: "red"
        }}>{codeState.message}</p>}
    </form>
}