"use server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Game } from "./gameSetup";
import GameConfigWrapper from "~/app/components/gameConfigWrapper";
import { getUserToken } from "~/app/spotify";
import { redirect } from "next/navigation";

export default async function GamePage({
    params,
}: {
    params: { gameId: string };
}) {

    const isValid = await isValidLobby(params.gameId);
    if (!isValid) redirect("/game")

    const userId = auth().userId;
    if (!userId) return <div>Not logged in</div>;
    const { fullName, imageUrl, id } = await clerkClient.users.getUser(userId);
    const { token: accessToken } = await getUserToken();

    return (
        <Game
            webSocketUrl={process.env.WEBSOCKET_URL ?? ""}
            accessToken={accessToken}
            gameId={params.gameId}
            user={{
                userId: id,
                username: fullName || generateGuestName(),
                imageUrl: imageUrl || "",
            }}
        >
            <GameConfigWrapper gameId={params.gameId} />
        </Game>
    );
}

async function isValidLobby(gameId: string) {
    const response = await fetch(process.env.WEBSOCKET_URL_HTTP + "/join?" + new URLSearchParams({ gameId }));
    return response.ok;
}

function generateGuestName() {
    return "Guest" + Math.floor(Math.random() * 1000);
}

