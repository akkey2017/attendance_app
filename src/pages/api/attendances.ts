/* eslint-disable camelcase */  
import type { NextApiRequest, NextApiResponse } from 'next';  
import { connectToDatabase } from '../../lib/mongodb';  
import Attendance from '../../models/Attendance';  

export default async (req: NextApiRequest, res: NextApiResponse) => {  
    const { db } = await connectToDatabase();  

    if (req.method === 'POST') {  
        // 出欠情報を記録  
        try {  
            const { userId, date, status, userImage, meetingIndexes, comment } = req.body;  
            const newAttendance = {  
                userId,  
                date,  
                status,  
                userImage,  
                meetingIndexes: meetingIndexes || [],  
                comment: comment || ''  
            };  

            const attendance = new Attendance(newAttendance);  
            const attendanceObject = attendance.toObject();  
            delete attendanceObject._id;  // _idフィールドを削除  

            await db.collection('attendances').updateOne(  
                { userId, date },  
                { $set: attendanceObject },  
                { upsert: true }  
            );  

            res.status(201).json({ message: 'Attendance recorded' });  
        } catch (error) {  
            console.error('Failed to record attendance:', error);  
            res.status(500).json({ error: 'Failed to record attendance', details: error });  
        }  
    } else if (req.method === 'GET') {  
        // 出欠情報を取得  
        try {  
            const attendances = await db.collection('attendances').find().toArray();  
            res.status(200).json(attendances);  
        } catch (error) {  
            console.error('Failed to fetch attendances:', error);  
            res.status(500).json({ error: 'Failed to fetch attendances', details: error });  
        }  
    } else if (req.method === 'DELETE') {  
        const { userId, date } = req.query;  

        if (!userId || !date) {  
            return res.status(400).json({ error: 'UserId and Date are required.' });  
        }  

        try {  
            await db.collection('attendances').deleteOne({ userId, date });  
            res.status(200).json({ message: 'Attendance deleted' });  
        } catch (error) {  
            console.error('Failed to delete attendance:', error);  
            res.status(500).json({ error: 'Failed to delete attendance', details: error });  
        }  
    } else {  
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);  
        res.status(405).end(`Method ${req.method} Not Allowed`);  
    }  
};