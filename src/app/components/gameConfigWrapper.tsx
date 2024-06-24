"use server"
import { getUserToken } from "../spotify";
import React from "react";
import GameConfig from "./gameConfig";
import { auth, clerkClient } from "@clerk/nextjs/server";
import WebPlayback from "../webplayback";

export default async function GameConfigWrapper({ gameId }: { gameId: string }) {
    const { token: accessToken } = await getUserToken();

    const { userId } = auth();
    const profile = await clerkClient.users.getUser(userId || "")

    if (!profile) return <div>Not logged in</div>
    if (!userId) return <div>Not logged in</div>

    const user = {
        userId: profile.id,
        username: profile.fullName || "Guest" + Math.floor(Math.random() * 1000),
        imageUrl: profile.imageUrl || "",
        score: 0,
        isReady: false
    }

    return (
        <>
            <GameConfig accessToken={accessToken} defaultPlayer={user} userId={userId} gameId={gameId} />
            <WebPlayback token={accessToken} />
        </>
    )
}