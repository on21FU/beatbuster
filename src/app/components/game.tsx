import { useEffect, useState } from "react";
import { Answer } from "./gameConfig";
import { useSocketStore, useSpotifyStore } from "../game/[gameId]/gameSetup";
import { Player, PlayerAnswer } from "~/types";
import Scoreboard from "./scoreboard";
import VolumeBar from "./volumeBar";
import { AudioVisualization } from "./audioVisualization";
import useSWR from 'swr'


export function Game({
    round,
    answers,
    roundStart,
    user,
    roundTime,
    playerAnswers,
    players,
    showResultsScreen,
    setPlayerGuessTrackId,
    playerGuessTrackId,
    showGameResultScreen,
    userId,
    correctTrackId
}: {
    round: number;
    answers: Answer[];
    roundStart: Date | null;
    user: Player;
    roundTime: number;
    playerAnswers: PlayerAnswer[] | null;
    players: Player[];
    showResultsScreen: boolean;
    showGameResultScreen: boolean;
    setPlayerGuessTrackId: (trackId: string | null) => void;
    playerGuessTrackId: string | null;
    userId: string;
    correctTrackId: string | null;
}) {

    const { socket } = useSocketStore();

    function handleAnswer(answer: Answer) {
        if (!roundStart) {
            console.log("Round start is not set");
            return;
        }
        const timeToAnswer = new Date().getTime() - roundStart.getTime();
        if (!socket) {
            console.log("Socket is not set");
            return;
        }
        setPlayerGuessTrackId(answer.trackId);
        socket.send(
            JSON.stringify({
                type: "answer",
                body: {
                    userId: user.userId,
                    trackId: answer.trackId,
                    timeToAnswer,
                },
            })
        );
    }

    useEffect(() => {
        if (!roundStart || playerGuessTrackId) return;
        const timer = setTimeout(() => {
            if (!playerGuessTrackId && answers.length > 0) {
                const wrongAnswer = {
                    trackId: "",
                    trackName: "",
                    trackArtists: [],
                    isCorrect: false
                }
                handleAnswer(wrongAnswer)
            }
        }, roundTime * 1000)
        return () => clearTimeout(timer);
    })

    if (showResultsScreen) {
        return <RoundResultScreen playerAnswers={playerAnswers!} players={players} correctTrackId={correctTrackId} />
    }

    if (showGameResultScreen) {
        return <GameResultScreen players={players} />
    }

    return (
        <>
            <div className="game container">
                <div className="game-animation">
                    <AudioVisualization duration={roundTime} />
                </div>
                <h3 className="text-center">Runde {round}</h3>
                <Scoreboard players={players} userId={userId} />
                <div className="answers-wrapper">
                    <div className="row">
                        {answers.map((answer) => {
                            const isClicked = answer.trackId === playerGuessTrackId ? "clicked" : ""
                            return (
                                <button
                                    className={`answer-button col-lg-5 ${isClicked}`}
                                    onClick={() => handleAnswer(answer)}
                                    key={answer.trackId}
                                    disabled={!!playerGuessTrackId}
                                >
                                    <PlayerAnswerDisplay answer={answer} />
                                    {answer.trackName} -{" "}
                                    {answer.trackArtists.join(", ")}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div>
                    <VolumeBar />
                </div>
            </div>
        </>
    );

    function PlayerAnswerDisplay({ answer }: { answer: Answer }) {
        if (playerAnswers?.length) {
            return (
                <OtherPlayerAnswerDisplay
                    answer={answer}
                    playerAnswers={playerAnswers}
                />
            );
        }

        if (answer.trackId === playerGuessTrackId) {
            return <img src={user.imageUrl} />;
        }
    }

    function OtherPlayerAnswerDisplay({
        answer,
        playerAnswers,
    }: {
        answer: Answer;
        playerAnswers: PlayerAnswer[];
    }) {
        return playerAnswers.map((playerAnswer) => {
            if (playerAnswer.trackId === answer.trackId) {
                return (
                    <img
                        key={playerAnswer.userId}
                        src={
                            players.find(
                                (player) =>
                                    player.userId === playerAnswer.userId
                            )?.imageUrl
                        }
                    />
                );
            }
        });
    }
}


function RoundResultScreen({ playerAnswers, players, correctTrackId }: { playerAnswers: PlayerAnswer[]; players: Player[]; correctTrackId: string | null }) {
    return (
        <div className="round-result container">
            <div className="row">
                <div className="progress">
                    <div className="progress-bar bg-primary"></div>
                </div>
            </div>
            <div className="row">
                <div className="col-2"><SongDisplay trackId={correctTrackId!} /></div>
                <div className="col-10">
                    <ul className="round-result-list">
                        <div className="round-result-description">
                            <p className="round-result-description-content">
                                Player
                            </p>
                            <p className="round-result-description-content">
                                Points
                            </p>
                            <p className="round-result-description-content">Time</p>
                        </div>
                        {playerAnswers?.sort((playerAnswer1, playerAnswer2) => playerAnswer2.gainedScore - playerAnswer1.gainedScore).map((playerAnswer, index) => {
                            const player = players.find(
                                (player) => player.userId === playerAnswer.userId
                            );
                            return (
                                <li className="round-result-list-item" key={index}>
                                    <div className="round-result-item-content">
                                        {player?.username}
                                    </div>
                                    <div className="round-result-item-content">
                                        {playerAnswer.gainedScore}
                                    </div>
                                    <div className="round-result-item-content">
                                        {playerAnswer.timeToAnswer.toFixed(2)}s
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
}

function GameResultScreen({ players }: { players: Player[] }) {
    const { socket } = useSocketStore();


    function restartGame() {
        if (!socket)
            return null;
        socket.send(
            JSON.stringify({
                type: "restart-game",
            })
        );
    }

    const sortedPlayers = players.sort((player1, player2) => player2.score - player1.score)
    const topThreePlayers = [...sortedPlayers].splice(0, 3)
    const otherPlayers = [...sortedPlayers].splice(3, sortedPlayers.length)

    return (
        <>
            <div className="container round-result">
                <h2>Game result</h2>
                <ul className="end-result-list">
                    <div className="normal-list">
                        {
                            topThreePlayers.length < 3 && <PlayerList players={sortedPlayers} offset={0} />
                        }
                    </div>
                    <div className="top-three-list">
                        {
                            topThreePlayers.length === 3 && <>
                                <Pedestal players={topThreePlayers} />
                                <PlayerList players={otherPlayers} offset={4} />
                            </>
                        }
                    </div>
                </ul>

                <div className="restart-button">
                    <button className="btn btn-primary" onClick={restartGame}>Restart Game</button>
                </div>

            </div>
        </>
    );
}

function Pedestal({ players }: { players: Player[] }) {
    if (!players[0] || !players[1] || !players[2]) {
        return
    }
    return [
        { player: players[1], position: 2 },
        { player: players[0], position: 1 },
        { player: players[2], position: 3 }
    ]
        .map((entry, index) => {
            return (
                <li className="end-result-list-item" key={index}>
                    <div className="image-wrapper">
                        <img src={entry.player.imageUrl} alt="" />
                    </div>
                    <div className="end-result-content">
                        <p className="end-result-index">
                            {entry.position}
                        </p>
                        <p className="end-result-name">
                            {entry.player.username}{" "}
                        </p>
                        <p className="end-result-score">
                            {entry.player.score}
                        </p>
                        <p className="end-result-description">
                            Points
                        </p>
                    </div>
                </li>
            );
        })
}


function SongDisplay({ trackId }: { trackId: string }) {
    const { spotify } = useSpotifyStore();

    const { data: track, isLoading } = useSWR(trackId, async (trackId) => {
        console.log("Getting track")
        if (!spotify) return;
        const track = await spotify.getTrack(trackId);
        console.log(track)
        return track.body;
    })

    if (isLoading) {
        return <div className="song-display">
            <div className="img-placeholder"></div>
            <p className="song-display-track">...</p>
            <p className="song-display-artists">...</p>
        </div>
    }


    if (!track) {
        return <p>Track not found</p>
    }

    return <div className="song-display">
        <img src={track.album.images[0]?.url} alt={track.name} />
        <p className="song-display-track">{track.name}</p>
        <p className="song-display-artists">{track.artists.map((artist) => artist.name).join(", ")}</p>
    </div>

}

function PlayerList({ players, offset = 0 }: { players: Player[], offset?: number }) {
    return players
        .map((player, index) => {
            return (
                <li className="end-result-list-item" key={index}>
                    <div className="image-wrapper">
                        <img src={player.imageUrl} alt="" />
                    </div>
                    <div className="end-result-content">
                        <p className="end-result-index">
                            {index + offset}
                        </p>
                        <p className="end-result-name">
                            {player.username}{" "}
                        </p>
                        <p className="end-result-score">
                            {player.score}
                        </p>
                        <p className="end-result-description">
                            Points
                        </p>
                    </div>
                </li>
            );
        })
}