"use client";
import React, {useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import {selectActiveLeftPanel} from "@/redux/settings/settingsSelector";
import TopReactedMessagesSection from "./TopReactedMessagesSection";
import PromotedMessagesSection from "./PromotedMessagesSection";
import {setActiveLeftSidebar} from "@/redux/settings/settingsSlice";
import {useIsMobile} from "@/lib/hooks/useIsMobile";
import {sidePanelDesktopClass} from "@/features/chatroom/components/sidePanelGlassClasses";
import {BottomSheet} from "@/components/ui/bottom-sheet";

const LeftPanel = () => {
    const activePanel = useSelector(selectActiveLeftPanel);
    const dispatch = useDispatch();
    const isMobile = useIsMobile();
    const lastPanel = useRef(activePanel);
    if (activePanel) lastPanel.current = activePanel;
    const displayedPanel = isMobile ? activePanel ?? lastPanel.current : activePanel;

    let content;
    switch (displayedPanel) {
        case "top-reacted-messages":
            content = <TopReactedMessagesSection showHeader={!isMobile}/>;
            break;
        case "promoted-messages":
            content = <PromotedMessagesSection showHeader={!isMobile}/>;
            break;
        default:
            content = null;
    }

    const handleClose = () => {
        dispatch(setActiveLeftSidebar(null));
    };

    if (!isMobile) return content ? <div className={sidePanelDesktopClass}>{content}</div> : null;

    return (
        <BottomSheet
            open={!!activePanel}
            onOpenChange={(open) => { if (!open) handleClose(); }}
            title={displayedPanel === "promoted-messages" ? "Promoted messages" : "Top reacted messages"}
            size="tall"
            scrollable={false}
            bodyClassName="px-0"
        >
            {content}
        </BottomSheet>
    );
};

export default React.memo(LeftPanel);
