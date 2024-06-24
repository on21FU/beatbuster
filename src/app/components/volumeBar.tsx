import { useEffect, useState } from "react";
import { useSpotifyStore } from "../game/[gameId]/gameSetup";

export default function VolumeBar() {
    const [volume, setVolume] = useState(50)
    const { spotify } = useSpotifyStore()

    function handleVolumeChange(newVolume: number) {
        setVolume(newVolume)
    }

    useEffect(() => {
        const handler = setTimeout(() => {
            spotify?.setVolume(volume)
            console.log("testerino")
        }, 300)

        return () => {
            clearTimeout(handler)
        }
    }, [volume])

    return (
        <>
            <div className="volume-bar">
                <p>Volume</p>
                <input className="form-range"
                    type="range"
                    id="volume"
                    name="volume"
                    min="0"
                    max="100"
                    step="0.5"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                />
            </div>
        </>
    );
}