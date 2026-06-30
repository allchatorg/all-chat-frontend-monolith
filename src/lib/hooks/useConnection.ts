import {useEffect, useState} from "react";

export const useConnection = () => {
    const [isOnline, setIsOnline] = useState<boolean>(true);
    const [justReconnected, setJustReconnected] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsOnline(window.navigator.onLine);
        }

        const handleOnline = () => {
            setIsOnline(true);
            setJustReconnected(true);

            setTimeout(() => setJustReconnected(false), 500);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setJustReconnected(false);
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);

            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            };
        }
    }, []);

    return {isOnline, justReconnected};
};
