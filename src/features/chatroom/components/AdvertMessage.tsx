import React from "react";
import {Message} from "@/models/message";
import AdvertItem from "@/features/chatroom/components/AdvertItem";
import {AdvertMenu} from "@/features/chatroom/components/AdvertMenu";
import {MessageTimestamp} from "@/features/chatroom/components/MessageTimestamp";

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
    return (
        <div className="flex w-full items-start mt-2 group min-w-0" data-advert-id={message.id}>
            <div className="w-full min-w-0 flex flex-col justify-start">
                <div
                    className="max-w-[70%] min-w-0 pb-1 px-1 text-xs font-medium transition-colors text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="min-w-0 wrap-anywhere dark:text-slate-200">{message.senderUsername}</span>

                    <span className="shrink-0 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded
                        bg-green-100 text-green-700">
                        advertiserment
                    </span>

                </div>

                <div className="flex w-full min-w-0 flex-nowrap items-center gap-1">
                    <div className="w-fit max-w-[70%] min-w-0">
                        <AdvertItem
                            message={message}
                            inset={false}
                            interactionsDisabled={interactionsDisabled}
                            allowAttachmentPreview={allowAttachmentPreview}
                        />
                    </div>

                    <div className="flex flex-none items-center transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
                        <MessageTimestamp createdAt={message.createdAt} placement="inline"/>
                        <AdvertMenu onHide={() => onHide(message.id)} disabled={interactionsDisabled}/>
                    </div>
                </div>
                <MessageTimestamp createdAt={message.createdAt}/>
            </div>
        </div>
    );
};
