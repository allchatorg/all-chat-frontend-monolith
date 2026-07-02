"use client";
import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {selectActiveRightPanel} from "@/redux/settings/settingsSelector";
import PopularChatRoomsSection from "./PopularChatRoomsSection";
import SearchChatRoomMessages from "./SearchChatRoomMessages";
import ModView from "@/features/chatroom/components/ModView";
import {AnimatePresence, motion} from "framer-motion";
import {setActiveRightSidebar} from "@/redux/settings/settingsSlice";
import {
    sidePanelDesktopClass,
    sidePanelMobileClass,
    sidePanelMobileContentClass
} from "@/features/chatroom/components/sidePanelGlassClasses";


const RightPanel = () => {
    const activePanel = useSelector(selectActiveRightPanel);
    const dispatch = useDispatch();

    let content;
    switch (activePanel) {
        case "top-online":
            content = <PopularChatRoomsSection/>;
            break;
        case "search-chatroom-messages":
            content = <SearchChatRoomMessages/>;
            break;
        case "mod-view":
            content = <ModView/>;
            break;
        default:
            content = null;
    }

    const handleClose = () => {
        dispatch(setActiveRightSidebar(null));
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


export default React.memo(RightPanel);
