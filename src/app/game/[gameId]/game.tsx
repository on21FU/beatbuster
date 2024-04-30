"use client"
import { Dispatch, SetStateAction, useEffect, useState } from "react";

type UserInfo = {
    username: string,
    imageUrl: string,
    userId: string
}

export function Game({ gameId, user, children }: { gameId: string, user: UserInfo, children: React.ReactNode }) {

    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {

        console.log("User in useEffect", user.username)

        establishWebSocketConnection({ setSocket, gameId, user })
    }, [])

    if (!socket) return <main>Connecting...</main>

    return (
        <main>
            Joined Game {gameId}
            {children}
        </main>
    )
}

async function establishWebSocketConnection(
    { setSocket, gameId, user }:
        { setSocket: Dispatch<SetStateAction<WebSocket | null>>, gameId: string, user: UserInfo }
) {

    const options = {
        gameId,
        user
    }
    try {
        const newSocket = new WebSocket("ws://localhost:8080?options=" + JSON.stringify(options));

        newSocket.addEventListener("open", () => {
            console.log("Connected to server");
            newSocket.send("Hello world");
            setSocket(newSocket)

        });
        newSocket.addEventListener("message", event => {
            console.log("Message from server", event.data);
        });

    } catch (error) {
        console.log(error)
    }
}