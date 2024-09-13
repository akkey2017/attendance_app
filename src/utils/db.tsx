import mongoose from 'mongoose';  

const MONGODB_URI = process.env.MONGODB_URI as string;  

if (!MONGODB_URI) {  
    throw new Error('Please define the MONGODB_URI environment variable');  
}  

async function connectToDatabase() {  
    if (mongoose.connection.readyState >= 1) {  
        // 1 = connected, 2 = connecting, 3 = disconnecting, 0 = disconnected  
        console.log('Already connected to MongoDB');  
        return;  
    }  
    try {  
        await mongoose.connect(MONGODB_URI);  
        console.log('Connected to MongoDB');  
    } catch (error) {  
        console.error('Error connecting to MongoDB:', error);  
        throw new Error('Failed to connect to MongoDB');  
    }  
}  

export default connectToDatabase;