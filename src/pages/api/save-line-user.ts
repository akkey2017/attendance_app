import type { NextApiRequest, NextApiResponse } from 'next';  
import { messagingApi } from '@line/bot-sdk';
const { MessagingApiClient } = messagingApi;
import { WebhookEvent } from '@line/bot-sdk';  
import { connectToDatabase } from '../../lib/mongodb';  
import { Db } from 'mongodb';  

// LINEクライアント設定  
const config = {  
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN as string,  
    channelSecret: process.env.CHANNEL_SECRET as string,  
};  

const client = new MessagingApiClient(config);

export default async function handler(  
    req: NextApiRequest,  
    res: NextApiResponse  
) {  
    // リアクティブなリクエストが判定された場合  
    if (req.method === 'POST') {  
        const { db } = await connectToDatabase();  
        const events: WebhookEvent[] = req.body.events;  

        for (const event of events) {  
            if (event.type === 'message' && event.source.type === 'group') {  
                const groupId = event.source.groupId;  

                // グループIDをMongoDBに保存  
                await saveGroupId(db, groupId);  

                // 任意の応答メッセージを送信  
                await client.replyMessage(
                    {
                        replyToken: event.replyToken,
                        messages: [{ type: 'text', text: 'グループIDを保存しました' }]
                    }
                );  
            }  
        }  
        return res.status(200).json({ status: 'success' });  
    } else {  
        return res.status(405).end(); // 非対応メソッドリクエストの場合  
    }  
}  

// グループIDを保存する関数  
async function saveGroupId(db: Db, groupId: string) {  
    try {  
        const collection = db.collection('group-ids');  
        await collection.updateOne(  
            { groupId: groupId },  
            { $set: { groupId: groupId } },  
            { upsert: true } // 新しいグループIDの場合は挿入します  
        );  
        console.log('Group ID saved:', groupId);  
    } catch (error) {  
        console.error('Failed to save Group ID:', error);  
    }  
};