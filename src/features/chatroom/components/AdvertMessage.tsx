import React from "react";
import {Message} from "@/models/message";
import {useFormatMessageDate} from "@/lib/hooks/useTimeFormatSetting";
import AdvertItem from "@/features/chatroom/components/AdvertItem";
import {AdvertMenu} from "@/features/chatroom/components/AdvertMenu";

interface AdvertMessageProps {
    message: Message;
    onHide: (messageId: number) => void;
    interactionsDisabled?: boolean;
    allowAttachmentPreview?: boolean;
}

export const AdvertMessage: React.FC<AdvertMessageProps> = ({
                                                                message,
                                                                onHide,
                                                                interactionsDisabled = false,
                                                                allowAttachmentPreview = false,
                                                            }) => {
    const {formatMessageDate} = useFormatMessageDate();
    const formattedTime = formatMessageDate(message.createdAt);

    return (
        <div className="flex w-full items-start mt-2 group min-w-0">
            <div className="max-w-[75%] min-w-0 flex flex-col justify-start">
                <div
                    className="pl-4 pb-1 px-1 text-xs font-medium transition-colors text-muted-foreground flex items-center gap-2">
                    <span>{message.senderUsername}</span>

                    <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded
                        bg-green-100 text-green-700">
                        advertiserment
                    </span>

                </div>

                <div className="flex items-center min-w-0 max-w-full">
                    <AdvertItem
                        message={message}
                        interactionsDisabled={interactionsDisabled}
                        allowAttachmentPreview={allowAttachmentPreview}
                    />

                    <div className="flex items-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="italic text-xs text-muted-foreground px-2 text-right">
                            {formattedTime}
                        </div>
                        <AdvertMenu onHide={() => onHide(message.id)} disabled={interactionsDisabled}/>
                    </div>
                </div>
            </div>
        </div>
    );
};
