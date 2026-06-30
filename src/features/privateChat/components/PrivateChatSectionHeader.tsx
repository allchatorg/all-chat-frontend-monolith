"use client";

import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {CardTitle} from "@/components/ui/card";
import {Ban, MoreVertical, PanelLeftOpen, Search, User as UserIcon, X} from "lucide-react";
import {useIsMobile} from "@/lib/hooks/useIsMobile";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@/redux/store";
import {selectPrivateSidebarVisible} from "@/redux/privateChat/privateChatSelectors";
import {togglePrivateSidebar} from "@/redux/privateChat/privateChatUiSlice";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import {PrivateChatDTO} from "@/models/PrivateChatDTO";
import PrivateChatSearchBar from "@/features/privateChat/components/PrivateChatSearchBar";

interface PrivateChatSectionHeaderProps {
    conversation: PrivateChatDTO;
    onHideConversation: () => void;
    onOpenMobileSidebar?: () => void;
}

const PrivateChatSectionHeader: React.FC<PrivateChatSectionHeaderProps> = ({
                                                                               conversation,
                                                                               onHideConversation,
                                                                               onOpenMobileSidebar,
                                                                           }) => {
    const dispatch = useDispatch<AppDispatch>();
    const isMobile = useIsMobile();
    const sidebarVisible = useSelector(selectPrivateSidebarVisible);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);

    const counterpartName = conversation.counterpart?.username ?? "Deleted user";

    const handleSidebarButton = () => {
        if (isMobile && onOpenMobileSidebar) {
            onOpenMobileSidebar();
        } else {
            dispatch(togglePrivateSidebar());
        }
    };

    const showSidebarToggle = isMobile || !sidebarVisible;

    const renderOptionsMenu = (buttonClassName: string, iconClassName: string) => (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={buttonClassName}
                    aria-label="Conversation options"
                    title="Conversation options"
                >
                    <MoreVertical className={iconClassName}/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-popover w-48">
                <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900"
                    onSelect={onHideConversation}
                >
                    Hide conversation
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    // Desktop layout — search bar lives inline in the header
    if (!isMobile) {
        return (
            <CardTitle className="flex items-center gap-2">
                {showSidebarToggle && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="glass-control h-9 w-9 p-2"
                        onClick={handleSidebarButton}
                        aria-label="Show conversations"
                        title="Show conversations"
                    >
                        <PanelLeftOpen className="h-5 w-5"/>
                    </Button>
                )}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <UserIcon className="h-4 w-4 text-muted-foreground"/>
                </div>
                <span className="truncate">{counterpartName}</span>
                {conversation.blocked && (
                    <span title="Blocked" className="inline-flex items-center text-red-500">
                        <Ban className="h-4 w-4"/>
                    </span>
                )}
                <div className="ml-auto flex items-center gap-2">
                    <PrivateChatSearchBar/>
                    {renderOptionsMenu("glass-control h-9 w-9 p-0", "h-5 w-5")}
                </div>
            </CardTitle>
        );
    }

    // Mobile layout — a search icon expands into the full-width search bar
    return (
        <CardTitle className="flex items-center gap-2">
            {!isSearchExpanded ? (
                <>
                    {showSidebarToggle && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="glass-control h-8 w-8 p-0"
                            onClick={handleSidebarButton}
                            aria-label="Show conversations"
                            title="Show conversations"
                        >
                            <PanelLeftOpen className="h-4 w-4"/>
                        </Button>
                    )}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <UserIcon className="h-4 w-4 text-muted-foreground"/>
                    </div>
                    <span className="truncate">{counterpartName}</span>
                    {conversation.blocked && (
                        <span title="Blocked" className="inline-flex items-center text-red-500">
                            <Ban className="h-4 w-4"/>
                        </span>
                    )}
                    <div className="ml-auto flex items-center gap-1">
                        <Button
                            onClick={() => setIsSearchExpanded(true)}
                            variant="ghost"
                            size="sm"
                            className="glass-control h-8 w-8 p-0"
                            aria-label="Open search"
                            title="Open search"
                        >
                            <Search className="h-4 w-4"/>
                        </Button>
                        {renderOptionsMenu("glass-control h-8 w-8 p-0", "h-4 w-4")}
                    </div>
                </>
            ) : (
                <>
                    <div className="flex-1 animate-in slide-in-from-right-2 duration-200">
                        <PrivateChatSearchBar/>
                    </div>
                    <Button
                        onClick={() => setIsSearchExpanded(false)}
                        variant="ghost"
                        size="sm"
                        className="glass-control h-8 w-8 p-0"
                        aria-label="Close search"
                        title="Close search"
                    >
                        <X className="h-4 w-4"/>
                    </Button>
                </>
            )}
        </CardTitle>
    );
};

export default PrivateChatSectionHeader;
