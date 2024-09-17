import { Liveblocks } from "@liveblocks/node";
import type { NextApiRequest, NextApiResponse } from "next";


const API_KEY = process.env.LIVEBLOCKS_SECRET_KEY;

const liveblocks = new Liveblocks({
    secret: API_KEY!,
});


export default async function(request: NextApiRequest, response: NextApiResponse) {
    let room;
    try{
        room = await liveblocks.getRoom("my-room");
    } catch (error) {
        liveblocks.createRoom("my-room", {
            defaultAccesses: ["room:write"],
            groupsAccesses: { "user": ["room:write"] },
        }); 
    }
    
    response.status(200).end();
}