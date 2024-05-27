
import { Player } from "~/types";


export default function Scoreboard({ players, userId }: { players: Player[], userId: string }) {
    return (
        <>
            <div className="scoreboard">
                <div className="scoreboard-wrapper">
                    <h4>Scoreboard</h4>
                    {players
                        .sort((player1, player2) => player2.score - player1.score)
                        .map((player) => {
                            const isCurrentUser = player.userId === userId ? "own-user" : ""
                            return (
                                <div className={`scoreboard-content ${isCurrentUser}`} key={player.userId}>
                                    <img src={player.imageUrl} />
                                    <p>{player.username}</p>
                                    <p>{player.score}</p>
                                </div>
                            );
                        })}
                </div>
            </div>
        </>
    );
}
