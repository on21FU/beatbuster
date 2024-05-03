"use client"

import { ChangeEvent, useEffect, useState } from "react"
import SpotifyWebApi from "spotify-web-api-node"
import { useSocketStore } from "../game/[gameId]/game"
import { Player, validateMessage } from "~/types"

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
    const [config, setConfig] = useState<Config>(getDefaultPlaylist())
    const [spotify, setSpotify] = useState<SpotifyWebApi>()
    const [players, setPlayers] = useState<Player[]>([])

    const { socket } = useSocketStore()

    useEffect(() => {
        const spotify = new SpotifyWebApi({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            accessToken: accessToken
        })
        setSpotify(spotify)
        if (!socket) return
        socket.addEventListener("message", handleMessage)
    }, [])

    if (!socket) return <div>Connecting...</div>
    if (!spotify) return <div>Establishing Spotify Connection...</div>


    function setActivePlaylist(playlist: Playlist) {
        setConfig({
            ...config, playlist: { ...playlist }
        })
    }

    function handleMessage(event: MessageEvent) {
        try {
            const message = JSON.parse(event.data)
            console.log("message", message)
            if (!validateMessage(message)) {
                console.error("Invalid message", message)
                return
            }

            switch (message.type) {
                case "start-round":
                    setPlayers(message.body.players)
                    console.log("start", players)
                    break
                case "update-players":

                    console.log("update", players)
                    setPlayers(message.body)
                    break
            }


        } catch (error) {
            console.error("Error parsing message", error)
        }
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
        if (!spotify) throw new Error("Spotify not initialized")
        spotify.searchPlaylists(e.target.value).then((data) => {
            setPlaylistItems(data.body.playlists?.items)
        })
    }
    function startGame() {
        if (!socket) throw new Error("No socket")
        const message = {
            type: "start-game",
            body: {
                ...config,
                accessToken
            }
        }
        socket.send(JSON.stringify(message));
    }

    return (
        <>
            <div className="container">

                <div className="row">
                    <div className="col-lg-4">
                        <h2>Players</h2>
                        <ul>
                            {
                                players.map((player, index) => <PlayerDisplay key={index} player={player} />)
                            }
                        </ul>
                    </div>
                    <div className="col-lg-8">
                        <h2>Your Game</h2>

                        <form action={startGame}>
                            <div className="settings">
                                <h4>Settings</h4>
                                <div className="setting-section">
                                    <p>Round Time</p>
                                    <input className="btn-check" type="radio" name="roundTime" id="roundTime5" value="5" onChange={handleRoundTimeChange} />
                                    <label className="btn btn-settings" htmlFor="roundTime5">5s</label>
                                    <input className="btn-check" type="radio" name="roundTime" id="roundTime10" value="10" onChange={handleRoundTimeChange} />
                                    <label className="btn btn-settings" htmlFor="roundTime10">10s</label>
                                    <input className="btn-check" type="radio" name="roundTime" id="roundTime15" value="15" onChange={handleRoundTimeChange} />
                                    <label className="btn btn-settings" htmlFor="roundTime15">15s</label>
                                </div>
                                <div className="setting-section">
                                    <p>Win Condition</p>
                                    <input className="btn-check" type="radio" name="winCondition" id="rounds" value="rounds" onChange={handleWinConditionChange} />
                                    <label className="btn btn-settings" htmlFor="rounds">Rounds</label>
                                    <input className="btn-check" type="radio" name="winCondition" id="score" value="score" onChange={handleWinConditionChange} />
                                    <label className="btn btn-settings" htmlFor="score">Score</label>
                                </div>

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
                            </div>

                            <div className="playlist-selection">
                                <div className="playlist-selection-left">
                                    <input className="searchbar" onChange={handleSearchInputChange} />
                                    <div className="card w-25">
                                        <img width="80px" src={config.playlist.imgUrl} />
                                        <p>{config.playlist.name}</p>
                                    </div>


                                    {
                                        JSON.stringify(config)
                                    }
                                </div>
                                <div className="playlist-selection-right">
                                    <button className="btn btn-settings" type="submit">Start Game</button>
                                </div>
                            </div>
                        </form>
                        <div>
                            <SearchResultDisplay playlistItems={playlistItems} searchTerm={searchTerm} setActivePlaylist={setActivePlaylist} />
                        </div>
                    </div>
                </div>
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

function PlayerDisplay({ player }: { player: Player }) {
    return <li>
        <img src={player.imageUrl} />
        <p>{player.username}</p>
        <p>{player.score}</p>
    </li>

}

function getDefaultPlaylist(): Config {
    return {
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
    }
}