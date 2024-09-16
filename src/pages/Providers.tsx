"use client";

import { LiveblocksProvider } from "@liveblocks/react";
import { PropsWithChildren } from "react";

export function Providers({ children }: PropsWithChildren) {
    return (
        <LiveblocksProvider publicApiKey={"pk_dev_d3biqyGYGoMLhrGj7HDu5GdoYZy2KqPj9_5oo2oPqf4Nuwht28xL7V94Tl0ajfyE"}>
            {children}
        </LiveblocksProvider>
    );
}