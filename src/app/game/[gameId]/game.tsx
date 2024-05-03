"use client"
import { create } from "zustand";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import test from "node:test";

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

export function Game({ gameId, user, children }: { gameId: string, user: UserInfo, children: React.ReactNode }) {

    const { socket, setSocket } = useSocketStore()

    useEffect(() => {
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
        { setSocket: ({ socket }: { socket: WebSocket }) => void, gameId: string, user: UserInfo }
) {

    const options = {
        gameId,
        user
    }
    try {
        const newSocket = new WebSocket("ws://localhost:8080?options=" + JSON.stringify(options));

        newSocket.addEventListener("open", () => {
            console.log("Connected to server");
            setSocket({ socket: newSocket })

        });
        newSocket.addEventListener("message", event => {
            console.log("Message from server", event.data);
        });

    } catch (error) {
        console.log(error)
    }
}