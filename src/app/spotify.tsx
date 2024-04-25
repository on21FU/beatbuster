import { auth, clerkClient } from "@clerk/nextjs/server";

export async function getUserToken(){
    const { userId } = auth();
    if(!userId) {
        throw new Error("Invalid UserID");
    }
    const tokens = await clerkClient.users.getUserOauthAccessToken(userId, "oauth_spotify")

    if(!Array.isArray(tokens) || !tokens[0]){
        throw new Error("No Token");
    }
    return tokens[0].token;
}