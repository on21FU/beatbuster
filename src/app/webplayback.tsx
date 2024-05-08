"use client";
import React, { useState, useEffect } from "react";
import { useSpotifyStore } from "./game/[gameId]/gameSetup";

export function WebPlayback({ token }: { token: string }) {
  const [player, setPlayer] = useState<Spotify.Player | undefined>(undefined);
  const { setActiveDeviceId, activeDeviceId } = useSpotifyStore();
  useEffect(() => {
    console.log(setActiveDeviceId)
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "BeatBuster",
        getOAuthToken: (cb) => {
          cb(token);
        },
        volume: 0.5,
      });

      player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
        setActiveDeviceId({ activeDeviceId: device_id })
        console.log(activeDeviceId)
      });
      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      player
        .connect()
        .then((success) => console.log("connect"))
        .catch((err) => console.log(err));

      setPlayer(player);
    };
  }, []);

  if (!player) {
    return "loading...";
  }

  return (
    <>
      <div className="container">
        <div className="main-wrapper">
        </div>
      </div>
    </>
  );
}

export default WebPlayback;
