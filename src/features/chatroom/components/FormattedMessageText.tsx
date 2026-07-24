import {tokenize} from "@/features/chatroom/utils/messageMarkers";

// Renders message content with **bold** / *italic* markers applied and URLs
// linkified. Replaces the old plain linkifyText helper in MessageItem.
export const FormattedMessageText: React.FC<{
    text: string,
    interactionsDisabled?: boolean,
}> = ({text, interactionsDisabled = false}) => {
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
                            className="underline hover:opacity-80"
                            onClick={(e) => e.stopPropagation()}
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
