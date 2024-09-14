/* eslint-disable camelcase */  
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
  const [myattendances, setMyAttendances] = useState<Attendance[]>([]);
  const dates = generateNextWeekDates();  

  const fetchAttendances = async () => {  
    try {  
      const response = await axios.get('/api/attendances');  
      const allAttendances = response.data;  

      // 自分の出欠情報のみフィルタリング  
      const userAttendances = allAttendances.filter((att: Attendance) => att.userId === session?.user?.name);  

      setAttendances(allAttendances);  
      setMyAttendances(userAttendances);
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
    return myattendances.some((attendance) => attendance.date === date);  
  };  

  if (status === 'loading') return <div>Loading...</div>;  

  if (!session) {  
    return (  
      <div>  
        <h1>出欠シート</h1>  
        <button onClick={() => signIn('line')}>LINEアカウントでサインイン</button>  
      </div>  
    );  
  }  

  return (  
    <div className={styles.container}>  
      <h1>{session.user?.name} でログイン中</h1>  
      <button onClick={() => signOut()}>サインアウト</button>  
      
      <ul className={styles['attendance-list']}>  
        {dates.map((date, index) => {  
          const attendingUsers = getUsersStatusForDate(date, true); // 出席者を取得   
          const userResponse = attendances.find(att => att.date === date);  

          return (  
            <li key={index} className={styles['attendance-item']}>  
              <span className={styles.dateText}>{date}</span>  
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
                <div className={styles.attendanceActionContainer}>  
                  <div className={styles.attendingUsers}>  
                    {attendingUsers.map((user, idx) => (  
                      <img  
                        src={user.userImage}  
                        alt={user.userId}  
                        key={idx}  
                        className={styles.userIcon}  
                      />  
                    ))}  
                  </div>  
                  <button onClick={() => handleDelete(date)} className={styles.modifyButton}>修正</button>  
                </div>  
              )}  
            </li>  
          );  
        })}  
      </ul>  
    </div>  
  );  
};  

export default Home;