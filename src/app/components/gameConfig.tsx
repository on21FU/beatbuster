"use client"

import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState, useTransition } from "react"
import SpotifyWebApi from "spotify-web-api-node"
import { useSocketStore, useSpotifyStore } from "../game/[gameId]/gameSetup"
import { Config, Player, PlayerAnswer, Playlist, messageSchema, validateMessage } from "~/types"
import { Game } from "./game"
import toast from 'react-hot-toast';
import LoadingSpinner from "./loadingSpinner"
import { useFormState } from "react-dom"

export type Answer = {
    trackId: string
    trackName: string
    trackArtists: string[]
    isCorrect: boolean
}

type PlayerWithReady = Player & { isReady: boolean }

export default function GameConfig({
    accessToken,
    defaultPlayer,
    userId,
    gameId,
}: {
    accessToken: string
    defaultPlayer: Player
    userId: string
    gameId: string
}) {
    const [playlistItems, setPlaylistItems] = useState<SpotifyApi.PlaylistObjectSimplified[] | undefined>()
    const [searchTerm, setSearchTerm] = useState("")
    const [config, setConfig] = useState<Config>(getDefaultPlaylist())
    const [players, setPlayers] = useState<PlayerWithReady[]>([{ ...defaultPlayer, isReady: false }])
    const [round, setRound] = useState(0)
    const [answers, setAnswers] = useState<Answer[]>([])
    const [roundStart, setRoundStart] = useState<Date | null>(null)
    const [playerAnswers, setPlayerAnswers] = useState<PlayerAnswer[]>([])
    const [showResultScreen, setShowResultScreen] = useState(false)
    const [resultScreenTimer, setResultScreenTimer] = useState<Date | null>(null)
    const [playerGuessTrackId, setPlayerGuessTrackId] = useState<string | null>(null)
    const [showGameResultScreen, setShowGameResultScreen] = useState(false)
    const [isNewPlaylistSelected, setIsNewPlaylistSelected] = useState(false)
    const [correctTrackId, setCorrectTrackId] = useState<string | null>(null)

    const { socket } = useSocketStore()
    const { spotify, activeDeviceId } = useSpotifyStore()

    const [pending, startTransition] = useTransition()

    useEffect(() => {
        if (!socket) return
        setFeaturedPlaylist()
        if (activeDeviceId) {
            socket.send(JSON.stringify({
                type: "ready",
            }))
            spotify?.transferMyPlayback([activeDeviceId]).then().catch(console.error)
        }

        socket.addEventListener("message", handleMessage)

        return () => {
            socket.removeEventListener("message", handleMessage)
        }
    }, [activeDeviceId])

    async function setFeaturedPlaylist() {
        if (!spotify) return
        const allFeaturedPlaylists = await spotify.getFeaturedPlaylists()
        const featuredPlaylist = allFeaturedPlaylists.body.playlists.items[0]
        if (!featuredPlaylist) return
        setConfig({
            ...config, playlist: {
                id: featuredPlaylist.id,
                name: featuredPlaylist.name,
                imgUrl: featuredPlaylist.images[0]?.url,
                owner: featuredPlaylist.owner.display_name
            }
        })
    }

    if (!socket)
        return (
            <>
                <div className="d-flex flex-column align-items-center">
                    <LoadingSpinner color="dark" />
                    <p>Connecting...</p>
                </div>
            </>
        )
    if (!spotify)
        return (
            <>
                <div className="d-flex flex-column align-items-center">
                    <LoadingSpinner color="dark" />
                    <p>Establishing Spotify Connection...</p>
                </div>
            </>
        )

    function setActivePlaylist(playlist: Playlist) {
        sendUpdatedConfig({
            ...config,
            playlist: { ...playlist },
        })
    }

    function sendUpdatedConfig(updatedConfig: Config) {
        if (!socket) return
        const message = {
            type: "update-config",
            body: updatedConfig,
        }
        socket.send(JSON.stringify(message))
    }

    async function handleMessage(event: MessageEvent) {
        try {
            const message = JSON.parse(event.data)
            if (!validateMessage(message)) {
                console.error("Invalid message", message)
                messageSchema.parse(message)
                return
            }

            switch (message.type) {
                case "start-round":
                    setPlayerGuessTrackId(null)
                    setPlayerAnswers([])
                    setShowResultScreen(false)
                    setPlayers(message.body.players.map(player => ({ ...player, isReady: false })))
                    setRound(message.body.round)
                    if (!spotify) return
                    const newAnswers = await getTrackInfos({
                        spotify,
                        tracks: message.body.tracks,
                    })
                    setAnswers(newAnswers)
                    console.log("Active Device Id: ", activeDeviceId)
                    if (!activeDeviceId) {
                        console.log("no device id")
                        return
                    }
                    await spotify.transferMyPlayback([activeDeviceId])
                    await playTrack({
                        trackId: message.body.tracks.correctTrackId,
                        spotify,
                        activeDeviceId,
                    })
                    setCorrectTrackId(message.body.tracks.correctTrackId)
                    setRoundStart(new Date())
                    break
                case "update-players":
                    setPlayers(message.body.players)
                    break
                case "round-results":
                    if (!spotify || !activeDeviceId) return
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
                    setShowGameResultScreen(true)
                    setPlayers(message.body.players.map(player => ({ ...player, isReady: false })))
                    break
                case "update-config":
                    setConfig(message.body)
                    break
                case "restart-game":
                    setRound(0)
                    setShowGameResultScreen(false)
                    setShowResultScreen(false)
                    setPlayerAnswers([])
                    setAnswers([])
                    setPlayers(players.map(player => ({ ...player, score: 0 })))
                    break
                default:
                    console.error("Unknown message type", message)
            }
        } catch (error) {
            console.error("Error parsing message", error)
        }
    }
    function handleRoundTimeChange(e: ChangeEvent<HTMLInputElement>) {
        if (!isPlayerHost({ players, userId })) return
        const newRoundTime = Number(e.target.value)
        setConfig({ ...config, roundTime: newRoundTime })
    }

    function handleWinConditionChange(e: ChangeEvent<HTMLInputElement>) {
        if (!isPlayerHost({ players, userId })) return
        const winCondition = e.target.value
        sendUpdatedConfig({
            ...config,
            winCondition: {
                type: winCondition as "rounds" | "score",
                amount: winCondition === "rounds" ? 10 : 10000,
            },
        })
    }

    function handleAmountChange(e: ChangeEvent<HTMLInputElement>) {
        if (!isPlayerHost({ players, userId })) return
        const amount = Number(e.target.value)
        if (config.winCondition.type === "rounds") {
            sendUpdatedConfig({
                ...config,
                winCondition: {
                    type: "rounds",
                    amount,
                },
            })
        }
        if (config.winCondition.type === "score") {
            sendUpdatedConfig({
                ...config,
                winCondition: {
                    type: "score",
                    amount,
                },
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
        spotify.searchPlaylists(e.target.value).then(data => {
            setPlaylistItems(data.body.playlists?.items)
        })
    }

    async function startGame() {
        if (!socket) throw new Error("No socket")
        if (!isPlayerHost({ players, userId })) return
        const enoughSongs = await checkAmountSongs()
        if (!enoughSongs) {
            toast.error("The selected playlist is too short")
            return
        }
        const message = {
            type: "start-game",
            body: {
                ...config,
                accessToken,
            },
        }
        socket.send(JSON.stringify(message))
    }
    async function checkAmountSongs() {
        if (!spotify) return false
        if (config.winCondition.type !== "rounds") return true
        const playlistSongs = await spotify.getPlaylist(config.playlist.id)
        return playlistSongs.body.tracks.items.length > config.winCondition.amount
    }
    if (round === 0) {
        return (
            <>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4">
                            <div className="game-config-left">
                                <h2>Players </h2>
                            </div>
                            <div className="playerlist-wrapper">
                                <ul className="player-list row">
                                    <PlayerList players={players} gameId={gameId} userId={userId} />
                                </ul>
                            </div>
                        </div>
                        <div className="col-lg-8">
                            <h2>Settings</h2>
                            <form action={() => startTransition(() => startGame())}>
                                <div className="settings">
                                    <div className="setting-section">
                                        <p>Round Time</p>
                                        <input
                                            className="btn-check"
                                            type="radio"
                                            name="roundTime"
                                            id="roundTime5"
                                            value="5"
                                            onChange={handleRoundTimeChange}
                                            checked={config.roundTime === 5}
                                            disabled={!isPlayerHost({ players, userId })}
                                        />
                                        <label className="btn btn-settings" htmlFor="roundTime5">
                                            5s
                                        </label>
                                        <input
                                            className="btn-check"
                                            type="radio"
                                            name="roundTime"
                                            id="roundTime10"
                                            value="10"
                                            onChange={handleRoundTimeChange}
                                            checked={config.roundTime === 10}
                                            disabled={!isPlayerHost({ players, userId })}
                                        />
                                        <label className="btn btn-settings" htmlFor="roundTime10">
                                            10s
                                        </label>
                                        <input
                                            className="btn-check"
                                            type="radio"
                                            name="roundTime"
                                            id="roundTime15"
                                            value="15"
                                            onChange={handleRoundTimeChange}
                                            checked={config.roundTime === 15}
                                            disabled={!isPlayerHost({ players, userId })}
                                        />
                                        <label className="btn btn-settings" htmlFor="roundTime15">
                                            15s
                                        </label>
                                    </div>
                                    <div className="win-section">
                                        <div className="win-section-left">
                                            <p>Win Condition</p>
                                            <input
                                                className="btn-check"
                                                type="radio"
                                                name="winCondition"
                                                id="rounds"
                                                value="rounds"
                                                onChange={handleWinConditionChange}
                                                checked={config.winCondition.type === "rounds"}
                                                disabled={!isPlayerHost({ players, userId })}
                                            />
                                            <label className="btn btn-settings" htmlFor="rounds">
                                                Rounds
                                            </label>
                                            <input
                                                className="btn-check"
                                                type="radio"
                                                name="winCondition"
                                                id="score"
                                                value="score"
                                                onChange={handleWinConditionChange}
                                                checked={config.winCondition.type === "score"}
                                                disabled={!isPlayerHost({ players, userId })}
                                            />
                                            <label className="btn btn-settings" htmlFor="score">
                                                Score
                                            </label>
                                        </div>
                                        <div className="win-section-right">
                                            {config.winCondition.type === "rounds" && (
                                                <div>
                                                    <p>Amount Songs</p>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="25"
                                                        onChange={handleAmountChange}
                                                        value={config.winCondition.amount}
                                                        disabled={!isPlayerHost({ players, userId })}
                                                    />
                                                </div>
                                            )}
                                            {config.winCondition.type === "score" && (
                                                <div>
                                                    <p>Amount Score</p>
                                                    <input
                                                        type="number"
                                                        step="1000"
                                                        min="5000"
                                                        max="25000"
                                                        onChange={handleAmountChange}
                                                        value={config.winCondition.amount}
                                                        disabled={!isPlayerHost({ players, userId })}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="playlist-selection">
                                        <div className="playlist-section-left">
                                            <p>Select your playlist</p>
                                            <input
                                                className="searchbar"
                                                onChange={handleSearchInputChange}
                                                onSelect={() => { setIsNewPlaylistSelected(false) }}
                                                disabled={!isPlayerHost({ players, userId })}
                                            />
                                            <SearchResultDisplay
                                                playlistItems={playlistItems}
                                                searchTerm={searchTerm}
                                                setActivePlaylist={setActivePlaylist}
                                                isNewPlaylistSelected={isNewPlaylistSelected}
                                                setIsNewPlaylistSelected={setIsNewPlaylistSelected}
                                            />
                                        </div>
                                        <div className="playlist-section-right">
                                            <p>Selected playlist</p>
                                            <div className="selected-card">
                                                <div className="card w-100">
                                                    <div className="selected-card-image">
                                                        <img width="80px" src={config.playlist.imgUrl} />
                                                    </div>
                                                    <div className="selected-card-content">
                                                        <p className="fw-bold">{config.playlist.name}</p>
                                                        <p>{config.playlist.owner}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {
                                    players.some(player => !player.isReady) && <p style={{
                                        textAlign: "right",
                                    }}>Please wait for all players to ready up.</p>
                                }
                                <div className="button-wrapper">

                                    <button
                                        disabled={!activeDeviceId || pending || players.some(p => !p.isReady) || !isPlayerHost({ players, userId })}
                                        className="btn btn-primary"
                                        type="submit"
                                    >
                                        {!activeDeviceId || pending || players.some(p => !p.isReady) ? <LoadingSpinner size="sm" color="dark" /> : "Start Game"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    if (round > 0) {
        return (
            <Game
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
                userId={userId}
                correctTrackId={correctTrackId}
            />
        )
    }

    return (
        <div>
            Game is running <p>{round}</p>
        </div>
    )
}

function SearchResultDisplay({
    playlistItems,
    searchTerm,
    setActivePlaylist,
    isNewPlaylistSelected,
    setIsNewPlaylistSelected
}: {
    playlistItems: SpotifyApi.PlaylistObjectSimplified[] | undefined
    searchTerm: string
    setActivePlaylist: (playlist: Playlist) => void
    isNewPlaylistSelected: boolean
    setIsNewPlaylistSelected: Dispatch<SetStateAction<boolean>>
}) {
    if (searchTerm.length < 3) {
        return
    }
    if (!playlistItems || playlistItems.length === 0) {
        return <p>No playlists found</p>
    }
    return (
        <div className={isNewPlaylistSelected ? "search-result grid hw-50 d-none" : "search-result grid hw-50"}>
            <div className="search-result-list column flex-nowrap overflow-auto">
                {playlistItems.map(playlist => {
                    return (
                        <button
                            type="button"
                            className="w-100 card"
                            key={playlist.id}
                            onClick={() =>
                                handlePlaylistSelection({
                                    id: playlist.id,
                                    imgUrl: playlist.images[0]?.url,
                                    name: playlist.name,
                                    owner: playlist.owner.display_name
                                }, setIsNewPlaylistSelected, setActivePlaylist)
                            }>
                            <div className="card-image">
                                <img width="80px" src={playlist.images[0]?.url} />
                            </div>
                            <div className="card-content">
                                <p className="fw-bold text-start">{playlist.name}</p>
                                <p className="text-start">{playlist.owner.display_name}</p>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

function handlePlaylistSelection(playlist: Playlist, setIsNewPlaylistSelected: Dispatch<SetStateAction<boolean>>, setActivePlaylist: (playlist: Playlist) => void) {
    setActivePlaylist(playlist)
    setIsNewPlaylistSelected(true)
}

function PlayerDisplay({ player, userId, index }: { player: PlayerWithReady; userId: string; index: number }) {
    return (
        <li className="col-lg-3 col-sm-3 col-xs-3">
            <div className="player-list-image">
                {index === 0 && (
                    <div className="player-list-host">
                        <img className="host-crown-icon" src="/assets/crown.svg" />
                    </div>
                )}
                {
                    !player.isReady && (
                        <div className="spinner">
                            <LoadingSpinner size="sm" color="dark" />
                        </div>
                    )
                }
                <img src={player.imageUrl} />
            </div>
            <div className="player-list-name">
                <p className={player.userId === userId ? "host" : ""}>{player.username}</p>
            </div>
        </li>
    )
}

function getDefaultPlaylist(): Config {
    return {
        playlist: {
            id: "6UeSakyzhiEt4NB3UAd6NQ",
            imgUrl: "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000bebb3bd5501a335b265807df34db",
            name: "Billboard Hot 100",
        },
        roundTime: 10,
        winCondition: {
            type: "rounds",
            amount: 10,
        },
    }
}

async function getTrackInfos({
    spotify,
    tracks,
}: {
    spotify: SpotifyWebApi
    tracks: { correctTrackId: string; wrongTrackIds: string[] }
}): Promise<Answer[]> {
    const { body: trackData } = await spotify.getTracks([tracks.correctTrackId, ...tracks.wrongTrackIds])
    const trackInfos = trackData.tracks.map((track, index) => {
        return {
            trackId: track.id,
            trackName: track.name,
            trackArtists: track.artists.map(artist => artist.name),
            isCorrect: index === 0,
        }
    })
    return shuffleArray(trackInfos)
}

export function shuffleArray<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5)
}

async function playTrack({
    trackId,
    spotify,
    activeDeviceId,
}: {
    trackId: string
    spotify: SpotifyWebApi
    activeDeviceId: string
}) {
    try {

        await spotify.play({
            uris: ["spotify:track:" + trackId],
            device_id: activeDeviceId,
        })
    } catch (error) {
        console.error("Coulnt play track", error)
    }
}

function EmptyPlayer() {
    return (
        <li className="col-md-3 col-sm-3 col-xs-3">
            <div className="player-list-image">
                <img src="/assets/placeholder-image.jpg" />
            </div>
            <div className="player-list-name">
                <p>Empty slot</p>
            </div>
        </li>
    )
}

function AddPlayer({ gameId }: { gameId: string }) {
    const [buttonContent, setButtonContent] = useState("+")

    return (
        <li className="col-md-3 col-sm-3 col-xs-3">
            <div className="player-list-button">
                <button onClick={() => copyLobbyCodeToClipboard(gameId)} className="add-player-button">
                    {buttonContent}
                </button>
            </div>
            <div className="player-list-name">
                <p>Invite Player</p>
            </div>
        </li>
    )

    function copyLobbyCodeToClipboard(gameId: string) {
        navigator.clipboard.writeText("https://beatbuster.vercel.app/game/" + gameId)
        toast.success("Successfully copied to clipboard!")
        setButtonContent("✓")
        setTimeout(() => {
            setButtonContent("+")
        }, 1500)
    }
}

function PlayerList({ players, gameId, userId }: { players: PlayerWithReady[]; gameId: string; userId: string }) {
    if (players.length === 12) {
        return (
            <>
                {players.map((player, index) => (
                    <PlayerDisplay key={index} player={player} userId={userId} index={index} />
                ))}
            </>
        )
    }
    if (players.length < 12) {
        return (
            <>
                {players.map((player, index) => (
                    <PlayerDisplay key={player.userId} player={player} userId={userId} index={index} />
                ))}
                {new Array(11 - players.length).fill(0).map((_, index) => (
                    <EmptyPlayer key={index} />
                ))}
                {players.length < 12 && <AddPlayer gameId={gameId} />}
            </>
        )
    }
}

function isPlayerHost({ players, userId }: { players: Player[]; userId: string }) {
    if (!players[0]) {
        throw new Error("No Players there...")
    }
    return players[0].userId === userId
}
