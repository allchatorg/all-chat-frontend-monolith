'use client';

import {useStompWithRedux} from "@/lib/hooks/useStompClient";

// Keeps the STOMP connection alive on every authenticated route. Mounted in
// both AppShell branches so navigating to /portal (which skips AppInitializer)
// no longer drops the WebSocket — promotion/ban events keep flowing there.
export default function StompBridge() {
    useStompWithRedux();
    return null;
}
