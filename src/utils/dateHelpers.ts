import { formatISO, add, startOfToday } from "date-fns";
import moment from 'moment';  

export function generateNextWeekDates() {
    const dates = [];
    const startDate = startOfToday();

    for (let i = 0; i < 7; i++) {
        dates.push(
            formatISO(add(startDate, { days: i }), { representation: "date" })
        );
    }
    return dates;
}

export const formatDateWithoutYear = (date: string): string => {  
    return moment(date).format('MM/DD');  
};  

export function getPastDate(days: number): string {  
    const date = new Date();  
    date.setDate(date.getDate() - days);  
    return date.toISOString().split('T')[0];  
}

export function formatDay(date: string): string {
    const JP_DAY = ['日', '月', '火', '水', '木', '金', '土'];
    const day = new Date(date).getDay();
    return JP_DAY[day];
}