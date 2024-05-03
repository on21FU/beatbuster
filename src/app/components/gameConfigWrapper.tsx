"use server"
import { getUserToken } from "../spotify";
import React from "react";
import GameConfig from "./gameConfig";
import { auth, clerkClient } from "@clerk/nextjs/server";

export default async function GameConfigWrapper() {
    const accessToken = await getUserToken();

    const { userId } = auth();
    const profile = await clerkClient.users.getUser(userId || "")

    if (!profile) return <div>Not logged in</div>

    const user = {
        userId: profile.id,
        username: profile.fullName || "Guest" + Math.floor(Math.random() * 1000),
        imageUrl: profile.imageUrl || "",
        score: 0
    }

    return (
        <>
            <GameConfig accessToken={accessToken} defaultPlayer={user} />
        </>
    )
}