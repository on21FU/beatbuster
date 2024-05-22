import { Player } from "~/types";

export default function Scoreboard({ players }: { players: Player[] }) {
    return (
        <>
            <div>
                {players.map((player) => {
                    return (
                        <div>
                            <img src={player.imageUrl} />
                            <p>{player.username}</p>
                            <p>{player.score}</p>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
