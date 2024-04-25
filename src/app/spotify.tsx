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
    try {
        const userToken = await getUserToken();
        const playlistId = formData.get("playlistId");
        if (!playlistId || typeof playlistId !== "string") return;
        const trackIds = await getTracksFromPlaylist({ userToken, playlistId });
        const shuffledTrackIds = shuffleArray(trackIds);
        if (!shuffledTrackIds[0]) throw new Error("Playlist is empty");
        addTrackToQueue({ userToken, trackId: shuffledTrackIds[0] });
        skipToNext();
    } catch (err) {
        console.log(err)
    }
}

function shuffleArray<Type>(array: Type[]) {
    return array.sort((a, b) => 0.5 - Math.random());
}

async function getTracksFromPlaylist({ userToken, playlistId }: { userToken: string, playlistId: string }) {
    const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}`,
        { headers: { Authorization: `Bearer ${userToken}` } }
    );
    const data = await response.json() as PlaylistInfo;
    type PlaylistInfo = {
        tracks: {
            items: any[]
        }
    }


    return data.tracks.items.map((item => item.track.id)) as string[];
}

async function addTrackToQueue({ userToken, trackId }: { userToken: string, trackId: string }) {
    const res = await fetch(
        `https://api.spotify.com/v1/me/player/queue?uri=spotify%3Atrack%3A` + trackId,
        {
            headers: { Authorization: `Bearer ${userToken}` },
            method: "POST",
        }
    );
    console.log(res)
}

async function skipToNext() {
    const userToken = await getUserToken();
    const res = await fetch(`https://api.spotify.com/v1/me/player/next`, {
        headers: { Authorization: `Bearer ${userToken}` },
        method: "POST",
    });
}
