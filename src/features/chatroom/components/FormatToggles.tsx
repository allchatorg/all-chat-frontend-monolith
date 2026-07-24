import React from "react";
import {Bold, Italic} from "lucide-react";
import {useEditorState, type Editor} from "@tiptap/react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

// Bold/Italic toggles for the composer. With a selection they format the
// selection; with a collapsed cursor they arm the mark so subsequent typing
// (or dictation) is formatted. Active state follows the cursor position.
export function FormatToggles({
                                  editor,
                                  disabled,
                              }: {
    editor: Editor | null;
    disabled?: boolean;
}) {
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
        <>
            {toggles.map(({label, icon: Icon, isActive, onToggle}) => (
                <Button
                    key={label}
                    type="button"
                    variant="outline"
                    size="icon"
                    className={cn(
                        "glass-control shrink-0 h-10 w-10",
                        isActive && "bg-accent text-accent-foreground"
                    )}
                    disabled={disabled || !editor}
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
        </>
    );
}
