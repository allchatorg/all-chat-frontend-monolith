import React, {useEffect, useRef} from "react";
import {EditorContent, useEditor, type Editor} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {Placeholder} from "@tiptap/extensions";
import {cn} from "@/lib/utils";
import {docToMarkers} from "@/features/chatroom/utils/messageMarkers";

// Transactions dispatched by the dictation helpers carry this meta flag so
// ChatInput can tell user edits (which commit the interim tail) apart from
// dictation updates (which must keep it replaceable).
export const DICTATION_META = "dictation";

interface ChatComposerEditorProps {
    placeholder: string;
    editable: boolean;
    onSerializedChange: (serialized: string, isDictation: boolean) => void;
    onEnter: () => void;
    onEscape: () => boolean;
    onReady: (editor: Editor) => void;
}

// WYSIWYG replacement for the composer textarea: bold/italic only. The rich
// document never leaves this component — every update is serialized to the
// **bold**/*italic* marker string that the rest of the app (and the backend)
// works with.
export const ChatComposerEditor: React.FC<ChatComposerEditorProps> = ({
                                                                          placeholder,
                                                                          editable,
                                                                          onSerializedChange,
                                                                          onEnter,
                                                                          onEscape,
                                                                          onReady,
                                                                      }) => {
    const placeholderRef = useRef(placeholder);
    placeholderRef.current = placeholder;
    const onEnterRef = useRef(onEnter);
    onEnterRef.current = onEnter;
    const onEscapeRef = useRef(onEscape);
    onEscapeRef.current = onEscape;
    const onSerializedChangeRef = useRef(onSerializedChange);
    onSerializedChangeRef.current = onSerializedChange;

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
                placeholder: () => placeholderRef.current,
            }),
        ],
        enableInputRules: false,
        enablePasteRules: false,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: cn(
                    "glass-input min-h-10 max-h-[120px] w-full overflow-y-auto rounded-md border",
                    "border-input bg-transparent px-3 py-2 text-base shadow-xs md:text-sm",
                    "whitespace-pre-wrap [word-break:break-word] outline-none focus:border-primary"
                ),
            },
            handleKeyDown: (_view, event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                    onEnterRef.current();
                    return true;
                }
                if (event.key === "Escape") {
                    return onEscapeRef.current();
                }
                return false;
            },
        },
        onUpdate: ({editor, transaction}) => {
            onSerializedChangeRef.current(
                docToMarkers(editor.getJSON()),
                transaction.getMeta(DICTATION_META) === true
            );
        },
    });

    useEffect(() => {
        if (editor) onReady(editor);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor]);

    useEffect(() => {
        editor?.setEditable(editable);
    }, [editor, editable]);

    return (
        <EditorContent
            editor={editor}
            className={cn(
                "chat-composer flex-1 min-w-0",
                !editable && "cursor-not-allowed opacity-50 [&_*]:pointer-events-none"
            )}
        />
    );
};
