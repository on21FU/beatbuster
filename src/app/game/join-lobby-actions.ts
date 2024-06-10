"use server"
import { redirect } from "next/navigation";

export async function enterLobbyByCode(previousState: any, formData: FormData) {

    const gameId = formData.get("gameId") as string;
    if (!gameId) {
        return {
            message: "Please provide a valid Game Code!"
        }
    }

    const gameIdSplit = gameId.split("/")
    const gameIdExtracted = gameIdSplit[gameIdSplit.length - 1]

    const { error } = await handleJoinGame(gameIdExtracted!)

    if (error) return {
        message: error
    }

    redirect(`/game/${gameIdExtracted}`)

}

export async function enterNewLobby(initialState: any, formData: FormData) {
    await handleJoinGame("")
}


async function handleJoinGame(gameId: string) {
    const params = new URLSearchParams({
        gameId
    });

    const response = await fetch(process.env.WEBSOCKET_URL_HTTP + "/join?" + params)
    console.log(response)
    if (!response.ok) {
        return {
            error: "Couldn't find the game you were looking for..."
        }
    }
    const id = await response.text();
    redirect(`/game/${id}`);
}