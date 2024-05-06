"use client"
import { create } from "zustand";
import { useEffect } from "react";
import { setTimeout } from "timers/promises";

type UserInfo = {
    username: string,
    imageUrl: string,
    userId: string
}

type SocketStore = {
    socket: WebSocket | null,
    setSocket: ({ socket }: { socket: WebSocket }) => void,
}
export const useSocketStore = create<SocketStore>((set) => ({
    socket: null,
    setSocket: (newSocket) => set((state) => (newSocket)),
}))

export function Game(
    { gameId, user, children, webSocketUrl }:
        { gameId: string, user: UserInfo, children: React.ReactNode, webSocketUrl: string }
) {

    const { socket, setSocket } = useSocketStore()

    useEffect(() => {
        establishWebSocketConnection({ setSocket, gameId, user, webSocketUrl })
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
    { setSocket, gameId, user, webSocketUrl }:
        { setSocket: ({ socket }: { socket: WebSocket }) => void, gameId: string, user: UserInfo, webSocketUrl: string }
) {
    const options = {
        gameId,
        user
    }
    try {
        const newSocket = new WebSocket(webSocketUrl + "?options=" + JSON.stringify(options));

        newSocket.addEventListener("open", () => {
            console.log("Connected to server");
            setSocket({ socket: newSocket })

            newSocket.send(JSON.stringify({ type: "join-game" }))
        });

        newSocket.addEventListener("close", () => console.log("Closing..."))

    } catch (error) {
        console.log(error)
    }
}