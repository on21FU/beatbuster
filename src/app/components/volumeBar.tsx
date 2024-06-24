"use client"
import { useEffect, useState } from "react";
import { useSpotifyStore } from "../game/[gameId]/gameSetup";

export default function VolumeBar() {
    const { spotify, player } = useSpotifyStore()
    const [volume, setVolume] = useState(50)
    const[isStart, setIsStart] = useState(true)
    

    function handleVolumeChange(newVolume: number) {
        setVolume(newVolume)
    }

    function getStartVolume() {
        setIsStart(false)
        player?.getVolume().then((volume) => {
            setVolume(Math.floor(volume * 100))
        })
        
    }

    useEffect(() => {
        const handler = setTimeout(() => {
            if (isStart) {
                getStartVolume()
            } else {
                spotify?.setVolume(volume)
            }
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