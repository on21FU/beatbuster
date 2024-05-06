"use client";
import React, { useState, useEffect } from "react";

export function WebPlayback(props: { token: string, setActiveDeviceId: ({ activeDeviceId }: { activeDeviceId: string }) => void }) {
  const [player, setPlayer] = useState<Spotify.Player | undefined>(undefined);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "BeatBuster",
        getOAuthToken: (cb) => {
          cb(props.token);
        },
        volume: 0.5,
      });

      player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
        props.setActiveDeviceId({ activeDeviceId: device_id })
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
