import { useState } from "react";
import { Answer } from "./gameConfig";
import { useSocketStore, useSpotifyStore } from "../game/[gameId]/gameSetup";
import { Player, PlayerAnswer } from "~/types";
import Scoreboard from "./scoreboard";
import VolumeBar from "./volumeBar";
import { AudioVisualization } from "./audioVisualization";

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
    resultScreenTimer,
    userId,
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
    resultScreenTimer: Date | null;
    setPlayerGuessTrackId: (trackId: string | null) => void;
    playerGuessTrackId: string | null;
    userId: string;
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

    if (showResultsScreen) {
        return (
            <div className="round-result container">
                <div className="progress">
                    <div className="progress-bar bg-primary"></div>
                </div>
                <h2>Results</h2>

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
        );
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

function GameResultScreen({ players }: { players: Player[] }) {
    return (
        <div className="container round-result ">
            <h2>Game result</h2>
            <ul className="end-result-list">
                {players
                    .sort((player1, player2) => player2.score - player1.score)
                    .map((player, index) => {
                        return (
                            <li className="end-result-list-item" key={index}>
                                <div className="image-wrapper">
                                    <img src={player.imageUrl} alt="" />
                                </div>
                                <div className="end-result-content">
                                    <p className="end-result-index">
                                        {index + 1}
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
                    })}
            </ul>
        </div>
    );
}
