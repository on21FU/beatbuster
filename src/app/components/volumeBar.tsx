import { useState } from "react";
import { useSpotifyStore } from "../game/[gameId]/gameSetup";

export default function VolumeBar() {
    const [volume, setVolume] = useState(50)

    const { spotify } = useSpotifyStore()

    function handleVolumeChange(newVolume: number) {
        setVolume(newVolume)
        spotify?.setVolume(newVolume)
    }

    return (
        <>
            <input
                type="range"
                id="volume"
                name="volume"
                min="0"
                max="100"
                step="0.5"
                value={volume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
            />
        </>
    );
}