"use server"
import { redirect } from "next/navigation";

export default async function GamePage({ params }: { params: { gameId: string } }) {
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
                            {/* <div className="bg-primary">GameId: {params.gameId}</div> */}
                            <form action={newGame}>
                                <button className="btn btn-outline-primary" type="submit">Create New Lobby</button>
                            </form>
                            <form action={enterLobby}>
                                <div className="creat-section-input">
                                    <div className="input-group">
                                        <input className="enter-lobby-code form-control" type="text" name="gameId" />
                                        <button type="submit" className="btn">Send</button>
                                    </div>
                                    <label htmlFor="gameId">Enter Lobby Code</label>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

async function enterLobby(formData: FormData) {
    "use server"
    console.log(formData.get("gameId"))

    redirect("/game/12345678");
}

async function newGame(formData: FormData) {
    "use server"

    const gameId = formData.get("gameId") as string;
    const params = new URLSearchParams({
        gameId: ""
    });

    const response = await fetch(process.env.WEBSOCKET_URL_HTTP + "/join?" + params)
    console.log("test", response)
    if (!response.ok) {
        // toast("Lobby not found")
        return
    }
    const id = await response.text();
    console.log("gameId", id)
    redirect(`/game/${id}`);
}
