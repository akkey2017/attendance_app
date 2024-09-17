"use client";
import { useEffect, useState } from "react";
import { BlockNoteEditor } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { useRoom } from "@liveblocks/react/suspense";
import { useSelf } from "@liveblocks/react/suspense";

const Editor =() => {
    
    const room = useRoom();
    const [doc, setDoc] = useState<Y.Doc>(new Y.Doc());
    const [provider, setProvider] = useState<LiveblocksYjsProvider | null>(null);
    

    // Set up Liveblocks Yjs provider
    useEffect(() => {
        const yDoc = new Y.Doc();
        const yProvider = new LiveblocksYjsProvider(room, yDoc);
        setDoc(yDoc);
        setProvider(yProvider);
        

        return () => {
            yDoc?.destroy();
            yProvider?.destroy();
        };
    }, [room]);

    if (!doc || !provider) {
        return null;
    }

    return <BlockNote doc={doc} provider={provider} />;
}


function BlockNote({ doc, provider }: EditorProps) {
    const userInfo = useSelf((me) => me.info);
    const editor: BlockNoteEditor = useCreateBlockNote({
        collaboration: {
            provider,

            // Where to store BlockNote data in the Y.Doc:
            fragment: doc.getXmlFragment("document-store"),

            // Information for this user:
            user: {
                name: userInfo.name,
                color: userInfo.color,
            },
        },
    });

    return <BlockNoteView editor={editor} className="border-gray-300 bg-white" theme="light"/>;
}

export default Editor;