"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSession, signIn } from 'next-auth/react';
import {
    LiveblocksProvider,
    RoomProvider,
    ClientSideSuspense,
    useOthers,
    useMyPresence,
} from "@liveblocks/react/suspense";
import dynamic from "next/dynamic";
const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });
import Header from "@/components/Header";
import { Avatars } from "@/components/Avatars";
//import Cursor from "@/components/Cursor";



const Whiteboard = () => {

    const { data: session, status } = useSession();
    const [isAllowed, setIsAllowed] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);

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
    }, [session, isAllowed]);

    //if (status === 'loading') return <div>Loading...</div>;

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
        return <div>Loading...</div>;
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
            <div className="container mx-auto p-6 pt-20">
                <LiveblocksProvider authEndpoint={async (room) => {
                    // Passing custom headers and body to your endpoint
                    const headers = {
                        "Content-Type": "application/json",
                    };

                    const body = JSON.stringify({
                        room,
                        session,
                    });

                    const response = await fetch("/api/liveblocks-auth", {
                        method: "POST",
                        headers,
                        body,
                    });

                    const res = await response.json();
                    return JSON.parse(res);
                }}>
                    <RoomProvider id="my-room" initialPresence={{ cursor: null }}>
                        <ClientSideSuspense fallback={<div>Loading…</div>}>
                            <Avatars />
                            <Editor />
                        </ClientSideSuspense>
                    </RoomProvider>
                </LiveblocksProvider>
            </div>
        </div>
    );
}

export default Whiteboard;