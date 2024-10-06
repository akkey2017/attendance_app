type Attendance = {
    userId: string;
    date: string;
    status: boolean;
    userImage?: string;
    meetingIndexes?: number[];
    comment?: string;
    timestamp?: string;
};

type MeetingTime = {
    userId: string;
    date: string;
    startTime: string;
    repeatCount: number;
};

type EditorProps = {
    doc: Y.Doc,
    provider: any;
}
