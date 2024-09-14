import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).end(); // Method Not Allowed  
    }

    const { userName } = req.body;
    const allowedUsers = process.env.ALLOWED_USERS?.split(',') || [];

    if (allowedUsers.includes(userName)) {
        return res.status(200).json({ isAllowed: true });
    } else {
        return res.status(403).json({ isAllowed: false });
    }
}