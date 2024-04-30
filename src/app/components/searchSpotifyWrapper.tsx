"use server"
import { getUserToken } from "../spotify";
import React from "react";
import GameConfig from "./gameConfig";

export default async function SearchSpotifyWrapper() {
    const accessToken = await getUserToken();

    return (
        <>
            <GameConfig accessToken={accessToken} />
        </>
    )
}