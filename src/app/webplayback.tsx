"use client";
import React, { useState, useEffect } from "react";
import { useSpotifyStore } from "./game/[gameId]/gameSetup";
import { useSession, useUser } from "@clerk/nextjs";

export function WebPlayback({ token }: { token: string }) {
  const { setActiveDeviceId, activeDeviceId, player, setPlayer } = useSpotifyStore();
  const { session } = useSession()

  console.log("Session: ", session)

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      if (!session) {
        console.log("No session")
        return
      }
      const player = new window.Spotify.Player({
        name: "BeatBuster",
        getOAuthToken: cb => { cb(token) },
        volume: 0.2,
        enableMediaSession: true
      });

      player.addListener("ready", ({ device_id }) => {
        setActiveDeviceId({ activeDeviceId: device_id })
      });
      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      player.addListener("authentication_error", (error) => { console.log(error) })
      player.addListener("account_error", (error) => { console.log(error) })
      player.addListener("initialization_error", (error) => { console.log(error) })
      player.addListener("playback_error", (error) => { console.log(error) })
      player
        .connect()
        .then((success) => console.log("connect"))
        .catch((err) => console.log(err));
      console.log("Player: ", player)
      setPlayer({ player });
    };
  }, []);

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
