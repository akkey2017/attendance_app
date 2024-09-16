import { Liveblocks } from "@liveblocks/node";
import type { NextApiRequest } from 'next'; 

/**
 * Authenticating your Liveblocks application
 * https://liveblocks.io/docs/authentication
 */

const liveblocks = new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: NextApiRequest) {
    if (!request.body?.userId) {
        return new Response("userId is required", { status: 400 });
    }
    // Get the current user's unique id from your database
    const { userId, userImage } = request.body; 

    // Create a session for the current user
    // userInfo is made available in Liveblocks presence hooks, e.g. useOthers
    const session = liveblocks.prepareSession(`user-${userId}`, {
        userInfo: {
            name: userId,
            color:  '#' + (0x1000000 + Math.random() * 0xffffff).toString(16).substring(1, 7),
            avatar: userImage,
        },
    });

    // Use a naming pattern to allow access to rooms with a wildcard
    session.allow(`liveblocks:examples:*`, session.FULL_ACCESS);

    // Authorize the user and return the result
    const { body, status } = await session.authorize();
    return new Response(body, { status });
}