import {ArrowLeft, ChevronRight, FileText, MessageSquare} from "lucide-react";
import React, {useState} from "react";
import {SearchUserMessagesInChatRoom} from "./SearchUserMessagesInChatRoom";
import {ModPanelAuditLogView} from "@/features/chatroom/components/ModPanelAuditLogView";
import {Button} from "@/components/ui/button";

export enum ModScreenType {
    MAIN = 'MAIN',
    MESSAGES = 'MESSAGES',
    AUDIT_LOG = 'AUDIT_LOG',
}

type ModMainScreenProps = {
    onClick: () => void;
    messageCount: number;
    userRole: string;
};

export const ModMainScreen = (props: ModMainScreenProps) => {
    const [currentScreen, setCurrentScreen] = useState<ModScreenType>(ModScreenType.MAIN);

    const handleScreenChange = (screenType: ModScreenType) => {
        setCurrentScreen(screenType);
    };

    const renderHeader = () => (
        <div className="flex items-center border-b p-2">
            {currentScreen !== ModScreenType.MAIN && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentScreen(ModScreenType.MAIN)}
                    className="glass-control h-8 w-8 p-0"
                >
                    <ArrowLeft className="h-4 w-4 text-muted-foreground"/>
                </Button>
            )}
        </div>
    );

    const renderCurrentScreen = () => {
        let content = null;

        switch (currentScreen) {
            case ModScreenType.MESSAGES:
                content = (
                    <SearchUserMessagesInChatRoom/>
                );
                break;
            case ModScreenType.AUDIT_LOG:
                content = (
                    <ModPanelAuditLogView/>
                );
                break;
            case ModScreenType.MAIN:
            default:
                return renderMainScreen();
        }

        return (
            <div className="flex h-full flex-col">
                <div className="flex-1 overflow-auto">
                    {content}
                </div>
            </div>
        );
    };

    const renderMainScreen = () => (
        <div className="flex h-full flex-col overflow-auto p-4">
            <h3 className="mb-4 text-xl font-bold text-foreground">ModView</h3>

            <div className="space-y-3">
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">Chatroom Activity</h4>

                <button
                    onClick={() => handleScreenChange(ModScreenType.MESSAGES)}
                    className="glass-surface flex w-full items-center justify-between rounded-md p-3 transition-colors group"
                >
                    <div className="flex items-center space-x-3">
                        <div className="rounded-md bg-blue-500/10 p-2">
                            <MessageSquare className="h-4 w-4 text-blue-500"/>
                        </div>
                        <span className="text-sm font-medium text-foreground">Messages</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-muted-foreground">{props.messageCount}</span>
                        <ChevronRight
                            className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground"/>
                    </div>
                </button>

                <button
                    onClick={() => handleScreenChange(ModScreenType.AUDIT_LOG)}
                    className="glass-surface flex w-full items-center justify-between rounded-md p-3 transition-colors group"
                >
                    <div className="flex items-center space-x-3">
                        <div className="rounded-md bg-green-500/10 p-2">
                            <FileText className="h-4 w-4 text-green-600"/>
                        </div>
                        <span className="text-sm font-medium text-foreground">Audit Log</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <ChevronRight
                            className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground"/>
                    </div>
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-full flex-col">
            {currentScreen !== ModScreenType.MAIN && renderHeader()}
            <div className="flex-1 overflow-auto">
                {renderCurrentScreen()}
            </div>
        </div>
    );
};
