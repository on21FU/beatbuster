import { SignInButton, UserButton } from "@clerk/nextjs";
import { startRoundWithSpotifyApi } from "./spotify";

export default async function Home() {
    return (
        <main>


            <div className="container">
                <div className="homescreen row">
                    <div className="col-lg-6">
                        <div className="homescreen-left">
                            <h2>Beat Buster</h2>
                            <p>Welcome to BeatBuster - the ultimate song quiz game to challenge your music knowledge! Gather your friends and dive into a world of music trivia excitement. With BeatBuster, you'll listen to snippets of songs and race against the clock to guess the title and artist. Compete for the top spot on the leaderboard and show off your music expertise!
                                <br />  To start your experience, log in with your Spotify account and play with your own playlists. Immerse yourself in the music you love and put your skills to the test. Get ready to groove, guess, and conquer the BeatBuster challenge. Sign up now and let the music quiz fun begin! </p>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="homescreen-right">
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
                        </div>
                    </div>
                </div>
            </div>

        </main >
    );
}
