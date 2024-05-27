"use client"

import { ChangeEvent, useEffect, useState } from "react"
import SpotifyWebApi from "spotify-web-api-node"
import { useSocketStore, useSpotifyStore } from "../game/[gameId]/gameSetup"
import { Player, PlayerAnswer, validateMessage } from "~/types"
import { Game } from "./game"

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

export type Answer = {
    trackId: string,
    trackName: string,
    trackArtists: string[],
    isCorrect: boolean
}

export default function GameConfig({ accessToken, defaultPlayer, userId }: { accessToken: string, defaultPlayer: Player, userId: string }) {
    const [playlistItems, setPlaylistItems] = useState<SpotifyApi.PlaylistObjectSimplified[] | undefined>()
    const [searchTerm, setSearchTerm] = useState("")
    const [config, setConfig] = useState<Config>(getDefaultPlaylist())
    const [players, setPlayers] = useState<Player[]>([defaultPlayer])
    const [round, setRound] = useState(0)
    const [answers, setAnswers] = useState<Answer[]>([])
    const [roundStart, setRoundStart] = useState<Date | null>(null)
    const [playerAnswers, setPlayerAnswers] = useState<PlayerAnswer[]>([])
    const [showResultScreen, setShowResultScreen] = useState(false)
    const [resultScreenTimer, setResultScreenTimer] = useState<Date | null>(null)
    const [playerGuessTrackId, setPlayerGuessTrackId] = useState<string | null>(null)
    const [showGameResultScreen, setShowGameResultScreen] = useState(false)


    const { socket } = useSocketStore()
    const { spotify, activeDeviceId } = useSpotifyStore()

    useEffect(() => {
        if (!socket) return

        console.log("Handling Message handler", activeDeviceId)
        socket.addEventListener("message", handleMessage)
    }, [activeDeviceId])

    if (!socket) return <div>Connecting...</div>
    if (!spotify) return <div>Establishing Spotify Connection...</div>


    function setActivePlaylist(playlist: Playlist) {
        setConfig({
            ...config, playlist: { ...playlist }
        })
    }

    async function handleMessage(event: MessageEvent) {
        try {
            const message = JSON.parse(event.data)
            console.log(message.type)
            if (!validateMessage(message)) {
                console.error("Invalid message", message)
                return
            }

            switch (message.type) {
                case "start-round":
                    console.log("Neue Rundeeeee")
                    setPlayerGuessTrackId(null)
                    setPlayerAnswers([])
                    setShowResultScreen(false)
                    setPlayers(message.body.players)
                    setRound(message.body.round)
                    if (!spotify) return
                    const newAnswers = await getTrackInfos({ spotify, tracks: message.body.tracks })
                    setAnswers(newAnswers)
                    if (!activeDeviceId) {
                        console.log("no device id")
                        return
                    }
                    await spotify.transferMyPlayback([activeDeviceId])
                    await playTrack({ trackId: message.body.tracks.correctTrackId, spotify, activeDeviceId })
                    setRoundStart(new Date())
                    break
                case "update-players":
                    setPlayers(message.body.players)
                    break
                case "round-results":
                    if (!spotify || !activeDeviceId) return
                    console.log("Results", message.body)
                    const newPlayerAnswers = message.body.answers.map(answer => {
                        return {
                            ...answer,
                            playerImgUrl: players.find(player => player.userId === answer.userId)?.imageUrl,
                        }
                    })
                    setPlayerAnswers(newPlayerAnswers)
                    await spotify.pause({ device_id: activeDeviceId })
                    setShowResultScreen(true)
                    setResultScreenTimer(new Date())
                    break
                case "game-results":
                    setShowResultScreen(false)
                    setShowGameResultScreen(true);
                    setPlayers(message.body.players);
                    break
                default:
                    console.error("Unknown message type", message)
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
        console.log(accessToken)
        socket.send(JSON.stringify(message));
    }
    if (round === 0) {
        return (
            <>
                <div className="container">
                    <div className="row">
                        <div className="col-sm-4">
                            <div className="game-config-left">
                                <h2>Players</h2>
                            </div>
                            <div className="">
                                <ul className="player-list row">
                                    {
                                        players.map((player, index) => <PlayerDisplay key={index} player={player} />)
                                    }
                                    {
                                        players.length < 11 && new Array(11 - players.length).fill(0).map((_, index) => <EmptyPlayer key={index} />)
                                    }
                                    {
                                        players.length < 12 && <AddPlayer />
                                    }
                                </ul>
                            </div>
                        </div>
                        <div className="col-lg-8">
                            <h2>Your Game</h2>
                            <form action={startGame}>
                                <div className="settings">
                                    <h4>Settings</h4>
                                    <div className="setting-section">
                                        <p>Round Time</p>
                                        <input className="btn-check" type="radio" name="roundTime" id="roundTime5" value="5" onChange={handleRoundTimeChange} checked={config.roundTime === 5}/>
                                        <label className="btn btn-settings" htmlFor="roundTime5">5s</label>
                                        <input className="btn-check" type="radio" name="roundTime" id="roundTime10" value="10" onChange={handleRoundTimeChange} checked={config.roundTime === 10}/>
                                        <label className="btn btn-settings" htmlFor="roundTime10">10s</label>
                                        <input className="btn-check" type="radio" name="roundTime" id="roundTime15" value="15" onChange={handleRoundTimeChange} checked={config.roundTime === 15}/>
                                        <label className="btn btn-settings" htmlFor="roundTime15">15s</label>
                                    </div>
                                    <div className="win-section">
                                        <div className="win-section-left">
                                            <p>Win Condition</p>
                                            <input className="btn-check" type="radio" name="winCondition" id="rounds" value="rounds" onChange={handleWinConditionChange} checked={config.winCondition.type === "rounds"}/>
                                            <label className="btn btn-settings" htmlFor="rounds">Rounds</label>
                                            <input className="btn-check" type="radio" name="winCondition" id="score" value="score" onChange={handleWinConditionChange} checked={config.winCondition.type === "score"}/>
                                            <label className="btn btn-settings" htmlFor="score">Score</label>
                                        </div>
                                        <div className="win-section-right">
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
                                    </div>
                                    <div className="playlist-selection">
                                        <div className="playlist-section-left">
                                            <p>Select your playlist</p>
                                            <input className="searchbar" onChange={handleSearchInputChange} />
                                            <SearchResultDisplay playlistItems={playlistItems} searchTerm={searchTerm} setActivePlaylist={setActivePlaylist} />
                                        </div>
                                        <div className="playlist-section-right">
                                            <p>Selected playlist</p>
                                            <div className="selected-card">
                                                <div className="card w-100">
                                                    <div className="selected-card-image">
                                                        <img width="80px" src={config.playlist.imgUrl} />
                                                    </div>
                                                    <div className="selected-card-content">
                                                        <p>{config.playlist.name}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                                <div className="button-wrapper">
                                    <button disabled={!activeDeviceId} className="btn btn-outline-primary" type="submit">Start Game</button>
                                </div>
                            </form>

                        </div>
                    </div>
                </div>
            </>
        )
    }
    if (round > 0) {
        return <Game
            answers={answers}
            round={round}
            roundStart={roundStart}
            roundTime={config.roundTime}
            user={defaultPlayer}
            playerAnswers={playerAnswers}
            players={players}
            showResultsScreen={showResultScreen}
            setPlayerGuessTrackId={setPlayerGuessTrackId}
            playerGuessTrackId={playerGuessTrackId}
            showGameResultScreen={showGameResultScreen}
            resultScreenTimer={resultScreenTimer}
            userId={userId}
        />
    }

    return <div>Game is running <p>{round}</p></div>
}

function SearchResultDisplay({ playlistItems, searchTerm, setActivePlaylist }: { playlistItems: SpotifyApi.PlaylistObjectSimplified[] | undefined, searchTerm: string, setActivePlaylist: (playlist: Playlist) => void }) {
    if (searchTerm.length < 3) {
        return
    }
    if (!playlistItems || playlistItems.length === 0) {
        return <p>No playlists found</p>
    }
    return <div className="search-result grid hw-50">
        <div className="search-result-list column flex-nowrap overflow-auto">
            {
                playlistItems.map((playlist) => {
                    return <button type="button" className="w-100 card" key={playlist.id} onClick={() => setActivePlaylist({ id: playlist.id, imgUrl: playlist.images[0]?.url, name: playlist.name })}>
                        <div className="card-image">
                            <img width="80px" src={playlist.images[0]?.url} />
                        </div>
                        <div className="card-content">
                            <p>{playlist.name}</p>
                        </div>
                    </button>
                })
            }
        </div>
    </div>


}

function PlayerDisplay({ player }: { player: Player }) {
    return <li className="col-lg-3">
        <div className="player-list-image">
            <img src={player.imageUrl} />
        </div>
        <div className="player-list-name">
            <p>{player.username}</p>
        </div>
    </li>
}

function getDefaultPlaylist(): Config {
    return {
        playlist: {
            id: "37i9dQZF1DXcBWIGoYBM5M",
            imgUrl: "https://i.scdn.co/image/ab67706f000000020ba81215546ef8fd79aa92a7",
            name: "Today's Top Hits",
        },
        roundTime: 10,
        winCondition: {
            type: "rounds",
            amount: 10,
        }
    }
}


async function getTrackInfos({ spotify, tracks }: { spotify: SpotifyWebApi, tracks: { correctTrackId: string, wrongTrackIds: string[] } }): Promise<Answer[]> {
    const { body: trackData } = await spotify.getTracks([tracks.correctTrackId, ...tracks.wrongTrackIds])
    const trackInfos = trackData.tracks.map((track, index) => {
        return {
            trackId: track.id,
            trackName: track.name,
            trackArtists: track.artists.map(artist => artist.name),
            isCorrect: index === 0
        }
    })
    return shuffleArray(trackInfos)
}

export function shuffleArray<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5);
}

async function playTrack({ trackId, spotify, activeDeviceId }: { trackId: string, spotify: SpotifyWebApi, activeDeviceId: string }) {
    await spotify.play({ uris: ["spotify:track:" + trackId], device_id: activeDeviceId })
}

function EmptyPlayer() {
    return <li className="col-lg-3">
        <div className="player-list-image">
            <img src="/assets/placeholder-image.jpg" />
        </div>
        <div className="player-list-name">
            <p>Empty slot</p>
        </div>
    </li>
}

function AddPlayer() {
    return <li className="col-lg-3">
        <div className="player-list-button">
            <button className="add-player-button">+</button>
        </div>
        <div className="player-list-name">
            <p>Invite Player</p>
        </div>
    </li>
}

