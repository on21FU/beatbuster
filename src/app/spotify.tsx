"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import SpotifyWebApi from "spotify-web-api-node";

export async function getUserToken() {
    try {
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
        return { token: tokens[0].token };        
    } catch (error) {
        console.error(error)
        return { error }
    }
}

export async function startRoundWithSpotifyApi(formData: FormData) {
    const playlistId = formData.get("playlistId");
    if (!playlistId || typeof playlistId !== "string") return;

    const { token: userToken } = await getUserToken();
    const spotify = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        accessToken: userToken
    })

    const trackIds = await getTrackIdsFromPlaylist({ spotify, playlistId });
    const shuffledTrackIds = shuffleArray(trackIds);

}


async function getTrackIdsFromPlaylist({ spotify, playlistId }: { spotify: SpotifyWebApi, playlistId: string }) {
    const playlist = await spotify.getPlaylist(playlistId);
    const trackIds = [];
    for (let i = 0; i < Math.ceil(playlist.body.tracks.total / 100); i++) {
        const trackResponse = await spotify.getPlaylistTracks(playlistId, {
            limit: 100,
            offset: i * 100
        });
        trackIds.push(...getTrackIds(trackResponse.body));
    }
    return trackIds;
}

function getTrackIds(trackResponse: SpotifyApi.PlaylistTrackResponse) {
    return trackResponse.items.filter(item => item.track && item.track.id).map(item => item);
}

function shuffleArray<Type>(array: Type[]) {
    return array.sort((a, b) => 0.5 - Math.random());
}