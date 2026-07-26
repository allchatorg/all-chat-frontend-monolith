'use client';

import React, {useRef} from "react";
import {EditorContent, useEditor, useEditorState} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {Placeholder} from "@tiptap/extensions";
import {Bold, Italic} from "lucide-react";
import {Button} from "@ads/components/ui/button";
import {cn} from "@ads/lib/utils";
import {docToMarkers, markersToDoc} from "@/features/chatroom/utils/messageMarkers";

interface AdTextEditorProps {
    value: string;
    onChange: (serialized: string) => void;
    placeholder: string;
}

// WYSIWYG field for ad text content: bold/italic only, same wire format as
// chat messages. The rich document never leaves this component — every update
// is serialized to the **bold**/*italic* marker string stored in textContent.
export default function AdTextEditor({value, onChange, placeholder}: AdTextEditorProps) {
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    // Only the mount-time value seeds the editor; afterwards the editor owns
    // the content (the form step is revisitable, so this restores drafts).
    const initialValueRef = useRef(value);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                blockquote: false,
                bulletList: false,
                code: false,
                codeBlock: false,
                dropcursor: false,
                gapcursor: false,
                heading: false,
                horizontalRule: false,
                link: false,
                listItem: false,
                listKeymap: false,
                orderedList: false,
                strike: false,
                trailingNode: false,
                underline: false,
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: markersToDoc(initialValueRef.current),
        enableInputRules: false,
        enablePasteRules: false,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: cn(
                    "min-h-24 max-h-60 w-full overflow-y-auto rounded-md border border-border",
                    "bg-transparent px-3 py-2 text-base shadow-xs md:text-sm",
                    "whitespace-pre-wrap [word-break:break-word] outline-none",
                    "focus:ring-2 focus:ring-indigo-200"
                ),
            },
        },
        onUpdate: ({editor}) => {
            onChangeRef.current(docToMarkers(editor.getJSON()));
        },
    });

    const active = useEditorState({
        editor,
        selector: (ctx) => ({
            bold: ctx.editor?.isActive("bold") ?? false,
            italic: ctx.editor?.isActive("italic") ?? false,
        }),
    });

    const toggles = [
        {
            label: "Bold",
            icon: Bold,
            isActive: active?.bold ?? false,
            onToggle: () => editor?.chain().focus().toggleBold().run(),
        },
        {
            label: "Italic",
            icon: Italic,
            isActive: active?.italic ?? false,
            onToggle: () => editor?.chain().focus().toggleItalic().run(),
        },
    ];

    return (
        <div className="space-y-2">
            <div className="flex gap-1">
                {toggles.map(({label, icon: Icon, isActive, onToggle}) => (
                    <Button
                        key={label}
                        type="button"
                        variant="outline"
                        size="icon"
                        className={cn(
                            "h-8 w-8 shrink-0 text-muted-foreground",
                            isActive && "bg-indigo-600 border-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:text-white"
                        )}
                        disabled={!editor}
                        // Keep focus (and the current selection) in the editor.
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={onToggle}
                        aria-pressed={isActive}
                        aria-label={label}
                        title={label}
                    >
                        <Icon className="h-4 w-4"/>
                    </Button>
                ))}
            </div>
            <EditorContent editor={editor}/>
        </div>
    );
}
