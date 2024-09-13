import connectToDatabase from '../../utils/db';  
import Attendance from '../../models/Attendance';  
import type { NextApiRequest, NextApiResponse } from "next";

export default async (req:NextApiRequest, res:NextApiResponse) => {  
    await connectToDatabase();  

    if (req.method === 'POST') {  
        try {  
            const attendance = new Attendance(req.body);  
            await attendance.save();  
            res.status(200).json({ message: 'Attendance recorded' });  
        } catch (error) {  
            res.status(500).json({ error: 'Failed to record attendance' });  
        }  
    }  
};  