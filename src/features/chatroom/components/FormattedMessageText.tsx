import {tokenize, tokenizeChatMessage, type Segment} from "@/features/chatroom/utils/messageMarkers";
import {CustomEmojiGlyph} from "@/features/stickers/CustomEmojiGlyph";
import {useDialog} from "@/components/providers/DialogProvider";
import {isTrustedDomain} from "@/features/chatroom/utils/externalLinks";
import ExternalLinkWarning from "@/features/chatroom/components/ExternalLinkWarning";
import {getGreentextColor} from "@/features/chatroom/utils/greentextColor";

// Renders message content with >greentext, **bold** / *italic* markers and URLs
// linkified. Replaces the old plain linkifyText helper in MessageItem.
// Links to domains outside the trusted list open a "Leaving allchat" dialog first.
export const FormattedMessageText: React.FC<{
    text: string,
    interactionsDisabled?: boolean,
    onLinkClick?: (url: string) => void,
    backgroundColor?: string,
    customEmojis?: boolean,
}> = ({text, interactionsDisabled = false, onLinkClick, backgroundColor, customEmojis = false}) => {
    const {open, close} = useDialog();
    const greentextColor = backgroundColor ? getGreentextColor(backgroundColor) : undefined;
    // Ads share this renderer and keep their original text/pricing semantics.
    const segments: Array<Segment & {customEmojiId?: string}> = customEmojis ? tokenizeChatMessage(text) : tokenize(text);

    return (
        <>
            {segments.map((segment, index) => {
                let node: React.ReactNode = segment.customEmojiId
                    ? <CustomEmojiGlyph id={segment.customEmojiId}/>
                    : segment.text;

                if (segment.isUrl && !interactionsDisabled) {
                    node = (
                        <a
                            href={segment.text}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:opacity-80 wrap-anywhere"
                            onClick={(e) => {
                                e.stopPropagation();
                                onLinkClick?.(segment.text);
                                if (!isTrustedDomain(segment.text)) {
                                    e.preventDefault();
                                    open(<ExternalLinkWarning url={segment.text} onClose={close}/>);
                                }
                            }}
                        >
                            {segment.text}
                        </a>
                    );
                }

                if (segment.italic) node = <em>{node}</em>;
                if (segment.bold) node = <strong>{node}</strong>;

                return (
                    <span
                        key={index}
                        className={segment.greentext ? "message-greentext" : undefined}
                        style={segment.greentext && greentextColor ? {color: greentextColor} : undefined}
                    >
                        {node}
                    </span>
                );
            })}
        </>
    );
};
