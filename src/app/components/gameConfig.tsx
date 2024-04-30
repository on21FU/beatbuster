"use client"

import { ChangeEvent, useState } from "react"
import SpotifyWebApi from "spotify-web-api-node"
import { useSocketStore } from "../game/[gameId]/game"

type Config = {
    playlist: Playlist,
    roundTime: number,
    winCondition: {
        type: "rounds",
        amount: number,
    } | {
        type: "score",
        amount: number
    }
}

type Playlist = {
    id: string,
    imgUrl: string | undefined,
    name: string
}

export default function GameConfig({ accessToken }: { accessToken: string }) {
    const [playlistItems, setPlaylistItems] = useState<SpotifyApi.PlaylistObjectSimplified[] | undefined>()
    const [searchTerm, setSearchTerm] = useState("")
    const [config, setConfig] = useState<Config>({
        playlist: {
            id: "37i9dQZF1DXcBWIGoYBM5M",
            imgUrl: "https://i.scdn.co/image/ab67706f000000020ba81215546ef8fd79aa92a7",
            name: "Today's Top Hits"
        },
        roundTime: 10,
        winCondition: {
            type: "rounds",
            amount: 10,
        }
    })

    const { socket } = useSocketStore()
    console.log("socket", socket)

    if (!socket) return <div>Connecting...</div>

    const spotify = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        accessToken: accessToken
    })

    function setActivePlaylist(playlist: Playlist) {
        setConfig({
            ...config, playlist: { ...playlist }
        })
    }

    function handleRoundTimeChange(e: ChangeEvent<HTMLInputElement>) {
        const newRoundTime = Number(e.target.value);
        setConfig({ ...config, roundTime: newRoundTime })
    }

    function handleWinConditionChange(e: ChangeEvent<HTMLInputElement>) {
        const winCondition = e.target.value
        setConfig({
            ...config, winCondition: {
                type: winCondition as "rounds" | "score",
                amount: winCondition === "rounds" ? 10 : 10000
            }
        })
    }

    function handleAmountChange(e: ChangeEvent<HTMLInputElement>) {
        const amount = Number(e.target.value)
        if (config.winCondition.type === "rounds") {
            setConfig({
                ...config, winCondition: {
                    type: "rounds", amount
                }
            })
        }
        if (config.winCondition.type === "score") {
            setConfig({
                ...config, winCondition: {
                    type: "score", amount
                }
            })
        }
    }

    async function handleSearchInputChange(e: ChangeEvent<HTMLInputElement>) {
        const currentSearchTerm = e.target.value
        setSearchTerm(currentSearchTerm)
        if (currentSearchTerm.length < 3) {
            return
        }
        spotify.searchPlaylists(e.target.value).then((data) => {
            setPlaylistItems(data.body.playlists?.items)
        })
    }

    return (
        <>
            <form>
                <p>Round Time</p>
                <input className="btn-check" type="radio" name="roundTime" id="roundTime5" value="5" onChange={handleRoundTimeChange} />
                <label className="btn btn-primary" htmlFor="roundTime5">5s</label>
                <input className="btn-check" type="radio" name="roundTime" id="roundTime10" value="10" onChange={handleRoundTimeChange} />
                <label className="btn btn-primary" htmlFor="roundTime10">10s</label>
                <input className="btn-check" type="radio" name="roundTime" id="roundTime15" value="15" onChange={handleRoundTimeChange} />
                <label className="btn btn-primary" htmlFor="roundTime15">15s</label>
                <p>Win Condition</p>
                <input className="btn-check" type="radio" name="winCondition" id="rounds" value="rounds" onChange={handleWinConditionChange} />
                <label className="btn btn-primary" htmlFor="rounds">Rounds</label>
                <input className="btn-check" type="radio" name="winCondition" id="score" value="score" onChange={handleWinConditionChange} />
                <label className="btn btn-primary" htmlFor="score">Score</label>
                {
                    config.winCondition.type === "rounds" && <div>
                        <p>Amount Songs</p>
                        <input type="number" min="5" max="25" onChange={handleAmountChange} value={config.winCondition.amount} />
                    </div>
                }
                {
                    config.winCondition.type === "score" && <div>
                        <p>Amount Score</p>
                        <input type="number" step="1000" min="5000" max="25000" onChange={handleAmountChange} value={config.winCondition.amount} />
                    </div>
                }

                <div>
                    <p>Playlist Search</p>
                    <input onChange={handleSearchInputChange} />
                    <div className="card w-25">
                        <img width="80px" src={config.playlist.imgUrl} />
                        <p>{config.playlist.name}</p>
                    </div>
                </div>
                {
                    JSON.stringify(config)
                }
                <button type="submit">Start Game</button>
            </form>
            <div>
                <SearchResultDisplay playlistItems={playlistItems} searchTerm={searchTerm} setActivePlaylist={setActivePlaylist} />
            </div>
        </>
    )
}

function SearchResultDisplay({ playlistItems, searchTerm, setActivePlaylist }: { playlistItems: SpotifyApi.PlaylistObjectSimplified[] | undefined, searchTerm: string, setActivePlaylist: (playlist: Playlist) => void }) {
    if (searchTerm.length < 3) {
        return
    }
    if (!playlistItems || playlistItems.length === 0) {
        return <p>No playlists found</p>
    }
    return <div className="grid">
        <div className="row flex-nowrap overflow-auto">
            {
                playlistItems.map((playlist) => {
                    return <button className="col-3 card" key={playlist.id} onClick={() => setActivePlaylist({ id: playlist.id, imgUrl: playlist.images[0]?.url, name: playlist.name })}>
                        <img width="80px" src={playlist.images[0]?.url} />
                        <p>{playlist.name}</p>
                    </button>
                })
            }
        </div>
    </div>


}