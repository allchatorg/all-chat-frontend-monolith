"use client";
import React, {useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import {selectActiveRightPanel} from "@/redux/settings/settingsSelector";
import PopularChatRoomsSection from "./PopularChatRoomsSection";
import SearchChatRoomMessages from "./SearchChatRoomMessages";
import ModView from "@/features/chatroom/components/ModView";
import {setActiveRightSidebar} from "@/redux/settings/settingsSlice";
import {sidePanelDesktopClass} from "@/features/chatroom/components/sidePanelGlassClasses";
import {BottomSheet} from "@/components/ui/bottom-sheet";
import {useIsMobile} from "@/lib/hooks/useIsMobile";
import {selectSelectedChatRoomState} from "@/redux/chatRoom/chatRoomSelectors";
import {selectModPanelLoadedUser} from "@/redux/modPanel/modPanelSelector";


const RightPanel = () => {
    const activePanel = useSelector(selectActiveRightPanel);
    const dispatch = useDispatch();
    const isMobile = useIsMobile();
    const selectedRoom = useSelector(selectSelectedChatRoomState);
    const selectedModUser = useSelector(selectModPanelLoadedUser);
    const lastPanel = useRef(activePanel);
    if (activePanel) lastPanel.current = activePanel;
    const displayedPanel = isMobile ? activePanel ?? lastPanel.current : activePanel;

    let content;
    let title = "Rooms";
    switch (displayedPanel) {
        case "top-online":
            content = <PopularChatRoomsSection showHeader={!isMobile}/>;
            break;
        case "search-chatroom-messages":
            content = <SearchChatRoomMessages showHeader={!isMobile}/>;
            title = selectedRoom?.name ? `Search ${selectedRoom.name} messages` : "Search messages";
            break;
        case "mod-view":
            content = <ModView showHeader={!isMobile}/>;
            title = selectedModUser?.username ?? "Moderation";
            break;
        default:
            content = null;
    }

    const handleClose = () => {
        dispatch(setActiveRightSidebar(null));
    };

    if (!isMobile) return content ? <div className={sidePanelDesktopClass}>{content}</div> : null;

    return (
        <BottomSheet
            open={!!activePanel}
            onOpenChange={(open) => { if (!open) handleClose(); }}
            title={title}
            size="tall"
            scrollable={false}
            bodyClassName="px-0"
        >
            {content}
        </BottomSheet>
    );
};


export default React.memo(RightPanel);
