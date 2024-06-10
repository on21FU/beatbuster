import { SignInButton, UserButton } from "@clerk/nextjs";
import { startRoundWithSpotifyApi } from "./spotify";

export default async function Home() {
    return (
        <main>
            <div className="container">
                <button><a href="/game">Play</a></button>
            </div>
        </main >
    );
}
