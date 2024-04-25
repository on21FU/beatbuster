import { UserButton } from "@clerk/nextjs";
import { playNextTrack, getUserToken, startRound } from "./spotify";
import WebPlayback from "./webplayback";


export default async function Home() {
  const userToken = await getUserToken();
  return (
    <main>
      <UserButton afterSignOutUrl="/"/>
      <div className="bg-primary ">Hello World!</div>
      <WebPlayback token={userToken}/>
      <form action={startRound}>
        <input type="text" id="playlistId" name="playlistId"/>
        <button type="submit">Start Round</button>
      </form>
    </main>
  );
}
