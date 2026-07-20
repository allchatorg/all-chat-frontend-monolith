"use client";
import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {selectActiveLeftPanel} from "@/redux/settings/settingsSelector";
import TopReactedMessagesSection from "./TopReactedMessagesSection";
import PromotedMessagesSection from "./PromotedMessagesSection";
import {AnimatePresence, motion} from "framer-motion";
import {setActiveLeftSidebar} from "@/redux/settings/settingsSlice";
import {
    sidePanelDesktopClass,
    sidePanelMobileClass,
    sidePanelMobileContentClass
} from "@/features/chatroom/components/sidePanelGlassClasses";

const LeftPanel = () => {
    const activePanel = useSelector(selectActiveLeftPanel);
    const dispatch = useDispatch();

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

    if (!content && !activePanel) return null;

    return (
        <>
            {/* Desktop View */}
            {content && (
                <div className={sidePanelDesktopClass}>
                    {content}
                </div>
            )}

            {/* Mobile View */}
            <AnimatePresence>
                {content && (
                    <>
                        <motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            onClick={handleClose}
                            className="lg:hidden fixed inset-0 bg-slate-950/15 dark:bg-black/50 z-40 backdrop-blur-xs"
                        />
                        <motion.div
                            initial={{y: "100%"}}
                            animate={{y: 0}}
                            exit={{y: "100%"}}
                            transition={{type: "spring", damping: 25, stiffness: 200}}
                            className={sidePanelMobileClass}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={sidePanelMobileContentClass}>
                                {content}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default React.memo(LeftPanel);
