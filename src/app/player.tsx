"use client"

import { useEffect, useState } from "react";

export default function Player({ token }: { token: string }) {

    useEffect(() => {
        setWindow(window)
        console.log("Window", window);
    }, [])

    const [window2, setWindow] = useState<Window | null>(null)

    if(!window2) return <div>Player loading...</div>

    const getPlayer = window2.onSpotifyWebPlaybackSDKReady = () => {
        return new Spotify.Player({
            name: 'Guess the song',
            getOAuthToken: cb => { cb(token); },
            volume: 0.5
        });
    }

    const player = getPlayer()

    if (!player) return <div>Player not loaded</div>

    // Ready
    player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
    });

    player.addListener('initialization_error', ({ message }) => {
        console.error(message);
    });
  
    player.addListener('authentication_error', ({ message }) => {
        console.error(message);
    });
  
    player.addListener('account_error', ({ message }) => {
        console.error(message);
    });

    player.connect()

    return (
        <div>
            <button onClick={() => player.togglePlay()}>Pause/Continue</button>
        </div>
    )


}