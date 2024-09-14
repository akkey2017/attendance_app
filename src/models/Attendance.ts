import { Schema, models, model } from 'mongoose';  

const AttendanceSchema = new Schema({  
    userId: { type: String, required: true },  
    date: { type: String, required: true }, // e.g., "2023-10-18"  
    status: { type: Boolean, required: true }, // true = 出席, false = 欠席  
    userImage: { type: String, required: true }, // アイコンのURLを追加  
    meetingIndexes: { type: [Number], default: [] }, // 追加: 出席するミーティングインデックス  
    comment: { type: String, default: '' }, // 追加: コメントフィールド  
    timestamp: { type: Date, default: Date.now },  
});  

export default models.Attendance || model('Attendance', AttendanceSchema);