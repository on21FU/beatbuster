import { UserButton } from "@clerk/nextjs";
import { getUserToken } from "./spotify";
import WebPlayback from "./webplayback";


export default async function Home() {
  const userToken = await getUserToken();
  const response = await fetch("https://api.spotify.com/v1/playlists/5Rwe4lHPn0YXXDlXMXc36h",
    {headers:  {Authorization: `Bearer ${userToken}`}}
  )
  const data = await response.json();
  const trackIds = data.tracks.items.map( track => track.track.id)
  //console.log(trackIds);


  return (
    <main>
      <UserButton afterSignOutUrl="/"/>
      <div className="bg-primary ">Hello World!</div>
      <WebPlayback token={userToken}/>
    </main>
  );
}
