import { auth, clerkClient } from "@clerk/nextjs/server";
import { Game } from "./game";

export default async function GamePage({ params }: { params: { gameId: string } }) {
    const userId = auth().userId
    if (!userId) return <div>Not logged in</div>
    const { fullName, imageUrl, id } = await clerkClient.users.getUser(userId)

    return <Game gameId={params.gameId} user={{
        userId: id,
        username: fullName || generateGuestName(),
        imageUrl: imageUrl || ""
    }} />
}

function generateGuestName() {
    return "Guest" + Math.floor(Math.random() * 1000)
}
