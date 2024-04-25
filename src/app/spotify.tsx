"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";

export async function getUserToken() {
    const { userId } = auth();
    if (!userId) {
        throw new Error("Invalid UserID");
    }
    const tokens = await clerkClient.users.getUserOauthAccessToken(
        userId,
        "oauth_spotify"
    );

    if (!Array.isArray(tokens) || !tokens[0]) {
        throw new Error("No Token");
    }
    return tokens[0].token;
}

export async function startRound(formData: FormData) {
    try{
        const playlistId = formData.get("playlistId");
        if (!playlistId || typeof playlistId !== "string") return;
        const trackIds = await getTracksFromPlaylist(playlistId);
        const shuffledTrackIds = shuffleArray(trackIds);
        console.log("Trackids", trackIds);
        if (!shuffledTrackIds[0]) throw new Error("Playlist is empty");
        playNextTrack(shuffledTrackIds[0]);
    } catch(err) {
        console.log(err)
    }
}

function shuffleArray<Type>(array: Type[]) {
    return array.sort((a, b) => 0.5 - Math.random());
}

async function getTracksFromPlaylist(playlistId: string) {
    const userToken = await getUserToken();
    const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}`,
        { headers: { Authorization: `Bearer ${userToken}` } }
    );
    const data = await response.json();
    const map = data.tracks.items.map(
        (item => item.track));
    console.log(map)
    const mapIds = map.map(
        item => item.album.id
    )
    return map
}

export async function playNextTrack(trackId: string) {
    addTrackToQueue(trackId);
    skipToNext();
}

async function addTrackToQueue(trackId: string) {
    const userToken = await getUserToken();
    const res = await fetch(
        `https://api.spotify.com/v1/me/player/queue?uri=spotify%3Atrack%${trackId}`,
        {
            headers: { Authorization: `Bearer ${userToken}` },
            method: "POST",
        }
    );
}

async function skipToNext() {
    const userToken = await getUserToken();
    const res = await fetch(`https://api.spotify.com/v1/me/player/next`, {
        headers: { Authorization: `Bearer ${userToken}` },
        method: "POST",
    });
}