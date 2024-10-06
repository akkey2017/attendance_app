import { useSession, signIn, signOut } from 'next-auth/react';
import { use, useEffect, useState } from 'react';
import axios from 'axios';
import { generateNextWeekDates, formatDateWithoutYear, formatDay } from '../utils/dateHelpers';
import { calculateEndTime } from '../utils/timeHelpers';
import Header from '../components/Header';
import { RitzLoading } from '@/components/Ritz_Loading';
import CustomButton from '@/components/Custom_Button';

const Home = () => {
  const { data: session, status } = useSession();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [meetingTimes, setMeetingTimes] = useState<MeetingTime[]>([]);
  const [myAttendances, setMyAttendances] = useState<Attendance[]>([]);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [activeAttendance, setActiveAttendance] = useState<Attendance | null>(null);
  const [startTime, setStartTime] = useState<string>('21:00');
  const [repeatCount, setRepeatCount] = useState<number>(4);
  const [endTime, setEndTime] = useState<string>('23:40');
  const [meetingIndexes, setMeetingIndexes] = useState<number[]>([]);
  const [comment, setComment] = useState<string>('');
  const [expandedDates, setExpandedDates] = useState<string[]>([]);

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
      const response = await axios.get('/api/meeting-time');
      setMeetingTimes(response.data);
    } catch (error) {
      console.error('Failed to fetch meeting times', error);
    }
  };

  useEffect(() => {
    if (!session?.user?.name) {
      return;
    }

    const checkUser = async () => {
      try {
        const response = await axios.post('/api/checkUser', { userName: session?.user?.name });
        setIsAllowed(response.data.isAllowed);
      } catch (error) {
        console.error('Failed to check user', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    if (session) {
      fetchAttendances();
      fetchMeetingTimes();
    }
  }, [session, isAllowed]);

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



  const handleVote = (date: string, attendance: Attendance | null = null, absent: string | "attendance") => {
    if (!session?.user) return;

    //出席の場合  
    if (absent == "attendance") {
      if (attendance != null) {
        setActiveDate(date);
        setActiveType('attendance');
        setActiveAttendance(attendance);
        setMeetingIndexes(attendance.meetingIndexes || Array(repeatCount).fill(0).map((_, i) => i));
        setComment(attendance.comment || '');
      } else {
        const newAttendance = {
          userId: session.user.name ?? '',
          date: date,
          status: true,
          userImage: session.user.image ?? '',
          meetingIndexes: [],
          comment: '',
        };
        setActiveType("attendance");
        setActiveDate(date);
        setActiveAttendance(newAttendance);
        setMeetingIndexes([0, 1, 2, 3]);
      }
    } else {
      //欠席の場合  
      const newAttendance = {
        userId: session.user.name ?? '',
        date: date,
        status: false,
        userImage: session.user.image ?? '',
        meetingIndexes: [],
        comment: '',
      };

      try {
        setActiveType("absent");
        setActiveDate(date);
        setActiveAttendance(newAttendance);
        setMeetingIndexes([]);
      } catch (error) {
        console.error('Failed to record absence', error);
      }
    }
  };


  const handleEdit = (date: string) => {
    if (!session?.user) return;
    setActiveDate(date);
    setActiveType('edit'); // 編集ボタンを押した時  
  };

  const handleAttendanceSubmit = async () => {
    if (!session?.user || !activeDate) return;

    const isAttendance = meetingIndexes.length > 0;

    let newAttendance: Attendance;

    if (!isAttendance) {
      newAttendance = {
        userId: session.user.name ?? '',
        date: activeDate,
        status: isAttendance,
        userImage: session.user.image ?? '',
        meetingIndexes: [],
        comment,
      };
    } else {

      newAttendance = {
        userId: session.user.name ?? '',
        date: activeDate,
        status: isAttendance,
        userImage: session.user.image ?? '',
        meetingIndexes,
        comment,
      };
    }

    try {
      await axios.post('/api/attendances', newAttendance);
      setActiveDate(null);
      setActiveAttendance(null);
      fetchAttendances();
    } catch (error) {
      console.error('Failed to record attendance', error);
    }
  };

  const handleAbsenseSubmit = async () => {
    if (!session?.user || !activeDate) return;

    const isAttendance = false;

    const newAttendance: Attendance = {
      userId: session.user.name ?? '',
      date: activeDate,
      status: isAttendance,
      userImage: session.user.image ?? '',
      meetingIndexes,
      comment,
    };

    try {
      await axios.post('/api/attendances', newAttendance);
      setActiveDate(null);
      setActiveAttendance(null);
      fetchAttendances();
    } catch (error) {
      console.error('Failed to record absence', error);
    }

  }

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
    if (repeatCount > 10) {
      alert("イタズラしないでぇ〜");
      return;
    }
    const newMeetingTime: MeetingTime = {
      userId: session.user.name ?? '',
      date: activeDate,
      startTime,
      repeatCount
    };
    try {
      await axios.post('/api/meeting-time', newMeetingTime);
      fetchMeetingTimes();
      setActiveDate(null);
    } catch (error) {
      console.error('Failed to update meeting time', error);
    }
  };

  const getUsersStatusForDate = (date: string, status: boolean) => {
    return attendances.filter((attendance) => attendance.date === date && attendance.status === status);
  };

  const hasUserRespondedForDate = (date: string) => {
    const att = myAttendances.some((attendance) => attendance.date === date);
    return att;
  };

  const meetingTimesForDate = (date: string) => {
    return meetingTimes.find(meeting => meeting.date === date) || { startTime: '21:00', repeatCount: 4 };
  };

  const toggleExpand = (date: string) => {
    setExpandedDates((prev) =>
      prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
    );
  };

  const calculateMeetingPeriod = (indexes: number[], startTime: string) => {
    if (indexes.length === 0) {
      return '';
    }

    const start = indexes[0];
    const end = indexes[indexes.length - 1];
    const startFormatted = calculateEndTime(startTime, start);
    const endFormatted = calculateEndTime(startTime, end + 1);

    return `${startFormatted} 〜 ${endFormatted}`;
  };

  if (status === 'loading') return <div><div className='container mx-auto p-6'><RitzLoading /></div></div>;

  if (!session) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">出欠シート</h1>
        <button className="px-4 py-2 bg-green-500 text-white rounded transition duration-200 ease-in-out transform hover:scale-105 active:scale-95" onClick={() => signIn('line')}>
          LINEアカウントでログイン
        </button>
      </div>
    );
  }
  if (loading) {
    return <div><div className='container mx-auto p-6'><RitzLoading /></div></div>;
  }

  if (isAllowed == false) {
    return (
      <div className="p-6 text-center">
        <Header />
        <h1 className="text-2xl font-bold mb-4">出欠シート</h1>
        <p className="text-lg text-red-500">このアプリは利用できません</p>
      </div>
    );

  }

  return (
    <div className="container mx-auto p-6">
      <Header />
      <main className="container mx-auto p-6 pt-20"></main>
      <h1 className="text-xl font-bold mb-4">{session.user?.name} でログイン中</h1>

      <ul className="space-y-4">
        {dates.map((date, index) => {
          const attendingUsers = getUsersStatusForDate(date, true);
          const absenceUsers = getUsersStatusForDate(date, false);
          const userResponse = attendances.find((att) => att.date === date && att.userId === session.user?.name);
          const meetingTime = meetingTimesForDate(date);
          const isExpanded = expandedDates.includes(date);

          return (
            <li key={index} className={` rounded shadow transition ${hasUserRespondedForDate(date) && !userResponse?.status ? 'bg-gray-500' : 'bg-gray-100'}`}>
              <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => toggleExpand(date)}>
                <div className="flex items-center">
                  <CustomButton
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      handleEdit(date);
                    }}
                    text='編集' color='grey' />
                  <span className="text-lg font-bold gothic">&nbsp;&nbsp;{formatDateWithoutYear(date)}&nbsp;({formatDay(date)})</span>
                  <span className="ml-2 text-sm text-gray-600 font-bold gothic">
                    {meetingTime.startTime} - {calculateEndTime(meetingTime.startTime, meetingTime.repeatCount)}
                  </span>
                </div>
                {!hasUserRespondedForDate(date) ? (
                  <div className="flex space-x-2">
                    <CustomButton onClick={(e) => {
                      e.stopPropagation();
                      handleVote(date, userResponse, "attendance");
                    }} text="出席" color="blue" size="medium" />
                    <CustomButton onClick={(e) => {
                      e.stopPropagation();
                      handleVote(date, null, "absence");
                    }} text="欠席" color="red" size="medium" />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="hidden md:flex space-x-2 ">
                      {attendingUsers.map((user, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={user.userImage}
                            alt={user.userId}
                            className="w-8 h-8 rounded-full transition duration-200 ease-in-out transform hover:scale-105 active:scale-95"
                          />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 pointer-events-none">
                            {user.userId}
                          </div>
                        </div>
                      ))}
                    </div>
                    <CustomButton onClick={(e) => {
                      e.stopPropagation();
                      handleVote(date, userResponse, "attendance");
                    }} text="修正" color="orange" size="medium" />
                  </div>
                )}
              </div>

              {/* 展開部分 */}
              {isExpanded && (
                <div className="p-4">
                  {attendingUsers.map((user, idx) => (
                    <div key={idx} className="flex items-center space-x-4 mb-4 last:mb-0">
                      <img
                        src={user.userImage}
                        alt={user.userId}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="font-semibold">{user.userId} ({calculateMeetingPeriod(user.meetingIndexes || [], meetingTime.startTime)})</div>
                        {user.comment && <div className="text-sm text-gray-600">{user.comment}</div>}
                      </div>
                    </div>
                  ))}
                  <label className="block mb-2">
                    欠席:
                  </label>
                  {absenceUsers.map((user, idx) => (
                    <div key={idx} className="flex items-center space-x-4 mb-4 last:mb-0">
                      <img
                        src={user.userImage}
                        alt={user.userId}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="font-semibold">{user.userId}</div>
                        {user.comment && <div className="text-sm text-gray-600">{user.comment}</div>}
                      </div>

                    </div>

                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {activeDate && (
        
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            {activeType === 'edit' && (
              <>
                <h2 className="text-lg font-bold mb-4">{activeDate} のミーティング時間を編集</h2>
                <label className="block mb-2">
                  開始時間:
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md transition duration-200"
                  />
                </label>
                <label className="block mb-4">
                  回数:
                  <input
                    type="number"
                    value={repeatCount}
                    onChange={(e) => setRepeatCount(Number(e.target.value))}
                    min="1"
                    className="block w-full mt-1 border-gray-300 rounded-md transition duration-200"
                  />
                </label>
                <div className="mb-4">
                  終了予定時刻: {endTime}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleMeetingTimeUpdate}
                    className="px-4 py-2 bg-blue-500 text-white rounded transition duration-200 ease-in-out transform hover:scale-105 active:scale-95">保存</button>
                  <button
                    onClick={() => setActiveDate(null)}
                    className="px-4 py-2 bg-red-500 text-white rounded transition duration-200 ease-in-out transform hover:scale-105 active:scale-95">キャンセル</button>
                </div>
              </>
            )}
            {activeType === 'attendance' && (
              <>
                <h2 className="text-lg font-bold mb-4 mr-32">{activeDate} の出席登録</h2>
                <h3 className="text-md font-bold mb-2">出席するミーティング:</h3>
                <div className="mb-4">
                  {Array(repeatCount).fill(0).map((_, idx) => (
                    <label key={idx} className="block">
                      <input
                        type="checkbox"
                        checked={meetingIndexes.includes(idx)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setMeetingIndexes([...meetingIndexes, idx]);
                            //console.log(meetingIndexes, idx);
                          } else {
                            setMeetingIndexes(meetingIndexes.filter((index) => index !== idx));
                            //console.log(meetingIndexes); 
                          }
                        }}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">{idx + 1} 回 {calculateMeetingPeriod([idx], startTime)}</span>
                    </label>
                  ))}
                </div>
                <h3 className="text-md font-bold mb-2"><span className=''>コメント:</span></h3>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md transition duration-200"
                  rows={3}
                />
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={handleAttendanceSubmit}
                    className="px-4 py-2 bg-blue-500 text-white rounded transition duration-200 ease-in-out transform hover:scale-105 active:scale-95">保存</button>
                  <button
                    onClick={() => {
                      setActiveDate(null);
                      setActiveAttendance(null);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded transition duration-200 ease-in-out transform hover:scale-105 active:scale-95">キャンセル</button>
                </div>
              </>
            )}
            {activeType === 'absent' && (
              <>
                <h2 className="text-lg font-bold mb-4 mr-32">{activeDate} の欠席登録</h2>
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={handleAbsenseSubmit}
                    className="px-4 py-2 bg-blue-500 text-white rounded transition duration-200 ease-in-out transform hover:scale-105 active:scale-95">保存</button>
                  <button
                    onClick={() => {
                      setActiveDate(null);
                      setActiveAttendance(null);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded transition duration-200 ease-in-out transform hover:scale-105 active:scale-95">キャンセル</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;