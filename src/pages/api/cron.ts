import type { NextApiRequest, NextApiResponse } from 'next';  
import { connectToDatabase } from '../../lib/mongodb';  
import { getPastDate } from '../../utils/dateHelpers';  
import { Db } from 'mongodb';

const deleteExpiredAttendances = async (db: Db) => {  
    const pastWeekDate = getPastDate(0);
    console.log('Deleting attendances before: ', pastWeekDate);
    try {  
        await db.collection('attendances').deleteMany({ date: { $lt: pastWeekDate } });  
        await db.collection('meeting-time').deleteMany({ date: { $lt: pastWeekDate } });
        console.log('Expired attendances deleted');  
    } catch (error) {  
        console.error('Failed to delete expired attendances:', error);  
    }  
};  

const autoSetupMeetingTime = async (db: Db) => {
    const meetingWeekDay = ["Wednesday", "Friday"];
    const timeStartsMeeting = ["22:00","22:00"];
    const meetingCounts = [4,4];

    try {
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() + i);
            const dayOfWeek = checkDate.toLocaleString('en-US', { weekday: 'long' });

            const index = meetingWeekDay.indexOf(dayOfWeek);
            if (index !== -1) {
                const meetingTime = timeStartsMeeting[index];
                const meetingCount = meetingCounts[index];

                const existingMeeting = await db.collection('meeting-time').findOne({ date: checkDate });
                if (!existingMeeting) {
                    await db.collection('meeting-time').insertOne({
                        userId: "cron-job",
                        date: checkDate,
                        startTime: meetingTime,
                        repeartCount: meetingCount
                    });
                    console.log(`Meeting time set for ${dayOfWeek} at ${meetingTime}`);
                }
            }
        }
    } catch (error) {
        console.error('Failed to auto setup meeting time:', error);
    }
};

export default async function (  
    req: NextApiRequest,  
    res: NextApiResponse  
) {  
    const { db } = await connectToDatabase();  

    await deleteExpiredAttendances(db);  
    await autoSetupMeetingTime(db);

    res.status(200).end(); // レスポンスを終了  
}