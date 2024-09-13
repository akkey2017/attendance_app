import { useState, useEffect } from 'react';  
import axios from 'axios';  
import styles from '../styles/Home.module.css';  

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
    <div className={styles.container}>  
      <h1 className={styles.title}>Attendance Management</h1>  
      <form onSubmit={handleSubmit}>  
        <div className={styles['form-group']}>  
          <label className={styles.label}>User ID:</label>  
          <input  
            type="text"  
            className={styles.input}  
            value={userId}  
            onChange={(e) => setUserId(e.target.value)}  
            required  
          />  
        </div>  
        <div className={styles['form-group']}>  
          <label className={styles.label}>Event ID:</label>  
          <input  
            type="text"  
            className={styles.input}  
            value={eventId}  
            onChange={(e) => setEventId(e.target.value)}  
            required  
          />  
        </div>  
        <div className={styles['form-group']}>  
          <label className={styles.label}>Status:</label>  
          <input  
            type="text"  
            className={styles.input}  
            value={status}  
            onChange={(e) => setStatus(e.target.value)}  
            required  
          />  
        </div>  
        <button type="submit" className={styles.button}>Record Attendance</button>  
      </form>  

      <h2>Attendances</h2>  
      <ul className={styles['attendance-list']}>  
        {attendances.map((attendance, index) => (  
          <li key={index} className={styles['attendance-item']}>  
            {attendance.userId} | {attendance.eventId} | {attendance.status} | {new Date(attendance.timestamp!).toLocaleString()}  
          </li>  
        ))}  
      </ul>  
    </div>  
  );  
};  

export default Home;