"use server"
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Game } from "./game";
import GameConfigWrapper from "~/app/components/gameConfigWrapper";

export default async function GamePage({ params }: { params: { gameId: string } }) {
    const userId = auth().userId
    if (!userId) return <div>Not logged in</div>
    const { fullName, imageUrl, id } = await clerkClient.users.getUser(userId)

    return <Game webSocketUrl={process.env.WEBSOCKET_URL ?? ""} gameId={params.gameId} user={{
        userId: id,
        username: fullName || generateGuestName(),
        imageUrl: imageUrl || "",
    }} >
        <GameConfigWrapper />
    </Game>
}

function generateGuestName() {
    return "Guest" + Math.floor(Math.random() * 1000)
}
