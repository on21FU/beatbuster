import { redirect } from "next/navigation";

export default async function GamePage({ params }: { params: { gameId: string } }) {
    return (
        <main>
            <div className="container">
                <div className="game-rules row">
                    <div className="col-lg-8">
                        <h2>Rules</h2>
                        <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
                            Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod.</p>
                    </div>
                    <div className="col-lg-4">
                        <div className="creat-section">
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
