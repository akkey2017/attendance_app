import type { NextApiRequest, NextApiResponse } from 'next';
import { messagingApi } from '@line/bot-sdk';
import { connectToDatabase } from '../../lib/mongodb';
import { Db } from 'mongodb';
import { calculateEndTime } from '@/utils/timeHelpers';
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN as string,
    channelSecret: process.env.CHANNEL_SECRET as string,
};
const { MessagingApiClient } = messagingApi;
const defailtStartTime = '21:00';
const defaultrepeat = 4;


const calculateMeetingPeriod = (indexes: number[], startTime: string) => {
    if (indexes.length === 0) {
        return '';
    }

    const start = indexes[0];
    const end = indexes[indexes.length - 1];
    const startFormatted = calculateEndTime(startTime, start);
    const endFormatted = calculateEndTime(startTime, end + 1);

    return `${startFormatted} 〜 ${endFormatted}`;
};

const checkAttendances = async (db: Db) => {
    const today = new Date();
    today.setTime(today.getTime() - today.getTimezoneOffset() * 60 * 1000);
    const date = today.toISOString().split('T')[0];
    const value: Attendance[] = [];
    const attendances = await db.collection('attendances').find({ date: date }).toArray();
    attendances.forEach(async (attendance) => {
        if (attendance.status) {
            value.push({ userId: attendance.userId, status: true, date: date, meetingIndexes: attendance.meetingIndexes });
        }
    });
    return value;
}

const checkAndAnnounce = async (db: Db) => {
    try {
        const today = new Date();
        today.setTime(today.getTime() - today.getTimezoneOffset() * 60 * 1000);
        const date = today.toISOString().split('T')[0];

        const meetingTime = await db.collection('meeting-time').findOne({ date: date });
        console.log(meetingTime)
        if (meetingTime) {
            const startTime = new Date(`${date}T${meetingTime.startTime}:00`);
            const timeDifference = (startTime.getTime() - today.getTime()) / (1000 * 60 * 60);

            if (timeDifference < 2 && timeDifference >= 1) {
                const client = new MessagingApiClient(config);
                const attendances = await checkAttendances(db);
                let messageText = '';
                if (attendances.length === 0) {
                    messageText = `${date}のミーティングは${meetingTime.startTime}からです。\n出席者はいません。`;
                } else {
                    messageText = `${date}のミーティングは${meetingTime.startTime}からです。\n出席者は以下の通りです。\n全て出席する人:\n${attendances.map((attendance) => {
                        if (attendance.meetingIndexes && attendance.meetingIndexes.length === 4) {
                            return `@${attendance.userId}`;
                        }
                    }).join('\n')
                        }\n途中参加、途中退席:\n${attendances.map((attendance) => {
                            if (attendance.meetingIndexes && attendance.meetingIndexes.length !== 4) {
                                return `@${attendance.userId} (${calculateMeetingPeriod(attendance.meetingIndexes, meetingTime.startTime)})`;
                            }
                        }).join('\n')
                        }`;
                }
                client.pushMessage({
                    to: process.env.NOTIFICATION_GROUP_ID as string,
                    messages: [{ type: 'text', text: messageText }]
                });
            }
        } else {
            const startTime = new Date(`${date}T${defailtStartTime}:00`);
            const timeDifference = (startTime.getTime() - today.getTime()) / (1000 * 60 * 60);

            if (timeDifference < 2 && timeDifference >= 1) {
                const client = new MessagingApiClient(config);
                const attendances = await checkAttendances(db);
                let messageText = '';
                if (attendances.length === 0) {
                    messageText = `${date}のミーティングは${defailtStartTime}からです。\n出席者はいません。`;
                } else {

                    messageText = `${date}のミーティングは${defailtStartTime}からです。\n出席者は以下の通りです。\n全て出席する人:\n${attendances.map((attendance) => {
                        if (attendance.meetingIndexes && attendance.meetingIndexes.length === 4) {
                            return `@${attendance.userId}`;
                        }
                    }).join('\n')
                        }\n途中参加、途中退席:\n${attendances.map((attendance) => {
                            if (attendance.meetingIndexes && attendance.meetingIndexes.length !== 4) {
                                return `@${attendance.userId} (${calculateMeetingPeriod(attendance.meetingIndexes, defailtStartTime)})`;
                            }
                        }).join('\n')
                        }`;
                }
                client.pushMessage({
                    to: process.env.NOTIFICATION_GROUP_ID as string,
                    messages: [{ type: 'text', text: messageText }]
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
    if (req.query.secret !== process.env.CRON_SECRET) {
        return res.status(401).end();
    }
    if (req.method == 'HEAD') {
        const { db } = await connectToDatabase();

        await checkAndAnnounce(db);

        res.status(200).end(); // レスポンスを終了  
    } else {
        return res.status(405).end();
    }
}