import { useSession, signIn, signOut } from 'next-auth/react';  
import { useEffect, useState } from 'react';  
import axios from 'axios';  
import { generateNextWeekDates, formatDateWithoutYear } from '../utils/dateHelpers';  
import { calculateEndTime } from '../utils/timeHelpers';  

type Attendance = {  
  userId: string;  
  date: string;  
  status: boolean;  
  userImage?: string;  
  timestamp?: string;  
};  

type MeetingTime = {  
  userId: string;  
  date: string;  
  startTime: string;  
  repeatCount: number;  
};  

const Home = () => {  
  const { data: session, status } = useSession();  
  const [attendances, setAttendances] = useState<Attendance[]>([]);  
  const [meetingTimes, setMeetingTimes] = useState<MeetingTime[]>([]);  
  const [myAttendances, setMyAttendances] = useState<Attendance[]>([]);  
  const [activeDate, setActiveDate] = useState<string | null>(null);  
  const [startTime, setStartTime] = useState<string>('21:00');  
  const [repeatCount, setRepeatCount] = useState<number>(4);  
  const [endTime, setEndTime] = useState<string>('23:40');  

  const dates = generateNextWeekDates();  

  const fetchAttendances = async () => {  
    try {  
      const response = await axios.get('/api/attendances');  
      const allAttendances = response.data;  
      const userAttendances = allAttendances.filter((att: Attendance) => att.userId === session?.user?.name);  
      setAttendances(allAttendances);  
      setMyAttendances(userAttendances);  
    } catch (error) {  
      console.error('Failed to fetch attendances', error);  
    }  
  };  

  const fetchMeetingTimes = async () => {  
    try {  
      const response = await axios.get('/api/meeting-times');  
      setMeetingTimes(response.data);  
    } catch (error) {  
      console.error('Failed to fetch meeting times', error);  
    }  
  };  

  useEffect(() => {  
    if (session) {  
      fetchAttendances();  
      fetchMeetingTimes();  
    }  
  }, [session]);  

  useEffect(() => {  
    const fetchMeetingTimeForDate = async () => {  
      if (!activeDate) return;  
      try {  
        const response = await axios.get('/api/meeting-time', { params: { date: activeDate } });  
        if (response.status === 200) {  
          const { startTime, repeatCount } = response.data;  
          setStartTime(startTime);  
          setRepeatCount(repeatCount);  
        } else if (response.status === 404) {  
          setStartTime('21:00');  
          setRepeatCount(4);  
        }  
      } catch (error) {  
        console.error('Failed to fetch meeting time for date', error);  
        // デフォルト値をセット  
        setStartTime('21:00');  
        setRepeatCount(4);  
      }  
    };  

    fetchMeetingTimeForDate();  
  }, [activeDate]);  

  useEffect(() => {  
    const newEndTime = calculateEndTime(startTime, repeatCount);  
    setEndTime(newEndTime);  
  }, [startTime, repeatCount]);  

  const handleVote = async (date: string, status: boolean) => {  
    if (!session?.user) return;  
    const newAttendance: Attendance = {  
      userId: session.user.name ?? '',  
      date,  
      status,  
      userImage: session.user.image ?? '',  
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
          userId: session.user.name ?? '',  
          date,  
        },  
      });  
      fetchAttendances();  
    } catch (error) {  
      console.error('Failed to delete attendance', error);  
    }  
  };  

  const handleMeetingTimeUpdate = async () => {  
    if (!session?.user || !activeDate) return;  
    const newMeetingTime: MeetingTime = {  
      userId: session.user.email ?? '',  
      date: activeDate,  
      startTime,  
      repeatCount  
    };  
    try {  
      await axios.post('/api/meeting-time', newMeetingTime);  
      fetchMeetingTimes();  
      setActiveDate(null); // Close the edit form  
    } catch (error) {  
      console.error('Failed to update meeting time', error);  
    }  
  };  

  const getUsersStatusForDate = (date: string, status: boolean) => {  
    return attendances.filter((attendance) => attendance.date === date && attendance.status === status);  
  };  

  const hasUserRespondedForDate = (date: string) => {  
    return myAttendances.some((attendance) => attendance.date === date);  
  };  

  const meetingTimesForDate = (date: string) => {  
    return meetingTimes.find(meeting => meeting.date === date);  
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
          const attendingUsers = getUsersStatusForDate(date, true);  
          const userResponse = attendances.find((att) => att.date === date);  
          const meetingTime = meetingTimesForDate(date) || { startTime: '21:00', repeatCount: 4 };  

          return (  
            <li key={index} className="flex items-center justify-between p-4 bg-gray-100 rounded shadow">  
              <div className="flex items-center">  
                <button   
                  onClick={() => setActiveDate(date)}   
                  className="mr-4 px-2 py-1 bg-gray-300 text-black rounded">  
                  編集  
                </button>  
                <span className="text-lg">{formatDateWithoutYear(date)}</span>  
                <span className="ml-2 text-sm text-gray-600">  
                  {meetingTime.startTime} - {calculateEndTime(meetingTime.startTime, meetingTime.repeatCount)}  
                </span>  
              </div>  
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
                      <div key={idx} className="relative group">  
                        <img  
                          src={user.userImage}  
                          alt={user.userId}  
                          className="w-8 h-8 rounded-full"  
                        />  
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 pointer-events-none">  
                          {user.userId}  
                        </div>  
                      </div>  
                    ))}  
                  </div>  
                  <button onClick={() => handleDelete(date)} className="px-4 py-2 bg-yellow-500 text-black rounded">修正</button>  
                </div>  
              )}
            </li>  
          );  
        })}  
      </ul>  

      {activeDate && (  
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">  
          <div className="bg-white p-6 rounded shadow-lg">  
            <h2 className="text-lg font-bold mb-4">{activeDate} のミーティング時間を編集</h2>  
            <label className="block mb-2">  
              開始時間:  
              <input   
                type="time"   
                value={startTime}   
                onChange={(e) => setStartTime(e.target.value)}   
                className="block w-full mt-1 border-gray-300 rounded-md"  
              />  
            </label>  
            <label className="block mb-4">  
              回数:  
              <input   
                type="number"   
                value={repeatCount}   
                onChange={(e) => setRepeatCount(Number(e.target.value))}   
                min="1"  
                className="block w-full mt-1 border-gray-300 rounded-md"  
              />  
            </label>  
            <div className="mb-4">  
              終了予定時刻: {endTime}  
            </div>  
            <div className="flex space-x-2">  
              <button   
                onClick={handleMeetingTimeUpdate}   
                className="px-4 py-2 bg-blue-500 text-white rounded">保存</button>  
              <button   
                onClick={() => setActiveDate(null)}   
                className="px-4 py-2 bg-red-500 text-white rounded">キャンセル</button>  
            </div>  
          </div>  
        </div>  
      )}  

    </div>  
  );  
};  

export default Home;