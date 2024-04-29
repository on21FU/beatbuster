"use client"

import { ChangeEvent, useState } from "react"
import SpotifyWebApi from "spotify-web-api-node"

export default function Search({ accessToken }: { accessToken: string }) {
    const [playlistItems, setPlaylistItems] = useState<SpotifyApi.PlaylistObjectSimplified[] | undefined>()
    const [searchTerm, setSearchTerm] = useState("")
    const spotify = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        accessToken: accessToken
    })

    function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
        console.log("vorher ", "searchi: ", searchTerm, "eii: ", e.target.value)
        setSearchTerm("Benjamin")
        console.log("searchi: ", searchTerm, "eii: ", e.target.value)
        if (searchTerm.length < 4) {
            return
        }
        spotify.searchPlaylists(e.target.value).then((data) => {
            setPlaylistItems(data.body.playlists?.items)
        })
    }

    return (
        <>
            <form>
                <input onChange={handleInputChange} />
            </form>
            <div>
                <SearchResultDisplay playlistItems={playlistItems} searchTerm={searchTerm} />
            </div>
        </>
    )
}

function SearchResultDisplay({ playlistItems, searchTerm }: { playlistItems: SpotifyApi.PlaylistObjectSimplified[] | undefined, searchTerm: string }) {
    if (searchTerm.length < 4) {
        return
    }
    if (!playlistItems || playlistItems.length === 0) {
        return <p>No playlists found</p>
    }
    return playlistItems.map((playlist) => {
        return <div key={playlist.id}>
            <img width="80px" src={playlist.images[0]?.url} />
            <p>{playlist.name}</p>
        </div>
    })

}