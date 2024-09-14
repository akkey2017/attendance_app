import NextAuth from 'next-auth';
import LineProvider from 'next-auth/providers/line';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '../../../lib/mongodb';

export default NextAuth({
    providers: [
        LineProvider({
            clientId: process.env.LINE_CHANNEL_ID as string,
            clientSecret: process.env.LINE_CHANNEL_SECRET as string,
        }),
    ],
    adapter: MongoDBAdapter(clientPromise),
    secret: process.env.NEXTAUTH_SECRET,
});