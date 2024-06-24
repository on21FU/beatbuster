
import { UserButton } from "@clerk/nextjs";
import { EnterByCode, CreateNewGame } from "./createNewGame";

export default async function GamePage() {

    await pingWebsocketServer();

    async function pingWebsocketServer(){
        try {
            const response = await fetch(process.env.WEBSOCKET_URL_HTTP + "/health")
            console.log("Ping Vercel Response: ", response)
            return response.ok
        } catch {
            return false
        }       
    }

    return (
        <main>
            <div className="container">
                <div className="game-rules row">
                    <div className="col-lg-8">
                        <h2>Beat Buster</h2>
                        <p>Welcome to BeatBuster - the ultimate song quiz game to challenge your music knowledge! Gather your friends and dive into a world of music trivia excitement. With BeatBuster, you'll listen to snippets of songs and race against the clock to guess the title and artist. Compete for the top spot on the leaderboard and show off your music expertise!
                            <br />  To start your experience, log in with your Spotify account and play with your own playlists. Immerse yourself in the music you love and put your skills to the test. Get ready to groove, guess, and conquer the BeatBuster challenge. Sign up now and let the music quiz fun begin! </p>                       
                        <div className="game-rules-left">
                            <h2>Rules</h2>
                            <p>The game's process is simple: players listen to snippets of various songs and must guess the title and artist from four options. The player who selects the correct song title and artist the fastest earns the most points for that round. The game ends either after a set number of rounds or when a player reaches a certain score. So, gather your friends and test your music knowledge.</p>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="sign-in-wrapper">
                            <div className="log-out-button">
                                <UserButton afterSignOutUrl="/" />
                            </div>
                        </div>
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