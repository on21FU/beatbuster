"use client"
import SpotifyWebApi from "spotify-web-api-node";
import { useState } from "react";

export default function Search({ accessToken }: { accessToken: string }) {
    const [playlistItems, setPlaylistItems] = useState();
    const [searchTerm, setSearchTerm] = useState();

    const spotify = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        accessToken: accessToken
    })

    function searchItems() {
        console.log()
        const playlistItems = spotify.searchPlaylists("input")
        // setPlaylistItems(playlistItems)
    }

    return (
        <form>
            <input onChange={searchItems} />
        </form>
    )
}