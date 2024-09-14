/* eslint-disable camelcase */  
import { useSession, signIn, signOut } from 'next-auth/react';  
import { useEffect, useState } from 'react';  
import axios from 'axios';  
import { generateNextWeekDates } from '../utils/dateHelpers';  

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
  const [myAttendances, setMyAttendances] = useState<Attendance[]>([]);  
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
    return myAttendances.some((attendance) => attendance.date === date);  
  };  

  if (status === 'loading') return <div>Loading...</div>;  

  if (!session) {  
    return (  
      <div className="p-6 text-center">  
        <h1 className="text-2xl font-bold mb-4">出欠シート</h1>  
        <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={() => signIn('line')}>LINEアカウントでサインイン</button>  
      </div>  
    );  
  }  

  return (  
    <div className="container mx-auto p-6">  
      <h1 className="text-xl font-bold mb-4">{session.user?.name} でログイン中</h1>  
      <button className="px-4 py-2 bg-red-500 text-white rounded mb-6" onClick={() => signOut()}>サインアウト</button>  
      
      <ul className="space-y-4">  
        {dates.map((date, index) => {  
          const attendingUsers = getUsersStatusForDate(date, true); // 出席者を取得   
          const userResponse = attendances.find(att => att.date === date);  

          return (  
            <li key={index} className="flex items-center justify-between p-4 bg-gray-100 rounded shadow">  
              <span className="text-lg">{date}</span>  
              {!hasUserRespondedForDate(date) ? (  
                <div className="flex space-x-2">  
                  <button onClick={() => handleVote(date, true)} className="px-4 py-2 bg-blue-500 text-white rounded">  
                    出席  
                  </button>  
                  <button onClick={() => handleVote(date, false)} className="px-4 py-2 bg-red-500 text-white rounded">  
                    欠席  
                  </button>  
                </div>  
              ) : (  
                <div className="flex items-center space-x-2">  
                  <div className="flex space-x-2">  
                    {attendingUsers.map((user, idx) => (  
                      <img  
                        src={user.userImage}  
                        alt={user.userId}  
                        key={idx}  
                        className="w-8 h-8 rounded-full"  
                      />  
                    ))}  
                  </div>  
                  <button onClick={() => handleDelete(date)} className="px-4 py-2 bg-yellow-500 text-black rounded">修正</button>  
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