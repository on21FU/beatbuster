import { Player } from "~/types";

export default function Scoreboard({ players }: { players: Player[] }) {
    return (
        <>
            <div>
                {players.map((player) => {
                    return (
                        <div className="scoreboard">
                            <div className="scoreboard-wrapper">
                            <h4>Scoreboard</h4>
                            <div className="scoreboard-content">
                            <img src={player.imageUrl} />
                            <p>{player.username}</p>
                            <p>{player.score}</p>
                            </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
