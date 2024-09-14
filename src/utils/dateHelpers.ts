import { formatISO, add, startOfToday } from "date-fns";

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
