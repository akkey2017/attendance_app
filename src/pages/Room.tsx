"use client";

import { ReactNode, useMemo } from "react";
import { RoomProvider } from "@liveblocks/react/suspense";
import { useSearchParams } from "next/navigation";
import { ClientSideSuspense } from "@liveblocks/react";
import { Loading } from "@/components/Loading";

export function Room({ children }: { children: ReactNode }) {

    return (
        <RoomProvider
            id={"my-room"}
            initialPresence={{
                cursor: null,
            }}
        >
            <ClientSideSuspense fallback={<Loading />}>{children}</ClientSideSuspense>
        </RoomProvider>
    );
}