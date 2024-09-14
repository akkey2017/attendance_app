/* eslint-disable camelcase */
import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
    throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;


const client = new MongoClient(uri);
const clientPromise: Promise<MongoClient> = client.connect();

export async function connectToDatabase() {
    const client = await clientPromise;
    const db = client.db();
    return { client, db };
}

export default clientPromise;