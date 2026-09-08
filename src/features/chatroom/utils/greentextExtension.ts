import {Extension} from "@tiptap/core";
import {Plugin} from "@tiptap/pm/state";
import {Decoration, DecorationSet} from "@tiptap/pm/view";
import {isGreentextLine} from "@/features/chatroom/utils/messageMarkers";

// Greentext is derived from the visible line, never stored as a mark. Rebuilding
// decorations also removes the color immediately when a leading > is deleted.
export const Greentext = Extension.create({
    name: "greentext",

    addProseMirrorPlugins() {
        return [new Plugin({
            props: {
                decorations: ({doc}) => {
                    const decorations: Decoration[] = [];

                    doc.descendants((node, position) => {
                        if (!node.isTextblock) return;

                        // These editors contain text and hardBreak inline nodes.
                        // Replacing each hardBreak with one newline preserves
                        // document offsets, including newlines within text nodes.
                        const text = node.textBetween(0, node.content.size, "", "\n");
                        let from = position + 1;
                        for (const line of text.split("\n")) {
                            if (isGreentextLine(line)) {
                                decorations.push(Decoration.inline(from, from + line.length, {
                                    class: "message-greentext",
                                }));
                            }
                            from += line.length + 1;
                        }
                        return false;
                    });

                    return DecorationSet.create(doc, decorations);
                },
            },
        })];
    },
});
