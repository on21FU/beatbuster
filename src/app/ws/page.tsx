import { getUserToken } from "../spotify";

export default async function WS() {

    const userToken = await getUserToken()

    const socket = new WebSocket("ws://localhost:8080?token=" + userToken);
    socket.addEventListener("open", () => {
        console.log("Connected to server");
        socket.send("Helllo world");
    });
    socket.addEventListener("message", event => {
        console.log("Message from server", event.data)
    })


    return (
        <main>
            <div className="bg-primary">Hello World!2</div>
        </main>
    );
}