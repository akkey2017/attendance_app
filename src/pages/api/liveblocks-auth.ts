import { Liveblocks } from "@liveblocks/node";
import type { NextApiRequest, NextApiResponse } from "next";


const API_KEY = process.env.LIVEBLOCKS_SECRET_KEY;

const liveblocks = new Liveblocks({
    secret: API_KEY!,
});


export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    if (request.method !== 'POST') {  
        response.status(405).json({ message: "Method Not Allowed" });  
        return;  
    }  


    const { body,status } = await liveblocks.identifyUser(
        {
            userId: request.body.session.user.name,
            groupIds: ["my-group-id"],
        },
        { userInfo: { name: request.body.session.user.name, avatar: request.body.session.user.image, color: '#' + (0x1000000 + Math.random() * 0xffffff).toString(16).substring(1, 7), } },
    );

    response.status(status).json(body);
}