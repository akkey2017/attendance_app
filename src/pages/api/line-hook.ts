import type { NextApiRequest, NextApiResponse } from 'next';  
import { messagingApi } from '@line/bot-sdk';
const { MessagingApiClient } = messagingApi;
import { WebhookEvent } from '@line/bot-sdk';  
import { connectToDatabase } from '../../lib/mongodb';  
import { Db } from 'mongodb';  

const config = {  
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN as string,  
    channelSecret: process.env.CHANNEL_SECRET as string,  
};  

const client = new MessagingApiClient(config);

export default async function handler(  
    req: NextApiRequest,  
    res: NextApiResponse  
) {  
    if (req.method === 'POST') {  
        const { db } = await connectToDatabase();  
        const events: WebhookEvent[] = req.body.events;  

        for (const event of events) {  
            if (event.type === 'message' && event.source.type === 'group') {  
                if (event.message.type !== 'text') {  
                    continue;  
                }else if (!event.message.text.startsWith("!")) {  
                    continue;  
                }
                const groupId = event.source.groupId;  
                const alreadySaved = await checkAndSaveGroupId(db, groupId);  
                if (alreadySaved) {  
                    console.log('Group ID saved:', groupId);  
                }else{
                    await client.replyMessage(
                        {
                            replyToken: event.replyToken,
                            messages: [{ type: 'text', text: 'グループIDを保存しました。\ngroup ID :' + groupId }]
                        }
                    );  
                }


            }
        }  
        return res.status(200).json({ status: 'success' });  
    } else {  
        return res.status(405).end();
    }  
}  

async function checkAndSaveGroupId(db: Db, groupId: string) {  
    try {  
        const collection = db.collection('group-ids');  
        const group = await collection.findOne({ groupId: groupId });
        if (group) {  
            return true;  
        }else{
            await collection.updateOne(  
                { groupId: groupId },  
                { $set: { groupId: groupId } },  
                { upsert: true }
            );  
            console.log('Group ID saved:', groupId);  
        }
    } catch (error) {  
        console.error('Failed to save Group ID:', error);  
    }  
};