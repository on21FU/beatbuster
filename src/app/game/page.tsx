"use client"
import { SignInButton, UserButton } from "@clerk/nextjs";
import { enterLobbyByCode, enterNewLobby } from "./join-lobby-actions";
import { useFormState, useFormStatus } from "react-dom";
import LoadingSpinner from "../components/loadingSpinner";
import { useTransition } from "react";
import { startRoundWithSpotifyApi } from "../spotify";

export default function GamePage() {

    return (
        <main>
            <div className="container">
                <div className="game-rules row">
                    <div className="col-lg-8">
                        <h2>Beat Buster</h2>
                        <p>Welcome to BeatBuster - the ultimate song quiz game to challenge your music knowledge! Gather your friends and dive into a world of music trivia excitement. With BeatBuster, you'll listen to snippets of songs and race against the clock to guess the title and artist. Compete for the top spot on the leaderboard and show off your music expertise!
                            <br />  To start your experience, log in with your Spotify account and play with your own playlists. Immerse yourself in the music you love and put your skills to the test. Get ready to groove, guess, and conquer the BeatBuster challenge. Sign up now and let the music quiz fun begin! </p>
                        <h2>Login</h2>
                        <div className="sign-in-wrapper">
                            <SignInButton>
                                <button className="sign-in-button">Sign In</button>
                            </SignInButton>
                            <div className="log-out-button">
                                <UserButton afterSignOutUrl="/" />
                            </div>
                        </div>
                        <form className="start-round-form" action={startRoundWithSpotifyApi}>
                            <input type="text" id="playlistId" name="playlistId" placeholder="Enter Lobby-code" />
                            <button type="submit">Start Round</button>
                        </form>
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