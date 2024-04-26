import { redirect } from "next/navigation";

export default async function GamePage({ params }: { params: { gameId: string } }) {
    return (
        <main>
            <div className="bg-primary">GameId: {params.gameId}</div>
            <form action={joinGame}>
                <label htmlFor="gameId">Game ID</label>
                <input type="text" name="gameId" />
                <button type="submit">Create New Lobby</button>
            </form>
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
