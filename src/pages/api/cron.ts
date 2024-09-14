import type { NextApiRequest, NextApiResponse } from 'next';  
import { connectToDatabase } from '../../lib/mongodb';  
import { getPastDate } from '../../utils/dateHelpers';  

const deleteExpiredAttendances = async (db: any) => {  
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

export default async function (  
    req: NextApiRequest,  
    res: NextApiResponse  
) {  
    const { db } = await connectToDatabase();  

    await deleteExpiredAttendances(db);  

    res.status(200).end(); // レスポンスを終了  
}