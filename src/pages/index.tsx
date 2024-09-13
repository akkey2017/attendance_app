import Image from "next/image";
import localFont from "next/font/local";
import { useState, useEffect } from 'react';  
import axios from 'axios';  

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

type Attendance = {  
  userId: string;  
  eventId: string;  
  status: string;  
  timestamp?: string;  
};  

const Home = () => {  
  const [userId, setUserId] = useState('');  
  const [eventId, setEventId] = useState('');  
  const [status, setStatus] = useState('');  
  const [attendances, setAttendances] = useState<Attendance[]>([]);  

  const fetchAttendances = async () => {  
    try {  
      const response = await axios.get('/api/attendances');  
      setAttendances(response.data);  
    } catch (error) {  
      console.error('Failed to fetch attendances', error);  
    }  
  };  

  useEffect(() => {  
    fetchAttendances();  
  }, []);  

  const handleSubmit = async (e: React.FormEvent) => {  
    e.preventDefault();  

    const newAttendance: Attendance = { userId, eventId, status };  

    try {  
      await axios.post('/api/attendances', newAttendance);  
      setAttendances([...attendances, newAttendance]);  
      setUserId('');  
      setEventId('');  
      setStatus('');  
    } catch (error) {  
      console.error('Failed to record attendance', error);  
    }  
  };  

  return (  
    <div>  
      <h1>Attendance Management</h1>  
      <form onSubmit={handleSubmit}>  
        <div>  
          <label>User ID:</label>  
          <input  
            type="text"  
            value={userId}  
            onChange={(e) => setUserId(e.target.value)}  
            required  
          />  
        </div>  
        <div>  
          <label>Event ID:</label>  
          <input  
            type="text"  
            value={eventId}  
            onChange={(e) => setEventId(e.target.value)}  
            required  
          />  
        </div>  
        <div>  
          <label>Status:</label>  
          <input  
            type="text"  
            value={status}  
            onChange={(e) => setStatus(e.target.value)}  
            required  
          />  
        </div>  
        <button type="submit">Record Attendance</button>  
      </form>  

      <h2>Attendances</h2>  
      <ul>  
        {attendances.map((attendance, index) => (  
          <li key={index}>  
            {attendance.userId} | {attendance.eventId} | {attendance.status} | {new Date(attendance.timestamp!).toLocaleString()}  
          </li>  
        ))}  
      </ul>  
    </div>  
  );  
};  

export default Home;  