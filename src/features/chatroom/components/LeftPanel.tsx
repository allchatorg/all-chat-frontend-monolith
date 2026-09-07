"use client";
import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {selectActiveLeftPanel} from "@/redux/settings/settingsSelector";
import TopReactedMessagesSection from "./TopReactedMessagesSection";
import PromotedMessagesSection from "./PromotedMessagesSection";
import {AnimatePresence, motion} from "framer-motion";
import {setActiveLeftSidebar} from "@/redux/settings/settingsSlice";
import {useIsMobile} from "@/lib/hooks/useIsMobile";
import {
    sidePanelDesktopClass,
    sidePanelMobileClass,
    sidePanelMobileContentClass
} from "@/features/chatroom/components/sidePanelGlassClasses";

const LeftPanel = () => {
    const activePanel = useSelector(selectActiveLeftPanel);
    const dispatch = useDispatch();
    const isMobile = useIsMobile();

    let content;
    switch (activePanel) {
        case "top-reacted-messages":
            content = <TopReactedMessagesSection/>;
            break;
        case "promoted-messages":
            content = <PromotedMessagesSection/>;
            break;
        default:
            content = null;
    }

    const handleClose = () => {
        dispatch(setActiveLeftSidebar(null));
    };

    return (
        <AnimatePresence>
            {content && isMobile && (
                <motion.div
                    key="backdrop"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                    onClick={handleClose}
                    className="lg:hidden fixed inset-0 bg-slate-950/15 dark:bg-black/50 z-40 backdrop-blur-xs"
                />
            )}
            {content && (
                <motion.div
                    key="panel"
                    initial={{y: isMobile ? "100%" : 0}}
                    animate={{y: 0}}
                    exit={{y: isMobile ? "100%" : 0}}
                    transition={{type: "spring", damping: 25, stiffness: 200}}
                    className={isMobile ? sidePanelMobileClass : sidePanelDesktopClass}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Keep one content instance across desktop and mobile layouts. */}
                    <div className={sidePanelMobileContentClass}>
                        {content}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default React.memo(LeftPanel);
