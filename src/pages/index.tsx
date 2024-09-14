import { useSession, signIn, signOut } from 'next-auth/react';  
import { useEffect, useState } from 'react';  
import axios from 'axios';  
import { generateNextWeekDates } from '../utils/dateHelpers';  
import styles from '../styles/Home.module.css';  

type Attendance = {  
  userId: string;  
  date: string;  
  status: boolean;  
  userImage?: string; // アイコンのURL 
  timestamp?: string; 
};  

const Home = () => {  
  const { data: session, status } = useSession();  
  const [attendances, setAttendances] = useState<Attendance[]>([]);  
  const dates = generateNextWeekDates();  

  const fetchAttendances = async () => {  
    try {  
      const response = await axios.get('/api/attendances');  
      const allAttendances = response.data;  

      // 自分の出欠情報のみフィルタリング  
      const userAttendances = allAttendances.filter((att: Attendance) => att.userId === session?.user?.name);  

      setAttendances(userAttendances);  
    } catch (error) {  
      console.error('Failed to fetch attendances', error);  
    }  
  };  

  useEffect(() => {  
    if (session) {  
      fetchAttendances();  
    }  
  }, [session]);  

  const handleVote = async (date: string, status: boolean) => {  
    if (!session?.user) return;  

    const newAttendance: Attendance = {  
      userId: session.user.name ?? '', // ユーザー名を userId フィールドに設定  
      date,  
      status,  
      userImage: session.user.image ?? '', // アイコンのURLを追加  
    };  

    try {  
      await axios.post('/api/attendances', newAttendance);  
      fetchAttendances();  
    } catch (error) {  
      console.error('Failed to record attendance', error);  
    }  
  };  

  const handleDelete = async (date: string) => {  
    if (!session?.user) return;  

    try {  
      await axios.delete('/api/attendances', {  
        params: {  
          userId: session.user.name ?? '', // ユーザー名をクエリパラメータとして渡す  
          date,  
        },  
      });  
      fetchAttendances();  
    } catch (error) {  
      console.error('Failed to delete attendance', error);  
    }  
  };  

  const getUsersStatusForDate = (date: string, status: boolean) => {  
    return attendances.filter((attendance) => attendance.date === date && attendance.status === status);  
  };  

  const hasUserRespondedForDate = (date: string) => {  
    return attendances.some((attendance) => attendance.date === date);  
  };  

  if (status === 'loading') return <div>Loading...</div>;  

  if (!session) {  
    return (  
      <div>  
        <h1>Attendance Management</h1>  
        <button onClick={() => signIn('line')}>Sign in with LINE</button>  
      </div>  
    );  
  }  

  return (  
    <div className={styles.container}>  
      <h1>Welcome, {session.user.name}</h1>  
      <button onClick={() => signOut()}>Sign out</button>  
      
      <ul className={styles['attendance-list']}>  
        {dates.map((date, index) => {  
          const attendingUsers = getUsersStatusForDate(date, true); // 出席者を取得  
          
          return (  
            <li key={index} className={styles['attendance-item']}>  
              <span>{date}</span>  
              {!hasUserRespondedForDate(date) ? (  
                <>  
                  <button onClick={() => handleVote(date, true)} className={styles.button}>  
                    出席  
                  </button>  
                  <button onClick={() => handleVote(date, false)} className={styles.button}>  
                    欠席  
                  </button>  
                </>  
              ) : (  
                <div className={`${styles['attending-users']} ${styles['has-responded']}`}>  
                  {attendingUsers.map((user, idx) => (  
                    <img  
                      src={user.userImage}  
                      alt={user.userId}  
                      key={idx}  
                      className={styles['user-icon']}  
                    />  
                  ))}  
                </div>  
              )}  
            </li>  
          );  
        })}  
      </ul>  

      <h2>Recorded Attendances</h2>  
      <ul className={styles['attendance-list']}>  
        {attendances.map((attendance, index) => (  
          <li key={index} className={styles['attendance-item']}>  
            {attendance.userId} | {attendance.date} | {attendance.status ? '出席' : '欠席'} | {new Date(attendance.timestamp!).toLocaleString()}  
            {session?.user.name === attendance.userId && (  
              <button onClick={() => handleDelete(attendance.date)} className={styles.deleteButton}>削除</button>  
            )}  
          </li>  
        ))}  
      </ul>  
    </div>  
  );  
};  

export default Home;