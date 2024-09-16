import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
//import "../styles/whiteboard.css";
//import "../styles/text-editor.css";
import { Suspense } from "react";
import { Providers } from "@/pages/Providers";
import Header from '../components/Header';

export const metadata = {
    title: "Liveblocks",
};
export default function Whiteboard({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="container mx-auto p-6">
            <Header />
            <Providers>
                <Suspense>{children}</Suspense>
            </Providers>
        </div>
    );
}