import type { NextApiRequest, NextApiResponse } from 'next';  
import { messagingApi } from '@line/bot-sdk';
import { connectToDatabase } from '../../lib/mongodb';  
import { Db } from 'mongodb';
const config = {  
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN as string,  
    channelSecret: process.env.CHANNEL_SECRET as string,  
};  


const { MessagingApiClient } = messagingApi;
const defailtStartTime = '21:00';
const defaultrepeat = 4;
const checkAndAnnounce = async (db: Db) => {
    try {
        const today = new Date();
        const checkDate = new Date(today);
        const date = checkDate.toISOString().split('T')[0];

        const meetingTime = await db.collection('meeting-time').findOne({ date: date });
        if (meetingTime) {
            const startTime = new Date(`${date}T${meetingTime.startTime}:00`);
            const timeDifference = (startTime.getTime() - today.getTime()) / (1000 * 60 * 60);

            if (timeDifference < 2 && timeDifference >= 1) {
                const client = new MessagingApiClient(config);
                client.pushMessage({
                    to: "",
                    messages: [{ type: 'text', text: 'hello, world' }]
                });
            }
        }else{
            const startTime = new Date(`${date}T${defailtStartTime}:00`);
            const timeDifference = (startTime.getTime() - today.getTime()) / (1000 * 60 * 60);

            if (true) {
                const client = new MessagingApiClient(config);
                client.pushMessage({
                    to: "",
                    messages: [{ type: 'text', text: 'hello, world' }]
                });
            }
        }
    } catch (error) {
        console.error('Failed to announce meeting time:', error);
    }
};

export default async function (  
    req: NextApiRequest,  
    res: NextApiResponse  
) {  
    const { db } = await connectToDatabase();  

    await checkAndAnnounce(db);

    res.status(200).end(); // レスポンスを終了  
}