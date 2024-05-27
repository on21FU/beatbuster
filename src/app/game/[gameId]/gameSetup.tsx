"use client"
import { create } from "zustand";
import { useEffect } from "react";
import { setTimeout } from "timers/promises";
import SpotifyWebApi from "spotify-web-api-node";

type UserInfo = {
    username: string,
    imageUrl: string,
    userId: string
}

type SocketStore = {
    socket: WebSocket | null,
    setSocket: ({ socket }: { socket: WebSocket }) => void,
}

type SpotifyStore = {
    spotify: SpotifyWebApi | null,
    activeDeviceId: string | null,
    setSpotify: ({ spotify }: { spotify: SpotifyWebApi }) => void,
    setActiveDeviceId: ({ activeDeviceId }: { activeDeviceId: string }) => void
}

export const useSocketStore = create<SocketStore>((set) => ({
    socket: null,
    setSocket: (newSocket) => set((state) => (newSocket)),
}))

export const useSpotifyStore = create<SpotifyStore>((set) => ({
    spotify: null,
    activeDeviceId: null,
    setSpotify: (newSpotify) => set((state) => (newSpotify)),
    setActiveDeviceId: (newDeviceId) => set((state) => (newDeviceId))
}))

export function Game(
    { gameId, user, children, webSocketUrl, accessToken, error }:
        { gameId: string, user: UserInfo, children: React.ReactNode, webSocketUrl: string, accessToken: string, error: string }
) {

    console.log("TOKEN ERROR: ", error)
    const { socket, setSocket } = useSocketStore()
    const { spotify, setSpotify } = useSpotifyStore()

    useEffect(() => {
        establishWebSocketConnection({ setSocket, gameId, user, webSocketUrl })

        const spotify = establishSpotify({ accessToken })
        setSpotify({ spotify })
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

function establishSpotify({ accessToken }: { accessToken: string }) {
    return new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        accessToken: accessToken
    })
}