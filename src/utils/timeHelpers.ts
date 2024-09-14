import moment from 'moment';

export const calculateEndTime = (startTime: string, repeatCount: number): string => {
    const start = moment(startTime, 'HH:mm');
    const duration = 40 * repeatCount; // 1回40分  
    const end = start.add(duration, 'minutes');
    return end.format('HH:mm');
};