import {tokenize} from "@/features/chatroom/utils/messageMarkers";
import {useDialog} from "@/components/providers/DialogProvider";
import {isTrustedDomain} from "@/features/chatroom/utils/externalLinks";
import ExternalLinkWarning from "@/features/chatroom/components/ExternalLinkWarning";

// Renders message content with **bold** / *italic* markers applied and URLs
// linkified. Replaces the old plain linkifyText helper in MessageItem.
// Links to domains outside the trusted list open a "Leaving allchat" dialog first.
export const FormattedMessageText: React.FC<{
    text: string,
    interactionsDisabled?: boolean,
    onLinkClick?: (url: string) => void,
}> = ({text, interactionsDisabled = false, onLinkClick}) => {
    const {open, close} = useDialog();

    return (
        <>
            {tokenize(text).map((segment, index) => {
                let node: React.ReactNode = segment.text;

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

                return <span key={index}>{node}</span>;
            })}
        </>
    );
};
