'use client';

import {ReactNode, useEffect} from 'react';
import {useAttachmentHook} from "@/lib/hooks/useAttachmentHook";
import {useUser} from "@/lib/hooks/useUser";
import {useStompWithRedux} from "@/lib/hooks/useStompClient";
import {useHeartbeat} from "@/lib/hooks/useHeartbeat";
import {useIpDetails} from "@/lib/hooks/useIpDetails";
import {useIsMobile} from "@/lib/hooks/useIsMobile";
import {useDispatch, useSelector} from "react-redux";
import {useTheme} from "next-themes";
import {AppDispatch, RootState} from "@/redux/store";
import {setActiveLeftSidebar, setActiveRightSidebar} from "@/redux/settings/settingsSlice";
import {fetchMessagingAvailabilityThunk} from "@/redux/messagingAvailability/messagingAvailabilityThunk";


export default function AppInitializer({children}: { children: ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();
    const isMobile = useIsMobile();
    const showAppBackground = useSelector((state: RootState) => state.settings.showAppBackground !== false);
    const {resolvedTheme} = useTheme();

    useIpDetails();
    const {user} = useUser();
    useAttachmentHook();
    useStompWithRedux();
    useHeartbeat();

    useEffect(() => {
        if (user?.id) {
            dispatch(fetchMessagingAvailabilityThunk());
        }
    }, [user?.id, dispatch]);

    useEffect(() => {
        if (isMobile) {
            dispatch(setActiveRightSidebar(null));
            dispatch(setActiveLeftSidebar(null));
        }
    }, [isMobile, dispatch]);

    useEffect(() => {
        if (showAppBackground) {
            document.body.removeAttribute("data-app-background");
            return;
        }

        document.body.dataset.appBackground = "hidden";
    }, [showAppBackground]);

    useEffect(() => {
        // Light icon in light mode (with or without the background); dark icon
        // otherwise, including before the theme resolves.
        const href = resolvedTheme === "light" ? "/icon_light.png" : "/icon_dark.png";

        let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
        if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            link.type = "image/png";
            document.head.appendChild(link);
        }
        if (link.getAttribute("href") !== href) {
            link.href = href;
        }
    }, [resolvedTheme]);

    return <>
        {children}
    </>;
}
