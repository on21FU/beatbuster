"use server"
import { getUserToken } from "../spotify";
import React from "react";
import Search from "./search";

export default async function SearchSpotifyWrapper() {
    const accessToken = await getUserToken();

    return (
        <>
            <Search accessToken={accessToken} />
        </>
    )
}