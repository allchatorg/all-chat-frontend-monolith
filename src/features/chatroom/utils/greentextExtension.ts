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

                        // Both breaks and inline emoji occupy one document position.
                        // Only hard breaks start a new line; emoji remain on this one.
                        const text = node.textBetween(0, node.content.size, "", leaf =>
                            leaf.type.name === "hardBreak" ? "\n" : "\uFFFC"
                        );
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
