import type { NextApiRequest, NextApiResponse } from 'next';  
import connectToDatabase from '../../utils/db';  
import Attendance from '../../models/Attendance';  

export default async (req: NextApiRequest, res: NextApiResponse) => {  
    await connectToDatabase();  

    if (req.method === 'POST') {  
        try {  
            const attendance = new Attendance(req.body);  
            await attendance.save();  
            res.status(200).json({ message: 'Attendance recorded' });  
        } catch (error) {  
            res.status(500).json({ error: 'Failed to record attendance', details: error });  
        }  
    } else if (req.method === 'GET') {  
        try {  
            const attendances = await Attendance.find({});  
            res.status(200).json(attendances);  
        } catch (error) {  
            res.status(500).json({ error: 'Failed to fetch attendances', details: error });  
        }  
    } else {  
        res.setHeader('Allow', ['GET', 'POST']);  
        res.status(405).end(`Method ${req.method} Not Allowed`);  
    }  
};