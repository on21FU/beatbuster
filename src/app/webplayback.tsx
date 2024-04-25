"use client";
import React, { useState, useEffect } from "react";

function WebPlayback(props: { token: string }) {
  const [player, setPlayer] = useState<Spotify.Player | undefined>(undefined);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player2 = new window.Spotify.Player({
        name: "BeatBuster",
        getOAuthToken: (cb) => {
          cb(props.token);
        },
        volume: 0.5,
      });
      console.log(player2);

      player2.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
      });

      player2.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      player2
        .connect()
        .then((success) => console.log("connect"))
        .catch((err) => console.log(err));

      setPlayer(player2);
    };
  }, []);

  if (!player) {
    return "loading...";
  }

  return (
    <>
      <div className="container">
        <div className="main-wrapper">
          <button
            onClick={() =>
              player.togglePlay().then(() => {
                console.log("Toggled playback!");
              }).catch(err => console.log(err))
            }
          >
            Play
          </button>
        </div>
      </div>
    </>
  );
}

export default WebPlayback;
