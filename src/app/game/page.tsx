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
                            <form action={joinGame}>

                                <button className="btn btn-outline-primary" type="submit">Create New Lobby</button>
                                <div className="creat-section-input">
                                    <input className="enter-lobby-code" type="text" name="gameId" />
                                    <label htmlFor="gameId">Enter Lobby Code</label>
                                </div>
                                <button className="btn btn-outline-primary" type="submit">Your Friends</button>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

async function joinGame(formData: FormData) {
    "use server"

    const gameId = formData.get("gameId") as string;
    const params = new URLSearchParams({
        gameId: gameId,
    });

    const response = await fetch("http://localhost:8080/join?" + params)
    const id = await response.text();
    console.log("gameId", id)
    redirect(`/game/${id}`);
}
