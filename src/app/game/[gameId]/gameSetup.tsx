"use client";
import { create } from "zustand";
import { useEffect } from "react";
import SpotifyWebApi from "spotify-web-api-node";
import LoadingSpinner from "~/app/components/loadingSpinner";
import { useQuery } from "@tanstack/react-query";

type UserInfo = {
    username: string;
    imageUrl: string;
    userId: string;
};

type SocketStore = {
    socket: WebSocket | null;
    setSocket: ({ socket }: { socket: WebSocket }) => void;
};

type SpotifyStore = {
    spotify: SpotifyWebApi | null;
    activeDeviceId: string | null;
    setSpotify: ({ spotify }: { spotify: SpotifyWebApi }) => void;
    setActiveDeviceId: ({ activeDeviceId }: { activeDeviceId: string }) => void;
    player: Spotify.Player | null;
    setPlayer: ({ player }: { player: Spotify.Player }) => void;
};

export const useSocketStore = create<SocketStore>((set) => ({
    socket: null,
    setSocket: (newSocket) => set((state) => newSocket),
}));

export const useSpotifyStore = create<SpotifyStore>((set) => ({
    spotify: null,
    activeDeviceId: null,
    setSpotify: (newSpotify) => set((state) => newSpotify),
    setActiveDeviceId: (newDeviceId) => set((state) => newDeviceId),
    player: null,
    setPlayer: (player) => set((state) => player),
}));

export function Game({
    gameId,
    user,
    children,
    webSocketUrl,
    accessToken,
}: {
    gameId: string;
    user: UserInfo;
    children: React.ReactNode;
    webSocketUrl: string;
    accessToken: string;
}) {
    const { socket, setSocket } = useSocketStore();
    const { spotify, setSpotify } = useSpotifyStore();

    useEffect(() => {
        establishWebSocketConnection({ setSocket, gameId, user, webSocketUrl });

        const spotify = establishSpotify({ accessToken });
        setSpotify({ spotify });
    }, []);

    if (!socket)
        return (
            <>
                <div className="d-flex flex-column align-items-center">
                    <LoadingSpinner color="dark" />
                    <p>Connecting...</p>
                </div>
            </>
        );

    return <main>{children}</main>;
}

async function establishWebSocketConnection({
    setSocket,
    gameId,
    user,
    webSocketUrl,
}: {
    setSocket: ({ socket }: { socket: WebSocket }) => void;
    gameId: string;
    user: UserInfo;
    webSocketUrl: string;
}) {
    const options = {
        gameId,
        user,
    };
    try {
        const newSocket = new WebSocket(
            webSocketUrl + "?options=" + JSON.stringify(options)
        );

        newSocket.addEventListener("open", () => {
            setSocket({ socket: newSocket });

            newSocket.send(JSON.stringify({ type: "join-game" }));
        });

        newSocket.addEventListener("error", () => window.location.href = "/game-not-found")

        newSocket.addEventListener("close", () => console.log("Closing..."));
    } catch (error) {
        console.log(error);
    }
}

function establishSpotify({ accessToken }: { accessToken: string }) {
    return new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        accessToken: accessToken,
    });
}
