import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/mongodb';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const DEFAULT_START_TIME = '21:00';
    const DEFAULT_REPEAT_COUNT = 4;

    const { db } = await connectToDatabase();

    if (req.method === 'POST') {
        const { userId, date, startTime, repeatCount } = req.body;
        const record = {
            userId,
            date,
            startTime,
            repeatCount
        };

        if (startTime === DEFAULT_START_TIME && repeatCount === DEFAULT_REPEAT_COUNT) {
            await db.collection('meeting-time').deleteOne({ date });
        } else {
            await db.collection('meeting-time').updateOne(
                { date },
                { $set: record },
                { upsert: true }
            );
        }

        res.status(200).json(record);
    } else if (req.method === 'GET') {
        const { date } = req.query;
        const meetingTime = await db.collection('meeting-time').findOne({ date });
        if (meetingTime) {
            res.status(200).json(meetingTime);
        } else {
            // デフォルト値を返す  
            res.status(200).json({
                userId: '',
                date,
                startTime: DEFAULT_START_TIME,
                repeatCount: DEFAULT_REPEAT_COUNT
            });
        }
    } else {
        res.status(405).end(); // Method Not Allowed  
    }
};